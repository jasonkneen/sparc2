# Customization

This document explains how to customize your MCP server project after it has been created with MCP Creator.

## Creating Custom Handlers

Handlers are the core of your MCP server's functionality. They process incoming requests and generate responses. Here's how to create a custom handler:

### Basic Handler

Create a new file in the `src/handlers` directory, for example `src/handlers/custom.ts`:

```typescript
import { Handler } from '@modelcontextprotocol/sdk';

export const customHandler: Handler = async (request) => {
  const { input } = request;
  
  // Process the input
  const output = `You said: ${input}`;
  
  // Return the response
  return {
    output
  };
};
```

Then register the handler in your `src/index.ts` file:

```typescript
import { customHandler } from './handlers/custom';

// Register the handler
server.registerHandler('custom', customHandler);
```

### Handler with Parameters

You can create handlers that accept additional parameters:

```typescript
import { Handler } from '@modelcontextprotocol/sdk';

interface TranslateParams {
  sourceLanguage: string;
  targetLanguage: string;
}

export const translateHandler: Handler<TranslateParams> = async (request) => {
  const { input, params } = request;
  const { sourceLanguage, targetLanguage } = params;
  
  // Implement translation logic
  const output = `Translated "${input}" from ${sourceLanguage} to ${targetLanguage}`;
  
  return {
    output
  };
};
```

### Handler with External API

You can create handlers that call external APIs:

```typescript
import { Handler } from '@modelcontextprotocol/sdk';
import fetch from 'node-fetch';

export const weatherHandler: Handler = async (request) => {
  const { input } = request;
  
  // Call external API
  const response = await fetch(`https://api.weather.com/forecast?location=${encodeURIComponent(input)}`);
  const data = await response.json();
  
  // Process the response
  const output = `Weather forecast for ${input}: ${data.forecast}`;
  
  return {
    output
  };
};
```

## Creating Custom Tools

Tools are functions that can be called by AI models to perform specific tasks. Here's how to create a custom tool:

```typescript
import { Tool } from '@modelcontextprotocol/sdk';

export const calculatorTool: Tool = {
  name: 'calculator',
  description: 'Performs mathematical calculations',
  parameters: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'The mathematical expression to evaluate'
      }
    },
    required: ['expression']
  },
  handler: async (params) => {
    const { expression } = params;
    
    // Evaluate the expression (in a real implementation, use a safe evaluation method)
    const result = eval(expression);
    
    return {
      result: result.toString()
    };
  }
};
```

Then register the tool in your `src/index.ts` file:

```typescript
import { calculatorTool } from './tools/calculator';

// Register the tool
server.registerTool(calculatorTool);
```

## Creating Custom Resources

Resources are data objects that can be accessed by AI models. Here's how to create a custom resource:

```typescript
import { Resource } from '@modelcontextprotocol/sdk';
import fs from 'fs';
import path from 'path';

export const documentResource: Resource = {
  name: 'document',
  description: 'Provides access to document content',
  handler: async (uri) => {
    // Extract document ID from URI
    const documentId = uri.replace('resource://document/', '');
    
    // Read document content
    const filePath = path.join(__dirname, '../documents', `${documentId}.txt`);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    return {
      content,
      metadata: {
        id: documentId,
        type: 'text/plain'
      }
    };
  }
};
```

Then register the resource in your `src/index.ts` file:

```typescript
import { documentResource } from './resources/document';

// Register the resource
server.registerResource(documentResource);
```

## Customizing Server Configuration

You can customize the server configuration in your `src/index.ts` file:

```typescript
import { createServer } from './core/server';

// Create and configure the server
const server = createServer({
  name: 'my-custom-mcp-server',
  version: '1.0.0',
  description: 'My custom MCP server',
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  timeout: 30000, // 30 seconds
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
});
```

## Adding Middleware

You can add custom middleware to your MCP server:

```typescript
import { createServer } from './core/server';

// Create custom middleware
const customMiddleware = (req, res, next) => {
  // Add custom logic
  console.log(`Request received: ${req.method} ${req.url}`);
  
  // Call next middleware
  next();
};

// Create and configure the server
const server = createServer({
  name: 'my-custom-mcp-server',
  version: '1.0.0'
});

// Add middleware
server.use(customMiddleware);
```

## Customizing Templates

MCP Creator uses templates to generate files. You can customize these templates by creating your own template files and specifying them in a configuration file.

1. Create a custom template file, for example `custom-handler.ts.template`:

```typescript
import { Handler } from '@modelcontextprotocol/sdk';

/**
 * <%= name %> handler
 * Created by: <%= author %>
 * Description: <%= description %>
 */
export const <%= handlerName %>Handler: Handler = async (request) => {
  const { input } = request;
  
  // Process the input
  const output = `<%= handlerName %> processed: ${input}`;
  
  // Return the response
  return {
    output
  };
};
```

2. Specify the custom template in your configuration file:

```json
{
  "customTemplates": {
    "handler": "./templates/custom-handler.ts.template"
  }
}
```

3. Use the custom template when generating a new handler:

```bash
mcp-creator generate handler my-custom-handler --config ./config.json
```

## Extending with Plugins

MCP Creator supports plugins to extend its functionality. You can create your own plugins or use third-party plugins.

### Using Third-Party Plugins

1. Install the plugin:

```bash
npm install mcp-creator-plugin-database
```

2. Configure the plugin in your configuration file:

```json
{
  "plugins": [
    "mcp-creator-plugin-database"
  ],
  "pluginOptions": {
    "database": {
      "type": "mongodb",
      "url": "mongodb://localhost:27017/mcp"
    }
  }
}
```

### Creating Your Own Plugin

1. Create a plugin file, for example `mcp-creator-plugin-custom.js`:

```javascript
module.exports = {
  name: 'custom',
  description: 'Custom plugin for MCP Creator',
  
  // Initialize the plugin
  initialize(options) {
    console.log('Initializing custom plugin with options:', options);
  },
  
  // Add custom templates
  templates: {
    'custom-component': './templates/custom-component.ts.template'
  },
  
  // Add custom generators
  generators: {
    'custom-component': (name, options) => {
      // Generate custom component
      return {
        path: `src/custom/${name}.ts`,
        content: `// Custom component: ${name}\n// Options: ${JSON.stringify(options)}\n`
      };
    }
  }
};
```

2. Configure the plugin in your configuration file:

```json
{
  "plugins": [
    "./mcp-creator-plugin-custom.js"
  ],
  "pluginOptions": {
    "custom": {
      "option1": "value1",
      "option2": "value2"
    }
  }
}
```

## Next Steps

For more information about advanced MCP usage, see the [Advanced MCP Usage](./advanced-mcp-usage.md) documentation.