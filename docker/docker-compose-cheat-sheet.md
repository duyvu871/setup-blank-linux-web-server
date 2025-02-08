# Docker Compose Cheat Sheet

## 1. Giới thiệu chung

- **Docker Compose** cho phép bạn định nghĩa và chạy nhiều container Docker cùng lúc dưới dạng một ứng dụng đa dịch vụ.
- File cấu hình của Docker Compose sử dụng định dạng YAML.
- Bạn có thể khai báo các service, network, volume, secret, … và dễ dàng quản lý vòng đời của chúng qua các lệnh như `up`, `down`, `logs`,…

---

## 2. Cấu trúc file docker-compose.yml

Một file `docker-compose.yml` cơ bản có cấu trúc sau:

```yaml
version: "3.8"  # Phiên bản của Docker Compose file (3.8 được khuyến nghị cho các dự án mới)

services:         # Định nghĩa các service (container) của ứng dụng
  service_name:
    image: image_name:tag         # Sử dụng image có sẵn từ Docker Hub hoặc registry
    build:                        # (Tùy chọn) Build image từ Dockerfile
      context: .                  # Thư mục build context
      dockerfile: path/to/Dockerfile
    command: ["executable", "arg1", "arg2"]  # Ghi đè command mặc định
    entrypoint: ["entrypoint", "arg1"]         # Ghi đè entrypoint
    environment:                  # Các biến môi trường
      - ENV_VAR=value
      - ANOTHER_VAR=another_value
    env_file:                     # Đọc các biến môi trường từ file
      - .env
    ports:                        # Mapping port: "host:container"
      - "80:80"
    volumes:                      # Mount volume từ host vào container
      - ./host_path:/container_path
    depends_on:                   # Khai báo phụ thuộc (service này khởi chạy sau service kia)
      - another_service
    restart: always               # Chính sách restart (no, on-failure, always, unless-stopped)
    healthcheck:                  # Kiểm tra tình trạng của container
      test: ["CMD-SHELL", "curl -f http://localhost/ || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

volumes:          # Định nghĩa volume dùng chung cho nhiều service
  volume_name:

networks:         # Định nghĩa các network tùy chỉnh (mặc định có network bridge)
  network_name:
    driver: bridge

secrets:          # (Docker Compose 3.1+) Quản lý bí mật (nếu cần)
  secret_name:
    file: ./secret_file
```

---

## 3. Các thành phần chính và best practices

### 3.1. Phiên bản (version)
- Sử dụng phiên bản mới nhất tương thích với Docker Engine của bạn (ví dụ: `3.8`).

### 3.2. Services
- **image vs build:**  
  - Dùng `image` nếu bạn sử dụng image đã được build sẵn.  
  - Dùng `build` để xây dựng image từ Dockerfile.
- **command/entrypoint:** Ghi đè lệnh mặc định của image khi cần.
- **environment & env_file:**  
  - Sử dụng `environment` để khai báo biến môi trường trực tiếp.  
  - Sử dụng `env_file` để load file chứa biến môi trường (nhớ rằng file này phải nằm trong build context hoặc đường dẫn tương đối đúng).
- **ports:** Mapping port từ container ra host, đảm bảo không bị xung đột.
- **volumes:**  
  - Định nghĩa volume cho dữ liệu cần được lưu lại giữa các lần chạy container.  
  - Sử dụng bind mounts (đường dẫn host) cho các file cấu hình, backup, …  
  - Đặt tên volume rõ ràng để tránh xung đột.
- **depends_on:** Đảm bảo thứ tự khởi động các service nhưng không chờ service phụ hoàn toàn sẵn sàng (sử dụng `healthcheck` để kiểm tra readiness).
- **restart:** Thiết lập restart policy (ví dụ: `always`, `unless-stopped`) để tự động khởi động lại container khi bị crash.
- **healthcheck:** Rất quan trọng để giám sát tình trạng service, giúp orchestrator có thể xử lý lỗi sớm.

### 3.3. Volumes & Networks
- **Volumes:**  
  - Định nghĩa volumes dùng cho dữ liệu cần được lưu trữ lâu dài (database data, backup files, …).  
  - Ví dụ: `postgres_data:`, `backup_volume:`.
- **Networks:**  
  - Định nghĩa network tùy chỉnh giúp liên kết các container cùng giao tiếp với nhau.  
  - Ví dụ: tạo network `backend` cho các service nội bộ.

### 3.4. Secrets (nếu cần)
- Dùng để lưu các thông tin nhạy cảm như mật khẩu, API key mà không cần đặt trực tiếp vào file cấu hình.

---

## 4. Ví dụ Docker Compose đầy đủ (Có Backup DB định kỳ)

Giả sử bạn có một ứng dụng sử dụng PostgreSQL, kèm theo service backup định kỳ. Cấu trúc thư mục dự án:

```
project/
├── docker-compose.yml
├── Dockerfile            # Dockerfile cho service postgres (nếu cần build)
├── .env                  # File biến môi trường
├── init-db/              # Thư mục init script cho postgres
├── backups/              # Thư mục mount volume để lưu backup
└── backup.sh             # Script backup định kỳ
```

### 4.1. File backup.sh  
Script này dùng để thực hiện backup định kỳ bằng pg_dump và lưu vào thư mục `/backup` (được mount từ `./backups`):

