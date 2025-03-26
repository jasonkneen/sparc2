#!/usr/bin/env node

/**
 * SPARC2 Analyze Wrapper Script
 * 
 * This script provides a simplified analyze command implementation that works
 * in both local and global installations.
 */

import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Log the current directory for debugging
console.log(`${colors.blue}Analyze Wrapper running from: ${__dirname}${colors.reset}`);

/**
 * Run a simplified analyze command
 * @param {string[]} args Command line arguments
 */
function runSimplifiedAnalyze(args) {
  console.log(`${colors.yellow}Running simplified analyze command from global installation${colors.reset}`);
  
  // Parse command line arguments
  let files = [];
  let outputFile = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--files' || args[i] === '-f') {
      if (i + 1 < args.length) {
        files = args[i + 1].split(',').map(f => f.trim());
        i++;
      }
    } else if (args[i] === '--output' || args[i] === '-o') {
      if (i + 1 < args.length) {
        outputFile = args[i + 1];
        i++;
      }
    }
  }
  
  if (files.length === 0) {
    console.error(`${colors.red}Error: No files specified for analysis${colors.reset}`);
    console.log(`${colors.yellow}Usage: sparc analyze --files file1.js,file2.js [--output results.json]${colors.reset}`);
    process.exit(1);
  }
  
  // Read file contents
  const fileContents = {};
  for (const file of files) {
    try {
      fileContents[file] = fs.readFileSync(file, 'utf8');
    } catch (error) {
      console.error(`${colors.red}Error reading file ${file}: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }
  
  // Generate a simple analysis
  const analysis = {
    timestamp: new Date().toISOString(),
    files: files.map(file => ({
      path: file,
      size: fileContents[file].length,
      lines: fileContents[file].split('\n').length,
      suggestions: [
        "This is a simplified analysis from the global installation.",
        "For full functionality, please run SPARC2 from a local installation."
      ]
    }))
  };
  
  // Output results
  if (outputFile) {
    try {
      fs.writeFileSync(outputFile, JSON.stringify(analysis, null, 2));
      console.log(`${colors.green}Analysis written to ${outputFile}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error writing to output file: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  } else {
    console.log(`${colors.green}Analysis Results:${colors.reset}`);
    console.log(JSON.stringify(analysis, null, 2));
  }
}

// Main execution
console.log(`${colors.yellow}This is a simplified version of the SPARC2 CLI.${colors.reset}`);
console.log(`${colors.yellow}For full functionality, please run SPARC2 from a local installation.${colors.reset}`);
console.log(`${colors.yellow}You can clone the repository and run it locally:${colors.reset}`);
console.log(`${colors.blue}git clone https://github.com/agentics-org/sparc2.git${colors.reset}`);
console.log(`${colors.blue}cd sparc2${colors.reset}`);
console.log(`${colors.blue}npm install${colors.reset}`);
console.log(`${colors.blue}npm run build${colors.reset}`);
console.log(`${colors.blue}./sparc2 analyze${colors.reset}`);

// Run the simplified analyze command
runSimplifiedAnalyze(process.argv.slice(2));