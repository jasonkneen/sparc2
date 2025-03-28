#!/bin/bash

# Run SSE Test Script
# This script starts the MCP server with SSE support and runs the SSE streaming test

# Get the absolute path to the project root directory
# We need to go up two levels from the examples directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
echo "Project root: $PROJECT_ROOT"

# Check if files were provided
if [ $# -eq 0 ]; then
  echo "Usage: $0 [file1.js file2.js ...]"
  echo "Example: $0 math-utils.js string-utils.js"
  echo "Using default test files..."
  TEST_FILES="$PROJECT_ROOT/scripts/sparc2/math-utils.js $PROJECT_ROOT/scripts/sparc2/string-utils.js"
else
  # Convert relative paths to absolute paths
  TEST_FILES=""
  for file in "$@"; do
    if [[ "$file" == /* ]]; then
      # Absolute path
      TEST_FILES="$TEST_FILES $file"
    else
      # Relative path
      TEST_FILES="$TEST_FILES $PROJECT_ROOT/$file"
    fi
  done
fi

echo "Starting SPARC2 MCP server with SSE support..."

# Start the MCP server with SSE support in the background
node "$PROJECT_ROOT/scripts/sparc2/sparc2-mcp-wrapper-sse.js" &
MCP_PID=$!

# Wait for the server to start
sleep 3

echo "MCP server started with PID: $MCP_PID"
echo "Running SSE streaming test with files: $TEST_FILES"

# Run the SSE streaming test
node "$PROJECT_ROOT/scripts/sparc2/examples/sse-streaming.js" analyze $TEST_FILES

# Check if the test was successful
TEST_EXIT_CODE=$?
if [ $TEST_EXIT_CODE -ne 0 ]; then
  echo "SSE streaming test failed with exit code: $TEST_EXIT_CODE"
else
  echo "SSE streaming test completed successfully"
fi

# Kill the MCP server
kill $MCP_PID 2>/dev/null || true
echo "MCP server stopped."

exit $TEST_EXIT_CODE