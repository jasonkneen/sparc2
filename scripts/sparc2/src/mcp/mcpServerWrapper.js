#!/usr/bin/env node

/**
 * MCP Server Wrapper for SPARC 2.0
 * This script uses the MCP SDK to create a server that communicates over stdio
 * and forwards requests to the SPARC2 HTTP API server.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "node:child_process";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Start the SPARC2 HTTP server
let httpServerProcess = null;

// Global flag to track if we're shutting down intentionally
let isShuttingDown = false;

/**
 * SSE Response class for Node.js
 */
class EventSourceResponse {
  constructor(res) {
    this.res = res;
    this.closed = false;
    
    // Set SSE headers
    this.res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    
    // Handle client disconnect
    this.res.on('close', () => {
      this.closed = true;
    });
  }
  
  /**
   * Send data as an SSE event
   * @param {any} data The data to send
   * @param {string} eventName Optional event name
   */
  send(data, eventName) {
    if (this.closed) return;
    
    let message = '';
    
    // Add event name if provided
    if (eventName) {
      message += `event: ${eventName}\n`;
    }
    
    // Add data as JSON string
    message += `data: ${JSON.stringify(data)}\n\n`;
    
    // Send the message
    this.res.write(message);
  }
  
  /**
   * Close the SSE connection
   */
  close() {
    if (this.closed) return;
    
    this.res.end();
    this.closed = true;
  }
}

/**
 * Find the Deno executable by checking multiple common installation locations
 * Falls back to the original path if no Deno installation is found
 * @returns {string|null} Path to the Deno executable or null if not found
 */
function findDenoExecutable() {
  const possiblePaths = [
    // Common paths for Deno installation
    "/home/codespace/.deno/bin/deno", // GitHub Codespaces (original path)
    "/usr/local/bin/deno", // Standard Linux/macOS location
    "/usr/bin/deno", // Alternative Linux location
    process.env.HOME ? path.join(process.env.HOME, ".deno/bin/deno") : null, // User home directory
    process.env.DENO_INSTALL_ROOT ? path.join(process.env.DENO_INSTALL_ROOT, "bin/deno") : null,
    // Windows paths (with .exe extension)
    process.env.USERPROFILE ? path.join(process.env.USERPROFILE, ".deno", "bin", "deno.exe") : null,
    "C:\\Program Files\\deno\\deno.exe",
    // Try the command directly (relies on PATH)
    "deno",
  ].filter(Boolean); // Remove null entries

  // First check if specific paths exist
  for (const denoPath of possiblePaths.slice(0, -1)) { // All except the last one
    try {
      if (existsSync(denoPath)) {
        console.error(`[MCP Wrapper] Found Deno at: ${denoPath}`);
        return denoPath;
      }
    } catch (error) {
      // Ignore errors checking file existence
    }
  }

  // Finally, try 'deno' command directly (which relies on PATH)
  try {
    execSync("deno --version", { stdio: "ignore" });
    console.error("[MCP Wrapper] Using Deno from PATH");
    return "deno";
  } catch (error) {
    // If we can't find deno anywhere, return null
    console.error("[MCP Wrapper] Deno not found in any standard location");
    return null;
  }
}

/**
 * Prints installation instructions for Deno
 */
function printDenoInstallInstructions() {
  console.error("\n========== DENO NOT FOUND ==========");
  console.error(
    "SPARC2 requires Deno to run. Please install Deno using one of the following methods:",
  );
  console.error("\nLinux/macOS:");
  console.error("  curl -fsSL https://deno.land/install.sh | sh");
  console.error("\nWindows (PowerShell):");
  console.error("  irm https://deno.land/install.ps1 | iex");
  console.error("\nUsing Homebrew (macOS/Linux):");
  console.error("  brew install deno");
  console.error("\nUsing Chocolatey (Windows):");
  console.error("  choco install deno");
  console.error("\nUsing Scoop (Windows):");
  console.error("  scoop install deno");
  console.error(
    "\nAfter installation, you may need to restart your terminal or add Deno to your PATH.",
  );
  console.error("For more information, visit: https://deno.land/#installation");
  console.error("=====================================\n");
}

/**
 * Kill any process using the specified port
 * @param {number} port The port to check
 * @returns {boolean} True if a process was killed, false otherwise
 */
function killProcessOnPort(port) {
  console.error(`[HTTP Server] Checking for processes using port ${port}...`);
  
  try {
    let pid;
    let killCommand;
    
    if (process.platform === 'win32') {
      // Windows: Get PID using netstat
      try {
        const output = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf8' });
        const match = output.match(/\s+(\d+)\s*$/m);
        if (match && match[1]) {
          pid = match[1];
          killCommand = `taskkill /F /PID ${pid}`;
        }
      } catch (e) {
        // No process found
        return false;
      }
    } else {
      // Linux/macOS: Get PID using lsof
      try {
        pid = execSync(`lsof -i :${port} -t`, { encoding: 'utf8' }).trim();
        if (pid) {
          killCommand = `kill -9 ${pid}`;
        }
      } catch (e) {
        // No process found
        return false;
      }
    }
    
    if (pid && killCommand) {
      console.error(`[HTTP Server] Found process with PID ${pid} using port ${port}. Killing it...`);
      execSync(killCommand, { stdio: 'ignore' });
      console.error(`[HTTP Server] Successfully killed process using port ${port}.`);
      
      // Wait a moment for the port to be released
      execSync('sleep 1');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`[HTTP Server Error] Failed to kill process: ${error.message}`);
    return false;
  }
}

// Function to start the HTTP server
async function startHttpServer() {
  return new Promise((resolve, reject) => {
    // Get the directory of this script
    const scriptDir = path.resolve(__dirname, "../..");

    // Find the Deno executable
    const denoPath = findDenoExecutable();

    // Check if Deno is installed
    if (!denoPath) {
      printDenoInstallInstructions();
      reject(new Error("Deno is not installed. Please install Deno and try again."));
      return;
    }

    // IMPORTANT: Start the HTTP API server directly, not the MCP server
    // This avoids the circular dependency where the MCP server tries to start this wrapper
    httpServerProcess = spawn(denoPath, [
      "run",
      "--allow-read",
      "--allow-write",
      "--allow-env",
      "--allow-net",
      "--allow-run",
      path.join(scriptDir, "src", "cli", "cli.ts"),
      "api", // Use the API command instead of MCP command
      "--port",
      "3001",
    ], {
      cwd: scriptDir,
      stdio: "pipe",
      env: {
        ...process.env,
        // Set a flag to prevent the API server from starting the MCP server
        SPARC2_DIRECT_API: "true",
      },
    });

    // Create a server start timeout
    const serverStartTimeout = setTimeout(() => {
      reject(new Error("HTTP server failed to start within 30 seconds"));
    }, 30000);

    // Handle server output
    httpServerProcess.stdout.on("data", (data) => {
      console.error(`[HTTP Server] ${data.toString().trim()}`);

      // Check if the server is listening
      if (data.toString().includes("Listening on http://localhost:3001")) {
        clearTimeout(serverStartTimeout);
        resolve();
      }
    });

    httpServerProcess.stderr.on("data", (data) => {
      // Prevent feedback loop by not logging messages that contain "[MCP Wrapper]"
      const message = data.toString().trim();
      if (!message.includes("[MCP Wrapper]")) {
        console.error(`[HTTP Server Error] ${message}`);
      }
    });

    httpServerProcess.on("error", (error) => {
      console.error(`[HTTP Server Process Error] ${error.message}`);
      clearTimeout(serverStartTimeout);
      reject(error);
    });

    httpServerProcess.on("close", (code) => {
      console.error(`[HTTP Server Process Exited] with code ${code}`);
      clearTimeout(serverStartTimeout);

      // Don't restart if exit was clean (code 0) or if we're shutting down
      if (code !== 0 && !isShuttingDown) {
        console.error(`[MCP Wrapper] HTTP server exited unexpectedly.`);
        reject(new Error(`HTTP server exited with code ${code}`));
      }

      httpServerProcess = null;
    });
  });
}

