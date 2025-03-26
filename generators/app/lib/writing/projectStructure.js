/**
 * Project Structure generator
 * Creates directory structure based on user choices
 */

module.exports = function(generator) {
  // Create directory structure recursively
  const createDirs = (structure, basePath = '') => {
    Object.keys(structure).forEach(dir => {
      const path = basePath ? `${basePath}/${dir}` : dir;
      generator.fs.write(generator.destinationPath(`${path}/.gitkeep`), '');
      
      if (Object.keys(structure[dir]).length > 0) {
        createDirs(structure[dir], path);
      }
    });
  };
  
  createDirs(generator.projectStructure);
  
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
};