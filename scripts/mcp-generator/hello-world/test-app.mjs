// Simple test application to check if the hello-world project works
console.log('Testing hello-world project');

// Import the MCP SDK server module
try {
  const sdk = await import('@modelcontextprotocol/sdk/server');
  console.log('SDK server module imported successfully');
  console.log('SDK server exports:', Object.keys(sdk));
} catch (error) {
  console.error('Error importing SDK server module:', error.message);
}

// Try importing other modules
try {
  const types = await import('@modelcontextprotocol/sdk/types');
  console.log('SDK types module imported successfully');
  console.log('SDK types exports:', Object.keys(types));
} catch (error) {
  console.error('Error importing SDK types module:', error.message);
}