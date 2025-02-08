# Linux Cheat Sheet cho DevOps Engineers

## 1. **Lệnh Cơ Bản & Điều Hướng**

- **Hiển thị thư mục hiện hành:**
  ```bash
  pwd
  ```
- **Danh sách nội dung thư mục:**
  ```bash
  ls -alh
  ```
- **Điều hướng thư mục:**
  ```bash
  cd /path/to/directory
  cd ~         # Đến home directory
  cd -         # Quay lại thư mục trước đó
  ```
- **Tạo, sao chép, di chuyển, xóa file & thư mục:**
  ```bash
  mkdir new_folder
  touch file.txt
  cp file.txt /path/to/destination/
  mv file.txt new_file.txt
  rm file.txt
  rm -rf folder_name   # Xóa thư mục và nội dung bên trong
  ```

---

## 2. **Quản Lý File & Quyền Truy Cập**

- **Hiển thị nội dung file:**
  ```bash
  cat file.txt
  less file.txt
  tail -f file.log     # Xem log file theo thời gian thực
  ```
- **Chỉnh sửa quyền file:**
  ```bash
  chmod 644 file.txt           # Đọc/ghi cho chủ sở hữu, chỉ đọc cho group & others
  chmod +x script.sh           # Thêm quyền thực thi
  chown user:group file.txt    # Đổi chủ sở hữu và group
  ```
- **Tìm kiếm file & nội dung:**
  ```bash
  find /path -name "*.log"
  grep "error" /var/log/syslog
  grep -R "keyword" /path/to/directory/
  ```

---

## 3. **Quản Lý Tiến Trình (Process) & Dịch Vụ**

- **Liệt kê các tiến trình:**
  ```bash
  ps aux | less
  top            # Giám sát hệ thống theo thời gian thực
  htop           # Tương tự top nhưng giao diện thân thiện (cài đặt riêng)
  ```
- **Tìm kiếm tiến trình:**
  ```bash
  ps aux | grep process_name
  pgrep -fl process_name
  ```
- **Giết tiến trình:**
  ```bash
  kill <PID>
  kill -9 <PID>     # Bắt buộc dừng tiến trình (dùng khi cần thiết)
  ```
- **Quản lý dịch vụ với systemd:**
  ```bash
  systemctl status service_name
  systemctl start service_name
  systemctl stop service_name
  systemctl restart service_name
  systemctl enable service_name     # Tự động khởi động khi boot
  systemctl disable service_name
  journalctl -u service_name          # Xem log của service
  ```
- **Ví dụ kiểm tra trạng thái PostgreSQL:**
  ```bash
  systemctl status postgresql
  ```

---

## 4. **Quản Lý Mạng (Networking)**

- **Xem cấu hình mạng:**
  ```bash
  ip a
  ifconfig           # Cài đặt gói net-tools nếu cần
  ```
- **Kiểm tra kết nối:**
  ```bash
  ping google.com
  curl -I http://localhost:8080
  ```
- **Xem các kết nối mạng:**
  ```bash
  netstat -tulpn
  ss -tulpn
  ```
- **Xác định cổng đang lắng nghe:**
  ```bash
  lsof -i :80
  ```

---

## 5. **Quản Lý Ổ Đĩa & Hệ Thống File**

- **Xem dung lượng đĩa sử dụng:**
  ```bash
  df -h
  ```
- **Xem dung lượng thư mục:**
  ```bash
  du -sh /path/to/directory
  ```
- **Kiểm tra inode:**
  ```bash
  df -i
  ```
- **Mount/Unmount ổ đĩa:**
  ```bash
  mount /dev/sdX1 /mnt/point
  umount /mnt/point
  ```

---

## 6. **Quản Lý Gói (Package Management)**

### Debian/Ubuntu (APT):

- **Cập nhật danh sách gói và nâng cấp:**
  ```bash
  sudo apt update
  sudo apt upgrade -y
  ```
- **Cài đặt, gỡ bỏ, và tìm kiếm gói:**
  ```bash
  sudo apt install package_name
  sudo apt remove package_name
  sudo apt search package_name
  ```

### CentOS/RHEL (YUM/DNF):

- **Cập nhật hệ thống:**
  ```bash
  sudo yum update         # Hoặc dùng dnf trên các phiên bản mới
  ```
- **Cài đặt, gỡ bỏ, và tìm kiếm:**
  ```bash
  sudo yum install package_name
  sudo yum remove package_name
  sudo yum search package_name
  ```

---

## 7. **Backup & Khôi Phục Dữ Liệu**

