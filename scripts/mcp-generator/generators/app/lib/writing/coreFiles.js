/**
 * Core files generator
 * Creates the main server and index files
 */

const templates = require('./templates');

module.exports = function(generator) {
  // Create index.ts
  generator.fs.write(
    generator.destinationPath('src/index.ts'),
    templates.getIndexFileContent(generator.answers)
  );
  
  // Create server.ts
  generator.fs.write(
    generator.destinationPath('src/core/server.ts'),
    templates.getServerFileContent(generator.answers)
  );
  
  // Create MCP SDK type definition
  generator.fs.write(
    generator.destinationPath('src/types/mcp.d.ts'),
    `declare module '@modelcontextprotocol/sdk/types.js' {
  export interface MCPRequest<T = any> {
    data: T;
    headers?: Record<string, string>;
    handlerName?: string;
    [key: string]: any;
  }

  export interface MCPHandler<TRequest = any, TResponse = any> {
    requestSchema: any;
    responseSchema: any;
    handler: (request: MCPRequest<TRequest>) => Promise<TResponse>;
  }

  export interface MCPServerOptions {
    name: string;
    [key: string]: any;
  }

  export interface MCPServer {
    addHandler: (name: string, handler: MCPHandler) => void;
    listen: (port: number) => Promise<void>;
    use: (middleware: any) => void;
    [key: string]: any;
  }
}

declare module '@modelcontextprotocol/sdk/server.js' {
  import { MCPServerOptions, MCPServer } from '@modelcontextprotocol/sdk/types.js';
  export function createServer(options: MCPServerOptions): MCPServer;
}
`
  );
};