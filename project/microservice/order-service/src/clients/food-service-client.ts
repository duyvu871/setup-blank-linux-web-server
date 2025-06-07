import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Load food service proto definition
const foodProtoPath = path.resolve(__dirname, '../../../proto/food.proto');
const foodProtoDefinition = protoLoader.loadSync(foodProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const foodProto = grpc.loadPackageDefinition(foodProtoDefinition).food;

export class FoodServiceClient {
  private client: any;

  constructor() {
    const host = process.env.FOOD_SERVICE_HOST || 'localhost';
    const port = process.env.FOOD_SERVICE_PORT || '50052';
    const serverUrl = `${host}:${port}`;

    this.client = new (foodProto as any).FoodService(
      serverUrl,
      grpc.credentials.createInsecure()
    );
  }

  getFoodById(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.getFoodById({ id }, (err: any, response: any) => {
        if (err) {
          console.error('Error calling Food Service:', err);
          return reject(err);
        }
        resolve(response);
      });
    });
  }

  getFoodsByIds(ids: number[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.getFoodsByIds({ ids }, (err: any, response: any) => {
        if (err) {
          console.error('Error calling Food Service:', err);
          return reject(err);
        }
        resolve(response);
      });
    });
  }
}