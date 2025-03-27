import { MCPHandler } from '@modelcontextprotocol/sdk';
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
