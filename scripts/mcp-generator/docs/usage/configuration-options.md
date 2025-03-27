# Configuration Options

This document details all the configuration options available in MCP Creator, explaining what each option does and how to use it.

## Interactive Configuration

When you run MCP Creator without any options, it will guide you through an interactive setup process with the following configuration options:

### Basic Project Information

#### Target Directory

- **Prompt**: "Where would you like to create your MCP server?"
- **Default**: `./my-mcp-server`
- **Description**: The directory where your MCP server project will be created. If the directory doesn't exist, it will be created.

#### Project Name

- **Prompt**: "What is the name of your MCP server?"
- **Default**: Based on the target directory name
- **Description**: The name of your MCP server project. This will be used in the package.json file and other places throughout the project.

#### Project Description

- **Prompt**: "Please provide a description for your MCP server:"
- **Default**: "An MCP server implementation"
- **Description**: A brief description of your MCP server project. This will be used in the package.json file and the README.md file.

#### Author

- **Prompt**: "Who is the author of this project?"
- **Default**: Current user's name (if available) or "Your Name"
- **Description**: The author of the project. This will be used in the package.json file and the README.md file.

### Project Configuration

#### Complexity Level

- **Prompt**: "What complexity level do you want for your MCP server?"
- **Options**:
  - `Basic`: Minimal setup with core functionality
  - `Intermediate`: Includes development tools and a more structured project
  - `Advanced`: Includes all features and a comprehensive project structure
- **Description**: Determines the overall complexity and feature set of your MCP server project.

#### Features (Advanced Only)

If you select the "Advanced" complexity level, you'll be prompted to select additional features:

- **Prompt**: "Select additional features to include:"
- **Options**:
  - `Environment configuration (.env)`: Adds support for environment variables using dotenv
  - `Authentication support`: Adds basic authentication framework
  - `Logging (Winston)`: Adds structured logging with Winston
  - `Edge functions`: Adds support for edge functions
  - `WebSocket support`: Adds WebSocket server integration
- **Description**: These features enhance your MCP server with additional capabilities.

#### Include Examples

- **Prompt**: "Would you like to include example handlers?"
- **Default**: Yes
- **Description**: If selected, example handlers will be included in your project to help you understand how to use MCP server features.

#### Include Tests

- **Prompt**: "Would you like to include tests?"
- **Default**: Yes
- **Description**: If selected, testing infrastructure and example tests will be included in your project.

#### Include Docker

- **Prompt**: "Would you like to include Docker configuration?"
- **Default**: Yes
- **Description**: If selected, Docker configuration files (Dockerfile and docker-compose.yml) will be included in your project.

## Configuration File

Instead of using the interactive prompts, you can provide a configuration file with all your options. This is useful for automated setups or when you want to reuse the same configuration across multiple projects.

### File Format

The configuration file can be in JSON or YAML format. Here's an example in JSON:

```json
{
  "name": "my-mcp-server",
  "description": "My custom MCP server",
  "author": "Your Name",
  "complexity": "advanced",
  "features": ["env", "logging", "auth", "edge", "websocket"],
  "includeExamples": true,
  "includeTests": true,
  "includeDocker": true,
  "customTemplates": {
    "handler": "./templates/custom-handler.ts",
    "readme": "./templates/custom-readme.md"
  },
  "dependencies": {
    "additional": {
      "express": "^4.17.1"
    },
    "dev": {
      "prettier": "^2.3.2"
    }
  }
}
```

### Configuration Options

#### Basic Options

- `name` (string): Project name
- `description` (string): Project description
- `author` (string): Project author
- `complexity` (string): Complexity level (`basic`, `intermediate`, or `advanced`)

#### Feature Options

- `features` (array): List of features to include (only applicable for advanced complexity)
  - Valid values: `env`, `auth`, `logging`, `edge`, `websocket`
- `includeExamples` (boolean): Whether to include example handlers
- `includeTests` (boolean): Whether to include tests
- `includeDocker` (boolean): Whether to include Docker configuration

#### Advanced Options

- `customTemplates` (object): Custom templates to use instead of the default ones
  - Keys are template names, values are paths to template files
- `dependencies` (object): Additional dependencies to include in package.json
  - `additional` (object): Regular dependencies
  - `dev` (object): Development dependencies

## Environment Variables

MCP Creator also respects the following environment variables for configuration:

- `MCP_CREATOR_NAME`: Project name
- `MCP_CREATOR_DESCRIPTION`: Project description
- `MCP_CREATOR_AUTHOR`: Project author
- `MCP_CREATOR_COMPLEXITY`: Complexity level
- `MCP_CREATOR_FEATURES`: Comma-separated list of features
- `MCP_CREATOR_INCLUDE_EXAMPLES`: Whether to include examples (true/false)
- `MCP_CREATOR_INCLUDE_TESTS`: Whether to include tests (true/false)
- `MCP_CREATOR_INCLUDE_DOCKER`: Whether to include Docker configuration (true/false)

Example:
```bash
MCP_CREATOR_NAME="my-server" MCP_CREATOR_COMPLEXITY="advanced" MCP_CREATOR_FEATURES="env,logging" mcp-creator
```

## Default Configuration

If you use the `--default` flag, MCP Creator will use the following configuration:

```json
{
  "name": "my-mcp-server",
  "description": "An MCP server implementation",
  "author": "Your Name",
  "complexity": "basic",
  "features": [],
  "includeExamples": false,
  "includeTests": false,
  "includeDocker": false
}
```

## Next Steps

For more information about CLI commands, see the [CLI Commands](./cli-commands.md) documentation.