#!/bin/bash
# Test script for SPARC2 CLI commands

echo "Testing SPARC2 CLI commands..."

# Test analyze command
echo -e "\n\nTesting 'analyze' command:"
./sparc analyze --files=string-utils.js

# Test modify command
echo -e "\n\nTesting 'modify' command:"
./sparc modify --files=string-utils.js --suggestions="Add a function to capitalize the first letter of each word"

# Test MCP command
echo -e "\n\nTesting 'mcp' command (press Ctrl+C after a few seconds):"
./sparc mcp

echo -e "\n\nAll tests completed!"