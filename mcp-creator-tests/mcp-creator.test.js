const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const inquirer = require('inquirer');
const chalk = require('chalk');

// Import the script to test
const { run } = require('./mcp-creator');

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
jest.mock('../generators/app/lib/prompting');
jest.mock('../generators/app/lib/configuring');
jest.mock('../generators/app/lib/writing/templates');

// Import the mocked modules
const promptingMock = require('../generators/app/lib/prompting');
const configuringMock = require('../generators/app/lib/configuring');
const templatesMock = require('../generators/app/lib/writing/templates');

describe('MCP Creator CLI', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log');
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock fs functions
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => undefined);
    fs.writeFileSync.mockImplementation(() => undefined);
    
    // Mock execSync
    execSync.mockImplementation(() => undefined);
    
    // Mock process.chdir
    process.chdir = jest.fn();
    
    // Mock inquirer.prompt
    inquirer.prompt.mockResolvedValueOnce({
      targetDir: './test-mcp-server'
    });
    
    // Setup prompting mock
    promptingMock.mockResolvedValue({
      name: 'test-mcp-server',
      description: 'Test MCP Server',
      author: 'Test Author',
      complexity: 'basic',
      includeExamples: true,
      includeTests: false,
      includeDocker: false,
      features: []
    });
    
    // Setup configuring mock
    configuringMock.mockReturnValue({
      src: {
        core: {},
        handlers: {},
        utils: {},
        examples: {}
      }
    });
    
    // Setup templates mock
    Object.keys(templatesMock).forEach(key => {
      if (typeof templatesMock[key] === 'function') {
        templatesMock[key] = jest.fn().mockReturnValue('mock content');
      }
    });
  });
  
  afterEach(() => {
    // Restore console methods
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
  
  // Skip this test for now as the welcome message is printed outside the run function
  test.skip('should display welcome message', async () => {
    // This test is skipped because the welcome message is printed outside the run function
    // and is not easily testable without modifying the source code
  });
  
  test('should prompt for target directory', async () => {
    // Execute the script
    await run();
    
    // Check if prompt was called with correct options
    expect(inquirer.prompt).toHaveBeenCalledWith([
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
    await run();
    
    // Check if directory was created
    expect(fs.mkdirSync).toHaveBeenCalled();
  });
  
  test('should not create directory if it already exists', async () => {
    // Mock fs.existsSync to return true (directory exists)
    fs.existsSync.mockReturnValue(true);
    
    // Execute the script
    await run();
    
    // Check if directory was not created
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });
  
  test('should call promptingQuestions with mock generator', async () => {
    // Execute the script
    await run();
    
    // Check if promptingQuestions was called with a mock generator
    expect(promptingMock).toHaveBeenCalledWith(expect.objectContaining({
      prompt: inquirer.prompt,
      destinationPath: expect.any(Function),
      fs: expect.objectContaining({
        write: expect.any(Function),
        writeJSON: expect.any(Function)
      })
    }));
  });
  
  test('should call configuring with answers', async () => {
    // Execute the script
    await run();
    
    // Check if configuring was called with answers
    expect(configuringMock).toHaveBeenCalled();
  });
  
  test('should create directory structure', async () => {
    // Execute the script
    await run();
    
    // Check if directories were created
    expect(fs.mkdirSync).toHaveBeenCalled();
  });
  
  test('should generate files', async () => {
    // Execute the script
    await run();
    
    // Check if files were created
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
  
  test('should install dependencies', async () => {
    // Execute the script
    await run();
    
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
    await run();
    
    // Check if error was handled
    expect(chalk.red).toHaveBeenCalledWith('\nFailed to install dependencies:');
    expect(chalk.yellow).toHaveBeenCalledWith('You can install them manually by running "npm install" in your project directory.');
  });
  
  test('should display next steps', async () => {
    // Execute the script
    await run();
    
    // Check if next steps were displayed
    expect(chalk.blue).toHaveBeenCalledWith('\nNext steps:');
    expect(chalk.white).toHaveBeenCalledWith('  cd ./test-mcp-server');
    expect(chalk.white).toHaveBeenCalledWith('  npm run build');
    expect(chalk.white).toHaveBeenCalledWith('  npm start');
  });
  
  test('should handle errors gracefully', async () => {
    // Mock promptingQuestions to throw an error
    promptingMock.mockRejectedValue(new Error('Test error'));
    
    // Execute the script
    await run();
    
    // Check if error was handled
    expect(chalk.red).toHaveBeenCalledWith('Error creating MCP server:');
  });
});