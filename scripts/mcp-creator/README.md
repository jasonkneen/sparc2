# MCP Server Generator

A Yeoman generator for creating Model Context Protocol (MCP) servers with various features and complexity levels.

## Features

- Create MCP servers with different complexity levels (basic, standard, advanced)
- Include example handlers
- Support for Server-Sent Events (SSE) for real-time data streaming
- WebSocket support
- Environment configuration
- Authentication
- Logging
- Docker support
- Test setup

## Installation

```bash
# Install Yeoman globally if you haven't already
npm install -g yo

# Install the generator
npm install -g generator-mcp-server

# Or link it locally for development
cd scripts/mcp-creator
npm link
```

## Usage

```bash
# Create a new MCP server
yo mcp-server

# Or use the CLI tool
mcp-creator
```

## CLI Options

The `mcp-creator` CLI tool provides a simple interface for creating MCP servers without using Yeoman directly.

```bash
# Create a new MCP server
mcp-creator
```

## MCP Server API

The generator also includes an MCP server that can generate MCP servers through an API:

```bash
# Start the MCP server generator
node mcp-server.js
```

Then you can use the MCP API to generate servers:

```json
POST /mcp
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "generate-mcp-server",
  "params": {
    "name": "my-mcp-server",
    "description": "An MCP server for AI model interactions",
    "author": "Your Name",
    "complexity": "advanced",
    "includeExamples": true,
    "includeTests": true,
    "includeDocker": true,
    "features": ["env", "logging", "sse", "websocket"],
    "outputDir": "./my-mcp-server"
  }
}
```

## Server-Sent Events (SSE) Support

The advanced complexity level includes support for Server-Sent Events (SSE), which enables real-time data streaming from the server to clients. This is particularly useful for AI applications that need to receive continuous updates.

### SSE Features

- Real-time data streaming
- Multiple concurrent connections
- Event filtering
- Connection management
- Automatic reconnection (client-side)

### SSE Example

The generator includes an example SSE implementation that demonstrates how to:

1. Create SSE connections
2. Send data to clients
3. Manage multiple connections
4. Close connections properly

## Deno Support

The generator also includes templates for Deno-based MCP servers with SSE support, which can be compiled into standalone executables.

## License

MIT