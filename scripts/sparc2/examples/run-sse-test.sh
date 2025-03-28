#!/bin/bash

# Run SSE MCP Test Script
# This script runs the SSE MCP test with Deno

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Print header
echo -e "${BLUE}=== SPARC2 SSE MCP Test ===${NC}"
echo -e "${YELLOW}This script tests the SSE-enabled MCP server for SPARC2${NC}"
echo ""

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    echo -e "${RED}Error: Deno is not installed or not in PATH${NC}"
    echo -e "${YELLOW}Please install Deno:${NC}"
    echo -e "  curl -fsSL https://deno.land/install.sh | sh"
    exit 1
fi

# Function to kill process on port 3333
kill_port_process() {
    echo -e "${YELLOW}Checking for processes using port 3333...${NC}"
    
    # Get PID of process using port 3333
    local pid
    
    if command -v lsof &> /dev/null; then
        # Use lsof if available (macOS, Linux)
        pid=$(lsof -t -i:3333 2>/dev/null)
    elif command -v netstat &> /dev/null; then
        # Use netstat as fallback (Windows, some Linux)
        pid=$(netstat -ano | grep "LISTEN" | grep ":3333" | awk '{print $NF}' 2>/dev/null)
    else
        echo -e "${RED}Cannot find tools to check for processes on port 3333${NC}"
        return 1
    fi
    
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}Found process with PID $pid using port 3333. Killing it...${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
        echo -e "${GREEN}Process killed${NC}"
        return 0
    else
        echo -e "${GREEN}No process found using port 3333${NC}"
        return 0
    fi
}

# Always kill any existing process on port 3333 to ensure a clean start
kill_port_process

# Start the SSE-enabled MCP server
echo -e "${YELLOW}Starting SSE-enabled MCP server...${NC}"
node "$SCRIPT_DIR/../sparc2-mcp-wrapper-sse.js" &
MCP_PID=$!

# Wait for server to start
echo -e "${YELLOW}Waiting for server to start...${NC}"
sleep 5

# Check if server is running by checking if the port is in use
if lsof -i:3333 > /dev/null 2>&1 || netstat -ano | grep "LISTEN" | grep ":3333" > /dev/null 2>&1; then
    echo -e "${GREEN}MCP server started successfully with PID $MCP_PID${NC}"
    STARTED_SERVER=true
else
    echo -e "${RED}Failed to start MCP server${NC}"
    echo -e "${YELLOW}Please start the server manually:${NC}"
    echo -e "  node scripts/sparc2/sparc2-mcp-wrapper-sse.js"
    exit 1
fi

# Run the test
echo -e "\n${BLUE}Running SSE test...${NC}"
deno run --allow-net --allow-read "$SCRIPT_DIR/sse-mcp-test.ts"

# Check if we should start the web server
if [[ "$1" == "--server" ]]; then
    echo -e "\n${BLUE}Starting web server for HTML client...${NC}"
    deno run --allow-net --allow-read "$SCRIPT_DIR/sse-mcp-test.ts" --server
fi

# Clean up if we started the server
if [[ "$STARTED_SERVER" == "true" ]]; then
    echo -e "\n${YELLOW}Stopping MCP server (PID $MCP_PID)...${NC}"
    kill $MCP_PID
    echo -e "${GREEN}MCP server stopped${NC}"
fi

echo -e "\n${GREEN}Test complete!${NC}"