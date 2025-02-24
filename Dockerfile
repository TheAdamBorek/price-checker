# Use an official Node.js LTS image as the base
FROM node:iron-alpine

# Set working directory inside the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml (if it exists) for dependency installation
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of your project files
COPY . .

# Build TypeScript to JavaScript
RUN pnpm run build

# Set environment variable to ensure cron works (optional, for logging)
ENV NODE_ENV=production

# Command to run your script
CMD ["node", "dist/index.js"]
