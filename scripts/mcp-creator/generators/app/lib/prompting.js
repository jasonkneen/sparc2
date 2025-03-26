/**
 * Prompting module for the MCP server generator
 * Handles user input prompts
 */

/**
 * Prompt the user for configuration options
 * @param {Object} generator The Yeoman generator instance
 * @returns {Promise<Object>} The user's answers
 */
async function prompting(generator) {
  const answers = await generator.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of your MCP server?',
      default: 'my-mcp-server'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Provide a description for your MCP server:',
      default: 'An MCP server for AI model interactions'
    },
    {
      type: 'input',
      name: 'author',
      message: 'Who is the author of this MCP server?',
      default: generator.user.git.name() || 'Author'
    },
    {
      type: 'list',
      name: 'complexity',
      message: 'What complexity level do you want for your MCP server?',
      choices: [
        {
          name: 'Basic (Simple MCP server with minimal features)',
          value: 'basic'
        },
        {
          name: 'Standard (MCP server with common features)',
          value: 'standard'
        },
        {
          name: 'Advanced (Full-featured MCP server with all options)',
          value: 'advanced'
        }
      ],
      default: 'standard'
    },
    {
      type: 'confirm',
      name: 'includeExamples',
      message: 'Include example handlers?',
      default: true
    },
    {
      type: 'confirm',
      name: 'includeTests',
      message: 'Include tests?',
      default: true
    },
    {
      type: 'confirm',
      name: 'includeDocker',
      message: 'Include Docker configuration?',
      default: true
    }
  ]);
  
  // Ask for advanced features if complexity is advanced
  if (answers.complexity === 'advanced') {
    const advancedAnswers = await generator.prompt([
      {
        type: 'checkbox',
        name: 'features',
        message: 'Select advanced features to include:',
        choices: [
          {
            name: 'Environment Configuration (.env)',
            value: 'env',
            checked: true
          },
          {
            name: 'Logging Middleware',
            value: 'logging',
            checked: true
          },
          {
            name: 'Authentication',
            value: 'auth',
            checked: false
          },
          {
            name: 'Edge Functions',
            value: 'edge',
            checked: false
          },
          {
            name: 'WebSocket Support',
            value: 'websocket',
            checked: false
          },
          {
            name: 'Server-Sent Events (SSE)',
            value: 'sse',
            checked: true
          }
        ]
      }
    ]);
    
    // Merge the advanced answers with the main answers
    Object.assign(answers, advancedAnswers);
  }
  
  return answers;
}

module.exports = prompting;