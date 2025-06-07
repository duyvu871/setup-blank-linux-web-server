# HTTP & HTTPS

## 1. HTTP (HyperText Transfer Protocol)

HTTP là giao thức truyền tải dữ liệu giữa client và server trên Internet.

### Đặc điểm chính của HTTP

#### Stateless (Không trạng thái)
- Mỗi request độc lập với nhau
- Server không nhớ thông tin của request trước
- Cần mechanism khác để duy trì session (cookies, tokens)

#### Request-Response Model
```
Client -------- Request --------> Server
Client <------- Response -------- Server
```

#### Text-based Protocol
- Header và body đều là text
- Dễ đọc và debug
- Có thể inspect bằng tools như curl, Postman

### Cấu trúc HTTP Request
```
GET /api/users HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Accept: application/json
Authorization: Bearer token123

[Body - chỉ có với POST, PUT, PATCH]
```

### Cấu trúc HTTP Response
```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 45
Set-Cookie: sessionId=abc123

{
  "message": "Success",
  "data": {...}
}
```

### HTTP Methods (Verbs)
- **GET**: Lấy dữ liệu
- **POST**: Tạo dữ liệu mới
- **PUT**: Cập nhật toàn bộ resource
- **PATCH**: Cập nhật một phần resource
- **DELETE**: Xóa resource
- **HEAD**: Giống GET nhưng chỉ trả về headers
- **OPTIONS**: Kiểm tra methods được support

### HTTP Headers quan trọng

#### Request Headers
```
Host: example.com                    // Domain của server
User-Agent: Chrome/91.0              // Thông tin browser/client
Accept: application/json             // Loại content muốn nhận
Content-Type: application/json       // Loại content đang gửi
Authorization: Bearer token123       // Thông tin xác thực
Cookie: sessionId=abc123            // Cookies
```

#### Response Headers
```
Content-Type: application/json       // Loại content trả về
Content-Length: 1234                // Kích thước content
Set-Cookie: sessionId=abc123        // Set cookie
Cache-Control: max-age=3600         // Caching directives
Location: /new-resource             // Redirect location
```

## 2. HTTPS (HTTP Secure)

HTTPS là phiên bản bảo mật của HTTP, sử dụng SSL/TLS để mã hóa dữ liệu.

### Tại sao cần HTTPS?

#### Bảo mật dữ liệu
- **Encryption**: Dữ liệu được mã hóa khi truyền
- **Authentication**: Xác thực server là đúng
- **Integrity**: Đảm bảo dữ liệu không bị thay đổi

#### SEO và UX
- Google ưu tiên HTTPS trong ranking
- Browser hiển thị "Secure" hoặc khóa xanh
- Không bị warning "Not Secure"

### SSL/TLS Handshake
```
1. Client Hello (supported algorithms)
2. Server Hello + Certificate
3. Client verifies certificate
4. Key exchange
5. Secure communication begins
```

### Certificate Types
- **Domain Validated (DV)**: Cơ bản nhất
- **Organization Validated (OV)**: Xác thực tổ chức
- **Extended Validation (EV)**: Xác thực cao nhất

## 3. HTTP vs HTTPS

| Đặc điểm | HTTP | HTTPS |
|----------|------|-------|
| Port mặc định | 80 | 443 |
| Bảo mật | Không | Có (SSL/TLS) |
| Tốc độ | Nhanh hơn một chút | Chậm hơn một chút |
| SEO | Thấp hơn | Cao hơn |
| Certificate | Không cần | Cần SSL certificate |

## 4. HTTP Versions

### HTTP/1.1 (1997)
- Persistent connections
- Chunked encoding
- Host header required

### HTTP/2 (2015)
- Binary protocol
- Multiplexing
- Server push
- Header compression

### HTTP/3 (2020)
- Built on QUIC (UDP)
- Better performance
- Reduced latency

## 5. Common HTTP Concepts

### Cookies
```javascript
// Set cookie
document.cookie = "username=john; expires=Thu, 18 Dec 2024 12:00:00 UTC; path=/";

// Get cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
```

### CORS (Cross-Origin Resource Sharing)
```javascript
// Server cần set headers
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Caching
```javascript
// Response headers
Cache-Control: max-age=3600          // Cache 1 hour
Cache-Control: no-cache              // Always revalidate
ETag: "33a64df551425fcc55e"          // Entity tag
Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT
```

## 6. Testing HTTP

### Using cURL
```bash
# GET request
curl https://api.example.com/users

# POST request with data
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'

# With authentication
curl -H "Authorization: Bearer token123" \
  https://api.example.com/protected
```

### Browser Developer Tools
1. Mở F12 → Network tab
2. Thực hiện request
3. Xem chi tiết request/response
4. Inspect headers, body, timing

## 7. Best Practices

### Security
- Luôn dùng HTTPS cho production
- Validate và sanitize input
- Set proper security headers
- Use HSTS (HTTP Strict Transport Security)

### Performance
- Enable gzip compression
- Set appropriate cache headers
- Minimize request size
- Use CDN cho static files

### API Design
- Sử dụng đúng HTTP methods
- Return appropriate status codes
- Include meaningful error messages
- Version your APIs

## Bài tập thực hành

1. Dùng browser dev tools để inspect HTTP requests
2. Test API với Postman hoặc curl
3. Tạo simple HTTP server với Node.js
4. Implement basic authentication với headers
