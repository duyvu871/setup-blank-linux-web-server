FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy proto files
COPY ../proto ../proto/

# Copy source code
COPY tsconfig.json ./
COPY src ./src/

# Build TypeScript code
RUN npm run build

# Create and migrate database
RUN npx prisma migrate dev --name init

# Expose port
EXPOSE 50052

# Start the service
CMD ["node", "dist/index.js"]