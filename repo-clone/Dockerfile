# Use Node.js as the base image
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# This will be overridden by docker-compose.yml for development
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy build artifacts from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/taxonomy ./taxonomy

# Expose the application port
EXPOSE 8080

# Start the application
CMD ["node", "dist/main"]