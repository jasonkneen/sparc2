# MCP Creator Tests

This directory contains unit tests for the MCP Creator CLI tool.

## Overview

The MCP Creator CLI is a command-line tool that helps users create Model Context Protocol (MCP) server projects. These tests verify that the CLI tool correctly creates MCP server projects based on user input.

## Directory Structure

- `mcp-creator.js` - A copy of the CLI tool for testing
- `mcp-creator.test.js` - The main test file
- `mocks/` - Mock implementations for dependencies
  - `prompting.mock.js` - Mock for the prompting module
  - `configuring.mock.js` - Mock for the configuring module
  - `writing/templates.mock.js` - Mock for the templates module
- `TESTING.md` - Detailed documentation about the testing approach

## Running the Tests

To run the tests:

```bash
# Install dependencies
npm install

# Run tests
npm test
```

## Test Coverage

The tests cover the following functionality:

- User interaction (prompting for input)
- Directory operations (creating directories)
- Project generation (creating files)
- Dependency management (installing dependencies)
- Error handling

Current test coverage: 70.29% statements, 37.2% branches, 57.14% functions

## Future Improvements

See the [TESTING.md](./TESTING.md) file for details on future improvements to the test suite.