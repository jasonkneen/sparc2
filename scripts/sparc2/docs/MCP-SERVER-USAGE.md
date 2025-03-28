# MCP Server Usage Guide

This document explains how to use the SPARC2 MCP server with SSE support.

## Overview

The SPARC2 MCP server provides a Model Context Protocol (MCP) interface for AI assistants to interact with SPARC2 functionality. It also includes Server-Sent Events (SSE) support for real-time progress updates during long-running operations.

## Running the MCP Server

There are several ways to run the MCP server:

### 1. Using the Direct Script

```bash
# Make sure the script is executable
chmod +x scripts/sparc2/src/mcp/mcpServerWrapper.js

# Run the script directly
scripts/sparc2/src/mcp/mcpServerWrapper.js
```

### 2. Using the Wrapper Script

```bash
# Make sure the wrapper script is executable
chmod +x scripts/sparc2/sparc2-mcp-wrapper-sse.js

# Run the wrapper script
scripts/sparc2/sparc2-mcp-wrapper-sse.js
```

### 3. Using Node.js

```bash
# Run with Node.js
node scripts/sparc2/src/mcp/mcpServerWrapper.js

# Or using the wrapper
node scripts/sparc2/sparc2-mcp-wrapper-sse.js
```

## Server Behavior

When you run the MCP server, it will:

