/**
 * Configuring module for the MCP server generator
 * Determines the project structure based on user choices
 */

/**
 * Configure the project structure based on user answers
 * @param {Object} answers The user's answers from prompting
 * @returns {Object} The project directory structure
 */
function configuring(answers) {
  const { complexity, features = [], includeExamples, includeTests } = answers;
  
  // Base structure for all complexity levels
  const structure = {
    src: {
      handlers: {},
      utils: {}
    },
    build: {}
  };
  
  // Add core directory for standard and advanced complexity
  if (complexity !== 'basic') {
    structure.src.core = {};
  }
  
  // Add examples directory if requested
  if (includeExamples) {
    structure.src.examples = {};
  }
  
  // Add tests directory if requested
  if (includeTests) {
    structure.tests = {};
  }
  
  // Add advanced features for advanced complexity
  if (complexity === 'advanced') {
    // Add middleware directory
    structure.src.middleware = {};
    
    // Add feature-specific directories
    features.forEach(feature => {
      switch (feature) {
        case 'auth':
          structure.src.auth = {};
          break;
        case 'edge':
          structure.src.edge = {};
          break;
        case 'websocket':
          structure.src.websocket = {};
          break;
        case 'sse':
          structure.src.sse = {};
          break;
      }
    });
  }
  
  return structure;
}

module.exports = configuring;