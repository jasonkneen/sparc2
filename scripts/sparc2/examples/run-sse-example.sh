#!/bin/bash

# Run SSE Example Script
# This script starts the MCP server with SSE support and opens the example HTML client

# Change to the project root directory
cd "$(dirname "$0")/../.." || exit 1

echo "Starting SPARC2 MCP server with SSE support..."

# Start the MCP server with SSE support in the background
node scripts/sparc2/sparc2-mcp-wrapper-sse.js &
MCP_PID=$!

# Wait for the server to start
sleep 3

echo "MCP server started with PID: $MCP_PID"
echo "Opening SSE client example in the browser..."

# Open the HTML client in the default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "scripts/sparc2/examples/analyze-sse-client.html"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open &> /dev/null; then
        xdg-open "scripts/sparc2/examples/analyze-sse-client.html"
    else
        echo "Cannot open browser automatically. Please open scripts/sparc2/examples/analyze-sse-client.html manually."
    fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    start "scripts/sparc2/examples/analyze-sse-client.html"
else
    echo "Cannot open browser automatically. Please open scripts/sparc2/examples/analyze-sse-client.html manually."
fi

echo "Press Ctrl+C to stop the server when you're done."

# Wait for user to press Ctrl+C
trap "kill $MCP_PID; echo 'MCP server stopped.'; exit 0" INT
wait $MCP_PID