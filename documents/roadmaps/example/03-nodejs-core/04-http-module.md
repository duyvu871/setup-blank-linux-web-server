# HTTP Module (Module HTTP)

## Tổng quan

Module `http` là một trong những module cốt lõi quan trọng nhất của Node.js, cho phép tạo HTTP server và client. Đây là nền tảng để xây dựng web applications, RESTful APIs, và các dịch vụ web khác.

## HTTP Server

### Tạo HTTP Server cơ bản

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
    // Thiết lập response headers
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    
    // Gửi response body
    res.write('Xin chào từ Node.js Server!');
    res.end();
});

// Lắng nghe trên port 3000
server.listen(3000, () => {
    console.log('Server đang chạy tại http://localhost:3000');
});
```

### Server với routing cơ bản

```javascript
const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;
    
    // Thiết lập CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (path === '/' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <h1>Trang chủ</h1>
            <p>Chào mừng đến với Node.js Server!</p>
            <a href="/about">Về chúng tôi</a>
        `);
    } else if (path === '/about' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Đây là trang giới thiệu',
            version: '1.0.0'
        }));
    } else if (path === '/api/users' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([
            { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com' },
            { id: 2, name: 'Trần Thị B', email: 'b@example.com' }
        ]));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Trang không tìm thấy');
    }
});

server.listen(3000, () => {
    console.log('Server đang chạy tại http://localhost:3000');
});
```

### Xử lý POST data

```javascript
const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;
    
    if (path === '/api/users' && method === 'POST') {
        let body = '';
        
        // Nhận data từng phần
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        
        // Khi nhận đủ data
        req.on('end', () => {
            try {
                const userData = JSON.parse(body);
                
                // Xử lý data (validation, save to database, etc.)
                const newUser = {
                    id: Date.now(),
                    name: userData.name,
                    email: userData.email,
                    createdAt: new Date().toISOString()
                };
                
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    user: newUser
                }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Dữ liệu JSON không hợp lệ'
                }));
            }
        });
        
        // Xử lý lỗi
        req.on('error', (err) => {
            console.error('Lỗi request:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Lỗi server'
            }));
        });
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
});

server.listen(3000);
```

### File Server

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// MIME types mapping
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to index.html for root
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    const filePath = path.join(__dirname, 'public', pathname);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>');
            } else {
                // Server error
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 - Server Error</h1>');
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(3000, () => {
    console.log('File server đang chạy tại http://localhost:3000');
});
```

## HTTP Client

### Tạo HTTP Request

```javascript
const http = require('http');

// GET request
function makeGetRequest(hostname, port, path) {
    const options = {
        hostname: hostname,
        port: port,
        path: path,
        method: 'GET',
        headers: {
            'User-Agent': 'Node.js HTTP Client'
        }
    };
    
    const req = http.request(options, (res) => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Response Body:', data);
        });
    });
    
    req.on('error', (err) => {
        console.error('Request error:', err);
    });
    
    req.end();
}

// Sử dụng
makeGetRequest('jsonplaceholder.typicode.com', 80, '/users/1');
```

### POST Request với data

```javascript
const http = require('http');

function makePostRequest(hostname, port, path, postData) {
    const data = JSON.stringify(postData);
    
    const options = {
        hostname: hostname,
        port: port,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };
    
    const req = http.request(options, (res) => {
        console.log(`Status Code: ${res.statusCode}`);
        
        let responseData = '';
        
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonResponse = JSON.parse(responseData);
                console.log('Response:', jsonResponse);
            } catch (error) {
                console.log('Response:', responseData);
            }
        });
    });
    
    req.on('error', (err) => {
        console.error('Request error:', err);
    });
    
    // Gửi data
    req.write(data);
    req.end();
}

// Sử dụng
makePostRequest('jsonplaceholder.typicode.com', 80, '/posts', {
    title: 'Bài viết mới',
    body: 'Nội dung bài viết',
    userId: 1
});
```

### Simple HTTP Client class

```javascript
const http = require('http');
const https = require('https');
const url = require('url');

class SimpleHttpClient {
    static request(options) {
        return new Promise((resolve, reject) => {
            const parsedUrl = url.parse(options.url);
            const isHttps = parsedUrl.protocol === 'https:';
            const client = isHttps ? https : http;
            
            const requestOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (isHttps ? 443 : 80),
                path: parsedUrl.path,
                method: options.method || 'GET',
                headers: options.headers || {}
            };
            
            const req = client.request(requestOptions, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                });
            });
            
            req.on('error', reject);
            
            if (options.data) {
                req.write(options.data);
            }
            
            req.end();
        });
    }
    
    static async get(url, headers = {}) {
        return this.request({ url, method: 'GET', headers });
    }
    
    static async post(url, data, headers = {}) {
        const postData = typeof data === 'object' ? JSON.stringify(data) : data;
        return this.request({
            url,
            method: 'POST',
            data: postData,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });
    }
}

// Sử dụng
async function testClient() {
    try {
        const response = await SimpleHttpClient.get('http://jsonplaceholder.typicode.com/users/1');
        console.log('GET Response:', JSON.parse(response.body));
        
        const postResponse = await SimpleHttpClient.post(
            'http://jsonplaceholder.typicode.com/posts',
            { title: 'Test', body: 'Test body', userId: 1 }
        );
        console.log('POST Response:', JSON.parse(postResponse.body));
    } catch (error) {
        console.error('Error:', error);
    }
}

