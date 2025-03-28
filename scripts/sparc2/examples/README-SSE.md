# SPARC2 SSE Examples

This directory contains examples demonstrating the Server-Sent Events (SSE) functionality in SPARC2.

## Overview

Server-Sent Events (SSE) provide a way for the server to push real-time updates to clients. In SPARC2, SSE is used to provide progress updates during long-running operations like code analysis and modification.

## Examples

### 1. HTML Client Example

The `analyze-sse-client.html` file is a standalone HTML page that demonstrates how to connect to the SSE stream and display real-time progress updates.

Features:
- Connect to the SSE stream for analyze_code and modify_code operations
- Display progress bar and step information
- Show detailed logs of all events
- Display the final result

### 2. Run SSE Example Script

The `run-sse-example.sh` script automates the process of:
1. Starting the MCP server with SSE support
2. Opening the HTML client in your default browser
3. Handling cleanup when you're done

## Running the Examples

### Method 1: Using the Script

Simply run the provided script:

```bash
./scripts/sparc2/examples/run-sse-example.sh
```

This will start the MCP server and open the HTML client in your browser.

### Method 2: Manual Setup

1. Start the MCP server with SSE support:

```bash
node scripts/sparc2/sparc2-mcp-wrapper-sse.js
```

2. Open the HTML client in your browser:

```bash
# On macOS
open scripts/sparc2/examples/analyze-sse-client.html

# On Linux
xdg-open scripts/sparc2/examples/analyze-sse-client.html

# On Windows
start scripts/sparc2/examples/analyze-sse-client.html
```

## Using the HTML Client

1. Enter the paths to the files you want to analyze or modify (comma-separated)
2. Select the operation (analyze_code or modify_code)
3. If you selected modify_code, enter a description of the modification task
4. Click "Start Operation"
5. Watch the real-time progress updates
6. View the final result when the operation completes

## Technical Details

The SSE server runs on port 3002, while the regular HTTP API server runs on port 3001. The MCP server communicates with both servers to provide a seamless experience.

For more detailed information about the SSE implementation, see the [MCP-SSE-USAGE-GUIDE.md](../docs/MCP-SSE-USAGE-GUIDE.md) document.