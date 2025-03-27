const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const mockInquirer = require('inquirer');
const mockChalk = require('chalk');

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');
jest.mock('inquirer');
jest.mock('chalk', () => ({
  blue: jest.fn(text => text),
  green: jest.fn(text => text),
  yellow: jest.fn(text => text),
  red: jest.fn(text => text),
  white: jest.fn(text => text)
}));

// Mock the generator modules
jest.mock('../generators/app/lib/prompting', () => require('./mocks/prompting.mock'));
jest.mock('../generators/app/lib/configuring', () => require('./mocks/configuring.mock'));
jest.mock('../generators/app/lib/writing/templates', () => require('./mocks/templates.mock'));

describe('MCP Creator CLI', () => {
  let originalConsoleLog;
  let consoleOutput = [];
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock console.log to capture output
    originalConsoleLog = console.log;
    console.log = jest.fn((...args) => {
      consoleOutput.push(args.join(' '));
    });
    
    // Reset captured console output
    consoleOutput = [];
    
    // Mock fs functions
    fs.existsSync.mockImplementation(() => false);
    fs.mkdirSync.mockImplementation(() => undefined);
    fs.writeFileSync.mockImplementation(() => undefined);
    
    // Mock execSync
    execSync.mockImplementation(() => undefined);
    
    // Mock process.chdir
    const originalChdir = process.chdir;
    process.chdir = jest.fn();
    
    // Mock inquirer.prompt
    mockInquirer.prompt.mockResolvedValue({
      targetDir: './test-mcp-server'
    });
  });
  
  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
  });
  
  test('should display welcome message', async () => {
    // Execute the script
    await require('../bin/mcp-creator');
    
    // Check if welcome message was displayed
    expect(mockChalk.blue).toHaveBeenCalledWith('==============================================');
    expect(mockChalk.blue).toHaveBeenCalledWith('  MCP Server Creator - Console CLI Interface  ');
    expect(mockChalk.blue).toHaveBeenCalledWith('==============================================');
  });
  
  test('should prompt for target directory', async () => {
    // Execute the script
    await require('../bin/mcp-creator');
    
    // Check if prompt was called with correct options
    expect(mockInquirer.prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'input',
        name: 'targetDir',
        message: 'Where would you like to create your MCP server?',
        default: './my-mcp-server'
      })
    ]);
  });
  
  test('should create directory if it does not exist', async () => {
    // Mock fs.existsSync to return false (directory doesn't exist)
    fs.existsSync.mockReturnValue(false);
    
    // Execute the script
    await require('../bin/mcp-creator');
    
    // Check if directory was created
    expect(fs.mkdirSync).toHaveBeenCalled();
  });
  
  test('should not create directory if it already exists', async () => {
    // Mock fs.existsSync to return true (directory exists)
    fs.existsSync.mockReturnValue(true);
    
    // Execute the script
    await require('../bin/mcp-creator');
    
    // Check if directory was not created
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });
  
  test('should call promptingQuestions with mock generator', async () => {
    // Execute the script
    await require('../bin/mcp-creator');
    
    // Check if promptingQuestions was called with a mock generator
    const promptingQuestions = require('../generators/app/lib/prompting');
    expect(promptingQuestions).toHaveBeenCalledWith(expect.objectContaining({
      prompt: mockInquirer.prompt,
      destinationPath: expect.any(Function),
      fs: expect.objectContaining({
        write: expect.any(Function),
        writeJSON: expect.any(Function)
      })
    }));
  });
  
  test('should call configuring with answers', async () => {
    // Execute the script
    await require('../bin/mcp-creator');
    
    // Check if configuring was called with answers
    const configuring = require('../generators/app/lib/configuring');
    expect(configuring).toHaveBeenCalled();
  });
  
  test('should create directory structure', async () => {
    // Execute the script
    await require('../bin/mcp-creator');
    
    // Check if directories were created
    expect(fs.mkdirSync).toHaveBeenCalled();
  });
  
  test('should generate files', async () => {
    // Execute the script
    await require('../bin/mcp-creator');
    
    // Check if files were created
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
  
  test('should install dependencies', async () => {
    // Execute the script
    await require('../bin/mcp-creator');
    
    // Check if dependencies were installed
    expect(process.chdir).toHaveBeenCalled();
    expect(execSync).toHaveBeenCalledWith('npm install', { stdio: 'inherit' });
  });
  
  test('should handle dependency installation error', async () => {
    // Mock execSync to throw an error
    execSync.mockImplementation(() => {
      throw new Error('Mock installation error');
    });
    
    // Execute the script
    await require('../bin/mcp-creator');
    
    // Check if error was handled
    expect(mockChalk.red).toHaveBeenCalledWith('\nFailed to install dependencies:');
    expect(mockChalk.yellow).toHaveBeenCalledWith('You can install them manually by running "npm install" in your project directory.');
  });
  
  test('should display next steps', async () => {
    // Execute the script
    await require('../bin/mcp-creator');
    
    // Check if next steps were displayed
    expect(mockChalk.blue).toHaveBeenCalledWith('\nNext steps:');
    expect(mockChalk.white).toHaveBeenCalledWith('  cd ./test-mcp-server');
    expect(mockChalk.white).toHaveBeenCalledWith('  npm run build');
    expect(mockChalk.white).toHaveBeenCalledWith('  npm start');
  });
});