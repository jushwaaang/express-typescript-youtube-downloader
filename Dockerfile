# Use an official Node.js runtime as a parent image
FROM node:21

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
  gconf-service \
  libasound2 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libfontconfig1 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libxss1 \
  libxtst6 \
  xdg-utils \
  libu2f-udev \
  ffmpeg

# Copy package.json and package-lock.json
COPY package*.json ./ 

# Install production dependencies
RUN npm install --only=production

# Copy the rest of your application code
COPY . .

# Build the TypeScript files
RUN npm run build

# Expose the application port (change if your app uses a different port)
EXPOSE 3000

# Set the default command for the app service
CMD ["npm", "start"]
