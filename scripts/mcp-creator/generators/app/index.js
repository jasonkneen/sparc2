/**
 * MCP Server Generator
 * A Yeoman generator for creating MCP servers
 */

const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

const prompting = require('./lib/prompting');
const configuring = require('./lib/configuring');
const writing = require('./lib/writing');
const install = require('./lib/install');
const end = require('./lib/end');

/**
 * MCP Server Generator class
 */
module.exports = class extends Generator {
  /**
   * Initialize the generator
   */
  initializing() {
    this.log(yosay(
      `Welcome to the ${chalk.blue('MCP Server')} generator!`
    ));
  }

  /**
   * Prompt the user for configuration options
   */
  async prompting() {
    this.answers = await prompting(this);
  }

  /**
   * Configure the project structure
   */
  configuring() {
    this.structure = configuring(this.answers);
  }

  /**
   * Write files to the project directory
   */
  writing() {
    writing(this, this.answers, this.structure);
  }

  /**
   * Install dependencies
   */
  install() {
    install(this, this.answers);
  }

  /**
   * End the generator
   */
  end() {
    end(this, this.answers);
  }
};