# Order Service

Service quản lý đơn hàng cho hệ thống đặt món ăn.

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Tạo và migrate database
npx prisma migrate dev --name init
```

## Chạy service

```bash
# Chạy ở chế độ development
npm run dev

# Hoặc build và chạy ở chế độ production
npm run build
npm start
```

## gRPC Methods

### CreateOrder

Tạo đơn hàng mới.

```typescript
rpc CreateOrder(CreateOrderRequest) returns (Order);
```

### GetOrderById

Lấy thông tin đơn hàng theo ID.

```typescript
rpc GetOrderById(GetOrderByIdRequest) returns (Order);
```

### GetOrdersByUserId

Lấy danh sách đơn hàng theo ID người dùng.

```typescript
rpc GetOrdersByUserId(GetOrdersByUserIdRequest) returns (GetOrdersByUserIdResponse);
```

### UpdateOrderStatus

Cập nhật trạng thái đơn hàng.

```typescript
rpc UpdateOrderStatus(UpdateOrderStatusRequest) returns (Order);
```

### CancelOrder

Hủy đơn hàng.

```typescript
rpc CancelOrder(CancelOrderRequest) returns (Order);
```

## Database Schema

```prisma
model Order {
  id        Int         @id @default(autoincrement())
  userId    Int
  status    OrderStatus @default(PENDING)
  total     Float
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  items     OrderItem[]
}

model OrderItem {
  id       Int   @id @default(autoincrement())
  orderId  Int
  foodId   Int
  quantity Int
  price    Float
  order    Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

enum OrderStatus {
  PENDING
  PROCESSING
  COMPLETED
  CANCELLED
}
```