#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { execSync } = require('child_process');

// Import our generator's prompting module to reuse the same questions
const promptingQuestions = require('../generators/app/lib/prompting');
const configuring = require('../generators/app/lib/configuring');
const templates = require('../generators/app/lib/writing/templates');

console.log(chalk.blue('=============================================='));
console.log(chalk.blue('  MCP Server Creator - Console CLI Interface  '));
console.log(chalk.blue('=============================================='));
console.log();

async function run() {
  try {
    // Get the target directory
    const { targetDir } = await inquirer.prompt([
      {
        type: 'input',
        name: 'targetDir',
        message: 'Where would you like to create your MCP server?',
        default: './my-mcp-server'
      }
    ]);

    // Create the directory if it doesn't exist
    const fullPath = path.resolve(process.cwd(), targetDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    console.log(chalk.green(`\nCreating MCP server in ${fullPath}\n`));

    // Create a mock generator object to pass to our prompting module
    const mockGenerator = {
      prompt: inquirer.prompt,
      destinationPath: (p) => path.join(fullPath, p),
      fs: {
        write: (path, content) => {
          fs.writeFileSync(path, content, 'utf8');
        },
        writeJSON: (path, json) => {
          fs.writeFileSync(path, JSON.stringify(json, null, 2), 'utf8');
        }
      }
    };

    // Get user answers using our prompting module
    const answers = await promptingQuestions(mockGenerator);
    
    // Configure project structure
    const projectStructure = configuring(answers);

    // Create directory structure
    console.log(chalk.yellow('\nCreating project structure...'));
    createDirectoryStructure(fullPath, projectStructure);

    // Create files
    console.log(chalk.yellow('\nGenerating files...'));
    await generateFiles(fullPath, answers, projectStructure);

    // Install dependencies
    console.log(chalk.yellow('\nInstalling dependencies...'));
    try {
      process.chdir(fullPath);
      execSync('npm install', { stdio: 'inherit' });
      console.log(chalk.green('\nDependencies installed successfully!'));
    } catch (error) {
      console.error(chalk.red('\nFailed to install dependencies:'), error.message);
      console.log(chalk.yellow('You can install them manually by running "npm install" in your project directory.'));
    }

    console.log(chalk.green('\nMCP server created successfully!'));
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.white(`  cd ${targetDir}`));
    console.log(chalk.white('  npm run build'));
    console.log(chalk.white('  npm start'));
  } catch (error) {
    console.error(chalk.red('Error creating MCP server:'), error);
  }
}

