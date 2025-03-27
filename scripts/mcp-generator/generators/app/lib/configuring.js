/**
 * Configuring module
 * Sets up project structure based on user choices
 */

module.exports = function(answers) {
  // Create project structure based on complexity
  const projectStructure = {
    src: {
      core: {},
      handlers: {},
      utils: {},
    },
    build: {}
  };

  // Add additional directories based on complexity
  if (answers.complexity !== 'basic') {
    projectStructure.src.middleware = {};
    projectStructure.src.types = {};
    projectStructure.config = {};
    
    if (answers.includeExamples) {
      projectStructure.src.examples = {};
    }
    
    if (answers.includeTests) {
      projectStructure.tests = {};
    }
  }

  // Add advanced features
  if (answers.complexity === 'advanced') {
    if (answers.features.includes('auth')) {
      projectStructure.src.auth = {};
    }
    
    if (answers.features.includes('edge')) {
      projectStructure.src.edge = {};
    }
    
    if (answers.features.includes('websocket')) {
      projectStructure.src.websocket = {};
    }
  }

  return projectStructure;
};