/**
 * Templates module for the MCP server generator
 * Provides template content for generated files
 */

/**
 * Get the content for the README.md file
 * @param {Object} answers The user's answers from prompting
 * @returns {string} The README.md content
 */
function getReadmeContent(answers) {
  const { name, description, complexity, features = [] } = answers;
  
  let content = `# ${name}

${description}

## Features

- MCP Server with ${complexity} complexity
`;

  if (features.length > 0) {
    content += '\n### Advanced Features\n\n';
    
    features.forEach(feature => {
      switch (feature) {
        case 'env':
          content += '- Environment configuration\n';
          break;
        case 'logging':
          content += '- Logging middleware\n';
          break;
        case 'auth':
          content += '- Authentication support\n';
          break;
        case 'edge':
          content += '- Edge functions\n';
          break;
        case 'websocket':
          content += '- WebSocket support\n';
          break;
        case 'sse':
          content += '- Server-Sent Events (SSE) for real-time data streaming\n';
          break;
      }
    });
  }
  
  content += `
## Getting Started

### Installation

\`\`\`bash
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

### Build

\`\`\`bash
npm run build
\`\`\`

### Start

\`\`\`bash
npm start
\`\`\`

## MCP Server

The MCP server will be available at:

\`\`\`
http://localhost:3000/mcp
\`\`\`

`;

  if (features.includes('sse')) {
    content += `
## Server-Sent Events (SSE)

This server includes SSE support for real-time data streaming. The SSE endpoints are available at:

\`\`\`
http://localhost:3000/sse/{streamId}
\`\`\`

Use the \`real_time_data\` MCP handler to create and manage SSE streams.
`;
  }

  if (features.includes('websocket')) {
    content += `
## WebSocket

This server includes WebSocket support. The WebSocket endpoint is available at:

\`\`\`
ws://localhost:3000/ws
\`\`\`

Use the \`websocket\` MCP handler to manage WebSocket connections.
`;
  }

  return content;
}

/**
 * Get the content for the index.ts file
 * @param {Object} answers The user's answers from prompting
 * @returns {string} The index.ts content
 */
function getIndexFileContent(answers) {
  const { complexity, features = [] } = answers;
  
  let imports = `import { startServer } from './core/server.js';\n`;
  
  if (complexity === 'advanced' && features.includes('env')) {
    imports += `import { config } from './utils/config.js';\n`;
  }
  
  let content = `${imports}
/**
 * Main entry point for the MCP server
 */
async function main() {
  try {
    console.log('Starting MCP server...');
    
    // Start the server
    const port = ${complexity === 'advanced' && features.includes('env') ? 'config.PORT' : '3000'};
    await startServer(port);
    
    console.log(\`MCP server is running on port \${port}\`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
`;

  return content;
}

/**
 * Get the content for the server.ts file
 * @param {Object} answers The user's answers from prompting
 * @returns {string} The server.ts content
 */
function getServerFileContent(answers) {
  const { name, complexity, features = [] } = answers;
  
  let imports = `import { createMCPServer } from '@modelcontextprotocol/sdk';\n`;
  imports += `import { helloHandler } from '../handlers/hello.js';\n`;
  
  if (complexity === 'advanced') {
    if (features.includes('logging')) {
      imports += `import { loggingMiddleware } from '../middleware/logging.js';\n`;
    }
    
    if (features.includes('auth')) {
      imports += `import { authMiddleware } from '../auth/auth.js';\n`;
    }
    
    if (features.includes('sse')) {
      imports += `import { sseHandler } from '../sse/sse-handler.js';\n`;
    }
    
    if (features.includes('websocket')) {
      imports += `import { websocketHandler } from '../websocket/websocket.js';\n`;
    }
    
    if (features.includes('edge')) {
      imports += `import { edgeHandler } from '../edge/edge.js';\n`;
    }
  }
  
  let content = `${imports}

/**
 * Start the MCP server
 * @param {number} port The port to listen on
 * @returns {Promise<void>}
 */
export async function startServer(port: number): Promise<void> {
  // Create the MCP server
  const server = createMCPServer({
    name: '${name}',
    description: 'MCP Server for AI model interactions',
    version: '1.0.0'
  });
  
  // Register handlers
  server.addHandler(helloHandler);
`;

  if (complexity === 'advanced') {
    if (features.includes('sse')) {
      content += `  server.addHandler(sseHandler);\n`;
    }
    
    if (features.includes('websocket')) {
      content += `  server.addHandler(websocketHandler);\n`;
    }
    
    if (features.includes('edge')) {
      content += `  server.addHandler(edgeHandler);\n`;
    }
    
    // Add middleware
    content += `\n  // Register middleware\n`;
    
    if (features.includes('logging')) {
      content += `  server.use(loggingMiddleware);\n`;
    }
    
    if (features.includes('auth')) {
      content += `  server.use(authMiddleware);\n`;
    }
  }
  
  content += `
  // Start the server
  await server.listen(port);
}
`;

  return content;
}

