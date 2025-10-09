FROM node:18-alpine

WORKDIR /app

# Copy static files
COPY . .

# Install a simple HTTP server
RUN npm install -g http-server

EXPOSE 5500

CMD ["http-server", "-p", "5500", "-c-1"]