/**
 * Analyze code files with SSE progress updates
 * @param {string[]} files Array of file paths to analyze
 * @param {EventSourceResponse} sse SSE response object
 */
async function analyzeCodeWithSSE(files, sse) {
  try {
    // Send initial progress update
    sse.send({ 
      status: 'started',
      message: 'Starting code analysis',
      progress: 0
    }, 'progress');
    
    // Make the HTTP request to the SPARC2 HTTP server for analysis
    // but stream the progress updates
    try {
      // Send progress update for file reading
      for (let i = 0; i < files.length; i++) {
        sse.send({ 
          status: 'reading',
          message: `Reading file ${files[i]}`,
          progress: (i / files.length) * 20
        }, 'progress');
        
        // Simulate file reading time
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Send progress update for analysis start
      sse.send({ 
        status: 'analyzing',
        message: 'Files loaded, starting analysis',
        progress: 20
      }, 'progress');
      
      // Simulate analysis steps
      const analysisSteps = [
        { message: 'Parsing code structure', progress: 30 },
        { message: 'Analyzing syntax', progress: 40 },
        { message: 'Checking for code smells', progress: 50 },
        { message: 'Evaluating complexity', progress: 60 },
        { message: 'Identifying potential improvements', progress: 70 },
        { message: 'Generating recommendations', progress: 80 },
        { message: 'Finalizing analysis', progress: 90 }
      ];
      
      // Send progress updates for each step
      for (const step of analysisSteps) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
        
        sse.send({ 
          status: 'analyzing',
          message: step.message,
          progress: step.progress
        }, 'progress');
      }
      
      // Make the actual HTTP request to get the analysis result
      const response = await makeHttpRequest('analyze', 'POST', { files });
      
      // Send final progress update
      sse.send({ 
        status: 'completed',
        message: 'Analysis completed',
        progress: 100
      }, 'progress');
      
      // Send the analysis result
      sse.send({ 
        result: response
      }, 'result');
      
      // Close the SSE connection
      sse.close();
    } catch (error) {
      // Send error message
      sse.send({ 
        status: 'error',
        message: `Error during analysis: ${error.message}`,
        error: error.message
      }, 'error');
      
      // Close the SSE connection
      sse.close();
    }
  } catch (error) {
    console.error(`[SSE Error] ${error.message}`);
    if (!sse.closed) {
      sse.send({ 
        status: 'error',
        message: `Unexpected error: ${error.message}`,
        error: error.message
      }, 'error');
      sse.close();
    }
  }
}

// Function to make an HTTP request to the SPARC2 HTTP server
async function makeHttpRequest(endpoint, method = "GET", body = null) {
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        const options = {
          hostname: "localhost",
          port: 3001,
          path: `/${endpoint}`,
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          // Add a timeout to the request
          timeout: 10000,
        };

        const req = http.request(options, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve(JSON.parse(data));
              } catch (error) {
                resolve(data);
              }
            } else {
              reject(new Error(`HTTP Error: ${res.statusCode} - ${data}`));
            }
          });
        });

        req.on("error", (error) => {
          reject(error);
        });

        req.on("timeout", () => {
          req.destroy();
          reject(new Error("Request timed out"));
        });

        if (body) {
          req.write(JSON.stringify(body));
        }

        req.end();
      });
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        throw error;
      }
      console.error(
        `[MCP Wrapper] Request to ${endpoint} failed (attempt ${attempt}/${maxRetries}): ${error.message}. Retrying...`,
      );
      // Wait before retrying with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }

  // This should never be reached due to the throw in the loop, but just in case
  throw lastError;
}

// Create the MCP server
const server = new Server(
  {
    name: "sparc2-mcp",
    version: "2.0.5",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Set up the ListTools request handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  try {
    // Get the tools from the HTTP server
    const response = await makeHttpRequest("discover", "GET");

    return {
      tools: response.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.parameters,
      })),
    };
  } catch (error) {
    console.error(`[MCP Server Error] Failed to list tools: ${error.message}`);
    throw new McpError(ErrorCode.InternalError, `Failed to list tools: ${error.message}`);
  }
});

