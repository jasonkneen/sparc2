# Hello World

Hello Test

## Features

- MCP (Model Context Protocol) server implementation
- TypeScript support
- Modular architecture
- Development mode with hot reloading
- Example handlers (echo, calculator)
- Test setup with Jest
- Docker and docker-compose configuration

## Installation

```bash
npm install
```

## Usage

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Start

```bash
npm start
```

### Testing

```bash
npm test
```

## Docker

### Build and run with Docker

```bash
docker build -t Hello World .
docker run -p 3000:3000 Hello World
```

### Using docker-compose

```bash
docker-compose up
```

## Project Structure

```
Hello World/
├── src/
│   ├── core/          # Core server functionality
│   ├── handlers/      # MCP request handlers
│   ├── utils/         # Utility functions
│   ├── middleware/    # Middleware components
│   ├── types/         # TypeScript type definitions
│   ├── examples/      # Example handlers
├── build/            # Compiled JavaScript
├── tests/            # Test files
├── config/           # Configuration files
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
