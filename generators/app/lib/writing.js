/**
 * Writing module
 * Handles file generation based on user choices
 */

// Import sub-modules for different file types
const createPackageJson = require('./writing/packageJson');
const createTsConfig = require('./writing/tsConfig');
const createProjectStructure = require('./writing/projectStructure');
const createCoreFiles = require('./writing/coreFiles');
const createExampleFiles = require('./writing/exampleFiles');
const createTestFiles = require('./writing/testFiles');
const createDockerFiles = require('./writing/dockerFiles');
const createAdvancedFeatureFiles = require('./writing/advancedFeatureFiles');
const createReadme = require('./writing/readme');

module.exports = function(generator) {
  // Create package.json with appropriate dependencies
  createPackageJson(generator);
  
  // Create tsconfig.json
  createTsConfig(generator);
  
  // Create basic project structure
  createProjectStructure(generator);
  
  // Create core files
  createCoreFiles(generator);
  
  // Create example files if requested
  if (generator.answers.includeExamples) {
    createExampleFiles(generator);
  }
  
  // Create test files if requested
  if (generator.answers.includeTests) {
    createTestFiles(generator);
  }
  
  // Create Docker files if requested
  if (generator.answers.includeDocker) {
    createDockerFiles(generator);
  }
  
  // Create advanced feature files
  if (generator.answers.complexity === 'advanced') {
    createAdvancedFeatureFiles(generator);
  }
  
  // Create README.md
  createReadme(generator);
};