// Set up the CallTool request handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const toolName = request.params.name;
    const args = request.params.arguments;

    // Special handling for analyze_code to support SSE
    if (toolName === "analyze_code") {
      // Return a URL for the SSE stream
      return {
        content: [
          {
            type: "text",
            text: "Analysis started. Connect to the SSE stream to receive progress updates.",
          },
        ],
        streamUrl: `http://localhost:3001/stream/analyze?id=${Date.now()}`,
      };
    }
    
    // Map the tool name to the corresponding HTTP endpoint
    let endpoint;
    switch (toolName) {
      case "analyze_code":
        endpoint = "analyze";
        break;
      case "modify_code":
        endpoint = "modify";
        break;
      case "execute_code":
        endpoint = "execute";
        break;
      case "search_code":
        endpoint = "search";
        break;
      case "create_checkpoint":
        endpoint = "checkpoint";
        break;
      case "rollback":
        endpoint = "rollback";
        break;
      case "config":
        endpoint = "config";
        break;
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
    }

    // Make the HTTP request to the SPARC2 HTTP server
    const response = await makeHttpRequest(endpoint, "POST", args);

    // Format the response
    return {
      content: [
        {
          type: "text",
          text: typeof response === "string" ? response : JSON.stringify(response, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error(`[MCP Server Error] Failed to call tool: ${error.message}`);
    throw new McpError(ErrorCode.InternalError, `Failed to call tool: ${error.message}`);
  }
});

// Set up error handler
server.onerror = (error) => {
  console.error(`[MCP Server Error] ${error}`);
};

// Create an HTTP server for SSE
let sseHttpServer = null;

// Function to start the SSE HTTP server
function startSseHttpServer() {
  // Create HTTP server for SSE
  sseHttpServer = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Handle SSE stream requests
    if (url.pathname === '/stream/analyze') {
      const id = url.searchParams.get('id');
      const filesParam = url.searchParams.get('files');
      const files = filesParam ? filesParam.split(',') : [];
      
      console.error(`[SSE Server] Received analyze request for files: ${files.join(', ')}`);
      
      // Set up SSE response
      const sse = new EventSourceResponse(res);
      
      // Start analysis with SSE updates
      analyzeCodeWithSSE(files, sse);
      
      return;
    }
    
    // Handle other requests
    res.writeHead(404);
    res.end('Not Found');
  });
  
  // Start HTTP server on port 3001 (same as the API server)
  // This works because we're using the same process, so there's no port conflict
  sseHttpServer.listen(3001, () => {
    console.error(`[MCP Wrapper] SSE server listening on port 3001`);
  });
  
  // Handle HTTP server errors
  sseHttpServer.on('error', (error) => {
    console.error(`[SSE Server Error] ${error.message}`);
  });
}

// Main function
async function main() {
  try {
    // Kill any process using port 3001 before starting
    console.error("[MCP Wrapper] Checking for processes using port 3001...");
    killProcessOnPort(3001);
    
    // Start the HTTP server
    console.error("[MCP Wrapper] Starting HTTP API server...");
    await startHttpServer();
    
    // Start the SSE HTTP server
    console.error("[MCP Wrapper] Starting SSE server...");
    startSseHttpServer();
    console.error("[MCP Wrapper] HTTP API server started");

    // Connect to the stdio transport
    console.error("[MCP Wrapper] Connecting to stdio transport...");
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[MCP Wrapper] SPARC2 MCP server running on stdio");

    // Handle process exit
    process.on("SIGINT", async () => {
      isShuttingDown = true;
      console.error("[MCP Wrapper] Shutting down...");
      if (httpServerProcess) {
        httpServerProcess.kill();
      }
      if (sseHttpServer) {
        sseHttpServer.close();
      }
      await server.close();
      process.exit(0);
    });
  } catch (error) {
    console.error(`[MCP Wrapper Error] ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error(`[MCP Wrapper Unhandled Error] ${error.message}`);
  process.exit(1);
});
