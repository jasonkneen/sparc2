# MCP Creator

[![npm version](https://img.shields.io/npm/v/@agentic/mcp-creator.svg)](https://www.npmjs.com/package/@agentic/mcp-creator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful CLI tool for creating Model Context Protocol (MCP) server projects with customizable templates and configurations.

## 📋 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [CLI Commands](#cli-commands)
  - [Configuration Options](#configuration-options)
- [Architecture](#architecture)
- [Customization](#customization)
- [Advanced MCP Usage](#advanced-mcp-usage)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Introduction

MCP Creator is a command-line interface (CLI) tool designed to streamline the process of creating Model Context Protocol (MCP) server projects. It provides an interactive experience to configure and generate a new MCP server with various features based on user preferences.

[Read more about introduction](./docs/introduction.md)

## ✨ Features

- Interactive project setup with customizable options
- Support for basic, intermediate, and advanced project structures
- Built-in templates for common MCP server components
- Optional Docker integration
- Testing framework integration
- Advanced features like logging, environment configuration, authentication, and WebSocket support

[Read more about features](./docs/features.md)

## 📦 Installation

```bash
# Install globally
npm install -g @agentic.org/mcp-creator

# Or use with npx
npx @agentic.org/mcp-creator
```

[Read more about installation](./docs/installation.md)

## ⚡ Quick Start

```bash
# Create a new MCP server project
npx @agentic.org/mcp-creator

# Follow the interactive prompts to configure your project
```

[Read more about quick start](./docs/quickstart.md)

## 📖 Usage

### CLI Commands

```bash
# Create a new MCP server project with interactive prompts
mcp-creator

# Create a new MCP server project with default options
mcp-creator --default

# Create a new MCP server project with a specific template
mcp-creator --template <template-name>
```

[Read more about CLI commands](./docs/usage/cli-commands.md)

### Configuration Options

MCP Creator supports various configuration options to customize your MCP server project.

[Read more about configuration options](./docs/usage/configuration-options.md)

## 🏗️ Architecture

MCP Creator follows a modular architecture to provide flexibility and extensibility.

[Read more about architecture](./docs/architecture.md)

## 🔧 Customization

MCP Creator allows you to customize various aspects of your MCP server project.

[Read more about customization](./docs/customization.md)

## 🔍 Advanced MCP Usage

Learn about advanced MCP features and how to use them in your projects.

[Read more about advanced MCP usage](./docs/advanced-mcp-usage.md)

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

[Read more about contributing](./docs/contributing.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.