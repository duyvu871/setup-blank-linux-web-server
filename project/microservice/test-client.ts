import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// Load order service proto definition
const orderProtoPath = path.resolve(__dirname, './proto/order.proto');
const orderProtoDefinition = protoLoader.loadSync(orderProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const orderProto = grpc.loadPackageDefinition(orderProtoDefinition).order;

// Create gRPC client for Order Service
const orderClient = new (orderProto as any).OrderService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Load food service proto definition
const foodProtoPath = path.resolve(__dirname, './proto/food.proto');
const foodProtoDefinition = protoLoader.loadSync(foodProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const foodProto = grpc.loadPackageDefinition(foodProtoDefinition).food;

// Create gRPC client for Food Service
const foodClient = new (foodProto as any).FoodService(
  'localhost:50052',
  grpc.credentials.createInsecure()
);

// Test Food Service
function testFoodService() {
  console.log('\n--- Testing Food Service ---');
  
  // Test GetFoodById
  foodClient.getFoodById({ id: 1 }, (err: any, response: any) => {
    if (err) {
      console.error('Error calling GetFoodById:', err);
      return;
    }
    console.log('GetFoodById Response:', response);
    
    // Test GetFoodsByIds
    foodClient.getFoodsByIds({ ids: [1, 2, 3] }, (err: any, response: any) => {
      if (err) {
        console.error('Error calling GetFoodsByIds:', err);
        return;
      }
      console.log('GetFoodsByIds Response:', response);
      
      // After testing Food Service, test Order Service
      testOrderService();
    });
  });
}

// Test Order Service
function testOrderService() {
  console.log('\n--- Testing Order Service ---');
  
  // Test CreateOrder
  const createOrderRequest = {
    userId: 1,
    items: [
      { foodId: 1, quantity: 2, price: 10.99 },
      { foodId: 2, quantity: 1, price: 8.99 },
    ],
  };
  
  orderClient.createOrder(createOrderRequest, (err: any, response: any) => {
    if (err) {
      console.error('Error calling CreateOrder:', err);
      return;
    }
    console.log('CreateOrder Response:', response);
    const orderId = response.id;
    
    // Test GetOrderById
    orderClient.getOrderById({ id: orderId }, (err: any, response: any) => {
      if (err) {
        console.error('Error calling GetOrderById:', err);
        return;
      }
      console.log('GetOrderById Response:', response);
      
      // Test GetOrdersByUserId
      orderClient.getOrdersByUserId({ userId: 1 }, (err: any, response: any) => {
        if (err) {
          console.error('Error calling GetOrdersByUserId:', err);
          return;
        }
        console.log('GetOrdersByUserId Response:', response);
        
        // Test UpdateOrderStatus
        orderClient.updateOrderStatus({ id: orderId, status: 'PROCESSING' }, (err: any, response: any) => {
          if (err) {
            console.error('Error calling UpdateOrderStatus:', err);
            return;
          }
          console.log('UpdateOrderStatus Response:', response);
          
          // Test CancelOrder
          orderClient.cancelOrder({ id: orderId }, (err: any, response: any) => {
            if (err) {
              console.error('Error calling CancelOrder:', err);
              return;
            }
            console.log('CancelOrder Response:', response);
            console.log('\n--- All tests completed ---');
          });
        });
      });
    });
  });
}

// Start testing
console.log('Starting gRPC client tests...');
testFoodService();