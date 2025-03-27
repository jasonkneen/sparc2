# CLI Commands

This document provides detailed information about the command-line interface (CLI) commands available in MCP Creator.

## Basic Commands

### Create a New MCP Server Project

```bash
mcp-creator
```

This is the primary command that launches the interactive setup process. It will prompt you for various configuration options and then generate a new MCP server project based on your responses.

### Display Help Information

```bash
mcp-creator --help
```

Displays help information, including available commands and options.

### Display Version Information

```bash
mcp-creator --version
```

Displays the current version of MCP Creator.

## Command Options

### Create with Default Options

```bash
mcp-creator --default
```

Creates a new MCP server project with default options, skipping the interactive prompts. This is useful for quick setup or in automated scripts.

Default options include:
- Project name: Based on the current directory name
- Complexity level: Basic
- No examples
- No tests
- No Docker configuration

### Specify Target Directory

```bash
mcp-creator --target <directory>
```

Creates a new MCP server project in the specified directory. If the directory doesn't exist, it will be created.

Example:
```bash
mcp-creator --target ./my-custom-mcp-server
```

### Use a Template

```bash
mcp-creator --template <template-name>
```

Creates a new MCP server project using a specific template. Available templates include:

- `basic`: A minimal MCP server implementation
- `intermediate`: Includes development tools and a more structured project
- `advanced`: Includes all features and a comprehensive project structure
- `microservice`: Optimized for microservice architecture
- `fullstack`: Includes both backend and frontend components

Example:
```bash
mcp-creator --template advanced
```

### Skip Installation

```bash
mcp-creator --skip-install
```

Skips the dependency installation step. This is useful if you want to review the generated files before installing dependencies or if you prefer to install dependencies manually.

### Specify Configuration File

```bash
mcp-creator --config <config-file>
```

Uses a configuration file to set options instead of interactive prompts. The configuration file should be in JSON or YAML format.

Example:
```bash
mcp-creator --config ./mcp-config.json
```

Example configuration file (JSON):
```json
{
  "name": "my-mcp-server",
  "description": "My custom MCP server",
  "author": "Your Name",
  "complexity": "advanced",
  "features": ["env", "logging", "auth"],
  "includeExamples": true,
  "includeTests": true,
  "includeDocker": true
}
```

### Verbose Output

```bash
mcp-creator --verbose
```

Displays detailed output during the creation process, including debug information. This is useful for troubleshooting.

### Quiet Mode

```bash
mcp-creator --quiet
```

Minimizes output during the creation process. Only essential information and errors will be displayed.

## Advanced Commands

### Validate Configuration

```bash
mcp-creator validate --config <config-file>
```

Validates a configuration file without creating a project. This is useful for checking if your configuration is correct before using it.

### Update Existing Project

```bash
mcp-creator update
```

Updates an existing MCP server project to use the latest templates and dependencies. This should be run from within an existing MCP server project directory.

### Generate Component

```bash
mcp-creator generate <component-type> <component-name>
```

Generates a specific component for an existing MCP server project. Component types include:

- `handler`: Creates a new handler
- `tool`: Creates a new tool
- `resource`: Creates a new resource
- `test`: Creates a new test

Example:
```bash
mcp-creator generate handler my-custom-handler
```

## Environment Variables

MCP Creator also respects the following environment variables:

- `MCP_CREATOR_DEFAULT_TEMPLATE`: Sets the default template to use
- `MCP_CREATOR_SKIP_INSTALL`: If set to "true", skips dependency installation
- `MCP_CREATOR_CONFIG_PATH`: Path to a default configuration file

Example:
```bash
MCP_CREATOR_DEFAULT_TEMPLATE=advanced mcp-creator
```

## Exit Codes

MCP Creator uses the following exit codes:

- `0`: Success
- `1`: General error
- `2`: Invalid arguments
- `3`: Configuration error
- `4`: Dependency installation error

## Next Steps

For more information about configuration options, see the [Configuration Options](./configuration-options.md) documentation.