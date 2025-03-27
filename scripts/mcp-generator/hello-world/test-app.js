// Simple test application to check if the hello-world project works
console.log('Testing hello-world project');

// Import the MCP SDK
try {
  import('@modelcontextprotocol/sdk').then(sdk => {
    console.log('SDK imported successfully');
    console.log('SDK exports:', Object.keys(sdk));
  }).catch(error => {
    console.error('Error importing SDK:', error.message);
  });
} catch (error) {
  console.error('Error in import statement:', error.message);
}