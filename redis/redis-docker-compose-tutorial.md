Dưới đây là một ví dụ về file **docker-compose.yml** cấu hình Redis kèm theo giải thích cho từng mục cấu hình. File này sẽ:

- Sử dụng image Redis (phiên bản Alpine cho dung lượng nhỏ).
- Ánh xạ cổng để bạn có thể truy cập Redis từ host.
- Mount volume để lưu trữ dữ liệu Redis (dữ liệu sẽ được giữ lại khi container dừng hoặc xóa).
- Mount file cấu hình Redis tùy chỉnh (nếu bạn muốn thay đổi cấu hình mặc định).
- Cấu hình healthcheck để theo dõi trạng thái của Redis.
- Sử dụng restart policy để container tự khởi động lại nếu gặp sự cố.

---

### File: docker-compose.yml

```yaml
version: "3.8"

services:
  redis:
    image: redis:6.2-alpine
    container_name: my_redis
    ports:
      - "6379:6379"               # Mở cổng 6379 trên host và ánh xạ đến cổng 6379 trên container
    volumes:
      - redis_data:/data          # Volume để lưu dữ liệu Redis (rdb, aof, …)
      - ./redis.conf:/usr/local/etc/redis/redis.conf:ro  # Mount file cấu hình Redis tùy chỉnh từ host vào container (chỉ đọc)
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]  # Chạy redis-server với file cấu hình tùy chỉnh
    environment:
      - TZ=Asia/Ho_Chi_Minh        # Đặt múi giờ cho container
    restart: always               # Luôn tự động khởi động lại container nếu gặp sự cố
    healthcheck:                  # Kiểm tra tình trạng của Redis
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s               # Khoảng cách giữa các lần kiểm tra
      timeout: 5s                 # Thời gian chờ tối đa cho mỗi lần kiểm tra
      retries: 3                  # Số lần thử lại trước khi đánh dấu container không khỏe

volumes:
  redis_data:                     # Volume dùng để lưu trữ dữ liệu của Redis
```

---

### Hướng dẫn cho các config trong file:

1. **version: "3.8"**  
   - Xác định phiên bản của Docker Compose file. Phiên bản 3.8 là một phiên bản mới hỗ trợ nhiều tính năng của Docker Swarm và Docker Engine.

2. **services:**  
   - Mục này định nghĩa các container (service) sẽ được khởi chạy. Ở đây chỉ có 1 service tên là **redis**.

3. **image: redis:6.2-alpine**  
   - Sử dụng image Redis phiên bản 6.2 trên Alpine Linux. Phiên bản Alpine nhẹ và tiết kiệm dung lượng.

4. **container_name: my_redis**  
   - Đặt tên container là `my_redis` thay vì tên tự động được tạo bởi Docker.

5. **ports:**  
   - `"6379:6379"`: Ánh xạ cổng 6379 trên host đến cổng 6379 của container, cho phép bạn truy cập Redis từ bên ngoài.

6. **volumes:**  
   - `redis_data:/data`: Mount volume tên `redis_data` vào thư mục `/data` của container để lưu trữ dữ liệu Redis (RDB, AOF,…). Nhờ đó dữ liệu không bị mất khi container dừng hoặc xóa.
   - `./redis.conf:/usr/local/etc/redis/redis.conf:ro`: Mount file cấu hình Redis từ thư mục hiện hành trên host (file `redis.conf`) vào container tại đường dẫn mặc định của Redis. Tùy chọn `:ro` chỉ định file được mount với quyền chỉ đọc, giúp ngăn ngừa thay đổi không mong muốn.

7. **command: ["redis-server", "/usr/local/etc/redis/redis.conf"]**  
   - Ghi đè command mặc định của image để chạy Redis Server với file cấu hình tùy chỉnh mà bạn đã mount.

8. **environment:**  
   - `TZ=Asia/Ho_Chi_Minh`: Đặt biến môi trường cho múi giờ, giúp các log và thời gian bên trong container hiển thị đúng múi giờ.

9. **restart: always**  
   - Thiết lập restart policy để Docker tự động khởi động lại container nếu nó dừng hoặc gặp sự cố. Điều này giúp đảm bảo Redis luôn sẵn sàng.

10. **healthcheck:**  
    - **test:** Chạy lệnh `redis-cli ping` để kiểm tra xem Redis có phản hồi không. Nếu trả về `PONG` thì container được xem là khỏe mạnh.
    - **interval:** Kiểm tra trạng thái sau mỗi 10 giây.
    - **timeout:** Nếu lệnh kiểm tra mất hơn 5 giây thì đánh dấu thất bại.
    - **retries:** Nếu 3 lần liên tiếp không thành công, container sẽ được đánh dấu là không khỏe.

11. **volumes: redis_data:**  
    - Định nghĩa volume tên `redis_data` để lưu trữ dữ liệu. Volume này được quản lý bởi Docker và giúp đảm bảo dữ liệu không bị mất khi container được xóa.

---

### Cách sử dụng:

1. **Chuẩn bị file cấu hình Redis (redis.conf):**  
   - Tạo file `redis.conf` tại cùng thư mục với file docker-compose.yml. Bạn có thể sử dụng file mặc định của Redis và tùy chỉnh theo nhu cầu (ví dụ: cấu hình bảo mật, persistence, …).

2. **Khởi chạy Redis bằng Docker Compose:**
   ```bash
   docker-compose up -d
   ```
   - Lệnh này sẽ build và chạy container Redis ở chế độ nền (detached).

3. **Kiểm tra trạng thái:**
   ```bash
   docker-compose ps
   docker-compose logs redis
   ```
   - Xem logs và trạng thái container Redis.

4. **Dừng và xoá container:**
   ```bash
   docker-compose down
   ```
   - Lệnh này sẽ dừng và xoá các container được tạo bởi docker-compose. Nếu muốn xoá cả volume, thêm tùy chọn `-v`.

---