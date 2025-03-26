/**
 * Templates module
 * Contains all file content templates for the generator
 */

/**
 * Get content for index.ts file
 */
function getIndexFileContent(answers) {
  let content = `import { startServer } from './core/server.js';

// Start the MCP server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
`;
  
  return content;
}

/**
 * Get content for server.ts file
 */
function getServerFileContent(answers) {
  let imports = `import { createServer } from '@modelcontextprotocol/sdk';
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
}
`;
  
  return content;
}

/**
 * Get content for basic handler
 */
function getBasicHandlerContent() {
  return `import { MCPHandler } from '@modelcontextprotocol/sdk';
import { z } from 'zod';

// Define the schema for the request
const requestSchema = z.object({
  name: z.string().optional()
});

// Define the schema for the response
const responseSchema = z.object({
  message: z.string()
});

// Create the handler
export const helloHandler: MCPHandler = {
  requestSchema,
  responseSchema,
  handler: async (request) => {
    const { name } = request.data;
    const greeting = name ? \`Hello, \${name}!\` : 'Hello, world!';
    
    return {
      message: greeting
    };
  }
};
`;
}

/**
 * Get content for utils
 */
function getUtilsContent() {
  return `/**
 * Helper functions for the MCP server
 */

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse(json: string) {
  try {
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
`;
}

/**
 * Get content for echo example
 */
function getEchoExampleContent() {
  return `import { MCPHandler } from '@modelcontextprotocol/sdk';
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

// Create the handler
export const echoHandler: MCPHandler = {
  requestSchema,
  responseSchema,
  handler: async (request) => {
    const { message } = request.data;
    
    return {
      echo: message,
      timestamp: Date.now()
    };
  }
};
`;
}

/**
 * Get content for calculator example
 */
function getCalculatorExampleContent() {
  return `import { MCPHandler } from '@modelcontextprotocol/sdk';
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

// Create the handler
export const calculatorHandler: MCPHandler = {
  requestSchema,
  responseSchema,
  handler: async (request) => {
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

/**
 * Get content for basic test
 */
function getBasicTestContent() {
  return `import { helloHandler } from '../src/handlers/hello.js';

describe('Hello Handler', () => {
  it('should return a greeting with name when provided', async () => {
    const request = {
      data: { name: 'Test' }
    };
    
    const response = await helloHandler.handler(request as any);
    
    expect(response).toEqual({
      message: 'Hello, Test!'
    });
  });
  
  it('should return a default greeting when no name is provided', async () => {
    const request = {
      data: {}
    };
    
    const response = await helloHandler.handler(request as any);
    
    expect(response).toEqual({
      message: 'Hello, world!'
    });
  });
});
`;
}

/**
 * Get content for config util
 */
function getConfigUtilContent(answers) {
  return `import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Server configuration
 */
export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  environment: process.env.NODE_ENV || 'development',
  serverName: process.env.MCP_SERVER_NAME || '${answers.name}'
};

/**
 * Get a configuration value with type safety
 */
export function getConfig<T>(key: keyof typeof config): T {
  return config[key] as unknown as T;
}
`;
}

/**
 * Get content for auth module
 */
function getAuthContent() {
  return `import { MCPServer } from '@modelcontextprotocol/sdk';

/**
 * Setup authentication for the MCP server
 */
export function setupAuth(server: MCPServer) {
  // This is a simple example of authentication middleware
  // In a real application, you would implement proper authentication
  server.use(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // Allow requests without authentication for now
      return next();
    }
    
    // Example token validation (replace with your actual auth logic)
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // Validate token (example)
        if (token === 'invalid-token') {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Set user info on request for handlers to use
        (req as any).user = { id: 'user-123', authenticated: true };
      } catch (error) {
        return res.status(401).json({ error: 'Authentication failed' });
      }
    }
    
    return next();
  });
  
  console.log('Authentication middleware configured');
}
`;
}

/**
 * Get content for logging middleware
 */
function getLoggingContent() {
  return `import { MCPServer } from '@modelcontextprotocol/sdk';
import winston from 'winston';

