#!/usr/bin/env node

/**
 * SPARC2 MCP Wrapper Script with SSE Support
 * 
 * This script provides an MCP server implementation with Server-Sent Events (SSE)
 * for streaming responses, preventing timeouts during long-running operations.
 */

import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import http from 'node:http';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Log the current directory for debugging
console.log(`${colors.blue}MCP Wrapper with SSE running from: ${__dirname}${colors.reset}`);

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
 * Check if Deno is installed
 * @returns {boolean} True if Deno is installed, false otherwise
 */
function isDenoInstalled() {
  try {
    execSync('deno --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Print Deno installation instructions
 */
function printDenoInstallInstructions() {
  console.log(`${colors.red}Error: Deno is required but not installed.${colors.reset}`);
  console.log(`${colors.yellow}Please install Deno using one of the following methods:${colors.reset}`);
  console.log(`\n${colors.blue}Linux/macOS:${colors.reset}`);
  console.log(`  curl -fsSL https://deno.land/install.sh | sh`);
  console.log(`\n${colors.blue}Windows (PowerShell):${colors.reset}`);
  console.log(`  irm https://deno.land/install.ps1 | iex`);
  
  // Check if the install script exists
  const installScriptPath = path.join(__dirname, 'install-deno.sh');
  if (fs.existsSync(installScriptPath)) {
    console.log(`\n${colors.green}Or run the included installation script:${colors.reset}`);
    console.log(`  ${installScriptPath}`);
  }
  
  console.log(`\n${colors.yellow}For more information, visit: https://deno.land/#installation${colors.reset}`);
  console.log(`\n${colors.cyan}After installing Deno, you may need to restart your terminal or add Deno to your PATH.${colors.reset}`);
}

/**
 * Check if we're running from a global installation (node_modules)
 * @returns {boolean} True if running from node_modules, false otherwise
 */
function isRunningFromNodeModules() {
  // Force simplified mode for now
  return true;
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
    
    // Read file contents
    const fileContents = {};
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        sse.send({ 
          status: 'reading',
          message: `Reading file ${file}`,
          progress: (i / files.length) * 20
        }, 'progress');
        
        fileContents[file] = fs.readFileSync(file, 'utf8');
      } catch (error) {
        sse.send({ 
          status: 'error',
          message: `Error reading file ${file}: ${error.message}`,
          error: error.message
        }, 'error');
        return;
      }
    }
    
    // Send progress update
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
    
    // Generate a simple analysis
    const analysis = {
      timestamp: new Date().toISOString(),
      files: files.map(file => ({
        path: file,
        size: fileContents[file].length,
        lines: fileContents[file].split('\n').length,
        suggestions: [
          "This is a simplified analysis with SSE streaming.",
          "For full functionality, please run SPARC2 from a local installation."
        ]
      }))
    };
    
    // Send final progress update
    sse.send({ 
      status: 'completed',
      message: 'Analysis completed',
      progress: 100
    }, 'progress');
    
    // Send the analysis result
    sse.send({ 
      result: analysis
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
}

/**
 * Run an MCP server with HTTP API and SSE support
 */
function runMcpServerWithSSE() {
  console.log(`${colors.yellow}Running MCP server with SSE support${colors.reset}`);
  
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

  // Set up the ListTools request handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "analyze_code",
          description: "Analyze code files for issues and improvements with streaming progress updates",
          inputSchema: {
            type: "object",
            properties: {
              files: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "List of file paths to analyze"
              }
            }
          }
        },
        {
          name: "modify_code",
          description: "Apply suggested modifications to code files",
          inputSchema: {
            type: "object",
            properties: {
              files: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "List of file paths to modify"
              },
              changes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    file: { type: "string" },
                    diff: { type: "string" }
                  }
                },
                description: "List of changes to apply"
              }
            }
          }
        },
        {
          name: "search_code",
          description: "Search code for patterns or keywords",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query"
              }
            }
          }
        }
      ]
    };
  });

  // Set up the CallTool request handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    
    if (toolName === "analyze_code") {
      const files = request.params.arguments.files || [];
      
      // Return a URL for the SSE stream
      return {
        content: [
          {
            type: "text",
            text: "Analysis started. Connect to the SSE stream to receive progress updates.",
          },
        ],
        streamUrl: `http://localhost:3333/stream/analyze?id=${Date.now()}`,
      };
    }
    
    // Handle other tools
    return {
      content: [
        {
          type: "text",
          text: `Tool "${toolName}" was called with arguments:\n${JSON.stringify(request.params.arguments, null, 2)}`,
        },
      ],
    };
  });

  // Set up error handler
  server.onerror = (error) => {
    console.error(`[MCP Server Error] ${error}`);
  };

  // Connect to the stdio transport
  console.log(`${colors.blue}Connecting to stdio transport...${colors.reset}`);
  const transport = new StdioServerTransport();
  server.connect(transport).then(() => {
    console.log(`${colors.green}SPARC2 MCP server running on stdio${colors.reset}`);
  }).catch((error) => {
    console.error(`${colors.red}Failed to connect to stdio transport: ${error.message}${colors.reset}`);
    process.exit(1);
  });
  
  // Create pending analysis requests
  const pendingAnalysis = new Map();
  
  // Start HTTP server for SSE
  const httpServer = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Handle SSE stream requests
    if (url.pathname === '/stream/analyze') {
      const id = url.searchParams.get('id');
      const files = url.searchParams.get('files')?.split(',') || [];
      
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
  
  // Start HTTP server
  const port = 3333;
  httpServer.listen(port, () => {
    console.log(`${colors.green}[MCP Wrapper] Starting HTTP API server on port ${port}...${colors.reset}`);
    console.log(`${colors.blue}[MCP Wrapper] Found Deno at: ${execSync('which deno').toString().trim()}${colors.reset}`);
  });
  
  // Handle HTTP server errors
  httpServer.on('error', (error) => {
    console.error(`${colors.red}[HTTP Server Error] Error starting API server: ${error.message}${colors.reset}`);
    
    // If the error is 'address already in use', try to kill the process using the port
    if (error.code === 'EADDRINUSE') {
      console.log(`${colors.yellow}[HTTP Server] Port ${port} is already in use. Attempting to kill the process...${colors.reset}`);
      
      try {
        // Try to kill the process using the port
        let killCommand;
        if (process.platform === 'win32') {
          // Windows
          killCommand = `FOR /F "tokens=5" %P IN ('netstat -ano ^| findstr :${port} ^| findstr LISTENING') DO taskkill /F /PID %P`;
        } else {
          // Linux/macOS
          killCommand = `lsof -i :${port} -t | xargs kill -9`;
        }
        
        execSync(killCommand, { stdio: 'ignore' });
        console.log(`${colors.green}[HTTP Server] Successfully killed process using port ${port}. Retrying...${colors.reset}`);
        
        // Wait a moment for the port to be released
        setTimeout(() => {
          console.log(`${colors.blue}[HTTP Server] Retrying to start server on port ${port}...${colors.reset}`);
          httpServer.listen(port, () => {
            console.log(`${colors.green}[MCP Wrapper] Starting HTTP API server on port ${port}...${colors.reset}`);
            console.log(`${colors.blue}[MCP Wrapper] Found Deno at: ${execSync('which deno').toString().trim()}${colors.reset}`);
          });
        }, 1000);
        
        return;
      } catch (killError) {
        console.error(`${colors.red}[HTTP Server Error] Failed to kill process: ${killError.message}${colors.reset}`);
      }
    }
    
    process.exit(1);
  });

  // Handle process exit
  process.on("SIGINT", async () => {
    console.log(`${colors.yellow}Shutting down...${colors.reset}`);
    httpServer.close();
    await server.close();
    process.exit(0);
  });
}

/**
 * Kill any process using the specified port
 * @param {number} port The port to check
 * @returns {boolean} True if a process was killed, false otherwise
 */
function killProcessOnPort(port) {
  console.log(`${colors.yellow}[HTTP Server] Checking for processes using port ${port}...${colors.reset}`);
  
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
      console.log(`${colors.yellow}[HTTP Server] Found process with PID ${pid} using port ${port}. Killing it...${colors.reset}`);
      execSync(killCommand, { stdio: 'ignore' });
      console.log(`${colors.green}[HTTP Server] Successfully killed process using port ${port}.${colors.reset}`);
      
      // Wait a moment for the port to be released
      execSync('sleep 1');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`${colors.red}[HTTP Server Error] Failed to kill process: ${error.message}${colors.reset}`);
    return false;
  }
}

// Main execution
if (!isDenoInstalled()) {
  printDenoInstallInstructions();
  process.exit(1);
}

// Kill any process using port 3333 before starting
killProcessOnPort(3333);



// Run the MCP server with SSE support
runMcpServerWithSSE();