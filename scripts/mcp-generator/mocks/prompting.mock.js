// Mock for the prompting module
module.exports = jest.fn().mockResolvedValue({
  name: 'test-mcp-server',
  description: 'Test MCP Server',
  author: 'Test Author',
  complexity: 'basic',
  includeExamples: true,
  includeTests: false,
  includeDocker: false,
  features: []
});