# Sổ Tay Xử Lý Lỗi Docker Daemon - DevOps Troubleshooting

## Mục Lục

1. [Tổng quan](#tổng-quan)
2. [Framework Chẩn đoán nhanh](#framework-chẩn-đoán-nhanh)
3. [Nguyên nhân và Giải pháp](#nguyên-nhân-và-giải-pháp)
   - [Case 1: Docker Daemon không chạy](#case-1-docker-daemon-không-chạy)
   - [Case 2: Lỗi quyền truy cập Socket](#case-2-lỗi-quyền-truy-cập-socket)
   - [Case 3: Socket bị thiếu hoặc hỏng](#case-3-socket-bị-thiếu-hoặc-hỏng)
   - [Case 4: Lỗi Systemd Socket Activation](#case-4-lỗi-systemd-socket-activation)
   - [Case 5: Lỗi Context và Environment](#case-5-lỗi-context-và-environment)
   - [Case 6: Lỗi Firewall và SELinux](#case-6-lỗi-firewall-và-selinux)
4. [Kỹ thuật Debug nâng cao](#kỹ-thuật-debug-nâng-cao)
5. [Best Practices phòng ngừa](#best-practices-phòng-ngừa)
6. [Quy trình khôi phục khẩn cấp](#quy-trình-khôi-phục-khẩn-cấp)
7. [Decision Tree xử lý sự cố](#decision-tree-xử-lý-sự-cố)
8. [Monitoring và Alerting](#monitoring-và-alerting)
9. [Những lỗi thường gặp cần tránh](#những-lỗi-thường-gặp-cần-tránh)
10. [Tham khảo nhanh](#tham-khảo-nhanh)

---

## Tổng quan

Lỗi "Cannot connect to the Docker daemon" là một trong những vấn đề phổ biến nhất khi làm việc với Docker. Sổ tay này cung cấp phương pháp tiếp cận có hệ thống để chẩn đoán và xử lý từng trường hợp cụ thể dành cho DevOps Engineers.

**Lỗi thường gặp:**
- `Cannot connect to the Docker daemon at unix:///var/run/docker.sock`
- `permission denied while trying to connect to the Docker daemon socket`
- `docker: command not found` (sau khi cài đặt)

---

## Framework Chẩn đoán nhanh

### Bước 1: Đánh giá ban đầu
```bash
# Kiểm tra trạng thái daemon
sudo systemctl status docker

# Kiểm tra sự tồn tại của socket
ls -l /var/run/docker.sock /run/docker.sock

# Kiểm tra tiến trình
ps aux | grep dockerd

# Kiểm tra network listeners
sudo netstat -lnp | grep docker
# hoặc
sudo ss -lnp | grep docker
```

### Bước 2: Checklist nhanh
```bash
# One-liner để kiểm tra tổng quan
echo "=== DOCKER HEALTH CHECK ===" && \
echo "Daemon status: $(systemctl is-active docker)" && \
echo "Socket exists: $(ls /var/run/docker.sock 2>/dev/null && echo "YES" || echo "NO")" && \
echo "User in docker group: $(groups $USER | grep -q docker && echo "YES" || echo "NO")" && \
echo "Docker command test: $(docker --version 2>/dev/null || echo "FAILED")"
```

---

## Nguyên nhân và Giải pháp

### Case 1: Docker Daemon không chạy

**Triệu chứng:**
- `systemctl status docker` hiển thị `inactive (dead)` hoặc `failed`
- Không có tiến trình dockerd trong `ps aux`
- Lỗi: "Is the docker daemon running?"

**Chẩn đoán:**
```bash
sudo systemctl status docker
sudo journalctl -u docker.service -n 50
```

**Giải pháp:**
```bash
# Khởi động service
sudo systemctl start docker
sudo systemctl enable docker

# Nếu khởi động thất bại, kiểm tra logs
sudo journalctl -u docker.service --no-pager -l

# Các lỗi thường gặp và cách fix:

# 1. Kiểm tra dung lượng ổ đĩa
df -h
# Nếu full disk, dọn dẹp:
docker system prune -a
sudo rm -rf /var/lib/docker/tmp/*

# 2. Kiểm tra cấu hình Docker
sudo dockerd --validate
# Hoặc kiểm tra file config:
cat /etc/docker/daemon.json

# 3. Reset Docker data (CẢNH BÁO: Sẽ mất containers/images)
sudo systemctl stop docker
sudo rm -rf /var/lib/docker
sudo systemctl start docker

# 4. Kiểm tra và fix quyền thư mục
sudo chown -R root:root /var/lib/docker
sudo chmod 755 /var/lib/docker
```

**Lỗi cụ thể và cách xử lý:**
```bash
# Lỗi "failed to start daemon: layer does not exist"
sudo rm -rf /var/lib/docker/image
sudo systemctl restart docker

# Lỗi "failed to start daemon: error initializing graphdriver"
sudo rm -rf /var/lib/docker/overlay2
sudo systemctl restart docker

# Lỗi "address already in use"
sudo pkill dockerd
sudo systemctl start docker
```

---

### Case 2: Lỗi quyền truy cập Socket

**Triệu chứng:**
- Daemon đang chạy nhưng `docker ps` thất bại với user thường
- Hoạt động với `sudo docker ps` nhưng không với `docker ps`
- Lỗi permission denied

**Chẩn đoán:**
```bash
ls -l /var/run/docker.sock
groups $USER
id $USER
getent group docker
```

**Giải pháp:**
```bash
# Thêm user vào nhóm docker
sudo usermod -aG docker $USER

# Tạo nhóm docker nếu chưa có
sudo groupadd docker 2>/dev/null || true

# Fix quyền socket
sudo chown root:docker /var/run/docker.sock
sudo chmod 660 /var/run/docker.sock

# Áp dụng thay đổi nhóm (chọn 1 cách):
# Cách 1: Logout/login lại
# Cách 2: Shell session mới
newgrp docker
# Cách 3: Reset session
exec su -l $USER

# Kiểm tra sau khi fix
groups $USER | grep docker
docker ps
```

**Script tự động fix quyền:**
```bash
#!/bin/bash
# auto-fix-docker-permissions.sh
USER_NAME=${1:-$USER}

echo "Fixing Docker permissions for user: $USER_NAME"

# Add user to docker group
sudo usermod -aG docker $USER_NAME

# Fix socket permissions
if [ -S /var/run/docker.sock ]; then
    sudo chown root:docker /var/run/docker.sock
    sudo chmod 660 /var/run/docker.sock
    echo "Socket permissions fixed"
else
    echo "Socket not found, restarting Docker..."
    sudo systemctl restart docker
fi

echo "Please logout and login again, or run: newgrp docker"
```

---

### Case 3: Socket bị thiếu hoặc hỏng

**Triệu chứng:**
- Daemon đang chạy nhưng file socket không tồn tại
- Socket tồn tại nhưng bị hỏng/sai loại
- Symlink bị lỗi (trỏ về chính nó)

**Chẩn đoán:**
```bash
ls -l /var/run/docker.sock /run/docker.sock
file /var/run/docker.sock
sudo lsof | grep docker.sock
sudo netstat -lnp | grep docker.sock

# Kiểm tra loại file
stat /var/run/docker.sock
readlink /var/run/docker.sock
```

**Giải pháp:**
```bash
# Xóa socket bị hỏng
sudo rm -f /var/run/docker.sock /run/docker.sock

# Restart Docker hoàn toàn
sudo systemctl stop docker
sudo systemctl stop docker.socket
sudo systemctl start docker.socket
sudo systemctl start docker

# Verify socket được tạo
ls -l /var/run/docker.sock
sudo netstat -lnp | grep docker.sock

# Nếu vẫn không có, tạo thủ công
sudo systemctl stop docker
sudo rm -f /var/run/docker.sock
sudo systemctl start docker.socket
sudo systemctl start docker

# Kiểm tra socket hoạt động
echo -e "HEAD /_ping HTTP/1.0\r\n\r\n" | nc -U /var/run/docker.sock
```

**Script phát hiện và fix socket:**
```bash
#!/bin/bash
# fix-docker-socket.sh

check_socket() {
    local socket_path=$1
    if [ -S "$socket_path" ]; then
        echo "✓ Socket $socket_path exists and is valid"
        return 0
    elif [ -L "$socket_path" ]; then
        echo "⚠ Socket $socket_path is a symlink: $(readlink $socket_path)"
        return 1
    elif [ -e "$socket_path" ]; then
        echo "✗ Socket $socket_path exists but is not a socket"
        return 1
    else
        echo "✗ Socket $socket_path does not exist"
        return 1
    fi
}

echo "=== Docker Socket Health Check ==="
check_socket /var/run/docker.sock
check_socket /run/docker.sock

if ! check_socket /var/run/docker.sock; then
    echo "Attempting to fix socket..."
    sudo rm -f /var/run/docker.sock /run/docker.sock
    sudo systemctl restart docker.socket
    sudo systemctl restart docker
    sleep 3
    check_socket /var/run/docker.sock
fi
```

---

### Case 4: Lỗi Systemd Socket Activation

**Triệu chứng:**
- Socket tồn tại nhưng daemon không thể bind
- Nhiều socket hoặc đường dẫn sai
- Service và socket unit không đồng bộ

**Chẩn đoán:**
```bash
sudo systemctl status docker.socket
cat /lib/systemd/system/docker.socket
sudo systemctl list-sockets | grep docker
systemctl show docker.socket --property=Listen
```

**Giải pháp:**
```bash
# Kiểm tra socket unit file
sudo systemctl cat docker.socket

# Nội dung mong đợi phải có:
# [Socket]
# ListenStream=/var/run/docker.sock

# Fix socket activation
sudo systemctl daemon-reload
sudo systemctl restart docker.socket
sudo systemctl restart docker

# Verify socket activation
sudo systemctl is-active docker.socket
sudo systemctl is-active docker.service

# Nếu cần tạo lại unit file
sudo tee /etc/systemd/system/docker.socket.d/override.conf << 'EOF'
[Socket]
ListenStream=
ListenStream=/var/run/docker.sock
SocketMode=0660
SocketUser=root
SocketGroup=docker
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker.socket
```

**Kiểm tra và fix systemd dependencies:**
```bash
# Kiểm tra dependencies
systemctl list-dependencies docker.service
systemctl list-dependencies docker.socket

# Reset về mặc định nếu cần
sudo systemctl revert docker.service docker.socket
sudo systemctl daemon-reload
sudo systemctl restart docker.socket docker.service
```

---

### Case 5: Lỗi Context và Environment

**Triệu chứng:**
- Hoạt động cho một số user nhưng không cho user khác
- Hành vi không nhất quán giữa các terminal
- Lỗi TLS hoặc remote connection

**Chẩn đoán:**
```bash
docker context ls
echo $DOCKER_HOST
env | grep -i docker
docker version --format '{{.Client.Context}}'
```

**Giải pháp:**
```bash
# Reset về default context
docker context use default

# Xóa các biến môi trường có vấn đề
unset DOCKER_HOST
unset DOCKER_TLS_VERIFY
unset DOCKER_CERT_PATH
unset DOCKER_API_VERSION

# Thêm vào shell profile nếu cần
echo 'unset DOCKER_HOST' >> ~/.bashrc
echo 'unset DOCKER_TLS_VERIFY' >> ~/.bashrc
source ~/.bashrc

# Tạo context mới nếu cần
docker context create local --docker host=unix:///var/run/docker.sock
docker context use local

# Kiểm tra context hoạt động
docker context inspect
docker info
```

**Script cleanup environment:**
```bash
#!/bin/bash
# cleanup-docker-env.sh

echo "Cleaning up Docker environment variables..."

# List current Docker env vars
echo "Current Docker environment:"
env | grep -i docker || echo "No Docker environment variables found"

# Unset problematic variables
unset DOCKER_HOST
unset DOCKER_TLS_VERIFY
unset DOCKER_CERT_PATH
unset DOCKER_API_VERSION
unset DOCKER_CONFIG

# Reset context
docker context use default 2>/dev/null || echo "Could not reset context"

# Test connection
if docker info >/dev/null 2>&1; then
    echo "✓ Docker connection successful"
else
    echo "✗ Docker connection still failing"
fi
```

---

### Case 6: Lỗi Firewall và SELinux

**Triệu chứng:**
- Permission denied mặc dù ownership đúng
- Hoạt động với root nhưng không với user thường
- Lỗi AVC trong audit logs

**Chẩn đoán:**
```bash
# Kiểm tra SELinux status
sestatus
sudo ausearch -m avc -ts recent | grep docker

# Kiểm tra firewall
sudo iptables -L | grep docker
sudo ufw status
getenforce 2>/dev/null || echo "SELinux not available"

# Kiểm tra security context
ls -Z /var/run/docker.sock
ps -eZ | grep dockerd
```

**Giải pháp:**
```bash
# SELinux fixes
sudo setsebool -P container_manage_cgroup on
sudo restorecon -R /var/run/docker.sock
sudo semanage fcontext -a -t container_runtime_exec_t /usr/bin/dockerd
sudo restorecon /usr/bin/dockerd

# Nếu SELinux quá nghiêm ngặt (không khuyến nghị production)
sudo setenforce 0
# Permanent (edit /etc/selinux/config):
# SELINUX=permissive

# Firewall rules (nếu cần)
sudo ufw allow from 127.0.0.1 to any port 2375
sudo ufw allow from 127.0.0.1 to any port 2376

# AppArmor fixes (Ubuntu)
sudo aa-status | grep docker
sudo aa-complain /usr/bin/dockerd
```

**Script SELinux troubleshooting:**
```bash
#!/bin/bash
# selinux-docker-fix.sh

if command -v getenforce >/dev/null 2>&1; then
    echo "SELinux status: $(getenforce)"
    
    if [ "$(getenforce)" = "Enforcing" ]; then
        echo "Checking Docker-related AVC denials..."
        sudo ausearch -m avc -ts recent | grep docker | tail -10
        
        echo "Applying SELinux fixes..."
        sudo setsebool -P container_manage_cgroup on
        sudo restorecon -R /var/run/docker.sock
        
        echo "✓ SELinux fixes applied"
    fi
else
    echo "SELinux not available on this system"
fi
```

---

## Kỹ thuật Debug nâng cao

### Debug Mode và Logging
```bash
# Chạy dockerd ở debug mode
sudo dockerd --debug --log-level=debug

# Monitor socket activity
sudo strace -e trace=connect docker ps 2>&1 | grep docker.sock

# Enable systemd debug logging
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo tee /etc/systemd/system/docker.service.d/debug.conf << 'EOF'
[Service]
Environment="DOCKERD_ROOTLESS_ROOTLESSKIT_FLAGS=--debug"
ExecStart=
ExecStart=/usr/bin/dockerd --debug -H fd:// --containerd=/run/containerd/containerd.sock
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

### System Resources Check
```bash
# Kiểm tra disk space
df -h /var/lib/docker
du -sh /var/lib/docker/*

# Kiểm tra memory
free -h
cat /proc/meminfo | grep -E "(MemTotal|MemAvailable)"

# Kiểm tra file descriptors
sudo lsof | wc -l
ulimit -n
echo "Docker process FDs:"
sudo lsof -p $(pgrep dockerd) | wc -l

# Kiểm tra inotify limits
cat /proc/sys/fs/inotify/max_user_watches
cat /proc/sys/fs/inotify/max_user_instances
```

### Network Diagnostics
```bash
# Test socket connectivity
echo -e "HEAD /_ping HTTP/1.0\r\n\r\n" | nc -U /var/run/docker.sock

# Check Docker API trực tiếp
curl --unix-socket /var/run/docker.sock http://localhost/_ping

# Test với socat
echo -e "GET /_ping HTTP/1.1\r\nHost: localhost\r\n\r\n" | socat - UNIX-CONNECT:/var/run/docker.sock

# Network namespace check
sudo ip netns list
sudo nsenter -t $(pgrep dockerd) -n ip addr
```

**Advanced debugging script:**
```bash
#!/bin/bash
# docker-advanced-debug.sh

echo "=== ADVANCED DOCKER DEBUGGING ==="

echo "1. Process Information:"
ps aux | grep dockerd
pgrep dockerd | xargs sudo lsof -p 2>/dev/null | grep sock

echo -e "\n2. Socket Information:"
find /var/run /run -name "*docker*" -type s 2>/dev/null
sudo netstat -xlnp | grep docker

echo -e "\n3. System Resources:"
echo "Disk usage: $(df -h /var/lib/docker | tail -1 | awk '{print $5}')"
echo "Memory usage: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')"
echo "File descriptors: $(sudo lsof | wc -l)"

echo -e "\n4. Docker Configuration:"
docker version 2>/dev/null || echo "Docker client not accessible"
docker info 2>/dev/null | head -10 || echo "Docker daemon not accessible"

echo -e "\n5. Systemd Status:"
systemctl is-active docker.service
systemctl is-active docker.socket
```

---

## Best Practices phòng ngừa

### 1. Monitoring Setup
```bash
# Thêm systemd monitoring
sudo systemctl enable docker.service
sudo systemctl enable docker.socket

# Health check script
sudo tee /usr/local/bin/docker-health-check << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/docker-health.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

if ! docker info >/dev/null 2>&1; then
    echo "[$DATE] Docker daemon unhealthy, attempting restart..." >> $LOG_FILE
    sudo systemctl restart docker
    sleep 5
    if docker info >/dev/null 2>&1; then
        echo "[$DATE] Docker daemon restart successful" >> $LOG_FILE
    else
        echo "[$DATE] Docker daemon restart failed" >> $LOG_FILE
        exit 1
    fi
else
    echo "[$DATE] Docker daemon healthy" >> $LOG_FILE
fi
EOF

sudo chmod +x /usr/local/bin/docker-health-check

# Add to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/docker-health-check") | crontab -
```

### 2. Log Rotation và Storage Management
```bash
# Configure Docker logging
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ]
}
EOF

sudo systemctl restart docker

# Auto cleanup script
sudo tee /usr/local/bin/docker-cleanup << 'EOF'
#!/bin/bash
echo "Starting Docker cleanup..."
docker system prune -f
docker volume prune -f
echo "Docker cleanup completed"
EOF

sudo chmod +x /usr/local/bin/docker-cleanup

# Weekly cleanup
(crontab -l 2>/dev/null; echo "0 2 * * 0 /usr/local/bin/docker-cleanup") | crontab -
```

### 3. User Management
```bash
# Script tự động setup user Docker
sudo tee /usr/local/bin/setup-docker-user << 'EOF'
#!/bin/bash
USER_NAME=$1

if [ -z "$USER_NAME" ]; then
    echo "Usage: $0 <username>"
    exit 1
fi

# Create docker group if not exists
sudo groupadd docker 2>/dev/null || true

# Add user to docker group
if id "$USER_NAME" &>/dev/null; then
    sudo usermod -aG docker "$USER_NAME"
    echo "Added $USER_NAME to docker group"
    echo "User needs to logout/login to apply changes"
else
    echo "User $USER_NAME does not exist"
    exit 1
fi

# Fix socket permissions
sudo chown root:docker /var/run/docker.sock 2>/dev/null || true
sudo chmod 660 /var/run/docker.sock 2>/dev/null || true
EOF

sudo chmod +x /usr/local/bin/setup-docker-user
```

### 4. Backup và Recovery
```bash
# Backup Docker configuration
sudo tee /usr/local/bin/backup-docker-config << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/docker-config"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup systemd files
sudo cp /lib/systemd/system/docker.* "$BACKUP_DIR/docker-systemd-$DATE.tar"

# Backup Docker daemon config
sudo cp /etc/docker/daemon.json "$BACKUP_DIR/daemon-$DATE.json" 2>/dev/null || true

# Backup user groups
getent group docker > "$BACKUP_DIR/docker-group-$DATE.txt"

echo "Docker configuration backed up to $BACKUP_DIR"
EOF

sudo chmod +x /usr/local/bin/backup-docker-config
```

---

## Quy trình khôi phục khẩn cấp

### Complete Docker Reset
```bash
#!/bin/bash
# emergency-docker-reset.sh
# CẢNH BÁO: Script này sẽ xóa tất cả containers, images, volumes

read -p "This will DESTROY all Docker data. Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled"
    exit 1
fi

echo "Starting emergency Docker reset..."

# Stop all Docker processes
sudo systemctl stop docker docker.socket
sudo pkill -f dockerd
sudo pkill -f docker-containerd

# Backup current config
sudo cp -r /etc/docker /tmp/docker-config-backup-$(date +%s) 2>/dev/null || true

# Remove Docker data
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
sudo rm -f /var/run/docker.sock

# Reset systemd
sudo systemctl daemon-reload
sudo systemctl reset-failed docker docker.socket

# Start fresh
sudo systemctl start docker.socket
sudo systemctl start docker

# Verify
sleep 5
if docker info >/dev/null 2>&1; then
    echo "✓ Docker reset successful"
    docker info
else
    echo "✗ Docker reset failed"
    exit 1
fi
```

### Service File Recovery
```bash
#!/bin/bash
# restore-docker-service-files.sh

echo "Restoring Docker service files..."

# Backup hiện tại
sudo cp /lib/systemd/system/docker.service /tmp/docker.service.backup.$(date +%s) 2>/dev/null || true

# Restore từ package (Ubuntu/Debian)
if command -v apt-get >/dev/null; then
    sudo apt-get install --reinstall docker-ce
# Restore từ package (RHEL/CentOS)
elif command -v yum >/dev/null; then
    sudo yum reinstall docker-ce
elif command -v dnf >/dev/null; then
    sudo dnf reinstall docker-ce
fi

sudo systemctl daemon-reload
sudo systemctl restart docker

echo "Service files restored and Docker restarted"
```

---

## Decision Tree xử lý sự cố

```
Lệnh Docker thất bại
├── Daemon có chạy không? (systemctl status docker)
│   ├── Không → Khởi động daemon → Kiểm tra logs → Fix config
│   │   ├── Start failed → Kiểm tra disk space
│   │   ├── Config error → Validate daemon.json
│   │   └── Permission error → Fix /var/lib/docker permissions
│   └── Có → Tiếp tục
├── Socket có tồn tại không? (ls -l /var/run/docker.sock)
│   ├── Không → Restart docker.socket → Tạo socket
│   │   ├── Socket still missing → Check systemd unit files
│   │   └── Socket created → Test connection
│   └── Có → Tiếp tục
├── Quyền đúng chưa? (ls -l + groups $USER)
│   ├── Chưa → Fix quyền → Thêm vào nhóm
│   │   ├── User not in docker group → usermod -aG docker
│   │   ├── Socket wrong permissions → chown root:docker
│   │   └── Need logout/login → newgrp docker
│   └── Đúng → Tiếp tục
├── Socket hoạt động chưa? (file /var/run/docker.sock)
│   ├── Chưa → Xóa + restart services
│   │   ├── Corrupted socket → rm + restart
│   │   ├── Wrong symlink → Fix symlink
│   │   └── SELinux issue → restorecon
│   └── Rồi → Tiếp tục
└── Vấn đề môi trường? (docker context ls + env)
    ├── Có → Reset context + environment
    │   ├── Wrong DOCKER_HOST → unset + use default context
    │   ├── TLS issues → Clear TLS env vars
    │   └── Multiple contexts → docker context use default
    └── Không → Debug nâng cao
        ├── Check system resources
        ├── Monitor socket activity
        ├── Review audit logs
        └── Emergency reset nếu cần
```

---

## Monitoring và Alerting

### Nagios/Icinga Check
```bash
#!/bin/bash
# /usr/local/lib/nagios/plugins/check_docker_daemon

CRITICAL=2
WARNING=1
OK=0

# Test Docker daemon
if timeout 10 docker info >/dev/null 2>&1; then
    echo "OK - Docker daemon is running and accessible"
    exit $OK
else
    # Try to get more specific error
    if ! systemctl is-active --quiet docker; then
        echo "CRITICAL - Docker service is not running"
        exit $CRITICAL
    elif [ ! -S /var/run/docker.sock ]; then
        echo "CRITICAL - Docker socket is missing"
        exit $CRITICAL
    else
        echo "CRITICAL - Docker daemon is not responding"
        exit $CRITICAL
    fi
fi
```

### Prometheus Metrics
```yaml
# docker-compose.yml cho monitoring
version: '3.8'
services:
  node-exporter:
    image: prom/node-exporter:latest
    command:
      - '--collector.systemd'
      - '--collector.processes'
      - '--path.rootfs=/host'
    volumes:
      - '/:/host:ro,rslave'
      - /var/run/docker.sock:/var/run/docker.sock:ro
    ports:
      - "9100:9100"
    
  docker-exporter:
    image: prom/container-exporter
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    ports:
      - "9104:9104"
```

### Zabbix Template
```bash
# Zabbix user parameter cho Docker
# File: /etc/zabbix/zabbix_agentd.d/docker.conf

UserParameter=docker.daemon.status,systemctl is-active docker | grep -c active
UserParameter=docker.socket.exists,[ -S /var/run/docker.sock ] && echo 1 || echo 0
UserParameter=docker.containers.running,docker ps -q | wc -l 2>/dev/null || echo 0
UserParameter=docker.images.count,docker images -q | wc -l 2>/dev/null || echo 0
UserParameter=docker.disk.usage,du -s /var/lib/docker 2>/dev/null | awk '{print $1}' || echo 0
```

### Automated Alerting Script
```bash
#!/bin/bash
# docker-alert-monitor.sh

ALERT_EMAIL="admin@company.com"
LOG_FILE="/var/log/docker-monitor.log"

check_docker_health() {
    local status="OK"
    local message=""
    
    # Check daemon
    if ! systemctl is-active --quiet docker; then
        status="CRITICAL"
        message="Docker daemon is not running"
    # Check socket
    elif [ ! -S /var/run/docker.sock ]; then
        status="CRITICAL"
        message="Docker socket is missing"
    # Check connectivity
    elif ! timeout 5 docker info >/dev/null 2>&1; then
        status="CRITICAL"
        message="Cannot connect to Docker daemon"
    # Check disk space
    elif [ $(df /var/lib/docker | tail -1 | awk '{print $5}' | sed 's/%//') -gt 90 ]; then
        status="WARNING"
        message="Docker disk usage over 90%"
    fi
    
    echo "$status:$message"
}

# Main monitoring loop
result=$(check_docker_health)
status=$(echo $result | cut -d: -f1)
message=$(echo $result | cut -d: -f2-)

timestamp=$(date '+%Y-%m-%d %H:%M:%S')
echo "[$timestamp] $status: $message" >> $LOG_FILE

if [ "$status" != "OK" ]; then
    # Send alert email
    echo "Docker Alert: $message" | mail -s "Docker $status Alert" $ALERT_EMAIL
    
    # Try auto-recovery for some issues
    if [[ "$message" == *"not running"* ]]; then
        systemctl start docker
    elif [[ "$message" == *"socket is missing"* ]]; then
        systemctl restart docker.socket
        systemctl restart docker
    fi
fi
```

---

## Những lỗi thường gặp cần tránh

### 1. Security Issues
```bash
# ❌ KHÔNG BAO GIỜ làm thế này trong production
chmod 777 /var/run/docker.sock
# ✅ Đúng cách
sudo chown root:docker /var/run/docker.sock
sudo chmod 660 /var/run/docker.sock
```

### 2. Resource Management
```bash
# ❌ Không kiểm tra disk space
docker pull large-image

# ✅ Kiểm tra trước khi pull
df -h /var/lib/docker
docker system df
docker system prune -f  # nếu cần
```

### 3. User Management
```bash
# ❌ Chạy Docker với root user
sudo docker run -u root dangerous-app

# ✅ Tạo user riêng cho container
docker run -u 1001:1001 app
```

### 4. Configuration Management
```bash
# ❌ Sửa systemd files trực tiếp
vim /lib/systemd/system/docker.service

# ✅ Dùng override directory
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo tee /etc/systemd/system/docker.service.d/override.conf << 'EOF'
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd --custom-option
EOF
```

### 5. Network và Socket
```bash
# ❌ Hardcode socket path trong scripts
docker -H unix:///var/run/docker.sock ps

# ✅ Dùng default hoặc environment variable
docker ps  # sử dụng default
DOCKER_HOST=unix:///var/run/docker.sock docker ps  # nếu cần custom
```

### Preventive Checklist
```bash
#!/bin/bash
# docker-health-checklist.sh

echo "=== DOCKER HEALTH CHECKLIST ==="

checks=(
    "systemctl is-active docker:Docker service running"
    "[ -S /var/run/docker.sock ]:Socket exists"
    "docker info >/dev/null 2>&1:Docker connectivity"
    "groups $USER | grep -q docker:User in docker group"
    "[ $(df /var/lib/docker | tail -1 | awk '{print $5}' | sed 's/%//') -lt 80 ]:Disk usage under 80%"
    "[ $(docker ps -aq | wc -l) -lt 100 ]:Container count reasonable"
    "docker system df | grep -v 'TYPE.*SIZE.*RECLAIMABLE':No excessive resource usage"
)

for check in "${checks[@]}"; do
    cmd=$(echo $check | cut -d: -f1)
    desc=$(echo $check | cut -d: -f2)
    
    if eval $cmd 2>/dev/null; then
        echo "✓ $desc"
    else
        echo "✗ $desc"
    fi
done
```

---

## Tham khảo nhanh

### Lệnh chẩn đoán một dòng
```bash
# Kiểm tra tổng quan Docker health
docker info 2>&1 | head -1; systemctl is-active docker; ls -l /var/run/docker.sock; groups $USER | grep docker

# Kiểm tra chi tiết về socket
ls -la /var/run/docker.sock /run/docker.sock; file /var/run/docker.sock; sudo netstat -lnp | grep docker

# Kiểm tra systemd services
systemctl status docker docker.socket --no-pager -l
```

### Quy trình restart hoàn toàn
```bash
# Full restart procedure
sudo systemctl stop docker docker.socket
sudo rm -f /var/run/docker.sock
sudo systemctl start docker.socket docker
sleep 3
docker ps
```

### Fix quyền nhanh
```bash
# Permission quick fix
sudo usermod -aG docker $USER
sudo chown root:docker /var/run/docker.sock
sudo chmod 660 /var/run/docker.sock
newgrp docker
```

### Emergency reset (NGUY HIỂM)
```bash
# CẢNH BÁO: Sẽ xóa tất cả containers và images
sudo systemctl stop docker
sudo rm -rf /var/lib/docker
sudo systemctl start docker
```

### Debugging commands
```bash
# Process debugging
ps aux | grep dockerd
sudo lsof -p $(pgrep dockerd) | grep sock

# Socket testing
echo -e "HEAD /_ping HTTP/1.0\r\n\r\n" | nc -U /var/run/docker.sock
curl --unix-socket /var/run/docker.sock http://localhost/_ping

# Log analysis
sudo journalctl -u docker.service -f
sudo journalctl -u docker.socket -f
```

### Environment cleanup
```bash
# Clean Docker environment
unset DOCKER_HOST DOCKER_TLS_VERIFY DOCKER_CERT_PATH
docker context use default
docker info
```

---

**Lưu ý quan trọng:** 
- Luôn backup dữ liệu quan trọng trước khi áp dụng các fix
- Test các giải pháp trong môi trường development trước
- Cập nhật sổ tay này dựa trên infrastructure cụ thể và phiên bản Docker của bạn
- Documentize các case đặc biệt xuất hiện trong môi trường production

**Version:** 1.0 - Updated: 2025-06-27  
**Author:** DevOps Team  
**Review:** Quarterly