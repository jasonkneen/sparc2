/**
 * Example Files generator
 * Creates example MCP handlers
 */

const templates = require('./templates');

module.exports = function(generator) {
  // Create echo example
  generator.fs.write(
    generator.destinationPath('src/examples/echo.ts'),
    templates.getEchoExampleContent()
  );
  
  // Create calculator example
  generator.fs.write(
    generator.destinationPath('src/examples/calculator.ts'),
    templates.getCalculatorExampleContent()
  );
};