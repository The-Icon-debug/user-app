# Use official Node.js image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy rest of the app
COPY . .

# Create non-root user with specific UID/GID for better control && Set ownership
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S -G appgroup -h /home/appuser appuser && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 4000

# Start app
CMD ["node", "index.js"]
