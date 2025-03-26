/**
 * README generator
 * Creates README.md based on user choices
 */

const templates = require('./templates');

module.exports = function(generator) {
  generator.fs.write(
    generator.destinationPath('README.md'),
    templates.getReadmeContent(generator.answers)
  );
};