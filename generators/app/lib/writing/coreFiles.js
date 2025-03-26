/**
 * Core Files generator
 * Creates essential MCP server files
 */

const templates = require('./templates');

module.exports = function(generator) {
  // Create index.ts - the entry point
  generator.fs.write(
    generator.destinationPath('src/index.ts'),
    templates.getIndexFileContent(generator.answers)
  );
  
  // Create core server setup
  generator.fs.write(
    generator.destinationPath('src/core/server.ts'),
    templates.getServerFileContent(generator.answers)
  );
  
  // Create basic handler
  generator.fs.write(
    generator.destinationPath('src/handlers/hello.ts'),
    templates.getBasicHandlerContent()
  );
  
  // Create utils
  generator.fs.write(
    generator.destinationPath('src/utils/helpers.ts'),
    templates.getUtilsContent()
  );
};