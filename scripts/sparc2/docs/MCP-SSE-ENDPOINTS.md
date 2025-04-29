# SPARC2 MCP Server SSE Endpoints

This document provides information about the Server-Sent Events (SSE) endpoints available in the SPARC2 MCP server.

## Overview

The SPARC2 MCP server provides real-time progress updates for long-running operations using Server-Sent Events (SSE). This allows clients to receive continuous updates about the progress of operations without having to poll the server.

## SSE Endpoints

The SSE server runs on port 3002 by default and provides the following endpoints:

### 1. `/stream/analyze`

This endpoint provides real-time updates during code analysis operations.

**URL Parameters:**
- `id` - A unique identifier for the request (typically a timestamp)
- `files` - A comma-separated list of file paths to analyze

**Example:**
```
http://localhost:3002/stream/analyze?id=1743189455338&files=/path/to/file1.js,/path/to/file2.js
```

**Event Types:**
- `progress` - Updates about the progress of the analysis
- `info` - General information about the operation
- `error` - Error messages if something goes wrong
- `result` - The final result of the analysis

**Progress Steps:**
1. Reading files
2. Parsing code structure
3. Performing static analysis
4. Assessing code quality
5. Identifying code patterns
6. Generating recommendations
7. Finalizing analysis

### 2. `/stream/modify`

This endpoint provides real-time updates during code modification operations.

**URL Parameters:**
- `id` - A unique identifier for the request (typically a timestamp)
- `files` - A comma-separated list of file paths to modify
- `task` - A description of the modification task to perform

**Example:**
```
http://localhost:3002/stream/modify?id=1743189455338&files=/path/to/file1.js,/path/to/file2.js&task=Add%20error%20handling
```

**Event Types:**
- `progress` - Updates about the progress of the modification
- `info` - General information about the operation
- `error` - Error messages if something goes wrong
- `result` - The final result of the modification

**Progress Steps:**
1. Reading files
2. Parsing code structure
3. Planning modifications
4. Applying changes
5. Validating changes
6. Finalizing modifications

## Using SSE in Client Applications

To connect to an SSE endpoint from a client application, you can use the `EventSource` API in JavaScript:

```javascript
const eventSource = new EventSource('http://localhost:3002/stream/analyze?id=123&files=/path/to/file.js');

eventSource.addEventListener('progress', (event) => {
  const data = JSON.parse(event.data);
  console.log(`Progress: ${data.progress}%`);
});

eventSource.addEventListener('result', (event) => {
  const data = JSON.parse(event.data);
  console.log('Analysis complete:', data.result);
  eventSource.close();
});

eventSource.addEventListener('error', (event) => {
  console.error('Error:', event);
  eventSource.close();
});
```

## Command Line Example

You can test the SSE endpoints using the provided test script:

```bash
cd scripts/sparc2/examples
./run-sse-test.sh path/to/file1.js path/to/file2.js
```

This script will start the MCP server with SSE support, connect to the appropriate SSE endpoint, and display progress updates in the terminal.

## MCP Integration

The SSE server is integrated with the MCP server, allowing AI assistants to use the MCP protocol to interact with the SPARC2 tools while providing real-time progress updates to users.

When an AI assistant uses the `analyze_code` or `modify_code` tools through the MCP protocol, the operation is processed through the SSE server, enabling real-time progress updates.

## Standard MCP HTTP Endpoints

In addition to the SSE endpoints, the SPARC2 MCP server also provides standard HTTP endpoints for tool execution. These endpoints are available on port 3001 by default.

### MCP HTTP Endpoints

The MCP server exposes the following HTTP endpoints:

- **GET /discover**: Returns a list of available tools and resources
- **GET /capabilities**: Alias for /discover, returns the same information
- **GET /list_tools**: Legacy endpoint that returns only the tools list
- **POST /analyze_code**: Analyzes code files for issues and improvements
- **POST /modify_code**: Applies suggested modifications to code files
- **POST /execute_code**: Executes code in a secure sandbox
- **POST /search_code**: Searches for similar code changes
- **POST /create_checkpoint**: Creates a git checkpoint
- **POST /rollback**: Rolls back to a previous checkpoint
- **POST /config**: Manages configuration settings

### MCP Tools

The SPARC2 MCP server provides the following tools:

#### 1. analyze_code
Analyzes code files for issues and improvements.

**Parameters**:
- `files`: Array of file paths to analyze (required)
- `task`: Description of the analysis task

**Returns**: Analysis results with suggestions for improvements

#### 2. modify_code
Applies suggested modifications to code files.

**Parameters**:
- `files`: Array of file paths to modify (required)
- `task`: Description of the modification task

**Returns**: Results of the modifications applied

#### 3. execute_code
Executes code in a secure sandbox.

**Parameters**:
- `code`: Code to execute (required)
- `language`: Programming language (python, javascript, typescript) (required)

**Returns**: Execution results including stdout, stderr, and any errors

#### 4. search_code
Searches for similar code changes.

**Parameters**:
- `query`: Search query (required)
- `limit`: Maximum number of results to return

**Returns**: Array of search results with relevance scores

#### 5. create_checkpoint
Creates a version control checkpoint.

**Parameters**:
- `name`: Checkpoint name (required)

**Returns**: Checkpoint information including commit hash

#### 6. rollback
Rolls back to a previous checkpoint.

**Parameters**:
- `commit`: Commit hash to roll back to (required)

**Returns**: Result of the rollback operation

#### 7. config
Manages configuration.

**Parameters**:
- `action`: Action to perform (get, set, list) (required)
- `key`: Configuration key (required for get/set)
- `value`: Configuration value (required for set)

**Returns**: Configuration operation result

### Testing MCP HTTP Endpoints with curl

You can test the MCP server endpoints using curl commands. First, start the MCP server:

```bash
./sparc api --port 3001
```

#### 1. Discover Available Tools and Resources

```bash
curl -X GET http://localhost:3001/discover
```

This will return a JSON object containing all available tools and resources.

#### 2. Execute Code

```bash
curl -X POST http://localhost:3001/execute_code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log(\"Hello, SPARC2!\"); const sum = (a, b) => a + b; console.log(sum(5, 3));",
    "language": "javascript"
  }'
```

#### 3. Analyze Code Files

```bash
curl -X POST http://localhost:3001/analyze_code \
  -H "Content-Type: application/json" \
  -d '{
    "files": ["path/to/file.js"],
    "task": "Check for performance issues and suggest improvements"
  }'
```

#### 4. Modify Code Files

```bash
curl -X POST http://localhost:3001/modify_code \
  -H "Content-Type: application/json" \
  -d '{
    "files": ["path/to/file.js"],
    "task": "Optimize the rendering function"
  }'
```

## Relationship Between SSE and HTTP Endpoints

The SSE endpoints provide real-time progress updates for the same operations that can be performed through the HTTP endpoints. When you use the HTTP endpoints directly, you'll receive the final result once the operation completes, but you won't get real-time progress updates.

Using the SSE endpoints allows you to:
1. Monitor the progress of long-running operations
2. Provide feedback to users about what's happening
3. Handle errors as they occur rather than waiting for the operation to complete

The SSE endpoints are particularly useful for operations that may take a significant amount of time, such as analyzing or modifying large codebases.