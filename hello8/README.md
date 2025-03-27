# hello8

helo

## Overview

This is a Model Context Protocol (MCP) server that provides API endpoints for various operations.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

### Building

```bash
npm run build
```

### Running

```bash
npm start
```


### Development

```bash
npm run dev
```



### Testing

```bash
npm test
```



### Docker

Build the Docker image:

```bash
docker build -t hello8 .
```

Run the container:

```bash
docker run -p 3000:3000 hello8
```

Or use Docker Compose:

```bash
docker-compose up
```


## API Endpoints

### Hello

- **Endpoint**: `/hello`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "name": "Your Name" // Optional
  }
  ```
- **Response**:
  ```json
  {
    "message": "Hello, Your Name!"
  }
  ```


### Echo

- **Endpoint**: `/echo`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "message": "Your message"
  }
  ```
- **Response**:
  ```json
  {
    "echo": "Your message",
    "timestamp": 1679825000000
  }
  ```

### Calculator

- **Endpoint**: `/calculator`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "operation": "add", // One of: add, subtract, multiply, divide
    "a": 10,
    "b": 5
  }
  ```
- **Response**:
  ```json
  {
    "result": 15,
    "operation": "10 add 5 = 15"
  }
  ```


## License

MIT
