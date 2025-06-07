# Kiến trúc Hệ thống Order Món Ăn

## Mục lục
1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Kiến trúc Microservice](#kiến-trúc-microservice)
3. [Giao tiếp giữa các Service](#giao-tiếp-giữa-các-service)
4. [Luồng dữ liệu](#luồng-dữ-liệu)
5. [Bảo mật](#bảo-mật)
6. [Khả năng mở rộng](#khả-năng-mở-rộng)
7. [Monitoring và Logging](#monitoring-và-logging)

## Tổng quan kiến trúc

### Kiến trúc tổng thể

Hệ thống Order Món Ăn được xây dựng theo kiến trúc microservice, bao gồm các thành phần chính sau:

1. **API Gateway**: Điểm vào duy nhất của hệ thống, xử lý và định tuyến các request từ client đến các service tương ứng.

2. **Food Service**: Quản lý thông tin về món ăn, danh mục, giá cả.

3. **Order Service**: Xử lý việc tạo đơn hàng, cập nhật trạng thái đơn hàng.

4. **User Service**: Quản lý thông tin người dùng, xác thực và phân quyền.

5. **Database**: Mỗi service sử dụng một database SQLite riêng biệt.

### Sơ đồ kiến trúc

```
┌─────────────┐      ┌─────────────┐
│             │      │             │
│   Client    │◄────►│ API Gateway │
│             │      │             │
└─────────────┘      └──────┬──────┘
                            │
                            ▼
     ┌────────────┬─────────┴────────┬────────────┐
     │            │                  │            │
     ▼            ▼                  ▼            ▼
┌─────────┐  ┌─────────┐       ┌─────────┐  ┌─────────┐
│  Food   │  │  Order  │       │  User   │  │  Other  │
│ Service │  │ Service │       │ Service │  │Services │
└────┬────┘  └────┬────┘       └────┬────┘  └────┬────┘
     │            │                  │            │
     ▼            ▼                  ▼            ▼
┌─────────┐  ┌─────────┐       ┌─────────┐  ┌─────────┐
│  Food   │  │  Order  │       │  User   │  │  Other  │
│   DB    │  │   DB    │       │   DB    │  │   DBs   │
└─────────┘  └─────────┘       └─────────┘  └─────────┘
```

## Kiến trúc Microservice

### Ưu điểm của kiến trúc Microservice

1. **Tính module hóa cao**: Mỗi service có thể được phát triển, triển khai và mở rộng độc lập.

2. **Công nghệ đa dạng**: Mỗi service có thể sử dụng công nghệ phù hợp nhất với yêu cầu của nó.

3. **Khả năng mở rộng**: Có thể mở rộng từng service riêng biệt dựa trên nhu cầu.

4. **Fault isolation**: Lỗi trong một service không ảnh hưởng đến toàn bộ hệ thống.

5. **Phát triển song song**: Các team có thể làm việc trên các service khác nhau cùng lúc.

### Chi tiết từng Service

#### API Gateway

- **Chức năng**: 
  - Định tuyến request đến service tương ứng
  - Xác thực và phân quyền
  - Rate limiting
  - Request/Response transformation
  - Logging và monitoring

- **Công nghệ**: 
  - Express.js
  - gRPC clients để giao tiếp với các service
  - JWT cho xác thực

#### Food Service

- **Chức năng**:
  - CRUD operations cho món ăn
  - Quản lý danh mục món ăn
  - Quản lý giá cả và tình trạng món ăn

- **Công nghệ**:
  - Node.js/TypeScript
  - gRPC server
  - Prisma ORM
  - SQLite database

#### Order Service

- **Chức năng**:
  - Tạo đơn hàng mới
  - Cập nhật trạng thái đơn hàng
  - Quản lý chi tiết đơn hàng
  - Tính toán tổng tiền

- **Công nghệ**:
  - Node.js/TypeScript
  - gRPC server
  - Prisma ORM
  - SQLite database

#### User Service

- **Chức năng**:
  - Đăng ký và đăng nhập người dùng
  - Quản lý thông tin người dùng
  - Phân quyền người dùng
  - Xác thực và tạo JWT token

- **Công nghệ**:
  - Node.js/TypeScript
  - gRPC server
  - Prisma ORM
  - SQLite database
  - bcrypt cho mã hóa mật khẩu
  - JWT cho authentication

## Giao tiếp giữa các Service

### gRPC Communication

Hệ thống sử dụng gRPC để giao tiếp giữa API Gateway và các service, cũng như giữa các service với nhau.

#### Ưu điểm của gRPC

1. **Hiệu suất cao**: Sử dụng Protocol Buffers và HTTP/2 giúp giao tiếp nhanh hơn so với REST.

2. **Strongly typed**: Định nghĩa rõ ràng các message và service interfaces.

3. **Code generation**: Tự động sinh code client và server từ proto files.

4. **Bidirectional streaming**: Hỗ trợ streaming hai chiều.

5. **Language agnostic**: Hỗ trợ nhiều ngôn ngữ lập trình.

#### Luồng giao tiếp gRPC

1. Client gửi request đến API Gateway.
2. API Gateway xác định service cần gọi và chuyển đổi request thành gRPC call.
3. Service xử lý gRPC call và trả về response.
4. API Gateway chuyển đổi gRPC response thành HTTP response và trả về cho client.

### Service-to-Service Communication

Trong một số trường hợp, các service cần giao tiếp trực tiếp với nhau:

- **Order Service** cần thông tin về món ăn từ **Food Service**.
- **Order Service** cần thông tin về người dùng từ **User Service**.

Luồng giao tiếp giữa các service:

1. Service A cần dữ liệu từ Service B.
2. Service A tạo gRPC client để gọi đến Service B.
3. Service B xử lý request và trả về response.
4. Service A nhận và xử lý response.

## Luồng dữ liệu

### Luồng tạo đơn hàng

1. **Client** gửi request tạo đơn hàng đến **API Gateway**.
2. **API Gateway** xác thực user và chuyển request đến **Order Service**.
3. **Order Service** kiểm tra thông tin người dùng thông qua **User Service**.
4. **Order Service** kiểm tra thông tin món ăn thông qua **Food Service**.
5. **Order Service** tạo đơn hàng mới trong database.
6. **Order Service** trả về thông tin đơn hàng cho **API Gateway**.
7. **API Gateway** trả về response cho **Client**.

### Luồng xác thực người dùng

1. **Client** gửi thông tin đăng nhập đến **API Gateway**.
2. **API Gateway** chuyển request đến **User Service**.
3. **User Service** kiểm tra thông tin đăng nhập.
4. Nếu hợp lệ, **User Service** tạo JWT token và trả về cho **API Gateway**.
5. **API Gateway** trả về token cho **Client**.
6. **Client** sử dụng token này cho các request tiếp theo.

## Bảo mật

### Authentication và Authorization

1. **JWT Authentication**:
   - User đăng nhập và nhận JWT token.
   - Token chứa thông tin về user và quyền hạn.
   - Token được gửi kèm trong header của mỗi request.
   - API Gateway xác thực token trước khi chuyển request đến service.

2. **Role-based Authorization**:
   - Mỗi user có một role cụ thể (ADMIN, STAFF, CUSTOMER).
   - API Gateway kiểm tra role của user trước khi cho phép truy cập vào các endpoint nhất định.
   - Ví dụ: Chỉ ADMIN mới có thể thêm/sửa/xóa món ăn.

### Data Security

1. **Password Hashing**:
   - Mật khẩu được mã hóa bằng bcrypt trước khi lưu vào database.
   - Không bao giờ lưu trữ mật khẩu dưới dạng plain text.

2. **HTTPS**:
   - Tất cả giao tiếp giữa client và API Gateway đều sử dụng HTTPS.
   - Dữ liệu được mã hóa trong quá trình truyền tải.

3. **Input Validation**:
   - Tất cả input từ user đều được validate kỹ lưỡng.
   - Sử dụng prepared statements để tránh SQL injection.

## Khả năng mở rộng

### Horizontal Scaling

1. **Stateless Services**:
   - Các service được thiết kế để stateless, cho phép dễ dàng scale horizontally.
   - Nhiều instance của cùng một service có thể chạy song song.

2. **Load Balancing**:
   - Sử dụng load balancer để phân phối traffic giữa các instance của service.
   - Health checks để đảm bảo traffic chỉ được định tuyến đến các instance healthy.

### Vertical Scaling

1. **Resource Allocation**:
   - Có thể tăng resources (CPU, memory) cho các service cần thiết.
   - Monitoring để xác định service nào cần thêm resources.

### Database Scaling

1. **Sharding**:
   - Chia database thành nhiều shards dựa trên một số tiêu chí (ví dụ: user ID).
   - Mỗi shard chứa một phần dữ liệu.

2. **Read Replicas**:
   - Tạo các read replicas để giảm tải cho primary database.
   - Sử dụng read replicas cho các query chỉ đọc.

## Monitoring và Logging

### Centralized Logging

1. **Log Aggregation**:
   - Tất cả logs từ các service được gửi đến một hệ thống log centralized.
   - Sử dụng ELK Stack (Elasticsearch, Logstash, Kibana) hoặc tương tự.

2. **Structured Logging**:
   - Logs được format theo một cấu trúc nhất định.
   - Bao gồm thông tin như timestamp, service name, log level, message, context.

### Application Monitoring

1. **Health Checks**:
   - Mỗi service cung cấp endpoint `/health` để kiểm tra trạng thái.
   - Load balancer sử dụng health checks để định tuyến traffic.

2. **Metrics Collection**:
   - Thu thập metrics như response time, error rate, throughput.
   - Sử dụng Prometheus hoặc tương tự để lưu trữ và query metrics.

3. **Alerting**:
   - Thiết lập alerts dựa trên thresholds của các metrics.
   - Gửi notifications khi có vấn đề xảy ra.

4. **Distributed Tracing**:
   - Theo dõi request khi nó đi qua các service khác nhau.
   - Xác định bottlenecks và latency issues.

---

Kiến trúc này cung cấp một hệ thống linh hoạt, có khả năng mở rộng và dễ bảo trì. Mỗi service có thể được phát triển và triển khai độc lập, giúp tăng tốc độ phát triển và giảm thiểu rủi ro khi triển khai các tính năng mới.