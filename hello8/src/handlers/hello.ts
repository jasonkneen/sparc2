import { MCPHandler, MCPRequest } from '@modelcontextprotocol/sdk';
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
    const greeting = name ? `Hello, ${name}!` : 'Hello, world!';
    
    return {
      message: greeting
    };
  }
};
