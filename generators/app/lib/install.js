/**
 * Install module
 * Handles dependency installation
 */
const chalk = require('chalk');

module.exports = function(generator) {
  generator.log(chalk.green('\nInstalling dependencies...\n'));
  generator.npmInstall();
};