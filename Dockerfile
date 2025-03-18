# Stage 1: Build Angular application
FROM node:18-alpine AS build

WORKDIR /app

COPY . .
RUN npm install

COPY . .
ARG ENV=production
RUN npm run build -- --configuration=$ENV

# Stage 2: Serve Angular application using Nginx
FROM nginx:latest AS ngi

# Copy built Angular files from the previous stage to Nginx directory
COPY --from=build /app/dist/hyp-web-app/browser /usr/share/nginx/html
COPY /nginx.conf  /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
