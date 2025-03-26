/**
 * Writing module for the MCP server generator
 * Handles file creation based on user choices
 */

const path = require('path');
const fs = require('fs');
const templates = require('./writing/templates');

/**
 * Write files to the project directory
 * @param {Object} generator The Yeoman generator instance
 * @param {Object} answers The user's answers from prompting
 * @param {Object} structure The project directory structure
 */
function writing(generator, answers, structure) {
  const { complexity, features = [], includeExamples, includeTests, includeDocker } = answers;
  
  // Create package.json
  createPackageJson(generator, answers);
  
  // Create tsconfig.json
  createTsConfig(generator, answers);
  
  // Create core files
  createCoreFiles(generator, answers);
  
  // Create example files if requested
  if (includeExamples) {
    createExampleFiles(generator, answers);
  }
  
  // Create test files if requested
  if (includeTests) {
    createTestFiles(generator, answers);
  }
  
  // Create Docker files if requested
  if (includeDocker) {
    createDockerFiles(generator, answers);
  }
  
  // Create advanced feature files
  if (complexity === 'advanced') {
    createAdvancedFeatureFiles(generator, answers, features);
  }
  
  // Create README.md
  generator.fs.write(
    generator.destinationPath('README.md'),
    templates.getReadmeContent(answers)
  );
  
  // Create .gitignore
  generator.fs.write(
    generator.destinationPath('.gitignore'),
    `node_modules/
build/
.env
*.log
coverage/
`
  );
}

/**
 * Create package.json file
 * @param {Object} generator The Yeoman generator instance
 * @param {Object} answers The user's answers from prompting
 */
function createPackageJson(generator, answers) {
  const { name, description, author, complexity, features = [], includeTests } = answers;
  
  const dependencies = {
    "@modelcontextprotocol/sdk": "^1.7.0"
  };
  
  const devDependencies = {
    "@types/node": "^22.13.10",
    "typescript": "^5.0.0"
  };
  
  // Add additional dependencies based on complexity
  if (complexity !== 'basic') {
    Object.assign(devDependencies, {
      "nodemon": "^3.0.1",
      "ts-node": "^10.9.1"
    });
  }
  
  // Add advanced dependencies
  if (complexity === 'advanced') {
    if (features.includes('logging')) {
      dependencies["winston"] = "^3.10.0";
    }
    
    if (features.includes('env')) {
      dependencies["dotenv"] = "^16.3.1";
    }
    
    if (includeTests) {
      Object.assign(devDependencies, {
        "jest": "^29.6.2",
        "ts-jest": "^29.1.1",
        "@types/jest": "^29.5.3"
      });
    }
  }
  
  const packageJson = {
    name,
    version: "1.0.0",
    description,
    type: "module",
    main: "build/index.js",
    scripts: {
      "build": "tsc && chmod +x build/index.js",
      "start": "node build/index.js"
    },
    author,
    license: "MIT",
    dependencies,
    devDependencies
  };
  
  // Add additional scripts based on complexity
  if (complexity !== 'basic') {
    Object.assign(packageJson.scripts, {
      "dev": "nodemon --exec ts-node src/index.ts",
      "clean": "rm -rf build"
    });
    
    if (includeTests) {
      packageJson.scripts.test = "jest";
    }
  }
  
  generator.fs.writeJSON(
    generator.destinationPath('package.json'),
    packageJson
  );
}

/**
 * Create tsconfig.json file
 * @param {Object} generator The Yeoman generator instance
 * @param {Object} answers The user's answers from prompting
 */
function createTsConfig(generator, answers) {
  const { includeTests } = answers;
  
  const tsConfig = {
    compilerOptions: {
      target: "ES2022",
      module: "ES2022",
      moduleResolution: "node",
      outDir: "build",
      rootDir: "src",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "build"]
  };
  
  if (includeTests) {
    tsConfig.exclude.push("tests");
  }
  
  generator.fs.writeJSON(
    generator.destinationPath('tsconfig.json'),
    tsConfig
  );
}

/**
 * Create core files
 * @param {Object} generator The Yeoman generator instance
 * @param {Object} answers The user's answers from prompting
 */
function createCoreFiles(generator, answers) {
  // Create index.ts
  generator.fs.write(
    generator.destinationPath('src/index.ts'),
    templates.getIndexFileContent(answers)
  );
  
  // Create server.ts
  generator.fs.write(
    generator.destinationPath('src/core/server.ts'),
    templates.getServerFileContent(answers)
  );
  
  // Create hello.ts handler
  generator.fs.write(
    generator.destinationPath('src/handlers/hello.ts'),
    templates.getBasicHandlerContent()
  );
  
  // Create helpers.ts
  generator.fs.write(
    generator.destinationPath('src/utils/helpers.ts'),
    templates.getUtilsContent()
  );
}