function createDirectoryStructure(basePath, structure, currentPath = '') {
  Object.keys(structure).forEach(dir => {
    const dirPath = path.join(basePath, currentPath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    if (Object.keys(structure[dir]).length > 0) {
      createDirectoryStructure(basePath, structure[dir], path.join(currentPath, dir));
    }
  });
}

async function generateFiles(basePath, answers, projectStructure) {
  // Create package.json
  const dependencies = {
    "@modelcontextprotocol/sdk": "^1.8.0",
    "zod": "^3.22.4"
  };
  
  const devDependencies = {
    "@types/node": "^22.13.10",
    "typescript": "^5.0.0"
  };
  
  // Add additional dependencies based on complexity
  if (answers.complexity !== 'basic') {
    Object.assign(devDependencies, {
      "nodemon": "^3.0.1",
      "ts-node": "^10.9.1"
    });
  }
  
  // Add advanced dependencies
  if (answers.complexity === 'advanced') {
    if (answers.features.includes('logging')) {
      dependencies["winston"] = "^3.10.0";
    }
    
    if (answers.features.includes('env')) {
      dependencies["dotenv"] = "^16.3.1";
    }
    
    if (answers.includeTests) {
      Object.assign(devDependencies, {
        "jest": "^29.6.2",
        "ts-jest": "^29.1.1",
        "@types/jest": "^29.5.3"
      });
    }
  }
  
  const packageJson = {
    name: answers.name,
    version: "1.0.0",
    description: answers.description,
    type: "module",
    main: "build/index.js",
    scripts: {
      "build": "tsc && chmod +x build/index.js",
      "start": "node build/index.js"
    },
    author: answers.author,
    license: "MIT",
    dependencies,
    devDependencies
  };
  
  // Add additional scripts based on complexity
  if (answers.complexity !== 'basic') {
    Object.assign(packageJson.scripts, {
      "dev": "nodemon --exec ts-node src/index.ts",
      "clean": "rm -rf build"
    });
    
    if (answers.includeTests) {
      packageJson.scripts.test = "jest";
    }
  }
  
  fs.writeFileSync(
    path.join(basePath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: "ES2022",
      module: "ES2022",
      moduleResolution: "NodeNext",
      outDir: "build",
      rootDir: "src",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      allowSyntheticDefaultImports: true,
      declaration: true,
      sourceMap: true
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "build"]
  };
  
  if (answers.includeTests) {
    tsConfig.exclude.push("tests");
  }
  
  fs.writeFileSync(
    path.join(basePath, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
  
  // Create core files
  fs.writeFileSync(
    path.join(basePath, 'src/index.ts'),
    templates.getIndexFileContent(answers)
  );
  
  fs.writeFileSync(
    path.join(basePath, 'src/core/server.ts'),
    templates.getServerFileContent(answers)
  );
  
  fs.writeFileSync(
    path.join(basePath, 'src/handlers/hello.ts'),
    templates.getBasicHandlerContent()
  );
  
  fs.writeFileSync(
    path.join(basePath, 'src/utils/helpers.ts'),
    templates.getUtilsContent()
  );
  
  // Create example files if requested
  if (answers.includeExamples) {
    fs.writeFileSync(
      path.join(basePath, 'src/examples/echo.ts'),
      templates.getEchoExampleContent()
    );
    
    fs.writeFileSync(
      path.join(basePath, 'src/examples/calculator.ts'),
      templates.getCalculatorExampleContent()
    );
  }
  
  // Create test files if requested
  if (answers.includeTests) {
    fs.writeFileSync(
      path.join(basePath, 'jest.config.js'),
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
    
    fs.writeFileSync(
      path.join(basePath, 'tests/hello.test.ts'),
      templates.getBasicTestContent()
    );
  }
  
  // Create Docker files if requested
  if (answers.includeDocker) {
    fs.writeFileSync(
      path.join(basePath, 'Dockerfile'),
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
    
    fs.writeFileSync(
      path.join(basePath, 'docker-compose.yml'),
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
  
  // Create advanced feature files
  if (answers.complexity === 'advanced') {
    // Create environment configuration
    if (answers.features.includes('env')) {
      fs.writeFileSync(
        path.join(basePath, '.env.example'),
        `# Server Configuration
PORT=3000
NODE_ENV=development

# MCP Configuration
MCP_SERVER_NAME=${answers.name}
`
      );
      
      fs.writeFileSync(
        path.join(basePath, 'src/utils/config.ts'),
        templates.getConfigUtilContent(answers)
      );
    }
    
    // Create authentication support
    if (answers.features.includes('auth')) {
      fs.writeFileSync(
        path.join(basePath, 'src/auth/auth.ts'),
        templates.getAuthContent()
      );
    }
    
    // Create logging middleware
    if (answers.features.includes('logging')) {
      fs.writeFileSync(
        path.join(basePath, 'src/middleware/logging.ts'),
        templates.getLoggingContent()
      );
    }
    
    // Create edge functions support
    if (answers.features.includes('edge')) {
      fs.writeFileSync(
        path.join(basePath, 'src/edge/edge.ts'),
        templates.getEdgeFunctionContent()
      );
    }
    
    // Create WebSocket support
    if (answers.features.includes('websocket')) {
      fs.writeFileSync(
        path.join(basePath, 'src/websocket/websocket.ts'),
        templates.getWebSocketContent()
      );
    }
  }
  
  // Create README.md
  fs.writeFileSync(
    path.join(basePath, 'README.md'),
    templates.getReadmeContent(answers)
  );
  
  // Create .gitignore
  fs.writeFileSync(
    path.join(basePath, '.gitignore'),
    `node_modules/
build/
.env
*.log
coverage/
`
  );
}

// Export for testing
module.exports = { run, createDirectoryStructure, generateFiles };

// Only run if this file is executed directly
if (require.main === module) {
  run();
}