# Quick Start Guide

This guide will help you quickly get started with MCP Creator and create your first MCP server project.

## Prerequisites

Before you begin, make sure you have:

- Node.js (version 16.x or higher)
- npm (version 7.x or higher)

## Step 1: Install MCP Creator

You can use MCP Creator without installing it by using npx:

```bash
npx @agentic.org/mcp-creator
```

Or install it globally for easier access:

```bash
npm install -g @agentic.org/mcp-creator
```

## Step 2: Create a New MCP Server Project

Run the MCP Creator CLI:

```bash
# If installed globally
mcp-creator

# Or using npx
npx @agentic.org/mcp-creator
```

## Step 3: Follow the Interactive Prompts

MCP Creator will guide you through the setup process with a series of prompts:

1. **Target Directory**: Specify where you want to create your MCP server
   ```
   Where would you like to create your MCP server? (./my-mcp-server)
   ```

2. **Project Name**: Enter a name for your project
   ```
   What is the name of your MCP server? (my-mcp-server)
   ```

3. **Project Description**: Provide a brief description
   ```
   Please provide a description for your MCP server: (An MCP server implementation)
   ```

4. **Author**: Enter your name or organization
   ```
   Who is the author of this project? (Your Name)
   ```

5. **Complexity Level**: Choose the complexity level for your project
   ```
   What complexity level do you want for your MCP server?
   > Basic (Minimal setup)
     Intermediate (Development tools)
     Advanced (Full feature set)
   ```

6. **Features** (if Advanced is selected): Choose additional features
   ```
   Select additional features to include:
   ◯ Environment configuration (.env)
   ◯ Authentication support
   ◯ Logging (Winston)
   ◯ Edge functions
   ◯ WebSocket support
   ```

7. **Examples**: Choose whether to include example code
   ```
   Would you like to include example handlers? (Y/n)
   ```

8. **Tests**: Choose whether to include tests
   ```
   Would you like to include tests? (Y/n)
   ```

9. **Docker**: Choose whether to include Docker configuration
   ```
   Would you like to include Docker configuration? (Y/n)
   ```

## Step 4: Wait for Project Generation

MCP Creator will:
1. Create the project directory structure
2. Generate all necessary files
3. Install dependencies

You'll see progress messages like:

```
Creating MCP server in /path/to/my-mcp-server

Creating project structure...

Generating files...

Installing dependencies...

Dependencies installed successfully!

MCP server created successfully!
```

## Step 5: Navigate to Your Project

```bash
cd my-mcp-server
```

## Step 6: Build and Run Your MCP Server

```bash
# Build the project
npm run build

# Start the server
npm start
```

Your MCP server will start and be available at `http://localhost:3000` by default.

## Step 7: Test Your MCP Server

You can test your MCP server using curl:

```bash
curl -X POST http://localhost:3000/mcp/hello -H "Content-Type: application/json" -d '{"input": "world"}'
```

You should receive a response like:

```json
{
  "output": "Hello, world!"
}
```

## Next Steps

Now that you have your MCP server up and running, you can:

- Explore the [project structure](./architecture.md)
- Learn how to [create custom handlers](./customization.md#creating-custom-handlers)
- Add [advanced features](./advanced-mcp-usage.md)
- Deploy your MCP server to production

For more detailed information, check out the [CLI Commands](./usage/cli-commands.md) and [Configuration Options](./usage/configuration-options.md) documentation.