```bash
#!/bin/bash
set -e

# Cấu hình (có thể override bằng biến môi trường)
DB_HOST="${DB_HOST:-postgres}"  # Sử dụng tên service postgres nếu chạy trong network nội bộ
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-${DB_POSTGRES_USER:-myuser}}"
DB_PASSWORD="${DB_PASSWORD:-${DB_POSTGRES_PASSWORD:-mypassword}}"
DB_NAME="${DB_NAME:-${DB_POSTGRES_DATABASE:-mydatabase}}"
BACKUP_DIR="${BACKUP_DIR:-/backup}"
BACKUP_INTERVAL="${BACKUP_INTERVAL:-86400}"  # Mặc định 24 giờ

# Export mật khẩu cho pg_dump
export PGPASSWORD="$DB_PASSWORD"

# Tạo thư mục backup nếu chưa có
mkdir -p "$BACKUP_DIR"

echo "Bắt đầu backup định kỳ database '$DB_NAME' từ $DB_HOST"

while true; do
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_backup_${TIMESTAMP}.sql"
    echo "[$(date)] Backup bắt đầu: ${BACKUP_FILE}"
    
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo "[$(date)] Backup thành công: ${BACKUP_FILE}"
    else
        echo "[$(date)] Backup thất bại"
    fi
    
    echo "[$(date)] Chờ ${BACKUP_INTERVAL} giây..."
    sleep "$BACKUP_INTERVAL"
done
```

> **Chú ý:**  
> - Đảm bảo file `backup.sh` có quyền thực thi:  
>   ```bash
>   chmod +x backup.sh
>   ```
> - Khi chạy trong Docker, bạn có thể mount file này vào container backup.

### 4.2. File docker-compose.yml

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    container_name: erado_postgres
    env_file:
      - .env
    environment:
      POSTGRES_USER: ${DB_POSTGRES_USER}
      POSTGRES_PASSWORD: ${DB_POSTGRES_PASSWORD}
      POSTGRES_DB: ${DB_POSTGRES_DATABASE}
      POSTGRES_HOST_AUTH_METHOD: trust
    ports:
      - "5432:5432"
    volumes:
      - postgres_erado:/var/lib/postgresql/data
      - ./init-db:/docker-entrypoint-initdb.d
      - ./backups:/backup
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_POSTGRES_USER} -d ${DB_POSTGRES_DATABASE}"]
      interval: 10s
      timeout: 10s
      retries: 5
      start_period: 30s
    command:
      - "postgres"
      - "-c"
      - "shared_buffers=256MB"
      - "-c"
      - "work_mem=32MB"

  backup:
    image: postgres:15-alpine  # Sử dụng image có sẵn pg_dump
    container_name: erado_backup
    depends_on:
      - postgres
    env_file:
      - .env
    volumes:
      - ./backups:/backup
      - ./backup.sh:/backup.sh:ro
    entrypoint: ["/bin/sh", "-c", "/backup.sh"]
    restart: always

volumes:
  postgres_erado:
```

### Giải thích:
- **Service postgres:**  
  - Sử dụng image PostgreSQL 15 trên Alpine.
  - Mount volume `postgres_erado` để lưu dữ liệu.
  - Mount thư mục `./init-db` cho các script khởi tạo.
  - Mount thư mục `./backups` vào `/backup` để lưu file backup.
  - Có healthcheck đảm bảo service sẵn sàng.
- **Service backup:**  
  - Sử dụng image PostgreSQL 15 Alpine vì đã có sẵn `pg_dump`.
  - Phụ thuộc vào service postgres (`depends_on`).
  - Mount file `backup.sh` (chỉ đọc) và thư mục `./backups`.
  - Sử dụng `entrypoint` chạy script backup định kỳ.
  - Sử dụng `restart: always` để đảm bảo nếu service bị crash, nó tự khởi động lại.

---

## 5. Các lệnh Docker Compose thường dùng

- **Build và chạy container:**
  ```bash
  docker-compose up --build
  ```
- **Chạy container ở chế độ nền (detached):**
  ```bash
  docker-compose up -d
  ```
- **Xem log:**
  ```bash
  docker-compose logs -f
  ```
- **Dừng container:**
  ```bash
  docker-compose down
  ```
- **Xóa toàn bộ volume (nếu cần reset dữ liệu):**
  ```bash
  docker-compose down -v
  ```

---

## 6. Một số lưu ý bổ sung

- **Quản lý môi trường và secrets:**  
  - Sử dụng file `.env` hoặc `env_file` trong docker-compose để quản lý biến môi trường.
  - Với thông tin nhạy cảm, cân nhắc sử dụng `secrets` (Docker Compose phiên bản ≥ 3.1) hoặc sử dụng giải pháp quản lý bí mật khác.
- **Giám sát và logging:**  
  - Cấu hình healthcheck cho từng service.
  - Sử dụng logging driver của Docker để thu thập log.
- **Restart Policy:**  
  - Đặt `restart: always` hoặc `unless-stopped` để tự động khởi động lại container khi xảy ra lỗi.
- **Volume và Network:**  
  - Đặt tên volume cụ thể để tránh xung đột giữa các dự án.
  - Sử dụng network riêng cho các container giao tiếp nội bộ.

---

Với cheat sheet này, bạn có thể triển khai một hệ thống container riêng biệt với các service tách biệt (ví dụ: database, backup, web app) đồng thời có cơ chế backup định kỳ và các cấu hình phòng tránh xung đột. Hy vọng tài liệu trên sẽ giúp ích cho bạn trong việc triển khai và quản lý các ứng dụng trên container.