/**
 * Docker Files generator
 * Creates Dockerfile and docker-compose.yml
 */

module.exports = function(generator) {
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
};