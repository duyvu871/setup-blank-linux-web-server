# How to Restore Database Dumps for Postgres in a Docker Container

## Giới thiệu

Trước năm 2018, tôi chủ yếu sử dụng MySQL cùng với VirtualBox và Vagrant cho môi trường phát triển. Từ giữa năm 2018, tôi đã chuyển sang sử dụng Postgres và Docker – một bước tiến giúp tăng hiệu quả trong công việc. Tuy nhiên, việc thay đổi công nghệ cũng đòi hỏi tôi phải nắm vững các tác vụ thường xuyên như backup và restore cơ sở dữ liệu. Bài viết này sẽ tập trung hướng dẫn cách khôi phục (restore) database dump cho Postgres chạy bên trong Docker container bằng cách sử dụng lệnh `pg_restore`.

> **Lưu ý:**  
> Trong bài viết này, tôi chỉ trình bày một cách làm đơn giản nhằm giúp người mới bắt đầu dễ hiểu. Các cách tiếp cận khác cũng có thể được áp dụng tuỳ theo yêu cầu cụ thể của từng dự án.

---

## Kiến thức nền tảng về Docker và Postgres

Trước khi bắt đầu các bước restore, hãy nắm được một số điều cơ bản:

1. **Docker Volumes:**  
   Mỗi Docker container có các volume riêng, tương tự như các ổ đĩa cứng trên host. Khi bạn chạy lệnh như `pg_restore`, dump file cần phải có sẵn bên trong một volume của container.

2. **Thực thi lệnh bên trong container:**  
   Bạn có thể chạy các lệnh trong container bằng cách sử dụng cú pháp:  
   ```bash
   docker exec <container_name> <your_command>
   ```
3. **File dump cần có trong volume:**  
   Khi restore database dump, file dump phải nằm trong volume của container (ví dụ: đường dẫn `/backups` bên trong container).

4. **Các công cụ di chuyển file:**  
   Docker cung cấp lệnh `docker cp` để sao chép file giữa host và container, giúp bạn dễ dàng chuyển dump file từ host vào volume của container.

---

## Quy trình khôi phục database dump trong Docker

### **Bước 1: Xác định Container Postgres**

Đầu tiên, khởi động Docker và liệt kê các container đang chạy để tìm tên và ID của container Postgres:

```bash
docker ps
```

Ví dụ, bạn có thể thấy kết quả như sau:

```
CONTAINER ID   ...                  NAMES
abc985ddffcf  ...              my_postgres_1
```

### **Bước 2: Kiểm tra các Volume của Container**

Để biết được các volume được mount vào container, sử dụng lệnh sau:

```bash
docker inspect -f '{{ json .Mounts }}' <container_id> | python -m json.tool
```

Kết quả sẽ hiển thị thông tin các volume, ví dụ:

```json
[
    {
        "Type": "volume",
        "Name": "my_postgres_backup_local",
        "Source": "/var/lib/docker/volumes/my_postgres_backup_local/_data",
        "Destination": "/backups",
        "Driver": "local",
        "Mode": "rw",
        "RW": true,
        "Propagation": ""
    },
    {
        "Type": "volume",
        "Name": "my_postgres_data_local",
        "Source": "/var/lib/docker/volumes/my_postgres_data_local/_data",
        "Destination": "/var/lib/postgresql/data",
        "Driver": "local",
        "Mode": "rw",
        "RW": true,
        "Propagation": ""
    }
]
```

Ở đây, bạn có thể thấy các volume với đường dẫn đích là `/backups` và `/var/lib/postgresql/data`.

### **Bước 3: Copy File Dump vào Volume**

Chọn volume phù hợp (ở đây, ví dụ ta chọn volume `/backups`) và sao chép file dump từ host vào container:

```bash
docker cp </path/to/dump/in/host> <container_name>:<path_to_volume>
```

Ví dụ:

```bash
docker cp my_data.dump my_postgres_1:/backups
```

### **Bước 4: Thực thi Lệnh pg_restore từ Container**

Trước hết, hãy đảm bảo rằng database đích đã tồn tại. Nếu bạn không biết chủ sở hữu (owner) của database, bạn có thể kiểm tra bằng lệnh sau (chạy bên trong container):

```bash
docker exec my_postgres_1 psql -U postgres -l
```

Kết quả sẽ hiển thị danh sách các database và chủ sở hữu của chúng, ví dụ:

```
          List of databases
        Name        |  Owner   
--------------------+----------
some_database      | postgres 
```

Sau khi có đủ thông tin, chạy lệnh `pg_restore` bên trong container để khôi phục dump:

```bash
docker exec my_postgres_1 pg_restore -U postgres -d some_database /backups/my_data.dump
```

---

## Tổng Kết – Các Bước Restore Database Dump

1. **Xác định Container:**  
   Chạy `docker ps` để tìm tên và ID của container Postgres.

2. **Kiểm Tra Volume:**  
   Sử dụng `docker inspect` để xem các volume và xác định đường dẫn đích (ví dụ: `/backups`).

3. **Copy File Dump:**  
   Dùng `docker cp` để sao chép file dump từ host vào volume của container.

4. **Khôi Phục Dump:**  
   Chạy lệnh `pg_restore` bên trong container với cú pháp:
   ```bash
   docker exec <container_name> pg_restore -U <database_owner> -d <database_name> <path_to_dump>
   ```

---

## Kết Luận

Bài viết đã hướng dẫn chi tiết cách khôi phục database dump cho Postgres chạy trong Docker container. Với 4 bước cơ bản – xác định container, kiểm tra volume, copy file dump, và thực thi lệnh `pg_restore` – bạn có thể dễ dàng thực hiện việc restore dữ liệu. Nếu gặp vấn đề hoặc có lỗi phát sinh, hãy kiểm tra lại từng bước và đảm bảo rằng file dump đã được đặt đúng vị trí trong volume của container.

