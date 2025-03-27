# Advanced MCP Usage

This document covers advanced usage scenarios for MCP servers created with MCP Creator, providing guidance on implementing complex features and optimizing performance.

## Advanced Handler Patterns

### Streaming Responses

You can implement streaming responses in your handlers to provide real-time updates to clients:

```typescript
import { StreamingHandler } from '@modelcontextprotocol/sdk';

export const streamingHandler: StreamingHandler = async (request, stream) => {
  const { input } = request;
  
  // Send initial response
  stream.write({ output: 'Processing your request...' });
  
  // Simulate processing with updates
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    stream.write({ output: `Progress: ${(i + 1) * 20}%` });
  }
  
  // Send final response
  stream.write({ output: `Completed processing: ${input}` });
  stream.end();
};
```

Register the streaming handler in your `src/index.ts` file:

```typescript
import { streamingHandler } from './handlers/streaming';

// Register the streaming handler
server.registerStreamingHandler('streaming', streamingHandler);
```

### Chained Handlers

You can implement handler chaining to create complex workflows:

```typescript
import { Handler, chainHandlers } from '@modelcontextprotocol/sdk';

// First handler in the chain
const extractEntitiesHandler: Handler = async (request) => {
  const { input } = request;
  
  // Extract entities from input
  const entities = input.match(/\b[A-Z][a-z]+\b/g) || [];
  
  return {
    entities,
    originalInput: input
  };
};

// Second handler in the chain
const lookupEntitiesHandler: Handler = async (request) => {
  const { entities, originalInput } = request;
  
  // Look up information about entities
  const entityInfo = entities.map(entity => ({
    name: entity,
    description: `Information about ${entity}`
  }));
  
  return {
    entityInfo,
    originalInput
  };
};

// Final handler in the chain
const formatResponseHandler: Handler = async (request) => {
  const { entityInfo, originalInput } = request;
  
  // Format the final response
  const output = `
    Input: ${originalInput}
    Entities found: ${entityInfo.length}
    ${entityInfo.map(e => `- ${e.name}: ${e.description}`).join('\n')}
  `;
  
  return {
    output
  };
};

// Chain the handlers
export const entityAnalysisHandler = chainHandlers([
  extractEntitiesHandler,
  lookupEntitiesHandler,
  formatResponseHandler
]);
```

### Error Handling

Implement robust error handling in your handlers:

```typescript
import { Handler } from '@modelcontextprotocol/sdk';
import { logger } from '../middleware/logging';

export const robustHandler: Handler = async (request) => {
  try {
    const { input } = request;
    
    // Validate input
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input: input must be a non-empty string');
    }
    
    // Process input
    const output = `Processed: ${input}`;
    
    return {
      output
    };
  } catch (error) {
    // Log the error
    logger.error('Error in robustHandler', {
      error: error.message,
      stack: error.stack,
      request
    });
    
    // Return a user-friendly error message
    return {
      error: {
        message: 'An error occurred while processing your request',
        code: 'PROCESSING_ERROR'
      }
    };
  }
};
```

## Advanced Tool Integration

### Tool with Authentication

Create tools that require authentication:

```typescript
import { Tool } from '@modelcontextprotocol/sdk';
import { verifyApiKey } from '../auth/auth';

export const secureCalculatorTool: Tool = {
  name: 'secureCalculator',
  description: 'Performs secure mathematical calculations',
  parameters: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'The mathematical expression to evaluate'
      },
      apiKey: {
        type: 'string',
        description: 'API key for authentication'
      }
    },
    required: ['expression', 'apiKey']
  },
  handler: async (params) => {
    const { expression, apiKey } = params;
    
    // Verify API key
    const isValid = await verifyApiKey(apiKey);
    if (!isValid) {
      throw new Error('Invalid API key');
    }
    
    // Evaluate the expression (in a real implementation, use a safe evaluation method)
    const result = eval(expression);
    
    return {
      result: result.toString()
    };
  }
};
```

### Tool with Rate Limiting

Implement rate limiting for your tools:

```typescript
import { Tool } from '@modelcontextprotocol/sdk';
import { RateLimiter } from 'limiter';

// Create a rate limiter (10 requests per minute)
const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'minute' });

export const rateLimitedTool: Tool = {
  name: 'rateLimitedTool',
  description: 'A tool with rate limiting',
  parameters: {
    type: 'object',
    properties: {
      input: {
        type: 'string',
        description: 'Input to process'
      }
    },
    required: ['input']
  },
  handler: async (params) => {
    // Check if we have tokens available
    const remainingTokens = await limiter.removeTokens(1);
    
    if (remainingTokens < 0) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    // Process the request
    const { input } = params;
    return {
      output: `Processed: ${input}`
    };
  }
};
```

## Advanced Resource Management

### Dynamic Resource Loading

Implement dynamic resource loading:

```typescript
import { Resource } from '@modelcontextprotocol/sdk';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

export const dynamicResource: Resource = {
  name: 'dynamic',
  description: 'Dynamically loads resources based on URI',
  handler: async (uri) => {
    // Extract resource type and ID from URI
    // Format: resource://dynamic/{type}/{id}
    const [, , , type, id] = uri.split('/');
    
    if (!type || !id) {
      throw new Error('Invalid resource URI format');
    }
    
    // Determine the appropriate directory based on type
    let directory;
    let contentType;
    
    switch (type) {
      case 'document':
        directory = path.join(__dirname, '../resources/documents');
        contentType = 'text/plain';
        break;
      case 'image':
        directory = path.join(__dirname, '../resources/images');
        contentType = 'image/png';
        break;
      case 'data':
        directory = path.join(__dirname, '../resources/data');
        contentType = 'application/json';
        break;
      default:
        throw new Error(`Unsupported resource type: ${type}`);
    }
    
    // Check if the resource exists
    const files = await readdir(directory);
    const fileName = files.find(file => file.startsWith(id));
    
    if (!fileName) {
      throw new Error(`Resource not found: ${id}`);
    }
    
    // Load the resource
    const filePath = path.join(directory, fileName);
    const content = await readFile(filePath);
    
    // Return the resource content
    return {
      content: type === 'data' ? JSON.parse(content.toString()) : content.toString(),
      metadata: {
        id,
        type: contentType,
        fileName
      }
    };
  }
};
```

