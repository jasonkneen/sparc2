# Installation Guide

This guide provides detailed instructions for installing and setting up MCP Creator on your system.

## Prerequisites

Before installing MCP Creator, ensure you have the following prerequisites:

- **Node.js**: Version 16.x or higher
- **npm**: Version 7.x or higher

You can check your current versions with:

```bash
node --version
npm --version
```

## Installation Options

### Global Installation (Recommended)

Installing MCP Creator globally allows you to use it from any directory on your system.

```bash
npm install -g @agentic.org/mcp-creator
```

After installation, you can verify that it was installed correctly by running:

```bash
mcp-creator --version
```

### Local Installation

If you prefer to install MCP Creator as a development dependency in your project:

```bash
npm install --save-dev @agentic.org/mcp-creator
```

With local installation, you'll need to use npx to run the tool:

```bash
npx mcp-creator
```

### Using Without Installation

You can also use MCP Creator without installing it by using npx:

```bash
npx @agentic.org/mcp-creator
```

This will download and execute the latest version of MCP Creator without installing it permanently.

## Platform-Specific Notes

### Windows

On Windows, you might need to adjust your execution policy to run scripts:

```powershell
# Run in PowerShell as Administrator
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### macOS / Linux

On macOS and Linux, you might need to add execute permissions to the installed binary:

```bash
chmod +x $(which mcp-creator)
```

## Docker Installation

If you prefer to use Docker, you can run MCP Creator in a container:

```bash
docker run --rm -it -v $(pwd):/app agentic/mcp-creator
```

This will mount your current directory as `/app` in the container and run MCP Creator.

## Troubleshooting

### Common Installation Issues

#### Permission Errors

If you encounter permission errors during global installation:

```bash
# On macOS/Linux
sudo npm install -g @agentic.org/mcp-creator

# Alternative approach (recommended)
npm install -g @agentic.org/mcp-creator --unsafe-perm=true --allow-root
```

#### Path Issues

If the `mcp-creator` command is not found after installation:

1. Check that your npm global bin directory is in your PATH
2. Find the npm global bin directory with:

```bash
npm config get prefix
```

Then add `<npm-prefix>/bin` to your PATH.

#### Dependency Conflicts

If you encounter dependency conflicts:

```bash
npm install -g @agentic.org/mcp-creator --force
```

### Getting Help

If you continue to experience issues with installation:

1. Check the [GitHub repository](https://github.com/agentic-ai/mcp-creator) for known issues
2. Join our [Discord community](https://discord.gg/agentic-ai) for support
3. Open an issue on GitHub with details about your environment and the error messages

## Next Steps

After installing MCP Creator, you can:

- Follow the [Quick Start Guide](./quickstart.md) to create your first MCP server
- Learn about [CLI Commands](./usage/cli-commands.md)
- Explore [Configuration Options](./usage/configuration-options.md)