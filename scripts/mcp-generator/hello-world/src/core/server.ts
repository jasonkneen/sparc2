import { createServer } from '@modelcontextprotocol/sdk';
import { helloHandler } from '../handlers/hello.js';
import { echoHandler } from '../examples/echo.js';
import { calculatorHandler } from '../examples/calculator.js';

export async function startServer() {
  // Create the MCP server
  const server = createServer({
    name: 'Hello World'
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
