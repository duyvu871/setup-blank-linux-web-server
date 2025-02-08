Dưới đây là Docker Cheat Sheet đầy đủ dành cho DevOps Engineer, bao gồm cả ví dụ thực tế và best practices cho backup database và xử lý xung đột:

---

### **1. Docker CLI Cơ Bản**
#### **Quản lý Container**
| Lệnh | Mô tả | Ví dụ |
|------|-------|-------|
| `docker run` | Chạy container từ image | `docker run -d --name myapp -p 8080:80 nginx:alpine` |
| `docker start/stop/restart` | Quản lý trạng thái container | `docker stop myapp` |
| `docker exec` | Chạy lệnh trong container đang chạy | `docker exec -it myapp sh` |
| `docker ps` | Liệt kê container đang chạy | `docker ps -a` (xem cả container đã dừng) |
| `docker rm` | Xóa container | `docker rm -f myapp` (force xóa) |
| `docker logs` | Xem logs container | `docker logs -f --tail 100 myapp` |

#### **Quản lý Image**
| Lệnh | Mô tả | Ví dụ |
|------|-------|-------|
| `docker build` | Build image từ Dockerfile | `docker build -t myapp:v1 .` |
| `docker push/pull` | Đẩy/tải image từ registry | `docker pull postgres:14` |
| `docker images` | Liệt kê images | `docker images --filter "dangling=true"` |
| `docker rmi` | Xóa image | `docker rmi myapp:v1` |

#### **Network & Volume**
| Lệnh | Mô tả | Ví dụ |
|------|-------|-------|
| `docker network create` | Tạo network | `docker network create mynet` |
| `docker volume create` | Tạo volume | `docker volume create db_data` |
| `docker inspect` | Xem thông tin chi tiết | `docker inspect myapp` |

---

### **2. Docker Compose**
#### **Ví dụ File `docker-compose.yml`**
```yaml
version: '3.8'

services:
web:
    image: nginx:alpine
    ports:
        - "8080:80"
    networks:
        - mynet
    depends_on:
        - db

db:
    image: postgres:14
    environment:
        POSTGRES_PASSWORD: mysecret
    volumes:
        - db_data:/var/lib/postgresql/data
        - ./backups:/backups  # Mount thư mục backup
    networks:
        - mynet
    healthcheck:
        test: ["CMD-SHELL", "pg_isready -U postgres"]
        interval: 5s

volumes:
    db_data:

networks:
    mynet:
```

#### **Lệnh Docker Compose**
| Lệnh | Mô tả | Ví dụ |
|------|-------|-------|
| `docker-compose up` | Khởi động services | `docker-compose up -d` |
| `docker-compose down` | Dừng và xóa services | `docker-compose down -v` (xóa cả volume) |
| `docker-compose logs` | Xem logs | `docker-compose logs -f db` |
| `docker-compose exec` | Chạy lệnh trong service | `docker-compose exec db psql -U postgres` |

---

### **3. Backup Database (PostgreSQL Example)**
#### **Cấu trúc Thư mục**
```
/myapp
├── docker-compose.yml
├── backups/          # Thư mục chứa backup
└── scripts/
    └── backup.sh     # Script backup
```

#### **Script Backup (`backup.sh`)**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec db pg_dump -U postgres -Fc mydb > /backups/mydb_${DATE}.dump
```

#### **Cron Job để Tự Động Backup**
```bash
# Thêm vào crontab (chạy hàng ngày lúc 2AM)
0 2 * * * /path/to/scripts/backup.sh
```

#### **Restore Backup**
```bash
docker-compose exec -T db pg_restore -U postgres -d mydb < /backups/mydb_20231001.dump
```

---

### **4. Best Practices**
1. **Sử dụng Volume cho Dữ liệu DB**:
```yaml
volumes:
    - db_data:/var/lib/postgresql/data
```
- Tránh mất dữ liệu khi container bị xóa.

2. **Health Check**:
```yaml
healthcheck:
    test: ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
    interval: 30s
    timeout: 10s
    retries: 3
```

3. **Resource Limits** (Tránh xung đột tài nguyên):
```yaml
deploy:
    resources:
    limits:
        cpus: '0.5'
        memory: 512M
```

4. **Sử dụng `.dockerignore`**:
```
node_modules/
.git
*.log
```

5. **Multi-Stage Build** (Giảm kích thước image):
```Dockerfile
FROM golang:1.18 AS builder
WORKDIR /app
COPY . .
RUN go build -o myapp .

FROM alpine:latest
COPY --from=builder /app/myapp .
CMD ["./myapp"]
```

---

### **5. Troubleshooting**
| Vấn đề | Giải pháp |
|--------|-----------|
| Container crash trên startup | `docker logs <container_id>` |
| Xung đột port | `docker ps` để kiểm tra port đang được sử dụng |
| Out of Memory | Giới hạn memory bằng `-m 512m` |
| DB không kết nối được | Kiểm tra network và `depends_on` trong Compose |
| Permission issues với volume | Thêm `user: "1000:1000"` trong service |

---

### **6. Useful Tips**
- **Xóa tất cả container/images không dùng**:
```bash
docker system prune -a --volumes
```
- **Xem resource usage**:
```bash
docker stats
```
- **Chạy Container với Timezone**:
```bash
-e TZ=Asia/Ho_Chi_Minh
```

Hy vọng cheat sheet này giúp bạn triển khai hệ thống ổn định và xử lý sự cố hiệu quả! 🐳