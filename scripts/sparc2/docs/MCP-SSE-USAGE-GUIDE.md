# MCP Server with SSE Support

This document explains how to use the Server-Sent Events (SSE) functionality in the SPARC2 MCP server.

## Overview

The SPARC2 MCP server now supports Server-Sent Events (SSE) for long-running operations like code analysis and modification. This provides real-time progress updates to clients, making the user experience more interactive.

## Transport Types

The MCP server supports two transport mechanisms:

1. **STDIO Transport**: The standard transport used for direct communication between Roo Code and the MCP server.
2. **SSE Transport**: Used for long-running operations to provide real-time progress updates.

## Using SSE with MCP Tools

### analyze_code

When using the `analyze_code` tool, the MCP server will return a `streamUrl` that clients can connect to for real-time progress updates:

```javascript
// Example response from analyze_code
{
  "content": [
    {
      "type": "text",
      "text": "Analysis started. Connect to the SSE stream to receive progress updates."
    }
  ],
  "streamUrl": "http://localhost:3002/stream/analyze?id=1648224000000&files=path%2Fto%2Ffile1.js%2Cpath%2Fto%2Ffile2.js"
}
```

### modify_code

Similarly, the `modify_code` tool will return a `streamUrl` for real-time progress updates:

```javascript
// Example response from modify_code
{
  "content": [
    {
      "type": "text",
      "text": "Modification started. Connect to the SSE stream to receive progress updates."
    }
  ],
  "streamUrl": "http://localhost:3002/stream/modify?id=1648224000000&files=path%2Fto%2Ffile1.js&task=Add%20error%20handling"
}
```

## SSE Event Types

The SSE server sends different types of events:

1. **progress**: Updates on the operation's progress
2. **info**: General information about the operation
3. **error**: Error messages if something goes wrong
4. **result**: The final result of the operation

### Progress Event Example

```json
event: progress
data: {
  "status": "step",
  "message": "Parsing code structure",
  "progress": 15,
  "step": 2,
  "totalSteps": 7,
  "details": "Analyzing syntax and structure of code files"
}
```

### Result Event Example

```json
event: result
data: {
  "result": { /* Analysis or modification result */ },
  "operation": "analyze",
  "files": ["/path/to/file1.js", "/path/to/file2.js"],
  "timestamp": "2025-03-28T18:24:35.000Z",
  "executionTime": "2.5 seconds"
}
```

## Connecting to the SSE Stream

You can connect to the SSE stream using the EventSource API in JavaScript:

```javascript
const eventSource = new EventSource(streamUrl);

eventSource.addEventListener('progress', (event) => {
  const data = JSON.parse(event.data);
  console.log(`Progress: ${data.progress}% - ${data.message}`);
});

eventSource.addEventListener('result', (event) => {
  const data = JSON.parse(event.data);
  console.log('Operation completed:', data.result);
  eventSource.close();
});

eventSource.addEventListener('error', (event) => {
  const data = JSON.parse(event.data);
  console.error('Error:', data.message);
  eventSource.close();
});
```

## Running the MCP Server with SSE Support

To start the MCP server with SSE support, use the following command:

```bash
node scripts/sparc2/sparc2-mcp-wrapper-sse.js
```

This will start:
1. The HTTP API server on port 3001
2. The SSE server on port 3002
3. The MCP server using STDIO transport

## Implementation Details

The SSE implementation provides detailed progress updates for both analyze and modify operations:

- **analyze_code**: 7 steps with progress updates
- **modify_code**: 8 steps with progress updates

Each step includes a description of what's happening, making it easier for users to understand the process.