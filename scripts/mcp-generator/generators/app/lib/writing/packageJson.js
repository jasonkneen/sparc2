/**
 * Package.json generator
 * Creates package.json with appropriate dependencies based on user choices
 */

module.exports = function(generator) {
  const dependencies = {
    "@modelcontextprotocol/sdk": "^1.8.0",
    "zod": "^3.23.8"
  };
  
  // Always include these dev dependencies
  const devDependencies = {
    "@types/node": "^22.13.10",
    "typescript": "^5.5.4",
    // Always include Jest for testing
    "jest": "^29.7.0",
    "ts-jest": "^29.2.4",
    "@types/jest": "^29.5.12"
  };
  
  // Add additional dependencies based on complexity
  if (generator.answers.complexity !== 'basic') {
    Object.assign(devDependencies, {
      "nodemon": "^3.0.1",
      "ts-node": "^10.9.1"
    });
  }
  
  // Add advanced dependencies
  if (generator.answers.complexity === 'advanced') {
    if (generator.answers.features.includes('logging')) {
      dependencies["winston"] = "^3.10.0";
    }
    
    if (generator.answers.features.includes('env')) {
      dependencies["dotenv"] = "^16.3.1";
    }
  }
  
  const packageJson = {
    name: generator.answers.name,
    version: "1.0.0",
    description: generator.answers.description,
    type: "module",
    main: "build/index.js",
    scripts: {
      "build": "tsc && chmod +x build/index.js",
      "start": "node build/index.js",
      // Always include test script
      "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
    },
    author: generator.answers.author,
    license: "MIT",
    dependencies,
    devDependencies
  };
  
  // Add additional scripts based on complexity
  if (generator.answers.complexity !== 'basic') {
    Object.assign(packageJson.scripts, {
      "dev": "nodemon --exec ts-node src/index.ts",
      "clean": "rm -rf build"
    });
  }
  
  generator.fs.writeJSON(generator.destinationPath('package.json'), packageJson);
};