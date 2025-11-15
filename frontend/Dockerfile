# Frontend React Development Container
FROM node:18-alpine
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Enable polling for hot-reload in Docker
ENV CHOKIDAR_USEPOLLING=true

# Disable host check for proxy compatibility
ENV DANGEROUSLY_DISABLE_HOST_CHECK=true

# Expose React dev server port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]
