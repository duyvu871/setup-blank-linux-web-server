# Coding Convention và Quy tắc Dự án

## Mục lục
1. [Quy tắc chung](#quy-tắc-chung)
2. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
3. [TypeScript Coding Style](#typescript-coding-style)
4. [Quy tắc đặt tên](#quy-tắc-đặt-tên)
5. [Quy tắc viết API](#quy-tắc-viết-api)
6. [Quy tắc viết gRPC Service](#quy-tắc-viết-grpc-service)
7. [Quy tắc làm việc với Prisma](#quy-tắc-làm-việc-với-prisma)
8. [Xử lý lỗi](#xử-lý-lỗi)
9. [Logging](#logging)
10. [Testing](#testing)
11. [Quy tắc làm việc với Docker](#quy-tắc-làm-việc-với-docker)

## Quy tắc chung

### Nguyên tắc SOLID
- **Single Responsibility**: Mỗi class/module chỉ nên có một trách nhiệm duy nhất
- **Open/Closed**: Các thành phần nên mở rộng được nhưng không nên sửa đổi
- **Liskov Substitution**: Các lớp con phải có thể thay thế lớp cha mà không làm thay đổi tính đúng đắn của chương trình
- **Interface Segregation**: Nhiều interface cụ thể tốt hơn một interface tổng quát
- **Dependency Inversion**: Phụ thuộc vào abstraction, không phụ thuộc vào implementation

### Nguyên tắc DRY (Don't Repeat Yourself)
- Tránh lặp lại code, tạo các utility functions hoặc shared modules khi cần

### Nguyên tắc KISS (Keep It Simple, Stupid)
- Giữ code đơn giản, dễ hiểu
- Tránh các giải pháp phức tạp khi có giải pháp đơn giản

### Nguyên tắc YAGNI (You Aren't Gonna Need It)
- Không thêm các tính năng cho đến khi thực sự cần thiết

## Cấu trúc thư mục

### Cấu trúc chung cho mỗi service

```
service-name/
├── src/
│   ├── config/           # Cấu hình service
│   ├── controllers/      # Xử lý logic nghiệp vụ
│   ├── interfaces/       # Định nghĩa các interface
│   ├── middlewares/      # Middleware (nếu cần)
│   ├── models/           # Định nghĩa model
│   ├── proto/            # gRPC client/server
│   ├── repositories/     # Tương tác với database
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── validators/       # Validation logic
│   ├── app.ts            # Khởi tạo ứng dụng
│   └── index.ts          # Entry point
├── prisma/
│   └── schema.prisma     # Prisma schema
├── tests/                # Unit tests
├── .env                  # Environment variables
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore file
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md             # Documentation
```

### Cấu trúc API Gateway

```
api-gateway/
├── src/
│   ├── config/           # Cấu hình service
│   ├── controllers/      # Xử lý request/response
│   ├── interfaces/       # Định nghĩa các interface
│   ├── middlewares/      # Express middlewares
│   ├── proto/            # gRPC clients
│   ├── routes/           # API routes
│   ├── services/         # Service layer
│   ├── utils/            # Utility functions
│   ├── validators/       # Request validation
│   ├── app.ts            # Express app setup
│   └── index.ts          # Entry point
├── prisma/
│   └── schema.prisma     # Prisma schema (nếu cần)
├── tests/                # Unit tests
├── .env                  # Environment variables
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore file
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md             # Documentation
```

## TypeScript Coding Style

### Sử dụng TypeScript Strict Mode
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true
  }
}
```

### Sử dụng Interface thay vì Type khi có thể
```typescript
// Tốt
interface User {
  id: number;
  name: string;
  email?: string;
}

// Tránh khi có thể dùng interface
type User = {
  id: number;
  name: string;
  email?: string;
};
```

### Sử dụng Enums cho các giá trị cố định
```typescript
enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
```

### Sử dụng async/await thay vì Promises trực tiếp
```typescript
// Tốt
async function getUser(id: number): Promise<User> {
  try {
    const user = await userRepository.findById(id);
    return user;
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
}

// Tránh
function getUser(id: number): Promise<User> {
  return userRepository.findById(id)
    .then(user => user)
    .catch(error => {
      throw new Error(`Failed to get user: ${error.message}`);
    });
}
```

### Sử dụng Type Inference khi rõ ràng
```typescript
// Tốt
const numbers = [1, 2, 3]; // Type inference: number[]

// Không cần thiết
const numbers: number[] = [1, 2, 3];
```

### Sử dụng Type Assertion khi cần thiết
```typescript
const userInput = document.getElementById('user-input') as HTMLInputElement;
```

## Quy tắc đặt tên

### Chung
- Sử dụng tiếng Anh cho tất cả tên biến, hàm, class, file
- Tên phải mô tả rõ mục đích, tránh viết tắt không rõ ràng
- Tránh tên quá ngắn hoặc quá dài

### Files
- Sử dụng kebab-case cho tên file: `user-service.ts`, `order-controller.ts`
- Tên file phải phản ánh nội dung của file

### Variables & Functions
- Sử dụng camelCase cho biến và hàm: `userId`, `getOrderById`
- Hàm nên bắt đầu bằng động từ: `getUser`, `createOrder`, `updateFood`
- Boolean nên bắt đầu bằng `is`, `has`, `should`: `isActive`, `hasPermission`

### Classes & Interfaces
- Sử dụng PascalCase: `UserService`, `OrderController`
- Interface nên có tên rõ ràng, không thêm tiền tố `I`: `User` thay vì `IUser`

### Constants
- Sử dụng UPPER_SNAKE_CASE cho hằng số: `MAX_RETRY_COUNT`, `API_BASE_URL`

### Enums
- Sử dụng PascalCase cho tên enum: `OrderStatus`
- Sử dụng UPPER_SNAKE_CASE hoặc PascalCase cho giá trị enum tùy theo ngữ cảnh

## Quy tắc viết API

### RESTful API Conventions
- Sử dụng danh từ số nhiều cho endpoints: `/api/users`, `/api/orders`
- Sử dụng HTTP methods đúng mục đích:
  - GET: Lấy dữ liệu
  - POST: Tạo mới
  - PUT: Cập nhật toàn bộ
  - PATCH: Cập nhật một phần
  - DELETE: Xóa
- Sử dụng HTTP status codes đúng:
  - 200: OK
  - 201: Created
  - 204: No Content
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 500: Internal Server Error

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

### Versioning
- Sử dụng versioning trong URL: `/api/v1/users`

### Pagination
- Sử dụng query parameters cho pagination: `?page=1&limit=10`
- Luôn trả về tổng số items trong response metadata

## Quy tắc viết gRPC Service

### Naming Conventions
- Service names: PascalCase, hậu tố `Service`: `UserService`, `OrderService`
- Method names: PascalCase, bắt đầu bằng động từ: `GetUser`, `CreateOrder`
- Message names: PascalCase, mô tả nội dung: `User`, `CreateUserRequest`
- Field names: snake_case trong proto, camelCase trong code: `user_id` (proto), `userId` (code)

### Message Design
- Mỗi RPC method nên có request và response message riêng
- Sử dụng common messages cho các trường hợp lặp lại
- Sử dụng `optional` cho các trường không bắt buộc

### Error Handling
- Sử dụng gRPC status codes đúng mục đích
- Thêm error details khi cần thiết

### Versioning
- Sử dụng package name để version: `user.v1`, `user.v2`

## Quy tắc làm việc với Prisma

### Schema Design
- Sử dụng PascalCase cho model names: `User`, `Order`
- Sử dụng camelCase cho field names: `userId`, `createdAt`
- Thêm `id` field cho mỗi model
- Thêm `createdAt` và `updatedAt` cho mỗi model

### Relations
- Đặt tên rõ ràng cho relations
- Sử dụng `@relation` để định nghĩa relations

### Migrations
- Tạo migration cho mỗi thay đổi schema
- Đặt tên migration rõ ràng: `add-user-role`, `update-order-status`

### Queries
- Sử dụng Prisma Client trong repository layer
- Tránh truy vấn trực tiếp từ controller
- Sử dụng transactions khi cần

## Xử lý lỗi

### Tạo Custom Error Classes
```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(400, message, 'VALIDATION_ERROR');
  }
}
```

### Try-Catch Pattern
```typescript
async function getUser(id: number): Promise<User> {
  try {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, `Failed to get user: ${error.message}`);
  }
}
```

### Global Error Handler (Express)
```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});
```

## Logging

### Sử dụng Winston hoặc Pino
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export default logger;
```

### Log Levels
- **error**: Lỗi nghiêm trọng, ứng dụng không thể tiếp tục
- **warn**: Cảnh báo, có thể có vấn đề
- **info**: Thông tin chung, trạng thái ứng dụng
- **debug**: Thông tin chi tiết cho debugging
- **trace**: Thông tin rất chi tiết

### Structured Logging
```typescript
logger.info('User created', {
  userId: user.id,
  username: user.username,
  service: 'user-service',
  action: 'create'
});
```

## Testing

### Unit Testing
- Sử dụng Jest hoặc Mocha + Chai
- Mỗi service/controller nên có unit tests
- Sử dụng mocking cho dependencies

### Integration Testing
- Test API endpoints
- Test gRPC services
- Sử dụng test database

### Test Naming Convention
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      // Test code
    });

    it('should throw ValidationError with invalid data', async () => {
      // Test code
    });
  });
});
```

## Quy tắc làm việc với Docker

### Dockerfile
- Sử dụng multi-stage builds
- Sử dụng .dockerignore
- Sử dụng non-root user
- Sử dụng specific version tags

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma

RUN npm prune --production
RUN npx prisma generate

USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Docker Compose
- Sử dụng environment variables
- Định nghĩa networks
- Sử dụng volumes cho persistent data
- Định nghĩa dependencies giữa các services

```yaml
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - FOOD_SERVICE_URL=food-service:50051
      - ORDER_SERVICE_URL=order-service:50052
      - USER_SERVICE_URL=user-service:50053
    depends_on:
      - food-service
      - order-service
      - user-service

  food-service:
    build: ./food-service
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/food.db
    volumes:
      - food-data:/app/data

  order-service:
    build: ./order-service
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/order.db
    volumes:
      - order-data:/app/data

  user-service:
    build: ./user-service
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/user.db
    volumes:
      - user-data:/app/data

volumes:
  food-data:
  order-data:
  user-data:

networks:
  default:
    driver: bridge
```

---

Các quy tắc và convention này nên được tuân thủ trong toàn bộ dự án để đảm bảo tính nhất quán và dễ bảo trì. Tùy thuộc vào nhu cầu cụ thể, có thể điều chỉnh hoặc bổ sung thêm các quy tắc khác.