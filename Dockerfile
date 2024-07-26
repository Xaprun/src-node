# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
# COPY src-node/package*.json ./

# Install dependencies
# RUN npm install

# Copy the rest of the application code
COPY src-node/ .

# Install dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["node", "index.js"]
