#!/usr/bin/env node

/**
 * Simple MCP Server Wrapper for SPARC 2.0
 * This is a simplified version to test the basic MCP functionality
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";

// Create the MCP server
const server = new Server(
  {
    name: "sparc2-mcp-simple",
    version: "1.0.0",
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
        name: "echo",
        description: "Echo back the input",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Message to echo",
            },
          },
          required: ["message"],
        },
      },
    ],
  };
});

// Set up the CallTool request handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = request.params.arguments;
  
  if (toolName === "echo") {
    return {
      content: [
        {
          type: "text",
          text: `Echo: ${args.message}`,
        },
      ],
    };
  }
  
  throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
});

// Set up error handler
server.onerror = (error) => {
  console.error(`[MCP Server Error] ${error}`);
};

// Start the server
try {
  console.log("[MCP Simple] Starting MCP server...");
  const transport = new StdioServerTransport();
  transport.start(server);
  console.log("[MCP Simple] MCP server started successfully");
} catch (error) {
  console.error(`[MCP Simple Error] Failed to start: ${error.message}`);
  process.exit(1);
}
