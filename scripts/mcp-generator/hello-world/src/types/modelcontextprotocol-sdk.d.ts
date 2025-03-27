declare module '@modelcontextprotocol/sdk' {
  export interface MCPRequest {
    data: any;
  }

  export interface MCPHandler {
    requestSchema: any;
    responseSchema: any;
    handler: (request: MCPRequest) => Promise<any>;
  }

  export interface MCPServerOptions {
    name: string;
    port?: number;
  }

  export interface MCPServer {
    addHandler: (name: string, handler: MCPHandler) => void;
    listen: (port: number) => Promise<void>;
  }

  export function createServer(options: MCPServerOptions): MCPServer;
}