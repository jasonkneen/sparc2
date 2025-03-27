import { helloHandler } from '../src/handlers/hello.js';

// Add Jest type definitions
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: any;

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