// Create a logger
export const logger = winston.createLogger({
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

/**
 * Setup logging middleware for the MCP server
 */
export function setupLogging(server: MCPServer) {
  // Add request logging middleware
  server.use(async (req, res, next) => {
    const start = Date.now();
    
    // Log the request
    logger.info({
      type: 'request',
      method: req.method,
      url: req.url,
      headers: req.headers
    });
    
    // Process the request
    await next();
    
    // Log the response
    const duration = Date.now() - start;
    logger.info({
      type: 'response',
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: \`\${duration}ms\`
    });
  });
  
  // Add error logging middleware
  server.use(async (err, req, res, next) => {
    logger.error({
      type: 'error',
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.url
    });
    
    await next(err);
  });
  
  console.log('Logging middleware configured');
}
`;
}

/**
 * Get content for edge function
 */
function getEdgeFunctionContent() {
  return `import { MCPServer, MCPHandler } from '@modelcontextprotocol/sdk';
import { z } from 'zod';

/**
 * Example edge function handler
 */
const edgeHandler: MCPHandler = {
  requestSchema: z.object({
    input: z.string()
  }),
  responseSchema: z.object({
    result: z.string(),
    processed: z.boolean()
  }),
  handler: async (request) => {
    const { input } = request.data;
    
    // This would typically be processed at the edge
    const result = \`Processed at edge: \${input.toUpperCase()}\`;
    
    return {
      result,
      processed: true
    };
  }
};

/**
 * Setup edge functions for the MCP server
 */
export function setupEdgeFunctions(server: MCPServer) {
  // Register edge function handlers
  server.addHandler('edge', edgeHandler);
  
  console.log('Edge functions configured');
}
`;
}

/**
 * Get content for WebSocket support
 */
function getWebSocketContent() {
  return `import { MCPServer } from '@modelcontextprotocol/sdk';

/**
 * Setup WebSocket support for the MCP server
 * 
 * Note: This is a simplified example. In a real application,
 * you would need to implement proper WebSocket handling.
 */
export function setupWebSocket(server: MCPServer) {
  // This is a placeholder for WebSocket setup
  // The actual implementation would depend on your specific needs
  
  console.log('WebSocket support configured');
  
  // Example of how you might handle WebSocket connections
  // server.on('upgrade', (request, socket, head) => {
  //   // Handle WebSocket upgrade
  // });
}
`;
}

/**
 * Get content for README.md
 */
function getReadmeContent(answers) {
  let content = `# ${answers.name}

${answers.description}

## Features

- MCP (Model Context Protocol) server implementation
- TypeScript support
`;

  if (answers.complexity !== 'basic') {
    content += `- Modular architecture
- Development mode with hot reloading
`;
    
    if (answers.includeExamples) {
      content += `- Example handlers (echo, calculator)
`;
    }
    
    if (answers.includeTests) {
      content += `- Test setup with Jest
`;
    }
    
    if (answers.includeDocker) {
      content += `- Docker and docker-compose configuration
`;
    }
  }

  if (answers.complexity === 'advanced') {
    content += '\n## Advanced Features\n\n';
    
    if (answers.features.includes('auth')) {
      content += '- Authentication support\n';
    }
    
    if (answers.features.includes('rateLimit')) {
      content += '- Rate limiting\n';
    }
    
    if (answers.features.includes('logging')) {
      content += '- Logging middleware with Winston\n';
    }
    
    if (answers.features.includes('env')) {
      content += '- Environment configuration\n';
    }
    
    if (answers.features.includes('edge')) {
      content += '- Edge functions support\n';
    }
    
    if (answers.features.includes('websocket')) {
      content += '- WebSocket support\n';
    }
  }

  content += `
## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

### Development

${answers.complexity !== 'basic' ? '```bash\nnpm run dev\n```\n\n### ' : ''}Build

\`\`\`bash
npm run build
\`\`\`

### Start

\`\`\`bash
npm start
\`\`\`
`;

  if (answers.includeTests) {
    content += `
### Testing

\`\`\`bash
npm test
\`\`\`
`;
  }

  if (answers.includeDocker) {
    content += `
## Docker

### Build and run with Docker

\`\`\`bash
docker build -t ${answers.name} .
docker run -p 3000:3000 ${answers.name}
\`\`\`

### Using docker-compose

\`\`\`bash
docker-compose up
\`\`\`
`;
  }

  content += `
## Project Structure

\`\`\`
${answers.name}/
├── src/
│   ├── core/          # Core server functionality
│   ├── handlers/      # MCP request handlers
│   ├── utils/         # Utility functions
`;

  if (answers.complexity !== 'basic') {
    content += `│   ├── middleware/    # Middleware components
│   ├── types/         # TypeScript type definitions
`;
    
    if (answers.includeExamples) {
      content += `│   ├── examples/      # Example handlers
`;
    }
  }

  if (answers.complexity === 'advanced') {
    if (answers.features.includes('auth')) {
      content += `│   ├── auth/          # Authentication
`;
    }
    
    if (answers.features.includes('edge')) {
      content += `│   ├── edge/          # Edge functions
`;
    }
    
    if (answers.features.includes('websocket')) {
      content += `│   ├── websocket/     # WebSocket support
`;
    }
  }

  content += `├── build/            # Compiled JavaScript
`;

  if (answers.includeTests) {
    content += `├── tests/            # Test files
`;
  }

  if (answers.complexity !== 'basic') {
    content += `├── config/           # Configuration files
`;
  }

  if (answers.includeDocker) {
    content += `├── Dockerfile
├── docker-compose.yml
`;
  }

  content += `├── package.json
├── tsconfig.json
└── README.md
\`\`\`

## License

MIT
`;

  return content;
}

// Export all template functions
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