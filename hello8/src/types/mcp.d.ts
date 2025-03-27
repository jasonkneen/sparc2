declare module '@modelcontextprotocol/sdk' {
  export interface MCPRequest<T = any> {
    data: T;
    headers?: Record<string, string>;
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

  export function createServer(options: MCPServerOptions): MCPServer;
}
