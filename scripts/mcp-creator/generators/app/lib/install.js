/**
 * Install module for the MCP server generator
 * Handles dependency installation
 */

/**
 * Install dependencies
 * @param {Object} generator The Yeoman generator instance
 * @param {Object} answers The user's answers from prompting
 */
function install(generator, answers) {
  // Skip installation if requested
  if (generator.options['skip-install']) {
    generator.log('Skipping dependency installation');
    return;
  }
  
  generator.log('Installing dependencies...');
  
  // Install dependencies
  generator.npmInstall();
}

module.exports = install;