#!/usr/bin/env node
import { startServer } from './core/server.js';

// Start the MCP server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
