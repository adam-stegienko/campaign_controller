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

# Install dependencies including devDependencies for build
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the React application using a lightweight web server
FROM nginx:1.27-alpine

# Remove default nginx website and configs
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/*

# Copy the build output from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create nginx cache directories and set permissions
RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp \
             /var/run \
             /var/log/nginx && \
    chown -R appuser:appgroup /var/cache/nginx \
                              /var/run \
                              /var/log/nginx \
                              /usr/share/nginx/html \
                              /etc/nginx

# Create nginx.conf that works with non-root user
RUN echo 'pid /var/run/nginx.pid; \
error_log /var/log/nginx/error.log warn; \
events { \
    worker_connections 1024; \
} \
http { \
    include /etc/nginx/mime.types; \
    default_type application/octet-stream; \
    sendfile on; \
    keepalive_timeout 65; \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
    server { \
        listen 8000; \
        server_name localhost; \
        root /usr/share/nginx/html; \
        index index.html; \
        location / { \
            try_files $uri $uri/ /index.html; \
        } \
        location /config.json { \
            add_header Cache-Control "no-cache, no-store, must-revalidate"; \
            add_header Pragma "no-cache"; \
            add_header Expires "0"; \
        } \
    } \
}' > /etc/nginx/nginx.conf

# Expose port 8000
EXPOSE 8000

# Switch to the non-root user
USER appuser

# Start nginx directly (bypass docker entrypoint)
CMD ["nginx", "-g", "daemon off;"]
