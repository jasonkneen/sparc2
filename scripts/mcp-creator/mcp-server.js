#!/usr/bin/env node

/**
 * MCP Server Generator MCP Server
 * A server that can generate MCP servers through the MCP protocol
 */

import { createMCPServer } from '@modelcontextprotocol/sdk';
import { z } from 'zod';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Import generator modules
import configuring from './generators/app/lib/configuring.js';
import writing from './generators/app/lib/writing.js';

// Define the schema for the generate-mcp-server method
const generateMCPServerSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  author: z.string().optional(),
  complexity: z.enum(['basic', 'standard', 'advanced']).default('standard'),
  includeExamples: z.boolean().default(true),
  includeTests: z.boolean().default(true),
  includeDocker: z.boolean().default(true),
  features: z.array(z.enum(['env', 'logging', 'auth', 'edge', 'websocket', 'sse'])).optional(),
  outputDir: z.string().optional()
});

// Create the MCP server
const server = createMCPServer({
  name: 'mcp-generator',
  description: 'MCP Server Generator',
  version: '1.0.0'
});

// Add the generate-mcp-server handler
server.addHandler({
  name: 'generate-mcp-server',
  description: 'Generates a new MCP server',
  inputSchema: generateMCPServerSchema,
  handler: async (request) => {
    const {
      name,
      description = 'An MCP server for AI model interactions',
      author = 'MCP Generator',
      complexity,
      includeExamples,
      includeTests,
      includeDocker,
      features = [],
      outputDir = `./${name}`
    } = request.data;
    
    console.log(`Generating MCP server: ${name}`);
    
    try {
      // Create the output directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Configure the project structure
      const answers = {
        name,
        description,
        author,
        complexity,
        includeExamples,
        includeTests,
        includeDocker,
        features
      };
      
      const structure = configuring(answers);
      
      // Create a mock generator object
      const mockGenerator = {
        destinationPath: (p) => path.join(outputDir, p),
        fs: {
          write: (path, content) => {
            // Ensure the directory exists
            const dir = path.substring(0, path.lastIndexOf('/'));
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(path, content, 'utf8');
          },
          writeJSON: (path, json) => {
            // Ensure the directory exists
            const dir = path.substring(0, path.lastIndexOf('/'));
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(path, JSON.stringify(json, null, 2), 'utf8');
          }
        },
        log: console.log
      };
      
      // Generate the files
      writing(mockGenerator, answers, structure);
      
      // Install dependencies if requested
      if (request.data.installDependencies) {
        console.log('Installing dependencies...');
        execSync('npm install', { cwd: outputDir });
      }
      
      // List the generated files
      const files = fs.readdirSync(outputDir, { recursive: true })
        .filter(file => fs.statSync(path.join(outputDir, file)).isFile())
        .map(file => file.toString());
      
      return {
        success: true,
        name,
        outputDir,
        files,
        message: `MCP server "${name}" generated successfully!`
      };
    } catch (error) {
      console.error('Error generating MCP server:', error);
      
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }
});

// Start the server
const PORT = process.env.PORT || 3000;

server.listen(PORT).then(() => {
  console.log(`MCP Server Generator is running on port ${PORT}`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
});