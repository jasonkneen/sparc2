/**
 * Advanced Feature Files generator
 * Creates files for advanced features based on user choices
 */

const templates = require('./templates');

module.exports = function(generator) {
  // Create environment configuration
  if (generator.answers.features.includes('env')) {
    generator.fs.write(
      generator.destinationPath('.env.example'),
      `# Server Configuration
PORT=3000
NODE_ENV=development

# MCP Configuration
MCP_SERVER_NAME=${generator.answers.name}
`
    );
    
    generator.fs.write(
      generator.destinationPath('src/utils/config.ts'),
      templates.getConfigUtilContent(generator.answers)
    );
  }
  
  // Create authentication support
  if (generator.answers.features.includes('auth')) {
    generator.fs.write(
      generator.destinationPath('src/auth/auth.ts'),
      templates.getAuthContent()
    );
  }
  
  // Create logging middleware
  if (generator.answers.features.includes('logging')) {
    generator.fs.write(
      generator.destinationPath('src/middleware/logging.ts'),
      templates.getLoggingContent()
    );
  }
  
  // Create edge functions support
  if (generator.answers.features.includes('edge')) {
    generator.fs.write(
      generator.destinationPath('src/edge/edge.ts'),
      templates.getEdgeFunctionContent()
    );
  }
  
  // Create WebSocket support
  if (generator.answers.features.includes('websocket')) {
    generator.fs.write(
      generator.destinationPath('src/websocket/websocket.ts'),
      templates.getWebSocketContent()
    );
  }
};