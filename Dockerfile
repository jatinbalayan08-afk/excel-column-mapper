# Base image
FROM node:22-alpine

# Create working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose Next.js port
EXPOSE 3000

# Start application
RUN npm run build

CMD ["npm", "start"]