# # Stage 1: Build
# FROM node:18-alpine AS builder

# WORKDIR /app

# COPY package.json ./
# # Install dependencies (no lock file needed for fresh install)
# RUN npm install --legacy-peer-deps

# COPY . .

# # Build the React app
# RUN npm run build

# # Stage 2: Serve with Nginx
# FROM nginx:alpine

# # Copy custom nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Copy build output
# COPY --from=builder /app/build /usr/share/nginx/html

# # Add health check file
# RUN echo "OK" > /usr/share/nginx/html/health

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]


# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Fix npm network issues
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-factor 2 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retry-maxtimeout 60000 && \
    npm install --legacy-peer-deps

COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/build /usr/share/nginx/html

# Health check
RUN echo "OK" > /usr/share/nginx/html/health

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]