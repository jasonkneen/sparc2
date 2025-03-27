# MCP Creator CLI Testing Documentation

## Overview
This document describes the testing approach and implementation for the MCP Creator CLI tool. The tests verify that the CLI tool correctly creates MCP server projects based on user input.

## Test Coverage
The test suite covers the following functionality:

1. **User Interaction**
   - Prompting for target directory
   - Handling user input for project configuration

2. **Directory Operations**
   - Creating the target directory if it doesn't exist
   - Not creating the directory if it already exists

3. **Project Generation**
   - Calling the prompting module with the correct generator object
   - Calling the configuring module with user answers
   - Creating the directory structure
   - Generating project files

4. **Dependency Management**
   - Installing dependencies
   - Handling dependency installation errors

5. **User Guidance**
   - Displaying next steps to the user

6. **Error Handling**
   - Gracefully handling errors during the creation process

## Test Implementation

### Mocking Strategy
The tests use Jest's mocking capabilities to isolate the CLI tool from its dependencies:

- **File System Operations**: `fs` module is mocked to prevent actual file system changes
- **Command Execution**: `child_process.execSync` is mocked to prevent actual command execution
- **User Interaction**: `inquirer` is mocked to simulate user input
- **Console Output**: `chalk` is mocked to verify colored output
- **Generator Modules**: The internal modules (`prompting`, `configuring`, `templates`) are mocked to control their behavior

### Test Structure
Each test follows a similar pattern:

1. Set up the test environment with appropriate mocks
2. Execute the `run()` function from the CLI tool
3. Verify that the expected actions were performed using Jest's assertion functions

### Known Limitations
- The welcome message test is skipped because it's printed outside the `run()` function and is not easily testable without modifying the source code.
- The test coverage is at 70.29% for statements, which could be improved by adding more tests for edge cases and error conditions.

## Running the Tests
To run the tests:

```bash
cd /workspaces/sparc2/mcp-creator-tests
npm test
```

## Future Improvements
1. Refactor the CLI tool to move the welcome message inside the `run()` function to make it more testable
2. Add tests for edge cases and error conditions to improve coverage
3. Add integration tests that verify the actual file contents generated
4. Add tests for different complexity levels and feature combinations