/**
 * Test Files generator
 * Creates test setup and basic tests
 */

const templates = require('./templates');

module.exports = function(generator) {
  // Create Jest config
  generator.fs.write(
    generator.destinationPath('jest.config.js'),
    `export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
};
`
  );
  
  // Create basic test
  generator.fs.write(
    generator.destinationPath('tests/hello.test.ts'),
    templates.getBasicTestContent()
  );
};