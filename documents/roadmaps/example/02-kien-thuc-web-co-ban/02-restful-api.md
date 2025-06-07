# RESTful API

## 1. REST là gì?

REST (Representational State Transfer) là một kiến trúc thiết kế cho web services, sử dụng các HTTP methods để thao tác với resources.

### Nguyên tắc cốt lõi của REST

#### 1. Stateless (Không trạng thái)
- Mỗi request chứa đủ thông tin để server xử lý
- Server không lưu trữ context của client

#### 2. Client-Server Architecture
- Tách biệt client và server
- Có thể phát triển độc lập

#### 3. Cacheable
- Response có thể được cache để tăng performance
- Phải chỉ rõ cache được hay không

#### 4. Uniform Interface
- Giao diện thống nhất cho tất cả resources
- Sử dụng standard HTTP methods

#### 5. Layered System
- Có thể có các layer trung gian (proxy, gateway)

## 2. Resources và URIs

### Resource Naming
```
✅ Tốt:
GET /users              // Lấy danh sách users
GET /users/123          // Lấy user có ID 123
GET /users/123/posts    // Lấy posts của user 123

❌ Tránh:
GET /getUsers           // Verb trong URL
GET /user-list          // Không consistent
GET /getUserById/123    // Verb + inconsistent
```

### URI Design Best Practices
```
// 1. Sử dụng nouns, không phải verbs
GET /products          ✅
GET /getProducts       ❌

// 2. Sử dụng plural nouns
GET /users             ✅
GET /user              ❌

// 3. Hierarchy rõ ràng
GET /users/123/orders/456    ✅
GET /getUserOrder/123/456    ❌

// 4. Lowercase và hyphens
GET /user-profiles     ✅
GET /userProfiles      ❌
GET /UserProfiles      ❌
```

## 3. HTTP Methods trong REST

### GET - Lấy dữ liệu
```javascript
// Lấy tất cả
GET /api/users
Response: [
  { id: 1, name: "An", email: "an@gmail.com" },
  { id: 2, name: "Bình", email: "binh@gmail.com" }
]

// Lấy theo ID
GET /api/users/1
Response: { id: 1, name: "An", email: "an@gmail.com" }

// Với query parameters
GET /api/users?page=1&limit=10&sort=name
```

### POST - Tạo dữ liệu mới
```javascript
POST /api/users
Content-Type: application/json

Request Body:
{
  "name": "Nguyễn Văn C",
  "email": "c@gmail.com"
}

Response (201 Created):
{
  "id": 3,
  "name": "Nguyễn Văn C", 
  "email": "c@gmail.com",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### PUT - Cập nhật toàn bộ resource
```javascript
PUT /api/users/1
Content-Type: application/json

Request Body:
{
  "name": "Nguyễn Văn An Updated",
  "email": "an-new@gmail.com"
}

Response (200 OK):
{
  "id": 1,
  "name": "Nguyễn Văn An Updated",
  "email": "an-new@gmail.com",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

### PATCH - Cập nhật một phần resource
```javascript
PATCH /api/users/1
Content-Type: application/json

Request Body:
{
  "email": "an-newer@gmail.com"
}

Response (200 OK):
{
  "id": 1,
  "name": "Nguyễn Văn An Updated",  // Không thay đổi
  "email": "an-newer@gmail.com",    // Chỉ thay đổi email
  "updatedAt": "2024-01-15T11:30:00Z"
}
```

### DELETE - Xóa resource
```javascript
DELETE /api/users/1

Response (204 No Content):
// Không có body

// Hoặc (200 OK):
{
  "message": "User deleted successfully"
}
```

## 4. Response Status Codes

### 2xx Success
```javascript
200 OK          // Request thành công
201 Created     // Resource được tạo thành công
204 No Content  // Thành công nhưng không trả về data
```

### 4xx Client Error
```javascript
400 Bad Request       // Request không hợp lệ
401 Unauthorized      // Chưa xác thực
403 Forbidden         // Không có quyền
404 Not Found         // Resource không tồn tại
409 Conflict          // Xung đột (email đã tồn tại)
422 Unprocessable     // Validation error
```

### 5xx Server Error
```javascript
500 Internal Server Error    // Lỗi server
502 Bad Gateway             // Gateway lỗi
503 Service Unavailable     // Service không khả dụng
```

## 5. API Response Format

### Success Response
```javascript
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A"
  },
  "message": "User retrieved successfully"
}
```

### Error Response
```javascript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": [
      "Email đã tồn tại",
      "Password phải có ít nhất 6 ký tự"
    ]
  }
}
```

### Pagination Response
```javascript
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 6. Query Parameters

### Filtering
```javascript
GET /api/users?status=active
GET /api/products?category=electronics&price_min=100
```

### Sorting
```javascript
GET /api/users?sort=name              // Ascending
GET /api/users?sort=-createdAt        // Descending
GET /api/users?sort=name,-createdAt   // Multiple fields
```

### Pagination
```javascript
GET /api/users?page=1&limit=10        // Page-based
GET /api/users?offset=0&limit=10      // Offset-based
```

### Field Selection
```javascript
GET /api/users?fields=id,name,email   // Chỉ lấy một số fields
```

### Search
```javascript
GET /api/users?search=nguyễn          // Full-text search
GET /api/users?q=nguyễn               // Query search
```

## 7. Nested Resources

### One-to-Many Relationships
```javascript
// Posts của user
GET /api/users/123/posts

// Comments của post
GET /api/posts/456/comments

// Tạo comment cho post
POST /api/posts/456/comments
{
  "content": "Great post!",
  "author": "Nguyễn Văn A"
}
```

### Limits của Nesting
```javascript
✅ Tốt:
GET /api/users/123/posts

❌ Quá sâu:
GET /api/users/123/posts/456/comments/789/replies
// Nên dùng: GET /api/comments/789/replies
```

## 8. Versioning API

### URL Versioning
```javascript
GET /api/v1/users
GET /api/v2/users
```

### Header Versioning
```javascript
GET /api/users
Accept: application/vnd.api+json;version=1
```

### Query Parameter Versioning
```javascript
GET /api/users?version=1
```

## 9. Content Negotiation

### Accept Header
```javascript
Accept: application/json           // JSON response
Accept: application/xml            // XML response
Accept: text/html                  // HTML response
```

### Content-Type Header
```javascript
Content-Type: application/json     // Gửi JSON
Content-Type: application/xml      // Gửi XML
Content-Type: multipart/form-data  // File upload
```

## 10. HATEOAS (Hypermedia)

Principle của REST về việc include links trong response:

```javascript
{
  "id": 1,
  "name": "Nguyễn Văn A",
  "email": "a@gmail.com",
  "_links": {
    "self": "/api/users/1",
    "posts": "/api/users/1/posts",
    "edit": "/api/users/1",
    "delete": "/api/users/1"
  }
}
```

## 11. Best Practices

### Consistency
- Sử dụng naming convention thống nhất
- Response format giống nhau
- Error handling consistent

### Security
- Validate input data
- Rate limiting
- Authentication & Authorization
- HTTPS only

### Documentation
- API documentation rõ ràng
- Examples cho mỗi endpoint
- Error code meanings

### Performance
- Implement caching
- Pagination cho large datasets
- Compress responses

## Bài tập thực hành

1. Thiết kế RESTful API cho blog system
2. Tạo API documentation cho user management
3. Implement pagination và filtering
4. Design error response format