/**
 * Create example files
 * @param {Object} generator The Yeoman generator instance
 * @param {Object} answers The user's answers from prompting
 */
function createExampleFiles(generator, answers) {
  // Create echo.ts example
  generator.fs.write(
    generator.destinationPath('src/examples/echo.ts'),
    templates.getEchoExampleContent()
  );
  
  // Create calculator.ts example
  generator.fs.write(
    generator.destinationPath('src/examples/calculator.ts'),
    templates.getCalculatorExampleContent()
  );
}

/**
 * Create test files
 * @param {Object} generator The Yeoman generator instance
 * @param {Object} answers The user's answers from prompting
 */
function createTestFiles(generator, answers) {
  // Create jest.config.js
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
  
  // Create basic test file
  generator.fs.write(
    generator.destinationPath('tests/hello.test.ts'),
    `import { helloHandler } from '../src/handlers/hello.js';

describe('Hello Handler', () => {
  it('should return a greeting with the provided name', async () => {
    const request = {
      data: { name: 'Test' }
    };
    
    const response = await helloHandler.handler(request);
    
    expect(response).toHaveProperty('message');
    expect(response.message).toBe('Hello, Test!');
    expect(response).toHaveProperty('timestamp');
  });
  
  it('should use "World" as the default name', async () => {
    const request = {
      data: {}
    };
    
    const response = await helloHandler.handler(request);
    
    expect(response).toHaveProperty('message');
    expect(response.message).toBe('Hello, World!');
  });
});
`
  );
}

/**
 * Create Docker files
 * @param {Object} generator The Yeoman generator instance
 * @param {Object} answers The user's answers from prompting
 */
function createDockerFiles(generator, answers) {
  // Create Dockerfile
  generator.fs.write(
    generator.destinationPath('Dockerfile'),
    `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
`
  );
  
  // Create docker-compose.yml
  generator.fs.write(
    generator.destinationPath('docker-compose.yml'),
    `version: '3'
services:
  mcp-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
`
  );
}

/**
 * Create advanced feature files
 * @param {Object} generator The Yeoman generator instance
 * @param {Object} answers The user's answers from prompting
 * @param {Array} features The selected features
 */
function createAdvancedFeatureFiles(generator, answers, features) {
  // Create environment configuration
  if (features.includes('env')) {
    // Create .env.example
    generator.fs.write(
      generator.destinationPath('.env.example'),
      `# Server Configuration
PORT=3000
NODE_ENV=development

# MCP Configuration
MCP_SERVER_NAME=${answers.name}
`
    );
    
    // Create config.ts
    generator.fs.write(
      generator.destinationPath('src/utils/config.ts'),
      templates.getConfigUtilContent(answers)
    );
  }
  
  // Create authentication support
  if (features.includes('auth')) {
    generator.fs.write(
      generator.destinationPath('src/auth/auth.ts'),
      templates.getAuthContent()
    );
  }
  
  // Create logging middleware
  if (features.includes('logging')) {
    generator.fs.write(
      generator.destinationPath('src/middleware/logging.ts'),
      templates.getLoggingContent()
    );
  }
  
  // Create edge functions support
  if (features.includes('edge')) {
    generator.fs.write(
      generator.destinationPath('src/edge/edge.ts'),
      templates.getEdgeFunctionContent()
    );
  }
  
  // Create WebSocket support
  if (features.includes('websocket')) {
    generator.fs.write(
      generator.destinationPath('src/websocket/websocket.ts'),
      templates.getWebSocketContent()
    );
  }
  
  // Create SSE support
  if (features.includes('sse')) {
    // Create SSE utility
    const ssePath = path.join(__dirname, 'writing/templates/sse.ts');
    if (fs.existsSync(ssePath)) {
      generator.fs.write(
        generator.destinationPath('src/utils/sse.ts'),
        fs.readFileSync(ssePath, 'utf8')
      );
    } else {
      // Fallback to template function
      generator.fs.write(
        generator.destinationPath('src/utils/sse.ts'),
        templates.getSSEHandlerContent()
      );
    }
    
    // Create SSE handler
    generator.fs.write(
      generator.destinationPath('src/sse/sse-handler.ts'),
      templates.getSSEHandlerContent()
    );
    
    // Create SSE example
    const sseExamplePath = path.join(__dirname, 'writing/templates/sseExample.ts');
    if (fs.existsSync(sseExamplePath)) {
      generator.fs.write(
        generator.destinationPath('src/examples/sse-example.ts'),
        fs.readFileSync(sseExamplePath, 'utf8')
      );
    }
  }
}

module.exports = writing;