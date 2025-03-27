#!/usr/bin/env node

/**
 * Test script for the MCP server generator
 * This script creates a test MCP server in a temporary directory
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Create a temporary directory for the test
const testDir = path.join(__dirname, 'test-output');

// Ensure the test directory exists
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

console.log(chalk.blue('=============================================='));
console.log(chalk.blue('  Testing MCP Server Generator               '));
console.log(chalk.blue('=============================================='));
console.log();

// Test configuration
const testConfig = {
  name: 'test-mcp-server',
  description: 'A test MCP server',
  author: 'Test User',
  complexity: 'advanced',
  includeExamples: true,
  includeTests: true,
  includeDocker: true,
  features: ['env', 'logging', 'sse', 'websocket'],
  outputDir: path.join(testDir, 'test-mcp-server')
};

console.log(chalk.yellow('Test configuration:'));
console.log(JSON.stringify(testConfig, null, 2));
console.log();

// Create the output directory if it doesn't exist
if (!fs.existsSync(testConfig.outputDir)) {
  fs.mkdirSync(testConfig.outputDir, { recursive: true });
}

// Import the generator modules
const prompting = require('./generators/app/lib/prompting');
const configuring = require('./generators/app/lib/configuring');
const writing = require('./generators/app/lib/writing');

// Create a mock generator object
const mockGenerator = {
  destinationPath: (p) => path.join(testConfig.outputDir, p),
  fs: {
    write: (path, content) => {
      fs.writeFileSync(path, content, 'utf8');
    },
    writeJSON: (path, json) => {
      fs.writeFileSync(path, JSON.stringify(json, null, 2), 'utf8');
    }
  },
  log: console.log
};

try {
  console.log(chalk.yellow('Configuring project structure...'));
  const structure = configuring(testConfig);
  
  console.log(chalk.yellow('Generating files...'));
  writing(mockGenerator, testConfig, structure);
  
  console.log(chalk.green('\nTest completed successfully!'));
  console.log(chalk.white(`Generated files in: ${testConfig.outputDir}`));
  
  // List the generated files
  console.log(chalk.yellow('\nGenerated files:'));
  const files = execSync(`find ${testConfig.outputDir} -type f | sort`).toString().trim().split('\n');
  files.forEach(file => {
    console.log(chalk.white(`  ${file.replace(testConfig.outputDir + '/', '')}`));
  });
  
} catch (error) {
  console.error(chalk.red('Test failed:'), error);
  process.exit(1);
}