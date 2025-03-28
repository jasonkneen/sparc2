# SPARC2 Analyze Code with Server-Sent Events (SSE)

This document explains how to use the SSE-enabled version of the `analyze_code` MCP command, which provides real-time progress updates during code analysis to prevent timeouts.

## Overview

The standard MCP implementation can time out during long-running operations like code analysis. To solve this problem, we've implemented a Server-Sent Events (SSE) approach that:

1. Starts the analysis process
2. Returns immediately with a stream URL
3. Provides real-time progress updates via the SSE stream
4. Delivers the final result when analysis is complete

This approach prevents timeouts and provides a better user experience with progress visibility.

## How It Works

When you call the `analyze_code` tool through the MCP interface, it will automatically return a `streamUrl` that you can connect to for real-time updates. The actual analysis happens asynchronously on the server, and progress updates are sent through the SSE stream.

### Integration with MCP

The SSE functionality is fully integrated with the MCP protocol. When an MCP client calls the `analyze_code` tool, the response includes a `streamUrl` field that points to the SSE endpoint. This allows MCP clients to:

1. Make a standard MCP call to `analyze_code`
2. Receive a response with a `streamUrl`
3. Connect to that URL with an EventSource to get real-time updates

This approach maintains compatibility with the MCP protocol while adding streaming capabilities.

## Getting Started

### Starting the SSE-enabled MCP Server

```bash
# Navigate to the SPARC2 directory
cd scripts/sparc2

# Start the SSE-enabled MCP server
npm run start-mcp-sse
# or directly:
node sparc2-mcp-wrapper-sse.js
```

The server will start on port 3333 by default.

### Using the MCP Command

When you call the `analyze_code` tool through the MCP interface, it will return a stream URL that you can connect to for real-time updates:

```javascript
// Example MCP tool call response
{
  "content": [
    {
      "type": "text",
      "text": "Analysis started. Connect to the SSE stream to receive progress updates."
    }
  ],
  "streamUrl": "http://localhost:3333/stream/analyze?id=1711647123456"
}
```

### Connecting to the SSE Stream

You can connect to the SSE stream using the EventSource API in JavaScript:

```javascript
const eventSource = new EventSource("http://localhost:3333/stream/analyze?id=1711647123456&files=file1.js,file2.js");

// Handle progress events
eventSource.addEventListener('progress', function(event) {
  const data = JSON.parse(event.data);
  console.log(`Progress: ${data.progress}% - ${data.message}`);
});

// Handle result events
eventSource.addEventListener('result', function(event) {
  const data = JSON.parse(event.data);
  console.log('Analysis complete:', data.result);
  eventSource.close();
});

// Handle error events
eventSource.addEventListener('error', function(event) {
  console.error('Error:', event);
  eventSource.close();
});
```

### Direct SSE Usage (Without MCP)

You can also connect directly to the SSE endpoint without going through MCP:

```javascript
// Connect directly to the SSE endpoint with file parameters
const eventSource = new EventSource("http://localhost:3333/stream/analyze?files=file1.js,file2.js");
```

This is useful for testing or for applications that don't need the full MCP protocol.

## Demo Client

A demo HTML client is included to demonstrate the SSE functionality:

```
scripts/sparc2/examples/analyze-sse-client.html
```

To use the demo client:

1. Start the SSE-enabled MCP server
2. Open the HTML file in a browser
3. Enter the file paths you want to analyze (comma-separated)
4. Click "Analyze Code"

The client will connect to the SSE stream and display real-time progress updates.

## TypeScript Test Client

A TypeScript test client is also included to demonstrate how to use the SSE functionality from Deno:

```
scripts/sparc2/examples/sse-mcp-test.ts
```

This client connects directly to the SSE endpoint and displays progress in the terminal.

To run the test:

```bash
cd scripts/sparc2/examples
./run-sse-test.sh
```

## SSE Event Types

The SSE stream sends the following event types:

### `progress`

Sent to provide progress updates during analysis.

```json
{
  "status": "analyzing",
  "message": "Parsing code structure",
  "progress": 30
}
```

- `status`: Current status (started, reading, analyzing, completed, error)
- `message`: Human-readable description of the current step
- `progress`: Percentage complete (0-100)

### `result`

Sent when analysis is complete, containing the final result.

```json
{
  "result": {
    "timestamp": "2025-03-28T16:45:00.000Z",
    "files": [
      {
        "path": "src/index.js",
        "size": 1024,
        "lines": 42,
        "suggestions": [
          "This is a simplified analysis with SSE streaming.",
          "For full functionality, please run SPARC2 from a local installation."
        ]
      }
    ]
  }
}
```

### `error`

Sent when an error occurs during analysis.

```json
{
  "status": "error",
  "message": "Error reading file src/missing.js: File not found",
  "error": "ENOENT: no such file or directory"
}
```

## Implementation Details

The SSE implementation uses:

1. A Node.js HTTP server to handle SSE connections
2. An EventSourceResponse class to manage SSE streams
3. Asynchronous file reading and analysis with progress reporting
4. Event-based communication for real-time updates

This approach can be extended to other long-running operations in the SPARC2 system.

## Troubleshooting

### Port Already in Use

If you see an error like "Address already in use (os error 98)", another process is using port 3333. You can:

1. Kill the existing process:
   ```bash
   kill -9 $(lsof -t -i:3333)
   ```

2. Change the port in the `sparc2-mcp-wrapper-sse.js` file (look for `const port = 3333;`)

### Connection Refused

If the client can't connect to the SSE stream, make sure:

1. The MCP server is running
2. You're using the correct URL (localhost:3333)
3. There are no firewall issues blocking the connection

### Timeout During Analysis

If you still experience timeouts, you may need to adjust the timeout settings in your client or increase the frequency of progress updates in the SSE implementation.