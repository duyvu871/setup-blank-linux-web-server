# Redis Cheat Sheet

## 1. Giới thiệu & Cài đặt

- **Redis** là một in-memory data store, thường được dùng làm cache, message broker hay database NoSQL.
- **Cài đặt trên Linux (Ubuntu):**
  ```bash
  sudo apt update
  sudo apt install redis-server
  ```
- **Khởi động & kiểm tra trạng thái:**
  ```bash
  sudo systemctl start redis-server
  sudo systemctl status redis-server
  ```

---

## 2. Kết nối đến Redis

- **Kết nối bằng Redis CLI:**
  ```bash
  redis-cli
  ```
- **Kết nối tới host và port tùy chỉnh:**
  ```bash
  redis-cli -h 127.0.0.1 -p 6379
  ```

---

## 3. Các lệnh cơ bản

### 3.1. Quản lý Key

- **Đặt key với giá trị:**
  ```redis
  SET mykey "Hello, Redis!"
  ```
- **Lấy giá trị của key:**
  ```redis
  GET mykey
  ```
- **Xóa key:**
  ```redis
  DEL mykey
  ```
- **Kiểm tra key có tồn tại không:**
  ```redis
  EXISTS mykey
  ```
- **Đặt thời gian sống (TTL) cho key (tính bằng giây):**
  ```redis
  EXPIRE mykey 3600
  ```
- **Xem thời gian sống của key:**
  ```redis
  TTL mykey
  ```

### 3.2. Quản lý Keys (Tìm kiếm)

- **Tìm kiếm keys theo pattern:**
  ```redis
  KEYS user:*
  ```
  > *Lưu ý: Sử dụng `KEYS` trên môi trường production có thể gây ảnh hưởng hiệu năng, thay vào đó dùng `SCAN`.*

- **Duyệt keys theo kiểu phân trang (an toàn cho production):**
  ```redis
  SCAN 0 MATCH user:* COUNT 100
  ```

---

## 4. Các kiểu dữ liệu & Lệnh liên quan

### 4.1. Strings

- **SET & GET:**
  ```redis
  SET name "Alice"
  GET name
  ```
- **INCR/DECR (cho giá trị số):**
  ```redis
  SET counter 10
  INCR counter       # counter = 11
  DECR counter       # counter = 10
  ```
- **APPEND:**
  ```redis
  APPEND name " Smith"   # Nếu name = "Alice" => "Alice Smith"
  ```

### 4.2. Lists

- **LPUSH / RPUSH (thêm phần tử vào đầu/cuối danh sách):**
  ```redis
  LPUSH mylist "a"
  RPUSH mylist "b"
  ```
- **LPOP / RPOP (lấy phần tử đầu/cuối danh sách):**
  ```redis
  LPOP mylist
  RPOP mylist
  ```
- **LRANGE (lấy một khoảng phần tử):**
  ```redis
  LRANGE mylist 0 -1   # Lấy tất cả phần tử
  ```

### 4.3. Sets

- **SADD (thêm phần tử vào set):**
  ```redis
  SADD myset "apple"
  SADD myset "banana"
  ```
- **SMEMBERS (lấy tất cả phần tử của set):**
  ```redis
  SMEMBERS myset
  ```
- **SISMEMBER (kiểm tra phần tử có tồn tại):**
  ```redis
  SISMEMBER myset "apple"
  ```
- **SREM (xóa phần tử khỏi set):**
  ```redis
  SREM myset "banana"
  ```
- **SINTER, SUNION, SDIFF (phép giao, hợp, hiệu của set):**
  ```redis
  SINTER set1 set2
  SUNION set1 set2
  SDIFF set1 set2
  ```

### 4.4. Sorted Sets

- **ZADD (thêm phần tử với score vào sorted set):**
  ```redis
  ZADD leaderboard 100 "Alice"
  ZADD leaderboard 150 "Bob"
  ```
- **ZRANGE (lấy khoảng phần tử theo thứ tự tăng dần):**
  ```redis
  ZRANGE leaderboard 0 -1 WITHSCORES
  ```
- **ZRANGEBYSCORE (lấy phần tử theo khoảng điểm số):**
  ```redis
  ZRANGEBYSCORE leaderboard 100 200
  ```
