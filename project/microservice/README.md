# Mini Food Ordering System - Microservice Demo

Đây là một dự án demo nhỏ về hệ thống đặt món ăn sử dụng kiến trúc microservice với gRPC làm giao thức giao tiếp chính giữa các service.

## Tổng quan

Dự án này tập trung vào việc triển khai một hệ thống microservice đơn giản với các thành phần tối thiểu:

1. **Order Service**: Service chính để quản lý đơn hàng
2. **Food Service**: Service đơn giản để quản lý thông tin món ăn
3. **Proto Definitions**: Định nghĩa gRPC cho giao tiếp giữa các service

## Công nghệ sử dụng

- **Node.js/TypeScript**: Ngôn ngữ lập trình chính
- **gRPC**: Giao thức giao tiếp giữa các service
- **SQLite**: Database đơn giản cho mỗi service
- **Prisma**: ORM để tương tác với database

## Cấu trúc thư mục

```
microservice/
├── order-service/       # Service quản lý đơn hàng
├── food-service/        # Service quản lý món ăn
├── proto/               # Định nghĩa gRPC Protocol Buffers
└── docs/                # Tài liệu dự án
```

## Cài đặt và chạy

1. Cài đặt dependencies:

```bash
# Trong thư mục order-service và food-service
npm install
```

2. Khởi tạo database:

```bash
# Trong thư mục order-service và food-service
npx prisma migrate dev
```

3. Chạy các service:

```bash
# Trong thư mục order-service và food-service
npm run dev
```

## Tính năng chính

- Tạo đơn hàng mới
- Cập nhật trạng thái đơn hàng
- Lấy thông tin đơn hàng theo ID
- Lấy danh sách đơn hàng theo user ID
- Hủy đơn hàng

## Luồng dữ liệu

1. Order Service cần thông tin món ăn từ Food Service
2. Order Service gọi gRPC đến Food Service để lấy thông tin món ăn
3. Order Service tạo đơn hàng mới trong database
4. Order Service trả về thông tin đơn hàng