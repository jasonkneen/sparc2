# MCP Creator Features

MCP Creator offers a rich set of features to help you create and customize your MCP server projects. This document provides an overview of these features and how they can benefit your development workflow.

## Core Features

### Interactive Project Setup

MCP Creator provides an interactive command-line interface that guides you through the process of setting up your MCP server project. The interface prompts you for various configuration options, making it easy to customize your project without having to manually edit configuration files.

### Project Structure Generation

Based on your configuration choices, MCP Creator generates a complete project structure with all the necessary files and directories. This includes:

- Source code files
- Configuration files
- Documentation
- Testing infrastructure (if selected)
- Docker configuration (if selected)

### Dependency Management

MCP Creator automatically installs all required dependencies for your MCP server project, saving you time and ensuring that your project has everything it needs to run properly.

## Complexity Levels

MCP Creator supports three complexity levels to accommodate different project requirements:

### Basic

The basic complexity level provides a minimal MCP server implementation with:

- Core MCP server functionality
- Basic request handling
- Simple project structure

This is ideal for beginners or for simple proof-of-concept projects.

### Intermediate

The intermediate complexity level adds:

- Development tools (nodemon, ts-node)
- Additional script commands
- More structured project organization

This is suitable for most development projects.

### Advanced

The advanced complexity level includes all intermediate features plus:

- Comprehensive logging
- Environment configuration
- Authentication support
- Testing infrastructure
- Docker integration (optional)
- WebSocket support (optional)
- Edge function support (optional)

This is designed for production-ready applications that require robust features and scalability.

## Optional Features

### Example Code

MCP Creator can include example code to help you understand how to use various MCP server features:

- Echo handler: A simple example that echoes back the input
- Calculator handler: A more complex example that performs mathematical operations

### Testing Infrastructure

If you choose to include tests, MCP Creator will set up:

- Jest testing framework
- TypeScript integration with ts-jest
- Basic test examples

### Docker Integration

For containerized deployment, MCP Creator can generate:

- Dockerfile for building a container image
- docker-compose.yml for orchestrating services
- Configuration for production environments

### Advanced Features

#### Environment Configuration

- .env file support with dotenv
- Configuration utility for accessing environment variables
- Example environment configuration

#### Logging

- Structured logging with Winston
- Log levels for different environments
- Logging middleware for request/response logging

#### Authentication

- Basic authentication framework
- Authentication middleware
- Example authentication implementation

#### WebSocket Support

- WebSocket server integration
- Event handling for WebSocket connections
- Example WebSocket implementation

#### Edge Function Support

- Edge function framework
- Deployment configuration for edge functions
- Example edge function implementation

## Customization Options

MCP Creator allows you to customize various aspects of your project:

- Project name and description
- Author information
- Feature selection
- Directory structure
- Package.json configuration
- TypeScript configuration

## Next Steps

To learn more about how to use these features, check out the following resources:

- [Quick Start Guide](./quickstart.md)
- [CLI Commands](./usage/cli-commands.md)
- [Configuration Options](./usage/configuration-options.md)
- [Customization Guide](./customization.md)
- [Advanced MCP Usage](./advanced-mcp-usage.md)