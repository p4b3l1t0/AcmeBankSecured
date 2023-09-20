# Use an official Node.js runtime as the base image
FROM node:14

# Create and set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . /usr/src/app

# Expose a port for the application (adjust as needed)
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]
