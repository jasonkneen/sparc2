/**
 * Install module
 * Handles dependency installation
 */
const chalk = require('chalk');

module.exports = function(generator) {
  generator.log(chalk.green('\nInstalling dependencies...\n'));
  
  // Install base dependencies
  generator.npmInstall();
  
  // Always install Jest dependencies
  if (generator.answers.includeTests) {
    generator.npmInstall(['jest', 'ts-jest', '@types/jest'], { 'save-dev': true });
  }
};