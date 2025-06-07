import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Load order service proto definition
const orderProtoPath = path.resolve(__dirname, '../../proto/order.proto');
const orderProtoDefinition = protoLoader.loadSync(orderProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const orderProto = grpc.loadPackageDefinition(orderProtoDefinition).order;

// Import service implementations
import { OrderServiceImpl } from './services/order-service';

// Create gRPC server
const server = new grpc.Server();

// Register services
server.addService(
  (orderProto as any).OrderService.service,
  new OrderServiceImpl(prisma)
);

// Start server
const host = process.env.GRPC_SERVER_HOST || '0.0.0.0';
const port = process.env.GRPC_SERVER_PORT || '50051';
const serverUrl = `${host}:${port}`;

server.bindAsync(
  serverUrl,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error('Failed to start gRPC server:', err);
      return;
    }
    console.log(`Order Service gRPC server running at ${serverUrl}`);
    server.start();
  }
);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  server.tryShutdown(async () => {
    await prisma.$disconnect();
    console.log('Server shutdown complete');
    process.exit(0);
  });
});