/**
 * SSE MCP Test for SPARC2
 * 
 * This example demonstrates how to use the SSE-enabled MCP server
 * to analyze code with real-time progress updates.
 */

// Import Deno standard library modules
import { serve } from "https://deno.land/std/http/server.ts";
import { dirname, fromFileUrl, join } from "https://deno.land/std/path/mod.ts";

// Configuration
const HTTP_SERVER_PORT = 8080;
const SSE_SERVER_URL = "http://localhost:3333";
const FILES_TO_ANALYZE = ["scripts/sparc2/src/cli/analyzeCommand.ts", "scripts/sparc2/sparc2-analyze-wrapper.js"];

// Get the directory of this script
const __dirname = dirname(fromFileUrl(import.meta.url));

/**
 * EventSource client for Node.js/Deno
 */
class EventSourceClient {
  private url: string;
  private abortController: AbortController;
  private eventHandlers: Map<string, ((data: any) => void)[]>;
  private errorHandler?: (error: Error) => void;
  private connected = false;

  constructor(url: string) {
    this.url = url;
    this.abortController = new AbortController();
    this.eventHandlers = new Map();
  }

  /**
   * Add event listener
   * @param event Event name
   * @param callback Callback function
   */
  addEventListener(event: string, callback: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(callback);
  }

  /**
   * Set error handler
   * @param callback Error callback function
   */
  onError(callback: (error: Error) => void): void {
    this.errorHandler = callback;
  }

  /**
   * Connect to the SSE stream
   */
  async connect(): Promise<void> {
    try {
      const response = await fetch(this.url, {
        signal: this.abortController.signal,
        headers: {
          "Accept": "text/event-stream",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to connect to SSE stream: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      this.connected = true;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Process the stream
      while (this.connected) {
        const { done, value } = await reader.read();
        
        if (done) {
          this.connected = false;
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete events in the buffer
        const events = this.processEvents(buffer);
        buffer = events.remainder;
      }
    } catch (error) {
      this.connected = false;
      if (this.errorHandler) {
        this.errorHandler(error instanceof Error ? error : new Error(String(error)));
      } else {
        console.error("SSE connection error:", error);
      }
    }
  }

  /**
   * Process SSE events from the buffer
   * @param buffer Text buffer
   * @returns Remainder of the buffer after processing events
   */
  private processEvents(buffer: string): { remainder: string } {
    const lines = buffer.split("\n");
    let currentEvent = "message";
    let currentData = "";
    let i = 0;

    for (; i < lines.length; i++) {
      const line = lines[i];
      
      // Empty line marks the end of an event
      if (line === "") {
        if (currentData) {
          this.dispatchEvent(currentEvent, currentData);
          currentEvent = "message";
          currentData = "";
        }
        continue;
      }

      // Event field
      if (line.startsWith("event:")) {
        currentEvent = line.substring(6).trim();
        continue;
      }

      // Data field
      if (line.startsWith("data:")) {
        currentData = line.substring(5).trim();
        continue;
      }
    }

    // Return the remainder of the buffer
    return {
      remainder: lines.slice(i).join("\n")
    };
  }

  /**
   * Dispatch an event to registered handlers
   * @param event Event name
   * @param data Event data
   */
  private dispatchEvent(event: string, data: string): void {
    try {
      const parsedData = JSON.parse(data);
      
      // Call event-specific handlers
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        for (const handler of handlers) {
          handler(parsedData);
        }
      }
      
      // Call message handlers if this is not a message event
      if (event !== "message") {
        const messageHandlers = this.eventHandlers.get("message");
        if (messageHandlers) {
          for (const handler of messageHandlers) {
            handler({ event, data: parsedData });
          }
        }
      }
    } catch (error) {
      console.error(`Error parsing event data: ${error}`);
    }
  }

  /**
   * Close the SSE connection
   */
  close(): void {
    this.connected = false;
    this.abortController.abort();
  }
}

/**
 * Run the SSE test directly
 */
async function runSseTest() {
  console.log("Starting SSE Test");
  
  try {
    // Create a direct stream URL with the files to analyze
    const fileParam = FILES_TO_ANALYZE.join(',');
    const streamUrl = `${SSE_SERVER_URL}/stream/analyze?id=${Date.now()}&files=${encodeURIComponent(fileParam)}`;
    
    console.log(`Connecting to SSE stream: ${streamUrl}`);
    
    // Connect to the SSE stream
    const eventSource = new EventSourceClient(streamUrl);
    
    // Handle progress events
    eventSource.addEventListener("progress", (data) => {
      const progressBar = createProgressBar(data.progress);
      console.log(`[${data.status}] ${data.message} ${progressBar} ${data.progress}%`);
    });
    
    // Handle result events
    eventSource.addEventListener("result", (data) => {
      console.log("\nAnalysis complete!");
      console.log("Result:", JSON.stringify(data.result, null, 2));
      eventSource.close();
    });
    
    // Handle error events
    eventSource.addEventListener("error", (data) => {
      console.error("Error during analysis:", data.message);
      eventSource.close();
    });
    
    // Handle connection errors
    eventSource.onError((error) => {
      console.error("SSE connection error:", error.message);
    });
    
    // Connect to the stream
    await eventSource.connect();
    
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Create a simple ASCII progress bar
 * @param progress Progress percentage (0-100)
 * @returns ASCII progress bar
 */
function createProgressBar(progress: number): string {
  const width = 20;
  const filled = Math.round(width * (progress / 100));
  const empty = width - filled;
  return `[${"=".repeat(filled)}${" ".repeat(empty)}]`;
}

/**
 * Start an HTTP server to serve the HTML client
 */
async function startHttpServer() {
  console.log(`Starting HTTP server on port ${HTTP_SERVER_PORT}...`);
  
  // Read the HTML client file
  const htmlClientPath = join(__dirname, "analyze-sse-client.html");
  console.log(`Reading HTML client from: ${htmlClientPath}`);
  const htmlClient = await Deno.readTextFile(htmlClientPath);
  
  // Start the server
  serve((req) => {
    const url = new URL(req.url);
    
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(htmlClient, {
        headers: { "Content-Type": "text/html" }
      });
    }
    
    return new Response("Not found", { status: 404 });
  }, { port: HTTP_SERVER_PORT });
  
  console.log(`HTTP server running at http://localhost:${HTTP_SERVER_PORT}/`);
}

// Main function
if (import.meta.main) {
  // Check command line arguments
  const args = Deno.args;
  
  if (args.includes("--server")) {
    // Start HTTP server
    await startHttpServer();
  } else {
    // Run the SSE test
    await runSseTest();
  }
}