### 7.1. **Backup File/Thư Mục bằng `tar`**

- **Tạo file nén (.tar.gz):**
  ```bash
  tar -czvf backup_$(date +"%Y%m%d").tar.gz /path/to/directory_or_file
  ```
- **Giải nén file:**
  ```bash
  tar -xzvf backup_20230101.tar.gz -C /destination/directory
  ```

### 7.2. **Backup CSDL PostgreSQL**

- **Backup sử dụng `pg_dump`:**
  ```bash
  pg_dump -h localhost -p 5432 -U myuser -d mydatabase > mydatabase_backup_$(date +"%Y%m%d").sql
  ```
- **Khôi phục sử dụng `psql` hoặc `pg_restore` (với file dump định dạng custom):**
  ```bash
  psql -h localhost -p 5432 -U myuser -d mydatabase < mydatabase_backup_20230101.sql
  # hoặc với custom dump file:
  pg_restore -h localhost -p 5432 -U myuser -d mydatabase mydatabase_custom.dump
  ```

### 7.3. **Lập lịch Backup định kỳ bằng Cron**

- **Mở crontab cho người dùng hiện tại:**
  ```bash
  crontab -e
  ```
- **Thêm dòng sau để chạy backup hàng ngày lúc 2 giờ sáng:**
  ```cron
  0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
  ```
- **Ví dụ nội dung script `backup.sh`:**
  ```bash
  #!/bin/bash
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  BACKUP_FILE="/backup/mydatabase_backup_${TIMESTAMP}.sql"
  pg_dump -h localhost -p 5432 -U myuser -d mydatabase > "$BACKUP_FILE"
  if [ $? -eq 0 ]; then
      echo "[$(date)] Backup thành công: ${BACKUP_FILE}"
  else
      echo "[$(date)] Backup thất bại"
  fi
  ```

---

## 8. **Quản Lý Log**

- **Xem log hệ thống với `journalctl`:**
  ```bash
  sudo journalctl -xe
  sudo journalctl -u service_name --since "2025-02-01" --until "2025-02-08"
  ```
- **Xem log kernel:**
  ```bash
  dmesg | less
  ```
- **Xem log ứng dụng nằm trong file (ví dụ, Apache, Nginx):**
  ```bash
  tail -f /var/log/nginx/error.log
  ```

---

## 9. **Quản Lý Người Dùng & Quyền**

- **Thêm người dùng mới:**
  ```bash
  sudo adduser username
  sudo passwd username
  ```
- **Thêm người dùng vào nhóm:**
  ```bash
  sudo usermod -aG groupname username
  ```
- **Xem danh sách người dùng:**
  ```bash
  cat /etc/passwd
  ```

---

## 10. **Một Số Công Cụ & Lệnh Hữu Ích Khác**

- **Sử dụng `screen` hoặc `tmux` để quản lý phiên làm việc dài hạn:**
  ```bash
  tmux new -s session_name
  tmux attach -t session_name
  ```
- **Xem sử dụng CPU và bộ nhớ:**
  ```bash
  free -h
  vmstat 1 5
  ```
- **Kiểm tra thông tin hệ thống:**
  ```bash
  uname -a
  lscpu
  lsblk
  ```
- **Tìm kiếm file theo nội dung:**
  ```bash
  grep -R "pattern" /path/to/search/
  ```
- **Sử dụng `rsync` để đồng bộ file/directory:**
  ```bash
  rsync -avh /source/directory/ /destination/directory/
  ```

---

## 11. **Best Practices & Lưu Ý**

- **Sử dụng SSH Keys:**  
  - Tạo và sử dụng SSH key thay vì mật khẩu để bảo mật khi kết nối đến server.
  
- **Backup Định Kỳ & Kiểm Tra:**  
  - Lập lịch backup với cron và kiểm tra file backup định kỳ để đảm bảo dữ liệu không bị mất.
  
- **Giám sát hệ thống:**  
  - Sử dụng các công cụ giám sát như Nagios, Zabbix, Prometheus, Grafana… để theo dõi tình trạng hệ thống.
  
- **Quản lý quyền truy cập:**  
  - Thiết lập tường lửa (iptables, ufw) và sử dụng SELinux/AppArmor nếu cần.
  
- **Ghi log & lưu trữ:**  
  - Thiết lập logrotate cho log files để tránh tình trạng đầy đĩa.
  
- **Bảo trì & Cập nhật thường xuyên:**  
  - Cập nhật hệ thống và các package bảo mật định kỳ.

---