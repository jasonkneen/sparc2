# SSE Implementation for analyze_code

This document provides detailed information about the Server-Sent Events (SSE) implementation for the `analyze_code` tool in SPARC2.

## Overview

The `analyze_code` tool now supports real-time progress updates using Server-Sent Events (SSE). This allows clients to receive step-by-step updates during the analysis process, providing a more interactive user experience.

## Analysis Steps

The analysis process is divided into 7 steps, each with its own progress update:

1. **Reading Files** (0-15%)
   - Reading and parsing the input files
   - Progress updates for each file being read

2. **Parsing Code Structure** (15-30%)
   - Analyzing the syntax and structure of the code files
   - Building an abstract syntax tree (AST)

3. **Static Analysis** (30-45%)
   - Checking for syntax errors, linting issues, and code style
   - Identifying potential bugs and code smells

4. **Code Quality Assessment** (45-60%)
   - Evaluating complexity, maintainability, and readability
   - Calculating metrics like cyclomatic complexity

5. **Identifying Patterns** (60-75%)
   - Looking for common patterns, anti-patterns, and code smells
   - Identifying potential refactoring opportunities

6. **Generating Recommendations** (75-90%)
   - Creating suggestions for code improvements
   - Prioritizing recommendations based on impact

7. **Finalizing Analysis** (90-100%)
   - Compiling the final analysis report
   - Formatting the results for presentation

## SSE Event Types

The SSE server sends different types of events during the analysis process:

### 1. Progress Events

Progress events provide updates on the current step and overall progress:

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

### 2. Info Events

Info events provide general information about the analysis:

```json
event: info
data: {
  "status": "info",
  "message": "Operation: analyze",
  "details": {
    "files": ["/path/to/file1.js", "/path/to/file2.js"],
    "timestamp": "2025-03-28T18:26:38.000Z"
  }
}
```

### 3. Reading Events

Reading events provide updates on file reading progress:

```json
event: progress
data: {
  "status": "reading",
  "message": "Reading file /path/to/file1.js (1/2)",
  "progress": 7.5,
  "file": "/path/to/file1.js",
  "fileIndex": 0,
  "totalFiles": 2
}
```

### 4. Error Events

Error events are sent if something goes wrong during the analysis:

```json
event: error
data: {
  "status": "error",
  "message": "Error during analysis: File not found",
  "error": "File not found",
  "operation": "analyze",
  "timestamp": "2025-03-28T18:26:38.000Z"
}
```

### 5. Result Events

Result events contain the final analysis results:

```json
event: result
data: {
  "result": {
    // Analysis result object
  },
  "operation": "analyze",
  "files": ["/path/to/file1.js", "/path/to/file2.js"],
  "timestamp": "2025-03-28T18:26:38.000Z",
  "executionTime": "2.5 seconds"
}
```

## Connecting to the SSE Stream

When using the `analyze_code` tool through the MCP server, you'll receive a `streamUrl` in the response:

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

You can connect to this URL using the EventSource API in JavaScript:

```javascript
const eventSource = new EventSource(streamUrl);

eventSource.addEventListener('progress', (event) => {
  const data = JSON.parse(event.data);
  console.log(`Progress: ${data.progress}% - ${data.message}`);
  // Update UI with progress information
});

eventSource.addEventListener('result', (event) => {
  const data = JSON.parse(event.data);
  console.log('Analysis completed:', data.result);
  // Display the analysis results
  eventSource.close();
});

eventSource.addEventListener('error', (event) => {
  const data = JSON.parse(event.data);
  console.error('Error:', data.message);
  // Display error message
  eventSource.close();
});
```

## Implementation Details

The SSE implementation for `analyze_code` is designed to be:

1. **Informative**: Providing detailed information about each step
2. **Responsive**: Sending updates frequently to keep the UI responsive
3. **Lightweight**: Minimizing the payload size to reduce bandwidth usage
4. **Robust**: Handling errors gracefully and providing clear error messages

The actual analysis is performed by the SPARC2 HTTP API server, while the SSE server is responsible for providing progress updates.