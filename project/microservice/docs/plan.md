


          
# Kế hoạch xây dựng hệ thống order món ăn mini

## Tổng quan kiến trúc
Hệ thống sẽ được xây dựng theo kiến trúc microservice với các thành phần sau:
1. **API Gateway**: Điểm vào duy nhất của hệ thống, xử lý request từ client
2. **Service món ăn**: Quản lý danh sách món ăn, thông tin, giá cả
3. **Service đơn hàng**: Xử lý đơn hàng, trạng thái đơn hàng
4. **Service người dùng**: Quản lý thông tin người dùng, xác thực

## Công nghệ sử dụng
- **Database**: SQLite (mỗi service sử dụng file SQLite riêng)
- **ORM**: Prisma để tương tác với database
- **API Gateway**: Express.js
- **Giao tiếp giữa các service**: gRPC
- **Ngôn ngữ**: Node.js/TypeScript

## Cấu trúc thư mục

```
microservice/
├── api-gateway/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── proto/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
├── food-service/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── proto/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
├── order-service/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── proto/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
├── user-service/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── proto/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
├── proto/
│   ├── food.proto
│   ├── order.proto
│   └── user.proto
└── docker-compose.yml
```

## Chi tiết các service

### 1. API Gateway
- **Chức năng**: Điểm vào duy nhất của hệ thống, định tuyến request đến các service tương ứng
- **Công nghệ**: Express.js, gRPC client
- **Endpoints**:
  - `/api/foods` - Quản lý món ăn
  - `/api/orders` - Quản lý đơn hàng
  - `/api/users` - Quản lý người dùng
  - `/api/auth` - Xác thực người dùng

### 2. Service món ăn (Food Service)
- **Chức năng**: Quản lý danh sách món ăn
- **Database Schema**:
  ```prisma
  model Food {
    id        Int      @id @default(autoincrement())
    name      String
    price     Float
    image     String?
    category  String
    available Boolean  @default(true)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }
  ```
- **gRPC Methods**:
  - `GetAllFoods`
  - `GetFoodById`
  - `CreateFood`
  - `UpdateFood`
  - `DeleteFood`

### 3. Service đơn hàng (Order Service)
- **Chức năng**: Xử lý đơn hàng
- **Database Schema**:
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
    order    Order @relation(fields: [orderId], references: [id])
  }

  enum OrderStatus {
    PENDING
    PROCESSING
    COMPLETED
    CANCELLED
  }
  ```
- **gRPC Methods**:
  - `CreateOrder`
  - `GetOrderById`
  - `GetOrdersByUserId`
  - `UpdateOrderStatus`
  - `CancelOrder`

### 4. Service người dùng (User Service)
- **Chức năng**: Quản lý thông tin người dùng, xác thực
- **Database Schema**:
  ```prisma
  model User {
    id        Int      @id @default(autoincrement())
    username  String   @unique
    password  String
    name      String
    email     String?  @unique
    phone     String?
    role      UserRole @default(CUSTOMER)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }

  enum UserRole {
    ADMIN
    STAFF
    CUSTOMER
  }
  ```
- **gRPC Methods**:
  - `CreateUser`
  - `GetUserById`
  - `UpdateUser`
  - `DeleteUser`
  - `AuthenticateUser`

## Định nghĩa gRPC Protocol Buffers

### food.proto
```protobuf
syntax = "proto3";

package food;

service FoodService {
  rpc GetAllFoods(GetAllFoodsRequest) returns (GetAllFoodsResponse);
  rpc GetFoodById(GetFoodByIdRequest) returns (Food);
  rpc CreateFood(CreateFoodRequest) returns (Food);
  rpc UpdateFood(UpdateFoodRequest) returns (Food);
  rpc DeleteFood(DeleteFoodRequest) returns (DeleteFoodResponse);
}

message GetAllFoodsRequest {
  optional string category = 1;
}

message GetAllFoodsResponse {
  repeated Food foods = 1;
}

message GetFoodByIdRequest {
  int32 id = 1;
}

message CreateFoodRequest {
  string name = 1;
  float price = 2;
  optional string image = 3;
  string category = 4;
  bool available = 5;
}

message UpdateFoodRequest {
  int32 id = 1;
  optional string name = 2;
  optional float price = 3;
  optional string image = 4;
  optional string category = 5;
  optional bool available = 6;
}

message DeleteFoodRequest {
  int32 id = 1;
}

message DeleteFoodResponse {
  bool success = 1;
}

message Food {
  int32 id = 1;
  string name = 2;
  float price = 3;
  optional string image = 4;
  string category = 5;
  bool available = 6;
  string createdAt = 7;
  string updatedAt = 8;
}
```

### order.proto
```protobuf
syntax = "proto3";

