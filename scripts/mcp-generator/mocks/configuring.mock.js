// Mock for the configuring module
module.exports = jest.fn().mockReturnValue({
  src: {
    core: {},
    handlers: {},
    utils: {},
    examples: {}
  }
});