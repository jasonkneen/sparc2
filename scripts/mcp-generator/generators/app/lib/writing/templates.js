/**
 * Templates for generating files
 */

function getIndexFileContent(answers) {
  return `#!/usr/bin/env node
import { startServer } from './core/server.js';

// Start the MCP server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
`;
}

function getServerFileContent(answers) {
  // Use the correct import path for MCP SDK
  let imports = `// Import handlers
import { helloHandler } from '../handlers/hello.js';`;
  
  let additionalImports = '';
  let additionalSetup = '';
  
  // Add imports for advanced features
  if (answers.complexity === 'advanced') {
    if (answers.features.includes('logging')) {
      additionalImports += `\nimport { setupLogging } from '../middleware/logging.js';`;
      additionalSetup += `\n  // Setup logging middleware\n  setupLogging(server);`;
    }
    
    if (answers.features.includes('auth')) {
      additionalImports += `\nimport { setupAuth } from '../auth/auth.js';`;
      additionalSetup += `\n  // Setup authentication\n  setupAuth(server);`;
    }
    
    if (answers.features.includes('edge')) {
      additionalImports += `\nimport { setupEdgeFunctions } from '../edge/edge.js';`;
      additionalSetup += `\n  // Setup edge functions\n  setupEdgeFunctions(server);`;
    }
    
    if (answers.features.includes('websocket')) {
      additionalImports += `\nimport { setupWebSocket } from '../websocket/websocket.js';`;
      additionalSetup += `\n  // Setup WebSocket support\n  setupWebSocket(server);`;
    }
  }
  
  // Add example imports if requested
  if (answers.includeExamples) {
    additionalImports += `\nimport { echoHandler } from '../examples/echo.js';
import { calculatorHandler } from '../examples/calculator.js';`;
  }
  
  // Import the MCP SDK directly with the correct subpath
  additionalImports += `\n// Import MCP SDK
import { createServer } from '@modelcontextprotocol/sdk/server.js';`;
  
  let content = `${imports}${additionalImports}

export async function startServer() {
  // Create the MCP server
  const server = createServer({
    name: '${answers.name}'
  });

  // Register handlers
  server.addHandler('hello', helloHandler);
${answers.includeExamples ? `  server.addHandler('echo', echoHandler);
  server.addHandler('calculator', calculatorHandler);` : ''}${additionalSetup}

  // Start the server
  const port = ${answers.features?.includes('env') ? 'parseInt(process.env.PORT || "3000")' : '3000'};
  await server.listen(port);
  console.log(\`MCP server running at http://localhost:\${port}\`);
  
  return server;
}`;

  return content;
}

function getBasicHandlerContent() {
  return `import { MCPHandler, MCPRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Define the schema for the request
const requestSchema = z.object({
  name: z.string().optional()
});

// Define the schema for the response
const responseSchema = z.object({
  message: z.string()
});

// Define types based on the schemas
type HelloRequest = z.infer<typeof requestSchema>;
type HelloResponse = z.infer<typeof responseSchema>;

// Create the handler
export const helloHandler: MCPHandler<HelloRequest, HelloResponse> = {
  requestSchema,
  responseSchema,
  handler: async (request: MCPRequest<HelloRequest>): Promise<HelloResponse> => {
    const { name } = request.data;
    const greeting = name ? \`Hello, \${name}!\` : 'Hello, world!';
    
    return {
      message: greeting
    };
  }
};
`;
}

function getUtilsContent() {
  return `/**
 * Helper utilities for the MCP server
 */

/**
 * Formats a date as an ISO string
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Generates a random ID
 */
export function generateId(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
`;
}

