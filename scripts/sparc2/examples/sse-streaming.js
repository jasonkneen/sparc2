#!/usr/bin/env node

/**
 * SPARC2 SSE Streaming Test
 * This script tests the SSE streaming functionality by connecting to the SSE stream
 * and displaying progress updates in the terminal.
 */

import http from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Get command line arguments
const args = process.argv.slice(2);
const operation = args[0] || 'analyze';
const files = args.slice(1);

if (files.length === 0) {
  console.error(`${colors.red}Error: No files specified${colors.reset}`);
  console.error(`Usage: node sse-streaming.js [analyze|modify] file1.js file2.js...`);
  process.exit(1);
}

// Verify files exist
for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`${colors.red}Error: File not found: ${file}${colors.reset}`);
    process.exit(1);
  }
}

// Create the SSE URL
const filesParam = files.join(',');
let sseUrl = `http://localhost:3002/stream/${operation}?id=${Date.now()}&files=${encodeURIComponent(filesParam)}`;

if (operation === 'modify') {
  const task = 'Add error handling and improve code quality';
  sseUrl += `&task=${encodeURIComponent(task)}`;
}

console.log(`${colors.cyan}Connecting to SSE stream: ${sseUrl}${colors.reset}`);

// Parse SSE response
function parseSSE(chunk) {
  const lines = chunk.toString().split('\n');
  let event = 'message';
  let data = '';
  
  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      data = line.slice(5).trim();
    } else if (line === '' && data) {
      // End of event
      try {
        const parsedData = JSON.parse(data);
        return { event, data: parsedData };
      } catch (error) {
        console.error(`${colors.red}Error parsing SSE data: ${error.message}${colors.reset}`);
      }
      
      event = 'message';
      data = '';
    }
  }
  
  return null;
}

// Create a progress bar
function createProgressBar(progress, width = 40) {
  const filled = Math.round(width * (progress / 100));
  const empty = width - filled;
  
  const filledBar = '█'.repeat(filled);
  const emptyBar = '░'.repeat(empty);
  
  return `${colors.green}${filledBar}${colors.dim}${emptyBar}${colors.reset} ${progress}%`;
}

// Connect to the SSE stream
const req = http.request(sseUrl, (res) => {
  if (res.statusCode !== 200) {
    console.error(`${colors.red}Error: Server returned status code ${res.statusCode}${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.green}Connected to SSE stream${colors.reset}`);
  
  let buffer = '';
  
  res.on('data', (chunk) => {
    buffer += chunk.toString();
    
    // Process complete events in the buffer
    const events = buffer.split('\n\n');
    buffer = events.pop() || ''; // Keep the last incomplete event in the buffer
    
    for (const eventData of events) {
      if (!eventData.trim()) continue;
      
      const parsedEvent = parseSSE(eventData + '\n\n');
      if (parsedEvent) {
        handleEvent(parsedEvent.event, parsedEvent.data);
      }
    }
  });
  
  res.on('end', () => {
    console.log(`${colors.yellow}SSE stream closed by server${colors.reset}`);
  });
  
  res.on('error', (error) => {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  });
});

req.on('error', (error) => {
  console.error(`${colors.red}Error connecting to SSE stream: ${error.message}${colors.reset}`);
  console.error(`${colors.yellow}Make sure the MCP server with SSE support is running:${colors.reset}`);
  console.error(`node scripts/sparc2/sparc2-mcp-wrapper-sse.js`);
  process.exit(1);
});

req.end();

// Handle different event types
function handleEvent(event, data) {
  switch (event) {
    case 'progress':
      handleProgressEvent(data);
      break;
    case 'info':
      handleInfoEvent(data);
      break;
    case 'error':
      handleErrorEvent(data);
      break;
    case 'result':
      handleResultEvent(data);
      break;
    default:
      console.log(`${colors.dim}Received unknown event: ${event}${colors.reset}`);
      console.log(data);
  }
}

// Handle progress events
function handleProgressEvent(data) {
  if (data.status === 'started') {
    console.log(`${colors.green}${colors.bright}Started ${data.operation} operation${colors.reset}`);
  } else if (data.status === 'step') {
    const progressBar = createProgressBar(data.progress);
    console.log(`${colors.cyan}Step ${data.step}/${data.totalSteps}: ${colors.reset}${data.message}`);
    console.log(progressBar);
    if (data.details) {
      console.log(`${colors.dim}${data.details}${colors.reset}`);
    }
    console.log();
  } else if (data.status === 'reading') {
    console.log(`${colors.dim}Reading file: ${data.file} (${data.fileIndex + 1}/${data.totalFiles})${colors.reset}`);
  } else if (data.status === 'completed') {
    const progressBar = createProgressBar(100);
    console.log(`${colors.green}${colors.bright}Operation completed: ${colors.reset}${data.message}`);
    console.log(progressBar);
    console.log();
  }
}

// Handle info events
function handleInfoEvent(data) {
  console.log(`${colors.blue}${colors.bright}Info: ${colors.reset}${data.message}`);
  if (data.details) {
    console.log(`${colors.dim}Files: ${data.details.files.join(', ')}${colors.reset}`);
    if (data.details.task) {
      console.log(`${colors.dim}Task: ${data.details.task}${colors.reset}`);
    }
  }
  console.log();
}

// Handle error events
function handleErrorEvent(data) {
  console.error(`${colors.red}${colors.bright}Error: ${colors.reset}${data.message}`);
  console.error(`${colors.red}${data.error}${colors.reset}`);
  console.log();
}

// Handle result events
function handleResultEvent(data) {
  console.log(`${colors.green}${colors.bright}Result for ${data.operation} operation:${colors.reset}`);
  console.log(`${colors.dim}Files: ${data.files.join(', ')}${colors.reset}`);
  console.log(`${colors.dim}Execution time: ${data.executionTime}${colors.reset}`);
  console.log();
  
  console.log(`${colors.yellow}${colors.bright}Result:${colors.reset}`);
  console.log(JSON.stringify(data.result, null, 2));
}

// Handle process termination
process.on('SIGINT', () => {
  console.log(`${colors.yellow}Terminating SSE client${colors.reset}`);
  process.exit(0);
});