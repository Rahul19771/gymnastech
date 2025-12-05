# Use an official Node.js runtime as a parent image
FROM node:18-alpine
WORKDIR /app
# Copy package files
COPY package*.json ./
# Install dependencies (including dev dependencies for TypeScript build)
RUN npm install
# Copy source code
COPY . .
# Build TypeScript
RUN npm run build
# Expose port
EXPOSE 8080
# Start app
CMD ["npm", "start"]