/**
 * Deno-specific Server-Sent Events (SSE) implementation for MCP
 * This file provides SSE functionality optimized for Deno runtime
 */

/**
 * SSE Response class for Deno
 */
export class EventSourceResponse {
  private controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  private encoder = new TextEncoder();
  private stream: ReadableStream<Uint8Array>;
  private closed = false;

  constructor() {
    this.stream = new ReadableStream({
      start: (controller) => {
        this.controller = controller;
      },
      cancel: () => {
        this.close();
      }
    });
  }

  /**
   * Send data as an SSE event
   * @param data The data to send
   * @param eventName Optional event name
   */
  send(data: any, eventName?: string): void {
    if (this.closed || !this.controller) return;

    let message = '';
    
    // Add event name if provided
    if (eventName) {
      message += `event: ${eventName}\n`;
    }
    
    // Add data as JSON string
    message += `data: ${JSON.stringify(data)}\n\n`;
    
    // Send the message
    this.controller.enqueue(this.encoder.encode(message));
  }

  /**
   * Close the SSE connection
   */
  close(): void {
    if (this.closed || !this.controller) return;
    
    this.controller.close();
    this.controller = null;
    this.closed = true;
  }

  /**
   * Get the SSE response for Deno
   * @returns Response object with SSE headers
   */
  getResponse(): Response {
    return new Response(this.stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

/**
 * Create an SSE handler for Deno
 * @param path The path to handle SSE requests
 * @param handler Function to handle SSE connections
 * @returns Handler function for HTTP requests
 */
export function createSSEHandler(path: string, handler: (sse: EventSourceResponse, request: Request) => Promise<void>) {
  return async (request: Request): Promise<Response | null> => {
    const url = new URL(request.url);
    if (url.pathname === path) {
      const sse = new EventSourceResponse();
      
      // Handle the connection in the background
      handler(sse, request).catch((error) => {
        console.error('SSE handler error:', error);
        sse.close();
      });
      
      return sse.getResponse();
    }
    return null;
  };
}

/**
 * Example of a real-time data stream with Deno
 * @param dataSource The source of the data
 * @param interval Interval between updates in milliseconds
 * @returns SSE handler function
 */
export function createRealTimeDataStream(dataSource: string, interval = 1000) {
  return createSSEHandler('/stream', async (sse, request) => {
    // Set up interval for sending data
    const intervalId = setInterval(() => {
      // Generate sample data
      const data = {
        timestamp: new Date().toISOString(),
        source: dataSource,
        value: Math.random() * 100
      };
      
      // Send the data
      sse.send(data);
    }, interval);
    
    // Clean up when the connection is closed
    try {
      // Wait for the request to be aborted
      await new Promise<void>((resolve, reject) => {
        request.signal.addEventListener('abort', () => {
          resolve();
        });
      });
    } finally {
      // Clean up
      clearInterval(intervalId);
      sse.close();
    }
  });
}

/**
 * Example of how to use SSE with Deno and MCP:
 * 
 * ```typescript
 * // main.ts
 * import { serve } from "https://deno.land/std/http/server.ts";
 * import { McpServer } from "npm:@modelcontextprotocol/sdk";
 * import { createRealTimeDataStream } from "./sse.ts";
 * 
 * // Create MCP server
 * const mcpServer = new McpServer({
 *   name: "real-time-data-server"
 * });
 * 
 * // Create SSE handler
 * const sseHandler = createRealTimeDataStream("sensor", 1000);
 * 
 * // Define MCP tool for initiating streams
 * mcpServer.defineTool({
 *   name: "start_data_stream",
 *   description: "Start a real-time data stream",
 *   inputSchema: {
 *     type: "object",
 *     properties: {
 *       dataSource: { type: "string" },
 *       interval: { type: "number", default: 1000 }
 *     },
 *     required: ["dataSource"]
 *   },
 *   handler: async ({ dataSource, interval }) => {
 *     return {
 *       streamUrl: `http://localhost:8000/stream?source=${dataSource}&interval=${interval}`,
 *       instructions: "Connect to this URL with an EventSource to receive real-time updates"
 *     };
 *   }
 * });
 * 
 * // Handle HTTP requests
 * serve(async (request) => {
 *   // Check if this is an SSE request
 *   const sseResponse = await sseHandler(request);
 *   if (sseResponse) return sseResponse;
 *   
 *   // Otherwise, handle as MCP request
 *   if (request.url.endsWith("/mcp")) {
 *     return await mcpServer.handleRequest(request);
 *   }
 *   
 *   // Default response
 *   return new Response("Real-time data server", { status: 200 });
 * }, { port: 8000 });
 * ```
 * 
 * To compile this as a standalone binary:
 * ```bash
 * deno compile --allow-net --allow-env main.ts
 * ```
 */

/**
 * Example of a more advanced SSE implementation with compression:
 * 
 * ```typescript
 * import { compress } from "https://deno.land/x/compress@v0.4.5/mod.ts";
 * 
 * export class CompressedEventSourceResponse extends EventSourceResponse {
 *   private useCompression: boolean;
 *   
 *   constructor(useCompression = true) {
 *     super();
 *     this.useCompression = useCompression;
 *   }
 *   
 *   override getResponse(): Response {
 *     const response = super.getResponse();
 *     
 *     if (this.useCompression) {
 *       const headers = new Headers(response.headers);
 *       headers.set('Content-Encoding', 'gzip');
 *       
 *       return new Response(
 *         compress(response.body!, 'gzip'),
 *         {
 *           headers,
 *           status: response.status,
 *           statusText: response.statusText
 *         }
 *       );
 *     }
 *     
 *     return response;
 *   }
 * }
 * ```
 */