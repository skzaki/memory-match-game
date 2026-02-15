# Use lightweight nginx image
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy your static game files into nginx directory
COPY . /usr/share/nginx/html

# Expose container port
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
