/**
 * End module for the MCP server generator
 * Handles final messages and instructions
 */

const chalk = require('chalk');

/**
 * Display final messages and instructions
 * @param {Object} generator The Yeoman generator instance
 * @param {Object} answers The user's answers from prompting
 */
function end(generator, answers) {
  const { name, complexity } = answers;
  
  generator.log('\n');
  generator.log(chalk.green('Your MCP server has been created successfully!'));
  generator.log('\n');
  
  generator.log(chalk.blue('Next steps:'));
  generator.log(chalk.white(`  cd ${name}`));
  
  if (complexity !== 'basic') {
    generator.log(chalk.white('  npm run dev     # Start in development mode'));
  }
  
  generator.log(chalk.white('  npm run build   # Build the project'));
  generator.log(chalk.white('  npm start       # Start the server'));
  
  if (answers.includeTests) {
    generator.log(chalk.white('  npm test        # Run tests'));
  }
  
  if (answers.includeDocker) {
    generator.log('\n');
    generator.log(chalk.blue('Docker:'));
    generator.log(chalk.white(`  docker build -t ${name.toLowerCase()} .`));
    generator.log(chalk.white(`  docker run -p 3000:3000 ${name.toLowerCase()}`));
    generator.log(chalk.white('  docker-compose up'));
  }
  
  generator.log('\n');
  generator.log(chalk.blue('MCP Server will be available at:'));
  generator.log(chalk.white('  http://localhost:3000/mcp'));
  
  if (complexity === 'advanced' && answers.features.includes('sse')) {
    generator.log('\n');
    generator.log(chalk.blue('SSE Endpoints:'));
    generator.log(chalk.white('  http://localhost:3000/sse/{streamId}'));
    generator.log(chalk.white('  Use the real_time_data MCP handler to create streams'));
  }
  
  if (complexity === 'advanced' && answers.features.includes('websocket')) {
    generator.log('\n');
    generator.log(chalk.blue('WebSocket Endpoint:'));
    generator.log(chalk.white('  ws://localhost:3000/ws'));
    generator.log(chalk.white('  Use the websocket MCP handler to manage connections'));
  }
  
  generator.log('\n');
  generator.log(chalk.green('Happy coding!'));
}

module.exports = end;