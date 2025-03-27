import { MCPHandler } from '@modelcontextprotocol/sdk';
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
    const greeting = name ? `Hello, ${name}!` : 'Hello, world!';
    
    return {
      message: greeting
    };
  }
};
