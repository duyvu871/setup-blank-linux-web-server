# Demo Loki Grafana với Winston Logger

Đây là một demo đơn giản về cách sử dụng Grafana Loki để thu thập và hiển thị logs từ một ứng dụng Node.js sử dụng Winston logger.

## Cấu trúc project

```
.
├── app/                    # Thư mục ứng dụng Node.js
│   ├── Dockerfile         # File build container cho ứng dụng
│   ├── index.js           # Source code ứng dụng
│   └── package.json       # Dependency của ứng dụng
├── docker-compose.yml     # Cấu hình Docker Compose
├── loki-config.yaml       # Cấu hình cho Loki
└── promtail-config.yaml   # Cấu hình cho Promtail
```

## Cách sử dụng

1. Khởi động các services:
```bash
docker-compose up -d
```

2. Truy cập các endpoints:
- Grafana UI: http://localhost:3000
- Demo app: http://localhost:3001

3. Các endpoints demo để tạo logs:
- Tạo log thông thường: http://localhost:3001/
- Tạo warning log: http://localhost:3001/warning
- Tạo error log: http://localhost:3001/error
- Kiểm tra health: http://localhost:3001/health

4. Các endpoints báo cáo:
- Tải báo cáo CSV: http://localhost:3001/reports/csv
- Tải báo cáo JSON: http://localhost:3001/reports/json
- Xóa dữ liệu báo cáo: http://localhost:3001/reports/clear

5. Xem logs trong Grafana:
- Truy cập http://localhost:3000
- Đăng nhập với tài khoản mặc định (admin/admin)
- Vào Explore và chọn data source Loki
- Query logs với LogQL, ví dụ:
  ```
  {job="winston-loki-demo"}
  ```

## Các thành phần chính

1. **Loki**: Hệ thống lưu trữ và xử lý logs
2. **Promtail**: Agent thu thập logs từ hệ thống
3. **Grafana**: UI để hiển thị và query logs
4. **Demo App**: Ứng dụng Node.js với các tính năng:
   - Sử dụng Winston logger để gửi logs tới Loki
   - Lưu logs vào file local
   - Xuất báo cáo dạng CSV và JSON
   - API endpoints để demo các loại logs khác nhau

## Tham khảo

- [Grafana Loki Documentation](https://grafana.com/docs/loki/latest/)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Winston Loki Transport](https://github.com/JaniAnttonen/winston-loki)