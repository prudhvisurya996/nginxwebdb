# Stage 1: Build the app
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Stage 2: Create a lightweight runtime image
FROM node:18-alpine

WORKDIR /usr/src/app

# Create the app directory explicitly
RUN mkdir -p /usr/src/app

# Copying  only the necessary files from the build stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/server.js ./  
COPY --from=builder /usr/src/app/public ./public  

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