function getEchoExampleContent() {
  return `import { MCPHandler, MCPRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Define the schema for the request
const requestSchema = z.object({
  message: z.string()
});

// Define the schema for the response
const responseSchema = z.object({
  echo: z.string(),
  timestamp: z.number()
});

// Define types based on the schemas
type EchoRequest = z.infer<typeof requestSchema>;
type EchoResponse = z.infer<typeof responseSchema>;

// Create the handler
export const echoHandler: MCPHandler<EchoRequest, EchoResponse> = {
  requestSchema,
  responseSchema,
  handler: async (request: MCPRequest<EchoRequest>): Promise<EchoResponse> => {
    const { message } = request.data;
    
    return {
      echo: message,
      timestamp: Date.now()
    };
  }
};
`;
}

function getCalculatorExampleContent() {
  return `import { MCPHandler, MCPRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Define the schema for the request
const requestSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
  a: z.number(),
  b: z.number()
});

// Define the schema for the response
const responseSchema = z.object({
  result: z.number(),
  operation: z.string()
});

// Define types based on the schemas
type CalculatorRequest = z.infer<typeof requestSchema>;
type CalculatorResponse = z.infer<typeof responseSchema>;

// Create the handler
export const calculatorHandler: MCPHandler<CalculatorRequest, CalculatorResponse> = {
  requestSchema,
  responseSchema,
  handler: async (request: MCPRequest<CalculatorRequest>): Promise<CalculatorResponse> => {
    const { operation, a, b } = request.data;
    
    let result: number;
    
    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) {
          throw new Error('Division by zero');
        }
        result = a / b;
        break;
      default:
        throw new Error('Invalid operation');
    }
    
    return {
      result,
      operation: \`\${a} \${operation} \${b} = \${result}\`
    };
  }
};
`;
}

function getBasicTestContent() {
  return `import { helloHandler } from '../src/handlers/hello.js';

describe('Hello Handler', () => {
  it('should return a greeting with name when provided', async () => {
    const request = {
      data: { name: 'Test' }
    };
    
    const response = await helloHandler.handler(request);
    
    expect(response).toEqual({
      message: 'Hello, Test!'
    });
  });
  
  it('should return a default greeting when no name is provided', async () => {
    const request = {
      data: {}
    };
    
    const response = await helloHandler.handler(request);
    
    expect(response).toEqual({
      message: 'Hello, world!'
    });
  });
});
`;
}

function getConfigUtilContent(answers) {
  return `import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define the schema for environment variables
const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MCP_SERVER_NAME: z.string().default('${answers.name}')
});

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

// Export configuration
export const config = {
  port: parseInt(env.PORT),
  environment: env.NODE_ENV,
  serverName: env.MCP_SERVER_NAME,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test'
};
`;
}

function getAuthContent() {
  return `import { MCPServer } from '@modelcontextprotocol/sdk/types.js';

// Simple authentication middleware
export function setupAuth(server: MCPServer) {
  server.use(async (request, next) => {
    // Get the authorization header
    const authHeader = request.headers?.authorization;
    
    // Check if the authorization header exists and is valid
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized: Missing or invalid authorization header');
    }
    
    // Extract the token
    const token = authHeader.substring(7);
    
    // Validate the token (this is a simple example, use a proper validation in production)
    if (token !== 'valid-token') {
      throw new Error('Unauthorized: Invalid token');
    }
    
    // Continue to the next middleware or handler
    return next();
  });
}
`;
}

function getLoggingContent() {
  return `import { MCPServer } from '@modelcontextprotocol/sdk/types.js';
import winston from 'winston';

// Create a logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Logging middleware
export function setupLogging(server: MCPServer) {
  server.use(async (request, next) => {
    const startTime = Date.now();
    
    try {
      // Log the request
      logger.info({
        type: 'request',
        handler: request.handlerName,
        data: request.data
      });
      
      // Process the request
      const result = await next();
      
      // Log the response
      const duration = Date.now() - startTime;
      logger.info({
        type: 'response',
        handler: request.handlerName,
        duration,
        success: true
      });
      
      return result;
    } catch (error) {
      // Log the error
      const duration = Date.now() - startTime;
      logger.error({
        type: 'error',
        handler: request.handlerName,
        duration,
        error: error.message,
        stack: error.stack
      });
      
      // Re-throw the error
      throw error;
    }
  });
}
`;
}

