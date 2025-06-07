import * as grpc from '@grpc/grpc-js';
import { PrismaClient } from '@prisma/client';
import { FoodServiceClient } from '../clients/food-service-client';

export class OrderServiceImpl {
  private prisma: PrismaClient;
  private foodServiceClient: FoodServiceClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.foodServiceClient = new FoodServiceClient();
  }

  async createOrder(call: any, callback: any) {
    try {
      const { userId, items } = call.request;

      if (!userId || !items || items.length === 0) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Invalid request: userId and items are required',
        });
      }

      // Get food details from Food Service
      const foodIds = items.map((item: any) => item.foodId);
      const foodsResponse = await this.foodServiceClient.getFoodsByIds(foodIds);
      
      // Calculate total price
      let total = 0;
      for (const item of items) {
        const food = foodsResponse.foods.find((f: any) => f.id === item.foodId);
        if (!food) {
          return callback({
            code: grpc.status.NOT_FOUND,
            message: `Food with id ${item.foodId} not found`,
          });
        }
        if (!food.available) {
          return callback({
            code: grpc.status.FAILED_PRECONDITION,
            message: `Food with id ${item.foodId} is not available`,
          });
        }
        total += food.price * item.quantity;
      }

      // Create order in database
      const order = await this.prisma.order.create({
        data: {
          userId,
          total,
          status: 'PENDING',
          items: {
            create: items.map((item: any) => ({
              foodId: item.foodId,
              quantity: item.quantity,
              price: foodsResponse.foods.find((f: any) => f.id === item.foodId).price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Format response
      const response = {
        id: order.id,
        userId: order.userId,
        status: order.status,
        total: order.total,
        items: order.items.map((item) => ({
          id: item.id,
          orderId: item.orderId,
          foodId: item.foodId,
          quantity: item.quantity,
          price: item.price,
        })),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      };

      callback(null, response);
    } catch (error) {
      console.error('Error creating order:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async getOrderById(call: any, callback: any) {
    try {
      const { id } = call.request;

      const order = await this.prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: `Order with id ${id} not found`,
        });
      }

      // Format response
      const response = {
        id: order.id,
        userId: order.userId,
        status: order.status,
        total: order.total,
        items: order.items.map((item) => ({
          id: item.id,
          orderId: item.orderId,
          foodId: item.foodId,
          quantity: item.quantity,
          price: item.price,
        })),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      };

      callback(null, response);
    } catch (error) {
      console.error('Error getting order by id:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async getOrdersByUserId(call: any, callback: any) {
    try {
      const { userId } = call.request;

      const orders = await this.prisma.order.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });

      // Format response
      const response = {
        orders: orders.map((order) => ({
          id: order.id,
          userId: order.userId,
          status: order.status,
          total: order.total,
          items: order.items.map((item) => ({
            id: item.id,
            orderId: item.orderId,
            foodId: item.foodId,
            quantity: item.quantity,
            price: item.price,
          })),
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        })),
      };

      callback(null, response);
    } catch (error) {
      console.error('Error getting orders by user id:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async updateOrderStatus(call: any, callback: any) {
    try {
      const { id, status } = call.request;

      const order = await this.prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: `Order with id ${id} not found`,
        });
      }

      // Update order status
      const updatedOrder = await this.prisma.order.update({
        where: { id },
        data: { status },
        include: { items: true },
      });

      // Format response
      const response = {
        id: updatedOrder.id,
        userId: updatedOrder.userId,
        status: updatedOrder.status,
        total: updatedOrder.total,
        items: updatedOrder.items.map((item) => ({
          id: item.id,
          orderId: item.orderId,
          foodId: item.foodId,
          quantity: item.quantity,
          price: item.price,
        })),
        createdAt: updatedOrder.createdAt.toISOString(),
        updatedAt: updatedOrder.updatedAt.toISOString(),
      };

      callback(null, response);
    } catch (error) {
      console.error('Error updating order status:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async cancelOrder(call: any, callback: any) {
    try {
      const { id } = call.request;

      const order = await this.prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: `Order with id ${id} not found`,
        });
      }

      if (order.status !== 'PENDING') {
        return callback({
          code: grpc.status.FAILED_PRECONDITION,
          message: `Cannot cancel order with status ${order.status}`,
        });
      }

      // Update order status to CANCELLED
      const cancelledOrder = await this.prisma.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { items: true },
      });

      // Format response
      const response = {
        id: cancelledOrder.id,
        userId: cancelledOrder.userId,
        status: cancelledOrder.status,
        total: cancelledOrder.total,
        items: cancelledOrder.items.map((item) => ({
          id: item.id,
          orderId: item.orderId,
          foodId: item.foodId,
          quantity: item.quantity,
          price: item.price,
        })),
        createdAt: cancelledOrder.createdAt.toISOString(),
        updatedAt: cancelledOrder.updatedAt.toISOString(),
      };

      callback(null, response);
    } catch (error) {
      console.error('Error cancelling order:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }
}