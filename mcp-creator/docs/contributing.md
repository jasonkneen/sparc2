# Contributing to MCP Creator

Thank you for your interest in contributing to MCP Creator! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## How Can I Contribute?

### Reporting Bugs

If you find a bug in MCP Creator, please report it by creating an issue in our GitHub repository. When filing a bug report, please include:

- A clear and descriptive title
- A detailed description of the issue
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Screenshots or error logs (if applicable)
- Environment information (OS, Node.js version, npm version)

### Suggesting Enhancements

If you have an idea for a new feature or an enhancement to an existing feature, please create an issue in our GitHub repository. When suggesting an enhancement, please include:

- A clear and descriptive title
- A detailed description of the proposed enhancement
- Any relevant examples or mockups
- An explanation of why this enhancement would be useful

### Pull Requests

We welcome pull requests from the community! Here's how to submit a pull request:

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes
4. Write tests for your changes (if applicable)
5. Run the test suite to ensure all tests pass
6. Submit a pull request

When submitting a pull request, please:

- Follow the coding style and conventions used in the project
- Include tests for new features or bug fixes
- Update documentation as needed
- Provide a clear and descriptive title and description for your pull request
- Reference any related issues

## Development Setup

### Prerequisites

- Node.js (version 16.x or higher)
- npm (version 7.x or higher)

### Installation

1. Fork and clone the repository:

```bash
git clone https://github.com/your-username/mcp-creator.git
cd mcp-creator
```

2. Install dependencies:

```bash
npm install
```

3. Link the package globally (for testing):

```bash
npm link
```

### Development Workflow

1. Create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and test them:

```bash
# Run tests
npm test

# Run linting
npm run lint

# Build the project
npm run build

# Test the CLI locally
mcp-creator
```

3. Commit your changes:

```bash
git commit -m "feat: add your feature"
```

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

4. Push your changes to your fork:

```bash
git push origin feature/your-feature-name
```

5. Submit a pull request to the main repository.

## Project Structure

Understanding the project structure will help you contribute effectively:

```
mcp-creator/
├── bin/                  # CLI entry point
├── generators/           # Code generators
│   └── app/              # Main app generator
│       ├── index.js      # Generator entry point
│       └── lib/          # Generator libraries
│           ├── prompting.js      # User prompts
│           ├── configuring.js    # Project configuration
│           ├── writing.js        # File writing
│           └── writing/          # Templates
│               └── templates.js  # Template functions
├── scripts/              # Build and development scripts
├── tests/                # Test files
└── docs/                 # Documentation
```

## Testing

We use Jest for testing. To run the tests:

```bash
npm test
```

To run tests with coverage:

```bash
npm run test:coverage
```

## Documentation

Documentation is written in Markdown and stored in the `docs` directory. When contributing new features, please update the relevant documentation.

## Release Process

Our release process is automated using GitHub Actions. When a new release is created:

1. The version in package.json is updated
2. A new tag is created
3. The package is published to npm
4. Release notes are generated

## Getting Help

If you need help with contributing, please:

1. Check the documentation
2. Look for existing issues or discussions in the GitHub repository
3. Join our Discord community
4. Reach out to the maintainers

## License

By contributing to MCP Creator, you agree that your contributions will be licensed under the project's MIT license.