function getEdgeFunctionContent() {
  return `import { MCPServer } from '@modelcontextprotocol/sdk/types.js';

// Edge functions middleware
export function setupEdgeFunctions(server: MCPServer) {
  server.use(async (request, next) => {
    // Check if the request is for an edge function
    if (request.headers?.['x-edge-function']) {
      // Process the edge function
      const functionName = request.headers['x-edge-function'];
      
      // Example edge functions
      if (functionName === 'transform') {
        // Process the request
        const result = await next();
        
        // Transform the result
        if (typeof result === 'object' && result !== null) {
          return {
            ...result,
            processedAtEdge: true,
            timestamp: Date.now()
          };
        }
      }
    }
    
    // Continue to the next middleware or handler
    return next();
  });
}
`;
}

function getWebSocketContent() {
  return `import { MCPServer } from '@modelcontextprotocol/sdk/types.js';

// WebSocket support
export function setupWebSocket(server: MCPServer) {
  // This is a placeholder for WebSocket setup
  // In a real implementation, you would integrate with a WebSocket library
  
  // Example: Track connected clients
  const clients = new Set();
  
  // Example: Broadcast a message to all clients
  function broadcast(message) {
    for (const client of clients) {
      client.send(JSON.stringify(message));
    }
  }
  
  // Example: Handle a new connection
  function handleConnection(client) {
    clients.add(client);
    
    client.on('message', (data) => {
      // Process the message
      const message = JSON.parse(data);
      
      // Broadcast the message to all clients
      broadcast({
        type: 'message',
        data: message,
        timestamp: Date.now()
      });
    });
    
    client.on('close', () => {
      clients.delete(client);
    });
  }
  
  // Return the WebSocket handler
  return {
    handleConnection,
    broadcast
  };
}
`;
}

function getReadmeContent(answers) {
  return `# ${answers.name}

${answers.description}

## Overview

This is a Model Context Protocol (MCP) server that provides API endpoints for various operations.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

### Building

\`\`\`bash
npm run build
\`\`\`

### Running

\`\`\`bash
npm start
\`\`\`

${answers.complexity !== 'basic' ? `
### Development

\`\`\`bash
npm run dev
\`\`\`
` : ''}

${answers.includeTests ? `
### Testing

\`\`\`bash
npm test
\`\`\`
` : ''}

${answers.includeDocker ? `
### Docker

Build the Docker image:

\`\`\`bash
docker build -t ${answers.name} .
\`\`\`

Run the container:

\`\`\`bash
docker run -p 3000:3000 ${answers.name}
\`\`\`

Or use Docker Compose:

\`\`\`bash
docker-compose up
\`\`\`
` : ''}

## API Endpoints

### Hello

- **Endpoint**: \`/hello\`
- **Method**: POST
- **Request Body**:
  \`\`\`json
  {
    "name": "Your Name" // Optional
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
    "message": "Hello, Your Name!"
  }
  \`\`\`

${answers.includeExamples ? `
### Echo

- **Endpoint**: \`/echo\`
- **Method**: POST
- **Request Body**:
  \`\`\`json
  {
    "message": "Your message"
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
    "echo": "Your message",
    "timestamp": 1679825000000
  }
  \`\`\`

### Calculator

- **Endpoint**: \`/calculator\`
- **Method**: POST
- **Request Body**:
  \`\`\`json
  {
    "operation": "add", // One of: add, subtract, multiply, divide
    "a": 10,
    "b": 5
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
    "result": 15,
    "operation": "10 add 5 = 15"
  }
  \`\`\`
` : ''}

## License

MIT
`;
}

module.exports = {
  getIndexFileContent,
  getServerFileContent,
  getBasicHandlerContent,
  getUtilsContent,
  getEchoExampleContent,
  getCalculatorExampleContent,
  getBasicTestContent,
  getConfigUtilContent,
  getAuthContent,
  getLoggingContent,
  getEdgeFunctionContent,
  getWebSocketContent,
  getReadmeContent
};