- **ZREM (xóa phần tử khỏi sorted set):**
  ```redis
  ZREM leaderboard "Alice"
  ```

### 4.5. Hashes

- **HSET (đặt field của hash):**
  ```redis
  HSET user:1000 name "Alice" age "30"
  ```
- **HGET (lấy giá trị của field):**
  ```redis
  HGET user:1000 name
  ```
- **HMGET / HMSET (lấy/đặt nhiều field):**
  ```redis
  HMSET user:1000 name "Alice" age "30" city "Hanoi"
  HMGET user:1000 name age
  ```
- **HGETALL (lấy tất cả các field & value):**
  ```redis
  HGETALL user:1000
  ```

### 4.6. Streams (Redis 5.0+)

- **XADD (thêm entry vào stream):**
  ```redis
  XADD mystream * sensor-id 123 temperature 19.5
  ```
- **XRANGE (lấy entries từ stream):**
  ```redis
  XRANGE mystream - +
  ```

### 4.7. Pub/Sub

- **SUBSCRIBE (đăng ký kênh nhận thông báo):**
  ```redis
  SUBSCRIBE news
  ```
- **PUBLISH (gửi thông báo đến kênh):**
  ```redis
  PUBLISH news "Tin mới đây!"
  ```

---

## 5. Quản lý Server & Cấu hình

- **INFO (xem thông tin server):**
  ```redis
  INFO
  ```
- **MONITOR (giám sát các lệnh được thực thi):**
  ```redis
  MONITOR
  ```
- **CONFIG GET/SET (lấy/đặt cấu hình server):**
  ```redis
  CONFIG GET maxmemory
  CONFIG SET maxmemory 256mb
  ```
- **SAVE & BGSAVE (lưu dữ liệu vào RDB file):**
  ```redis
  SAVE     # Đồng bộ hóa, nhưng sẽ block server trong quá trình lưu
  BGSAVE   # Lưu dữ liệu ở background
  ```
- **SHUTDOWN (dừng Redis server):**
  ```redis
  SHUTDOWN
  ```

---

## 6. Persistence & Replication

### 6.1. Persistence

- **RDB (Snapshot):**  
  - Tạo file snapshot theo khoảng thời gian nhất định.
  - Cấu hình trong file `redis.conf` với các tham số `save`.

- **AOF (Append Only File):**  
  - Ghi nhận tất cả các lệnh write, cho phép khôi phục gần như mất 0 dữ liệu.
  - Cấu hình bằng tham số `appendonly yes` trong `redis.conf`.

### 6.2. Replication

- **Thiết lập slave:**  
  Trong file cấu hình hoặc qua lệnh:
  ```redis
  SLAVEOF <master-ip> <master-port>
  ```
- **Xem trạng thái replication:**
  ```redis
  INFO replication
  ```

---

## 7. Lua Scripting

- **EVAL (chạy script Lua):**
  ```redis
  EVAL "return 'Hello, Lua!'" 0
  ```
- **EVALSHA (chạy script đã được load trước đó):**
  ```redis
  SCRIPT LOAD "return 'Hello, SHA!'"
  # Lấy SHA được trả về và dùng EVALSHA sau đó:
  EVALSHA <sha> 0
  ```

---

## 8. Quản lý kết nối & Clients

- **CLIENT LIST (liệt kê các kết nối đang hoạt động):**
  ```redis
  CLIENT LIST
  ```
- **CLIENT KILL (ngắt kết nối của một client cụ thể):**
  ```redis
  CLIENT KILL <ip:port>
  ```

---

## 9. Một số lưu ý & best practices

- **Backup dữ liệu:**  
  - Kết hợp RDB và AOF để tối ưu giữa hiệu năng và độ an toàn của dữ liệu.
- **Giám sát và Logging:**  
  - Sử dụng `INFO`, `MONITOR` và các công cụ giám sát bên ngoài (như RedisInsight, Prometheus) để theo dõi tình trạng server.
- **Tối ưu bộ nhớ:**  
  - Cấu hình `maxmemory` và `maxmemory-policy` trong `redis.conf` để tránh hết bộ nhớ.
- **Bảo mật:**  
  - Sử dụng `requirepass` trong `redis.conf` để bảo vệ Redis server.
  - Thiết lập firewall và network segmentation để hạn chế truy cập từ bên ngoài.

---