/**
 * Get the content for the basic handler
 * @returns {string} The basic handler content
 */
function getBasicHandlerContent() {
  return `import { z } from 'zod';

/**
 * Hello handler schema
 */
const helloSchema = z.object({
  name: z.string().optional()
});

/**
 * Hello handler
 */
export const helloHandler = {
  name: 'hello',
  description: 'A simple hello world handler',
  inputSchema: helloSchema,
  handler: async (request) => {
    const { name = 'World' } = request.data;
    
    return {
      message: \`Hello, \${name}!\`,
      timestamp: new Date().toISOString()
    };
  }
};
`;
}

/**
 * Get the content for the utils file
 * @returns {string} The utils content
 */
function getUtilsContent() {
  return `/**
 * Helper utilities for the MCP server
 */

/**
 * Sleep for a specified number of milliseconds
 * @param {number} ms The number of milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random ID
 * @returns {string} A random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
`;
}

/**
 * Get the content for the echo example
 * @returns {string} The echo example content
 */
function getEchoExampleContent() {
  return `import { z } from 'zod';

/**
 * Echo handler schema
 */
const echoSchema = z.object({
  message: z.string(),
  delay: z.number().optional()
});

/**
 * Echo handler
 */
export const echoHandler = {
  name: 'echo',
  description: 'Echoes back the input message',
  inputSchema: echoSchema,
  handler: async (request) => {
    const { message, delay = 0 } = request.data;
    
    // Simulate processing delay
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    return {
      echo: message,
      timestamp: new Date().toISOString()
    };
  }
};
`;
}

/**
 * Get the content for the calculator example
 * @returns {string} The calculator example content
 */
function getCalculatorExampleContent() {
  return `import { z } from 'zod';

/**
 * Calculator handler schema
 */
const calculatorSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
  a: z.number(),
  b: z.number()
});

/**
 * Calculator handler
 */
export const calculatorHandler = {
  name: 'calculator',
  description: 'Performs basic arithmetic operations',
  inputSchema: calculatorSchema,
  handler: async (request) => {
    const { operation, a, b } = request.data;
    
    let result;
    
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
    }
    
    return {
      operation,
      a,
      b,
      result,
      timestamp: new Date().toISOString()
    };
  }
};
`;
}

/**
 * Get the content for the config utility
 * @param {Object} answers The user's answers from prompting
 * @returns {string} The config utility content
 */
function getConfigUtilContent(answers) {
  return `import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Server configuration
 */
export const config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MCP_SERVER_NAME: process.env.MCP_SERVER_NAME || '${answers.name}'
};
`;
}

/**
 * Get the content for the auth middleware
 * @returns {string} The auth middleware content
 */
function getAuthContent() {
  return `import { MCPRequest, MCPResponse, NextFunction } from '@modelcontextprotocol/sdk';

/**
 * Authentication middleware
 * @param {MCPRequest} req The MCP request
 * @param {MCPResponse} res The MCP response
 * @param {NextFunction} next The next function
 */
export function authMiddleware(req: MCPRequest, res: MCPResponse, next: NextFunction) {
  // Get the authorization header
  const authHeader = req.headers['authorization'];
  
  // Check if the authorization header is present
  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing authorization header'
    });
  }
  
  // Check if the authorization header is valid
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authorization header format'
    });
  }
  
  // Get the token
  const token = authHeader.substring(7);
  
  // Validate the token (replace with your own validation logic)
  if (token !== 'secret-token') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
  
  // Add the user to the request
  req.user = {
    id: '1',
    name: 'User'
  };
  
  // Continue to the next middleware
  next();
}
`;
}

