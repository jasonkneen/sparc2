# Using the SSE-enabled analyze_code MCP Command

This guide demonstrates how to use the Server-Sent Events (SSE) enabled `analyze_code` MCP command from different clients, including Roo, JavaScript, and command-line tools.

## Prerequisites

Before you begin, make sure you have:

1. SPARC2 installed
2. Node.js installed
3. Deno installed (for some examples)

## Step 1: Start the SSE-enabled MCP Server

First, you need to start the SSE-enabled MCP server:

```bash
# Navigate to the SPARC2 directory
cd scripts/sparc2

# Start the SSE-enabled MCP server
node sparc2-mcp-wrapper-sse.js
```

You should see output similar to:
```
MCP Wrapper with SSE running from: /path/to/sparc2/scripts/sparc2
Running MCP server with SSE support
Connecting to stdio transport...
SPARC2 MCP server running on stdio
[MCP Wrapper] Starting HTTP API server on port 3333...
[MCP Wrapper] Found Deno at: /path/to/deno
```

## Step 2: Using the MCP Command from Different Clients

### Option 1: Using curl

You can use curl to make an MCP request to the `analyze_code` command:

```bash
# Make an MCP request to analyze_code
curl -X POST http://localhost:3333/mcp -H "Content-Type: application/json" -d '{
  "jsonrpc": "2.0",
  "method": "callTool",
  "params": {
    "name": "analyze_code",
    "arguments": {
      "files": ["scripts/sparc2/src/cli/analyzeCommand.ts", "scripts/sparc2/sparc2-analyze-wrapper.js"]
    }
  },
  "id": "1"
}'
```

This will return a response with a `streamUrl`:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Analysis started. Connect to the SSE stream to receive progress updates."
      }
    ],
    "streamUrl": "http://localhost:3333/stream/analyze?id=1711647123456"
  },
  "id": "1"
}
```

### Option 2: Using JavaScript

You can use JavaScript to make an MCP request and then connect to the SSE stream:

```javascript
// Make the MCP request
async function analyzeCode() {
  // Step 1: Make the MCP request
  const response = await fetch('http://localhost:3333/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'callTool',
      params: {
        name: 'analyze_code',
        arguments: {
          files: ['scripts/sparc2/src/cli/analyzeCommand.ts', 'scripts/sparc2/sparc2-analyze-wrapper.js']
        }
      },
      id: '1'
    })
  });
  
  const result = await response.json();
  const streamUrl = result.result.streamUrl;
  
  // Step 2: Connect to the SSE stream
  const eventSource = new EventSource(streamUrl);
  
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
}

analyzeCode();
```

### Option 3: Using the Provided TypeScript Test

You can use the provided TypeScript test to analyze code:

```bash
cd scripts/sparc2/examples
./run-sse-test.sh
```

### Option 4: Using the HTML Client

You can use the provided HTML client to analyze code:

```bash
cd scripts/sparc2/examples
./run-sse-test.sh --server
```

Then open a browser to http://localhost:8080 to use the HTML client.

### Option 5: Direct SSE Connection

You can connect directly to the SSE endpoint without going through MCP:

```bash
# Connect directly to the SSE endpoint with curl
curl -H "Accept: text/event-stream" \
  "http://localhost:3333/stream/analyze?files=scripts/sparc2/src/cli/analyzeCommand.ts,scripts/sparc2/sparc2-analyze-wrapper.js"
```

This will stream the SSE events directly to your terminal.

## Step 3: Using with Roo or Other MCP Clients

To use the SSE-enabled `analyze_code` command with Roo or other MCP clients, you need to:

1. Start the SSE-enabled MCP server as shown in Step 1
2. Configure your MCP client to connect to the server at `http://localhost:3333/mcp`
3. Call the `analyze_code` tool with the files you want to analyze
4. Extract the `streamUrl` from the response
5. Connect to that URL with an EventSource to receive real-time updates

For Roo specifically, you would need to:

1. Register the MCP server:
   ```
   /mcp register sparc2-sse http://localhost:3333/mcp
   ```

2. Call the tool:
   ```
   /mcp call sparc2-sse analyze_code '{"files": ["scripts/sparc2/src/cli/analyzeCommand.ts"]}'
   ```

3. Extract the `streamUrl` from the response and connect to it using an EventSource in your application.

## Troubleshooting

### Server Not Starting

If the server fails to start, check:
- You have the necessary permissions to start the server
- Node.js is installed and working correctly

Note: The server will automatically attempt to kill any process using port 3333 if it encounters an "address already in use" error. This auto-recovery feature helps ensure the server can start even if another process is using the port.

### Connection Issues

If you can't connect to the server:
- Make sure the server is running
- Check that you're using the correct URL (http://localhost:3333/mcp)
- Verify there are no firewall issues blocking the connection

### SSE Stream Not Working

If the SSE stream is not working:
- Make sure your client supports SSE (EventSource)
- Check that you're using the correct stream URL
- Verify the server is still running

## Conclusion

The SSE-enabled `analyze_code` MCP command provides real-time progress updates during code analysis, preventing timeouts and improving the user experience. By following this guide, you can use this feature from various clients and integrate it into your own applications.