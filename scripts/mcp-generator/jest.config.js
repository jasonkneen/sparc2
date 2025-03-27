module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  verbose: true,
  rootDir: './',
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '^../generators/app/lib/prompting$': '<rootDir>/mocks/prompting.mock.js',
    '^../generators/app/lib/configuring$': '<rootDir>/mocks/configuring.mock.js',
    '^../generators/app/lib/writing/templates$': '<rootDir>/mocks/writing/templates.mock.js'
  },
  // Exclude hello-world directory from tests
  testPathIgnorePatterns: ['/node_modules/', '/hello-world/']
};