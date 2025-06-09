# Stage 1: Build the app
FROM node:18-alpine 

WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