### Cached Resources

Implement resource caching for improved performance:

```typescript
import { Resource } from '@modelcontextprotocol/sdk';
import NodeCache from 'node-cache';

// Create a cache with TTL of 10 minutes
const cache = new NodeCache({ stdTTL: 600 });

export const cachedResource: Resource = {
  name: 'cached',
  description: 'Provides cached access to resources',
  handler: async (uri) => {
    // Check if the resource is in the cache
    const cachedResource = cache.get(uri);
    if (cachedResource) {
      return cachedResource;
    }
    
    // Resource not in cache, fetch it
    // (In a real implementation, this would fetch from a database or external API)
    const resource = {
      content: `Content for ${uri}`,
      metadata: {
        id: uri.split('/').pop(),
        type: 'text/plain',
        timestamp: new Date().toISOString()
      }
    };
    
    // Store in cache
    cache.set(uri, resource);
    
    return resource;
  }
};
```

## Performance Optimization

### Connection Pooling

Implement connection pooling for database connections:

```typescript
import { Pool } from 'pg';
import { config } from '../utils/config';

// Create a connection pool
const pool = new Pool({
  host: config.dbHost,
  port: config.dbPort,
  database: config.dbName,
  user: config.dbUser,
  password: config.dbPassword,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000 // How long a client is allowed to remain idle before being closed
});

// Export a function to get a client from the pool
export async function getDbClient() {
  const client = await pool.connect();
  return client;
}

// Example usage in a handler
export const databaseHandler = async (request) => {
  const client = await getDbClient();
  
  try {
    const { input } = request;
    
    // Use the client to query the database
    const result = await client.query('SELECT * FROM data WHERE name = $1', [input]);
    
    return {
      output: result.rows
    };
  } finally {
    // Release the client back to the pool
    client.release();
  }
};
```

### Request Batching

Implement request batching for improved throughput:

```typescript
import { BatchHandler } from '@modelcontextprotocol/sdk';

export const batchHandler: BatchHandler = async (requests) => {
  console.log(`Processing batch of ${requests.length} requests`);
  
  // Process all requests in parallel
  const results = await Promise.all(
    requests.map(async (request) => {
      const { input } = request;
      
      // Process the input
      const output = `Processed: ${input}`;
      
      return {
        output
      };
    })
  );
  
  return results;
};
```

Register the batch handler in your `src/index.ts` file:

```typescript
import { batchHandler } from './handlers/batch';

// Register the batch handler
server.registerBatchHandler('batch', batchHandler);
```

## Deployment Strategies

### Docker Deployment

If you included Docker configuration in your project, you can deploy your MCP server using Docker:

```bash
# Build the Docker image
docker build -t my-mcp-server .

# Run the container
docker run -p 3000:3000 my-mcp-server
```

For production deployments, consider using Docker Compose:

```bash
# Start the services defined in docker-compose.yml
docker-compose up -d
```

### Kubernetes Deployment

For more complex deployments, you can use Kubernetes:

1. Create a Kubernetes deployment file `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mcp-server
  template:
    metadata:
      labels:
        app: mcp-server
    spec:
      containers:
      - name: mcp-server
        image: my-mcp-server:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        - name: PORT
          value: "3000"
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
          requests:
            cpu: "0.5"
            memory: "256Mi"
```

2. Create a Kubernetes service file `service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mcp-server
spec:
  selector:
    app: mcp-server
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

3. Apply the configuration:

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

## Monitoring and Logging

### Prometheus Integration

Add Prometheus metrics to your MCP server:

```typescript
import { createServer } from './core/server';
import { register, Counter, Histogram } from 'prom-client';
import express from 'express';

// Create metrics
const requestCounter = new Counter({
  name: 'mcp_requests_total',
  help: 'Total number of MCP requests',
  labelNames: ['handler', 'status']
});

const requestDuration = new Histogram({
  name: 'mcp_request_duration_seconds',
  help: 'Duration of MCP requests in seconds',
  labelNames: ['handler']
});

// Create and configure the server
const server = createServer({
  name: 'my-mcp-server',
  version: '1.0.0'
});

// Add middleware to record metrics
server.use((req, res, next) => {
  const start = Date.now();
  const handlerName = req.url.split('/').pop();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    requestCounter.inc({ handler: handlerName, status: res.statusCode });
    requestDuration.observe({ handler: handlerName }, duration);
  });
  
  next();
});

// Expose metrics endpoint
const app = express();
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});

app.listen(9090, () => {
  console.log('Metrics server listening on port 9090');
});
```

### Distributed Tracing

Implement distributed tracing with OpenTelemetry:

```typescript
import { createServer } from './core/server';
import { NodeTracerProvider } from '@opentelemetry/node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

// Configure tracer
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'my-mcp-server'
  })
});

// Configure exporter
const exporter = new JaegerExporter({
  endpoint: 'http://jaeger:14268/api/traces'
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

// Register instrumentations
registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation()
  ]
});

// Create and configure the server
const server = createServer({
  name: 'my-mcp-server',
  version: '1.0.0'
});
```

## Next Steps

For more information about contributing to the MCP Creator project, see the [Contributing](./contributing.md) documentation.