/**
 * Get the content for the logging middleware
 * @returns {string} The logging middleware content
 */
function getLoggingContent() {
  return `import { MCPRequest, MCPResponse, NextFunction } from '@modelcontextprotocol/sdk';
import winston from 'winston';

// Create a logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

/**
 * Logging middleware
 * @param {MCPRequest} req The MCP request
 * @param {MCPResponse} res The MCP response
 * @param {NextFunction} next The next function
 */
export function loggingMiddleware(req: MCPRequest, res: MCPResponse, next: NextFunction) {
  const start = Date.now();
  
  // Log the request
  logger.info({
    type: 'request',
    method: req.method,
    path: req.path,
    handler: req.params.handler,
    ip: req.ip
  });
  
  // Override the end method to log the response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: BufferEncoding) {
    const duration = Date.now() - start;
    
    // Log the response
    logger.info({
      type: 'response',
      method: req.method,
      path: req.path,
      handler: req.params.handler,
      status: res.statusCode,
      duration
    });
    
    // Call the original end method
    return originalEnd.call(this, chunk, encoding);
  };
  
  // Continue to the next middleware
  next();
}
`;
}

/**
 * Get the content for the edge function
 * @returns {string} The edge function content
 */
function getEdgeFunctionContent() {
  return `import { z } from 'zod';

/**
 * Edge function schema
 */
const edgeSchema = z.object({
  function: z.string(),
  args: z.record(z.any()).optional()
});

/**
 * Edge function handler
 */
export const edgeHandler = {
  name: 'edge',
  description: 'Executes edge functions',
  inputSchema: edgeSchema,
  handler: async (request) => {
    const { function: functionName, args = {} } = request.data;
    
    // Define available edge functions
    const edgeFunctions = {
      hello: (name: string) => \`Hello, \${name}!\`,
      add: (a: number, b: number) => a + b,
      timestamp: () => new Date().toISOString()
    };
    
    // Check if the function exists
    if (!edgeFunctions[functionName]) {
      throw new Error(\`Edge function "\${functionName}" not found\`);
    }
    
    // Execute the function
    const result = edgeFunctions[functionName](...Object.values(args));
    
    return {
      function: functionName,
      args,
      result,
      timestamp: new Date().toISOString()
    };
  }
};
`;
}

/**
 * Get the content for the WebSocket handler
 * @returns {string} The WebSocket handler content
 */
function getWebSocketContent() {
  return `import { z } from 'zod';
import { WebSocket } from 'ws';

// Store WebSocket connections
const connections = new Map<string, WebSocket>();

/**
 * WebSocket handler schema
 */
const websocketSchema = z.object({
  action: z.enum(['connect', 'send', 'disconnect']),
  connectionId: z.string().optional(),
  message: z.string().optional()
});

/**
 * WebSocket handler
 */
export const websocketHandler = {
  name: 'websocket',
  description: 'Manages WebSocket connections',
  inputSchema: websocketSchema,
  handler: async (request) => {
    const { action, connectionId, message } = request.data;
    
    switch (action) {
      case 'connect':
        // Generate a new connection ID
        const newConnectionId = Math.random().toString(36).substring(2, 15);
        
        // Create a new WebSocket connection
        const ws = new WebSocket('ws://localhost:3000/ws');
        
        // Store the connection
        connections.set(newConnectionId, ws);
        
        return {
          action,
          connectionId: newConnectionId,
          status: 'connected'
        };
      
      case 'send':
        // Check if the connection ID is provided
        if (!connectionId) {
          throw new Error('Connection ID is required');
        }
        
        // Check if the message is provided
        if (!message) {
          throw new Error('Message is required');
        }
        
        // Check if the connection exists
        if (!connections.has(connectionId)) {
          throw new Error(\`Connection "\${connectionId}" not found\`);
        }
        
        // Send the message
        connections.get(connectionId)!.send(message);
        
        return {
          action,
          connectionId,
          status: 'sent'
        };
      
      case 'disconnect':
        // Check if the connection ID is provided
        if (!connectionId) {
          throw new Error('Connection ID is required');
        }
        
        // Check if the connection exists
        if (!connections.has(connectionId)) {
          throw new Error(\`Connection "\${connectionId}" not found\`);
        }
        
        // Close the connection
        connections.get(connectionId)!.close();
        
        // Remove the connection
        connections.delete(connectionId);
        
        return {
          action,
          connectionId,
          status: 'disconnected'
        };
    }
  }
};
`;
}

