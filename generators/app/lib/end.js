/**
 * End module
 * Handles final messages and instructions
 */
const chalk = require('chalk');

module.exports = function(generator) {
  generator.log(chalk.green('\nAll done! Your MCP server is ready.\n'));
  
  generator.log(chalk.yellow('To build your server:'));
  generator.log(chalk.white('  npm run build'));
  
  if (generator.answers.complexity !== 'basic') {
    generator.log(chalk.yellow('To run in development mode:'));
    generator.log(chalk.white('  npm run dev'));
  }
  
  generator.log(chalk.yellow('To start your server:'));
  generator.log(chalk.white('  npm start'));
  
  if (generator.answers.includeTests) {
    generator.log(chalk.yellow('To run tests:'));
    generator.log(chalk.white('  npm test'));
  }
  
  if (generator.answers.includeDocker) {
    generator.log(chalk.yellow('To run with Docker:'));
    generator.log(chalk.white('  docker-compose up'));
  }
  
  generator.log(chalk.blue('\nHappy coding!\n'));
};