// Import handlers
import { helloHandler } from '../handlers/hello.js';
import { echoHandler } from '../examples/echo.js';
import { calculatorHandler } from '../examples/calculator.js';
// Import MCP SDK
import { createServer } from '@modelcontextprotocol/sdk';

export async function startServer() {
  // Create the MCP server
  const server = createServer({
    name: 'hello8'
  });

  // Register handlers
  server.addHandler('hello', helloHandler);
  server.addHandler('echo', echoHandler);
  server.addHandler('calculator', calculatorHandler);

  // Start the server
  const port = 3000;
  await server.listen(port);
  console.log(`MCP server running at http://localhost:${port}`);
  
  return server;
}