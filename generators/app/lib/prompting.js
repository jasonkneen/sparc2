/**
 * Prompting module
 * Handles all user prompts for the generator
 */

module.exports = async function(generator) {
  // Basic information
  const basicAnswers = await generator.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Your MCP server name:',
      default: 'my-mcp-server'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description:',
      default: 'A Model Context Protocol server'
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author:',
      default: ''
    },
    {
      type: 'list',
      name: 'complexity',
      message: 'Project complexity:',
      choices: ['basic', 'standard', 'advanced'],
      default: 'standard'
    }
  ]);

  let answers = basicAnswers;

  // Additional prompts based on complexity
  if (answers.complexity !== 'basic') {
    const advancedAnswers = await generator.prompt([
      {
        type: 'confirm',
        name: 'includeExamples',
        message: 'Include example handlers?',
        default: true
      },
      {
        type: 'confirm',
        name: 'includeTests',
        message: 'Include test setup?',
        default: true
      },
      {
        type: 'confirm',
        name: 'includeDocker',
        message: 'Include Docker setup?',
        default: true
      }
    ]);

    // If advanced, ask about additional features
    if (answers.complexity === 'advanced') {
      const expertAnswers = await generator.prompt([
        {
          type: 'checkbox',
          name: 'features',
          message: 'Select additional features:',
          choices: [
            { name: 'Authentication support', value: 'auth' },
            { name: 'Rate limiting', value: 'rateLimit' },
            { name: 'Logging middleware', value: 'logging' },
            { name: 'Environment configuration', value: 'env' },
            { name: 'Edge functions support', value: 'edge' },
            { name: 'WebSocket support', value: 'websocket' }
          ]
        }
      ]);

      // Merge all answers
      Object.assign(answers, advancedAnswers, expertAnswers);
    } else {
      // For standard, just merge the advanced answers
      Object.assign(answers, advancedAnswers);
    }
  } else {
    // Set defaults for basic setup
    answers.includeExamples = false;
    answers.includeTests = false;
    answers.includeDocker = false;
    answers.features = [];
  }

  return answers;
};