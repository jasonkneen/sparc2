# Architecture

This document provides an overview of the architecture of MCP server projects created with MCP Creator, explaining the key components and how they interact.

## Project Structure

The structure of an MCP server project varies based on the complexity level you choose, but the core components remain consistent. Here's the typical structure of an advanced MCP server project:

```
my-mcp-server/
├── .env.example                 # Example environment variables
├── .gitignore                   # Git ignore file
├── Dockerfile                   # Docker configuration (if selected)
├── README.md                    # Project documentation
├── docker-compose.yml           # Docker Compose configuration (if selected)
├── jest.config.js               # Jest configuration (if tests are included)
├── package.json                 # Node.js package configuration
├── tsconfig.json                # TypeScript configuration
├── src/                         # Source code directory
│   ├── index.ts                 # Main entry point
│   ├── auth/                    # Authentication components (if selected)
│   │   └── auth.ts              # Authentication implementation
│   ├── core/                    # Core MCP server components
│   │   └── server.ts            # MCP server implementation
│   ├── edge/                    # Edge function components (if selected)
│   │   └── edge.ts              # Edge function implementation
│   ├── examples/                # Example handlers (if selected)
│   │   ├── calculator.ts        # Calculator example
│   │   └── echo.ts              # Echo example
│   ├── handlers/                # Request handlers
│   │   └── hello.ts             # Basic hello handler
│   ├── middleware/              # Middleware components (if selected)
│   │   └── logging.ts           # Logging middleware
│   ├── utils/                   # Utility functions
│   │   ├── config.ts            # Configuration utilities (if selected)
│   │   └── helpers.ts           # Helper functions
│   └── websocket/               # WebSocket components (if selected)
│       └── websocket.ts         # WebSocket implementation
└── tests/                       # Test directory (if selected)
    └── hello.test.ts            # Tests for hello handler
```

## Core Components

### Entry Point (index.ts)

The entry point initializes and starts the MCP server. It imports the necessary components, configures the server, and starts listening for requests.

```typescript
// Example index.ts
import { createServer } from './core/server';
import { helloHandler } from './handlers/hello';

// Create and configure the server
const server = createServer({
  name: 'my-mcp-server',
  version: '1.0.0'
});

// Register handlers
server.registerHandler('hello', helloHandler);

// Start the server
server.start(3000).then(() => {
  console.log('MCP server is running on port 3000');
});
```

### MCP Server (core/server.ts)

The MCP server is the core component that implements the Model Context Protocol. It handles incoming requests, routes them to the appropriate handlers, and returns responses.

```typescript
// Example server.ts
import { createServer as createHttpServer } from 'http';
import { MCPServer, Handler } from '@modelcontextprotocol/sdk';

export interface ServerConfig {
  name: string;
  version: string;
}

export function createServer(config: ServerConfig): MCPServer {
  const handlers = new Map<string, Handler>();
  
  const server = {
    registerHandler(name: string, handler: Handler) {
      handlers.set(name, handler);
    },
    
    async start(port: number) {
      const httpServer = createHttpServer((req, res) => {
        // Handle MCP requests
        // ...
      });
      
      return new Promise<void>((resolve) => {
        httpServer.listen(port, () => {
          resolve();
        });
      });
    }
  };
  
  return server;
}
```

### Handlers (handlers/*.ts)

Handlers process specific types of requests in an MCP server. They define the behavior of your AI services and are the primary way to extend your MCP server's functionality.

```typescript
// Example hello.ts
import { Handler } from '@modelcontextprotocol/sdk';

export const helloHandler: Handler = async (request) => {
  const { input } = request;
  return {
    output: `Hello, ${input}!`
  };
};
```

## Optional Components

### Authentication (auth/auth.ts)

If you select the authentication feature, MCP Creator will include a basic authentication framework that you can extend to implement your own authentication logic.

```typescript
// Example auth.ts
export interface AuthConfig {
  apiKey: string;
}

export function createAuthMiddleware(config: AuthConfig) {
  return (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (apiKey !== config.apiKey) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    
    next();
  };
}
```

### Logging (middleware/logging.ts)

If you select the logging feature, MCP Creator will include a structured logging framework using Winston.

```typescript
// Example logging.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export function createLoggingMiddleware() {
  return (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      logger.info({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration
      });
    });
    
    next();
  };
}
```

### Environment Configuration (utils/config.ts)

If you select the environment configuration feature, MCP Creator will include utilities for loading and accessing environment variables.

```typescript
// Example config.ts
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  serverName: process.env.MCP_SERVER_NAME || 'my-mcp-server'
};
```

### WebSocket Support (websocket/websocket.ts)

If you select the WebSocket feature, MCP Creator will include WebSocket server integration.

```typescript
// Example websocket.ts
import { Server as WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';

export function createWebSocketServer(httpServer: HttpServer) {
  const wss = new WebSocketServer({ server: httpServer });
  
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      // Handle WebSocket messages
      // ...
    });
  });
  
  return wss;
}
```

### Edge Functions (edge/edge.ts)

If you select the edge function feature, MCP Creator will include support for edge functions.

```typescript
// Example edge.ts
export interface EdgeFunction {
  name: string;
  handler: (request: any) => Promise<any>;
}

export function createEdgeFunction(name: string, handler: (request: any) => Promise<any>): EdgeFunction {
  return {
    name,
    handler
  };
}
```

## Data Flow

1. **Client Request**: A client sends an HTTP request to the MCP server.
2. **Request Parsing**: The server parses the request and extracts the relevant information.
3. **Authentication** (if enabled): The server authenticates the request.
4. **Logging** (if enabled): The server logs the request.
5. **Handler Selection**: The server selects the appropriate handler based on the request.
6. **Handler Execution**: The handler processes the request and generates a response.
7. **Response Formatting**: The server formats the response according to the MCP specification.
8. **Response Sending**: The server sends the response back to the client.

## Next Steps

For more information about customizing your MCP server, see the [Customization](../customization.md) documentation.