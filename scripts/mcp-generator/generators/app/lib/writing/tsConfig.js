/**
 * TSConfig generator
 * Creates tsconfig.json based on user choices
 */

module.exports = function(generator) {
  const tsConfig = {
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
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
  
  // Add test files to exclude if tests are included
  if (generator.answers.includeTests) {
    tsConfig.exclude.push("tests");
  }
  
  generator.fs.writeJSON(generator.destinationPath('tsconfig.json'), tsConfig);
};