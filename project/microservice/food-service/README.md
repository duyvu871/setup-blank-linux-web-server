# Food Service

Service quản lý thông tin món ăn cho hệ thống đặt món ăn.

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

### GetFoodById

Lấy thông tin món ăn theo ID.

```typescript
rpc GetFoodById(GetFoodByIdRequest) returns (Food);
```

### GetFoodsByIds

Lấy thông tin nhiều món ăn theo danh sách ID.

```typescript
rpc GetFoodsByIds(GetFoodsByIdsRequest) returns (GetFoodsByIdsResponse);
```

## Database Schema

```prisma
model Food {
  id        Int      @id @default(autoincrement())
  name      String
  price     Float
  category  String
  available Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```