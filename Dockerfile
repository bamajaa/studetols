FROM node:20-alpine

WORKDIR /app

# Copy semua file
COPY . .

# Build React frontend
RUN cd client && npm install && npm run build

# Install server dependencies
RUN cd server && npm install

# Expose port
EXPOSE 3000

# Start server (serves API + static React build)
CMD ["node", "server/src/index.js"]