testClient();
```

## Request và Response Objects

### Request Object Properties

```javascript
const server = http.createServer((req, res) => {
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    console.log('HTTP Version:', req.httpVersion);
    
    // Parse query parameters
    const urlParts = url.parse(req.url, true);
    console.log('Pathname:', urlParts.pathname);
    console.log('Query:', urlParts.query);
    
    // User Agent
    console.log('User Agent:', req.headers['user-agent']);
    
    // Content Type
    console.log('Content Type:', req.headers['content-type']);
    
    res.end('Request processed');
});
```

### Response Object Methods

```javascript
const server = http.createServer((req, res) => {
    // Set status code
    res.statusCode = 200;
    
    // Set headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Custom-Header', 'MyValue');
    
    // Multiple headers at once
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
    });
    
    // Write response body
    res.write('{"message": "Hello"}');
    
    // End response
    res.end();
    
    // Hoặc kết hợp write và end
    // res.end('{"message": "Hello"}');
});
```

## Server Events

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
    res.end('Hello World');
});

// Server events
server.on('connection', (socket) => {
    console.log('Có kết nối mới');
});

server.on('request', (req, res) => {
    console.log(`${req.method} ${req.url}`);
});

server.on('clientError', (err, socket) => {
    console.error('Client error:', err);
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.on('close', () => {
    console.log('Server đã đóng');
});

server.listen(3000, () => {
    console.log('Server started');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Nhận tín hiệu SIGTERM, đang đóng server...');
    server.close(() => {
        console.log('Server đã đóng hoàn toàn');
        process.exit(0);
    });
});
```

## Best Practices

### 1. Error Handling

```javascript
const server = http.createServer((req, res) => {
    try {
        // Xử lý request
        handleRequest(req, res);
    } catch (error) {
        console.error('Server error:', error);
        
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'Internal Server Error'
            }));
        }
    }
});

function handleRequest(req, res) {
    // Request handling logic
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Success');
}
```

### 2. Request Timeout

```javascript
const server = http.createServer((req, res) => {
    // Set timeout cho request
    req.setTimeout(30000, () => {
        res.writeHead(408, { 'Content-Type': 'text/plain' });
        res.end('Request Timeout');
    });
    
    // Xử lý request bình thường
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World');
});

// Set timeout cho server
server.timeout = 30000;
```

### 3. Security Headers

```javascript
function setSecurityHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
}

const server = http.createServer((req, res) => {
    setSecurityHeaders(res);
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Secure Server</h1>');
});
```

## Ví dụ thực tế: REST API Server

```javascript
const http = require('http');
const url = require('url');

// In-memory database
let users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com' },
    { id: 2, name: 'Trần Thị B', email: 'b@example.com' }
];

class UserAPI {
    static async getUsers(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
    }
    
    static async getUser(req, res, id) {
        const user = users.find(u => u.id === parseInt(id));
        if (!user) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User not found' }));
            return;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
    }
    
    static async createUser(req, res) {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const userData = JSON.parse(body);
                
                if (!userData.name || !userData.email) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Name and email are required' }));
                    return;
                }
                
                const newUser = {
                    id: Math.max(...users.map(u => u.id)) + 1,
                    name: userData.name,
                    email: userData.email
                };
                
                users.push(newUser);
                
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newUser));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    }
    
    static async updateUser(req, res, id) {
        const userId = parseInt(id);
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User not found' }));
            return;
        }
        
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const userData = JSON.parse(body);
                
                users[userIndex] = { ...users[userIndex], ...userData };
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(users[userIndex]));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    }
    
    static async deleteUser(req, res, id) {
        const userId = parseInt(id);
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User not found' }));
            return;
        }
        
        users.splice(userIndex, 1);
        
        res.writeHead(204);
        res.end();
    }
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Routes
    if (path === '/api/users' && method === 'GET') {
        await UserAPI.getUsers(req, res);
    } else if (path.match(/^\/api\/users\/\d+$/) && method === 'GET') {
        const id = path.split('/')[3];
        await UserAPI.getUser(req, res, id);
    } else if (path === '/api/users' && method === 'POST') {
        await UserAPI.createUser(req, res);
    } else if (path.match(/^\/api\/users\/\d+$/) && method === 'PUT') {
        const id = path.split('/')[3];
        await UserAPI.updateUser(req, res, id);
    } else if (path.match(/^\/api\/users\/\d+$/) && method === 'DELETE') {
        const id = path.split('/')[3];
        await UserAPI.deleteUser(req, res, id);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(3000, () => {
    console.log('API Server đang chạy tại http://localhost:3000');
    console.log('Endpoints:');
    console.log('  GET    /api/users');
    console.log('  GET    /api/users/:id');
    console.log('  POST   /api/users');
    console.log('  PUT    /api/users/:id');
    console.log('  DELETE /api/users/:id');
});
```

## Bài tập thực hành

### Bài 1: Blog API
Tạo REST API cho blog với endpoints để quản lý bài viết (CRUD operations).

### Bài 2: File Upload Server
Viết server để upload và download files.

### Bài 3: Proxy Server
Tạo proxy server chuyển tiếp requests đến server khác.

### Bài 4: Chat Server
Xây dựng simple chat server sử dụng HTTP long polling.

## Tổng kết

Module HTTP là nền tảng để xây dựng web applications trong Node.js. Mặc dù trong thực tế thường sử dụng frameworks như Express.js, việc hiểu rõ HTTP module giúp bạn:

- Hiểu sâu hơn về cách web servers hoạt động
- Debug và optimize performance tốt hơn
- Tạo được solutions tùy chỉnh khi cần thiết
- Làm việc hiệu quả với các frameworks cao cấp hơn