/**
 * Get the content for the SSE handler
 * @returns {string} The SSE handler content
 */
function getSSEHandlerContent() {
  return `import { z } from 'zod';
import { EventEmitter } from 'events';

// Create an event emitter for SSE
const eventEmitter = new EventEmitter();

// Store SSE streams
const streams = new Map<string, {
  emitter: EventEmitter;
  clients: Set<string>;
}>();

/**
 * SSE handler schema
 */
const sseSchema = z.object({
  action: z.enum(['create', 'send', 'close']),
  streamId: z.string().optional(),
  event: z.string().optional(),
  data: z.any().optional()
});

/**
 * SSE handler
 */
export const sseHandler = {
  name: 'real_time_data',
  description: 'Manages Server-Sent Events (SSE) streams',
  inputSchema: sseSchema,
  handler: async (request) => {
    const { action, streamId, event, data } = request.data;
    
    switch (action) {
      case 'create':
        // Generate a new stream ID
        const newStreamId = Math.random().toString(36).substring(2, 15);
        
        // Create a new stream
        streams.set(newStreamId, {
          emitter: new EventEmitter(),
          clients: new Set()
        });
        
        return {
          action,
          streamId: newStreamId,
          status: 'created'
        };
      
      case 'send':
        // Check if the stream ID is provided
        if (!streamId) {
          throw new Error('Stream ID is required');
        }
        
        // Check if the event is provided
        if (!event) {
          throw new Error('Event is required');
        }
        
        // Check if the stream exists
        if (!streams.has(streamId)) {
          throw new Error(\`Stream "\${streamId}" not found\`);
        }
        
        // Emit the event
        streams.get(streamId)!.emitter.emit(event, data);
        
        return {
          action,
          streamId,
          event,
          status: 'sent'
        };
      
      case 'close':
        // Check if the stream ID is provided
        if (!streamId) {
          throw new Error('Stream ID is required');
        }
        
        // Check if the stream exists
        if (!streams.has(streamId)) {
          throw new Error(\`Stream "\${streamId}" not found\`);
        }
        
        // Remove all listeners
        streams.get(streamId)!.emitter.removeAllListeners();
        
        // Close all client connections
        streams.get(streamId)!.clients.forEach(clientId => {
          // Emit a close event
          streams.get(streamId)!.emitter.emit('close');
        });
        
        // Remove the stream
        streams.delete(streamId);
        
        return {
          action,
          streamId,
          status: 'closed'
        };
    }
  }
};

/**
 * Get the SSE stream for a given stream ID
 * @param {string} streamId The stream ID
 * @returns {EventEmitter | null} The event emitter for the stream
 */
export function getSSEStream(streamId: string): EventEmitter | null {
  if (!streams.has(streamId)) {
    return null;
  }
  
  return streams.get(streamId)!.emitter;
}

/**
 * Register a client for a given stream
 * @param {string} streamId The stream ID
 * @param {string} clientId The client ID
 * @returns {boolean} Whether the client was registered
 */
export function registerSSEClient(streamId: string, clientId: string): boolean {
  if (!streams.has(streamId)) {
    return false;
  }
  
  streams.get(streamId)!.clients.add(clientId);
  return true;
}

/**
 * Unregister a client for a given stream
 * @param {string} streamId The stream ID
 * @param {string} clientId The client ID
 * @returns {boolean} Whether the client was unregistered
 */
export function unregisterSSEClient(streamId: string, clientId: string): boolean {
  if (!streams.has(streamId)) {
    return false;
  }
  
  return streams.get(streamId)!.clients.delete(clientId);
}
`;
}

module.exports = {
  getReadmeContent,
  getIndexFileContent,
  getServerFileContent,
  getBasicHandlerContent,
  getUtilsContent,
  getEchoExampleContent,
  getCalculatorExampleContent,
  getConfigUtilContent,
  getAuthContent,
  getLoggingContent,
  getEdgeFunctionContent,
  getWebSocketContent,
  getSSEHandlerContent
};