package order;

service OrderService {
  rpc CreateOrder(CreateOrderRequest) returns (Order);
  rpc GetOrderById(GetOrderByIdRequest) returns (Order);
  rpc GetOrdersByUserId(GetOrdersByUserIdRequest) returns (GetOrdersByUserIdResponse);
  rpc UpdateOrderStatus(UpdateOrderStatusRequest) returns (Order);
  rpc CancelOrder(CancelOrderRequest) returns (Order);
}

message CreateOrderRequest {
  int32 userId = 1;
  repeated OrderItemInput items = 2;
}

message OrderItemInput {
  int32 foodId = 1;
  int32 quantity = 2;
  float price = 3;
}

message GetOrderByIdRequest {
  int32 id = 1;
}

message GetOrdersByUserIdRequest {
  int32 userId = 1;
}

message GetOrdersByUserIdResponse {
  repeated Order orders = 1;
}

message UpdateOrderStatusRequest {
  int32 id = 1;
  OrderStatus status = 2;
}

message CancelOrderRequest {
  int32 id = 1;
}

message Order {
  int32 id = 1;
  int32 userId = 2;
  OrderStatus status = 3;
  float total = 4;
  repeated OrderItem items = 5;
  string createdAt = 6;
  string updatedAt = 7;
}

message OrderItem {
  int32 id = 1;
  int32 orderId = 2;
  int32 foodId = 3;
  int32 quantity = 4;
  float price = 5;
}

enum OrderStatus {
  PENDING = 0;
  PROCESSING = 1;
  COMPLETED = 2;
  CANCELLED = 3;
}
```

### user.proto
```protobuf
syntax = "proto3";

package user;

service UserService {
  rpc CreateUser(CreateUserRequest) returns (User);
  rpc GetUserById(GetUserByIdRequest) returns (User);
  rpc UpdateUser(UpdateUserRequest) returns (User);
  rpc DeleteUser(DeleteUserRequest) returns (DeleteUserResponse);
  rpc AuthenticateUser(AuthenticateUserRequest) returns (AuthenticateUserResponse);
}

message CreateUserRequest {
  string username = 1;
  string password = 2;
  string name = 3;
  optional string email = 4;
  optional string phone = 5;
  UserRole role = 6;
}

message GetUserByIdRequest {
  int32 id = 1;
}

message UpdateUserRequest {
  int32 id = 1;
  optional string name = 2;
  optional string email = 3;
  optional string phone = 4;
  optional string password = 5;
}

message DeleteUserRequest {
  int32 id = 1;
}

message DeleteUserResponse {
  bool success = 1;
}

message AuthenticateUserRequest {
  string username = 1;
  string password = 2;
}

message AuthenticateUserResponse {
  bool success = 1;
  optional string token = 2;
  optional User user = 3;
}

message User {
  int32 id = 1;
  string username = 2;
  string name = 3;
  optional string email = 4;
  optional string phone = 5;
  UserRole role = 6;
  string createdAt = 7;
  string updatedAt = 8;
}

enum UserRole {
  ADMIN = 0;
  STAFF = 1;
  CUSTOMER = 2;
}
```

## Các bước triển khai

1. **Bước 1**: Tạo cấu trúc thư mục và cài đặt các package cần thiết
2. **Bước 2**: Định nghĩa các protocol buffers cho gRPC
3. **Bước 3**: Cài đặt Prisma và định nghĩa schema cho từng service
4. **Bước 4**: Triển khai các service (Food, Order, User)
5. **Bước 5**: Triển khai API Gateway
6. **Bước 6**: Tạo Docker Compose để chạy toàn bộ hệ thống
7. **Bước 7**: Kiểm thử hệ thống

## Các package cần thiết cho mỗi service

```json
{
  "dependencies": {
    "@grpc/grpc-js": "^1.8.0",
    "@grpc/proto-loader": "^0.7.0",
    "@prisma/client": "^4.8.0",
    "bcrypt": "^5.1.0",
    "dotenv": "^16.0.3",
    "jsonwebtoken": "^9.0.0"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/node": "^18.11.18",
    "prisma": "^4.8.0",
    "ts-node": "^10.9.1",
    "typescript": "^4.9.4"
  }
}
```

## Package bổ sung cho API Gateway

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^6.0.1",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.15",
    "@types/cors": "^2.8.13",
    "@types/morgan": "^1.9.4"
  }
}
```

Đây là kế hoạch tổng thể để xây dựng hệ thống order món ăn mini sử dụng kiến trúc microservice với SQLite, gRPC, Express và Prisma. Bạn có thể mở rộng hoặc điều chỉnh kế hoạch này tùy theo nhu cầu cụ thể của mình.
        