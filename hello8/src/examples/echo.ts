import { MCPHandler, MCPRequest } from '@modelcontextprotocol/sdk';
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
