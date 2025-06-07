import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Load food service proto definition
const foodProtoPath = path.resolve(__dirname, '../../proto/food.proto');
const foodProtoDefinition = protoLoader.loadSync(foodProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const foodProto = grpc.loadPackageDefinition(foodProtoDefinition).food;

// Import service implementations
import { FoodServiceImpl } from './services/food-service';

// Create gRPC server
const server = new grpc.Server();

// Register services
server.addService(
  (foodProto as any).FoodService.service,
  new FoodServiceImpl(prisma)
);

// Start server
const host = process.env.GRPC_SERVER_HOST || '0.0.0.0';
const port = process.env.GRPC_SERVER_PORT || '50052';
const serverUrl = `${host}:${port}`;

server.bindAsync(
  serverUrl,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error('Failed to start gRPC server:', err);
      return;
    }
    console.log(`Food Service gRPC server running at ${serverUrl}`);
    server.start();

    // Seed some initial data
    seedData();
  }
);

// Seed initial food data
async function seedData() {
  try {
    const foodCount = await prisma.food.count();
    if (foodCount === 0) {
      console.log('Seeding initial food data...');
      await prisma.food.createMany({
        data: [
          {
            name: 'Pizza Margherita',
            price: 10.99,
            category: 'Pizza',
            available: true,
          },
          {
            name: 'Hamburger',
            price: 8.99,
            category: 'Burger',
            available: true,
          },
          {
            name: 'Caesar Salad',
            price: 7.99,
            category: 'Salad',
            available: true,
          },
          {
            name: 'Spaghetti Carbonara',
            price: 12.99,
            category: 'Pasta',
            available: true,
          },
          {
            name: 'Chicken Wings',
            price: 9.99,
            category: 'Appetizer',
            available: true,
          },
        ],
      });
      console.log('Food data seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding food data:', error);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  server.tryShutdown(async () => {
    await prisma.$disconnect();
    console.log('Server shutdown complete');
    process.exit(0);
  });
});