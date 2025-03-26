const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

// Import modular components
const prompting = require('./lib/prompting');
const configuring = require('./lib/configuring');
const writing = require('./lib/writing');
const install = require('./lib/install');
const end = require('./lib/end');

module.exports = class extends Generator {
  // Initialization - your initialization methods
  initializing() {
    this.log(yosay(
      `Welcome to the ${chalk.blue('MCP Server')} generator!`
    ));
  }

  // Prompting phase
  async prompting() {
    this.answers = await prompting(this);
  }

  // Configuration - Saving configurations and configure the project
  configuring() {
    this.projectStructure = configuring(this.answers);
  }

  // Writing phase - Where you write the generator specific files
  writing() {
    writing(this);
  }

  // Installation phase
  install() {
    install(this);
  }

  // End phase
  end() {
    end(this);
  }
};
