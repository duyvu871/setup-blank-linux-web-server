import * as grpc from '@grpc/grpc-js';
import { PrismaClient } from '@prisma/client';

export class FoodServiceImpl {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getFoodById(call: any, callback: any) {
    try {
      const { id } = call.request;

      const food = await this.prisma.food.findUnique({
        where: { id },
      });

      if (!food) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: `Food with id ${id} not found`,
        });
      }

      // Format response
      const response = {
        id: food.id,
        name: food.name,
        price: food.price,
        category: food.category,
        available: food.available,
      };

      callback(null, response);
    } catch (error) {
      console.error('Error getting food by id:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async getFoodsByIds(call: any, callback: any) {
    try {
      const { ids } = call.request;

      if (!ids || ids.length === 0) {
        return callback(null, { foods: [] });
      }

      const foods = await this.prisma.food.findMany({
        where: {
          id: {
            in: ids,
          },
        },
      });

      // Format response
      const response = {
        foods: foods.map((food) => ({
          id: food.id,
          name: food.name,
          price: food.price,
          category: food.category,
          available: food.available,
        })),
      };

      callback(null, response);
    } catch (error) {
      console.error('Error getting foods by ids:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }
}