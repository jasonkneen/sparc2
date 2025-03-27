import { MCPHandler, MCPRequest } from '@modelcontextprotocol/sdk';
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
      operation: `${a} ${operation} ${b} = ${result}`
    };
  }
};
