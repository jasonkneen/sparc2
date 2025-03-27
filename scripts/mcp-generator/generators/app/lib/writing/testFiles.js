/**
 * Test files generator
 * Creates test files and configuration
 */

const templates = require('./templates');

module.exports = function(generator) {
  if (!generator.answers.includeTests) {
    return;
  }
  
  // Create Jest configuration
  generator.fs.write(
    generator.destinationPath('jest.config.js'),
    `/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true
    }],
  },
};
`
  );
  
  // Create basic test file
  generator.fs.write(
    generator.destinationPath('tests/hello.test.ts'),
    templates.getBasicTestContent()
  );
};