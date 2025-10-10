# Stage 1: Build the React application
FROM node:22-alpine AS build

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Change ownership of the working directory
RUN chown appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the React application using a lightweight web server
FROM nginx:1.27-alpine

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Change ownership of the web root directory
RUN chown -R appuser:appgroup /usr/share/nginx/html

# Copy custom nginx configuration (optional)
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Change ownership of the nginx configuration directory
RUN chown -R appuser:appgroup /etc/nginx

# Expose port 8000
EXPOSE 8000

# # Switch to the non-root user
# USER appuser

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
