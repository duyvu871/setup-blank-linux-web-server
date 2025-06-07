# Tổng quan về Node.js

## 1. Node.js là gì?

Node.js là một runtime environment cho JavaScript, được xây dựng trên V8 JavaScript engine của Chrome. Nó cho phép chạy JavaScript code trên server-side.

### Đặc điểm chính

#### JavaScript ở Server-side
- Sử dụng cùng ngôn ngữ cho frontend và backend
- Chia sẻ code giữa client và server
- Một team có thể làm full-stack

#### Built on Chrome V8 Engine
- Performance cao
- Compile JavaScript thành machine code
- Optimizations tự động

#### Cross-platform
- Chạy trên Windows, macOS, Linux
- Container-friendly (Docker)

## 2. Tại sao nên dùng Node.js?

### Ưu điểm

#### 1. High Performance
```javascript
// V8 engine compile JavaScript thành machine code
// Không cần interpreter runtime
```

#### 2. Non-blocking I/O
```javascript
// Traditional blocking I/O
const data1 = fs.readFileSync('file1.txt'); // Đợi
const data2 = fs.readFileSync('file2.txt'); // Đợi
console.log('Done');

// Non-blocking I/O
fs.readFile('file1.txt', (err, data1) => {
    console.log('File 1 loaded');
});
fs.readFile('file2.txt', (err, data2) => {
    console.log('File 2 loaded');
});
console.log('This runs immediately');
```

#### 3. Single Language
```javascript
// Frontend (React)
const UserProfile = ({ user }) => {
    return <div>{user.name}</div>;
};

// Backend (Node.js)
app.get('/api/user/:id', (req, res) => {
    res.json({ name: 'John Doe' });
});

// Shared utilities
const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
};
```

#### 4. Rich Ecosystem (NPM)
- Hơn 1 triệu packages
- Tái sử dụng code cao
- Community lớn

#### 5. Rapid Development
- Hot reload
- Ít boilerplate code
- Fast prototyping

### Nhược điểm

#### 1. Single-threaded
```javascript
// CPU-intensive task sẽ block event loop
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// ❌ Sẽ block server
app.get('/slow', (req, res) => {
    const result = fibonacci(40); // Takes several seconds
    res.json({ result });
});

// ✅ Giải pháp: Worker threads hoặc child processes
```

#### 2. Callback Hell (đã được giải quyết)
```javascript
// Old style - callback hell
getData((err, a) => {
    if (err) return handleError(err);
    getMoreData(a, (err, b) => {
        if (err) return handleError(err);
        getEvenMoreData(b, (err, c) => {
            // ... nested callbacks
        });
    });
});

// Modern solution - async/await
async function processData() {
    try {
        const a = await getData();
        const b = await getMoreData(a);
        const c = await getEvenMoreData(b);
        return c;
    } catch (error) {
        handleError(error);
    }
}
```

## 3. Kiến trúc Node.js

### Architecture Overview
```
┌─────────────────┐
│   Application   │  (Your JavaScript code)
├─────────────────┤
│   Node.js APIs  │  (fs, http, path, etc.)
├─────────────────┤
│   Node Bindings │  (C++ bindings)
├─────────────────┤
│   V8 Engine     │  (JavaScript execution)
│   libuv        │  (Event loop, I/O)
└─────────────────┘
```

### Core Components

#### 1. V8 JavaScript Engine
- Compile JavaScript thành machine code
- Garbage collection
- Memory management

#### 2. libuv
- Event loop implementation
- Thread pool cho I/O operations
- Cross-platform I/O abstraction

#### 3. Node.js Bindings
- Bridge giữa JavaScript và C++
- Expose system APIs
- Native modules interface

## 4. Use Cases tốt cho Node.js

### ✅ Phù hợp

#### 1. API Servers / Microservices
```javascript
// RESTful API
app.get('/api/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// GraphQL API
const typeDefs = gql`
    type User {
        id: ID!
        name: String!
        email: String!
    }
`;
```

#### 2. Real-time Applications
```javascript
// WebSocket server
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    socket.on('message', (data) => {
        io.emit('message', data); // Broadcast to all clients
    });
});
```

#### 3. Single Page Applications (SPA)
```javascript
// Serve React/Vue/Angular apps
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build/index.html'));
});
```

#### 4. Streaming Applications
```javascript
// File streaming
app.get('/video/:id', (req, res) => {
    const videoPath = `./videos/${req.params.id}.mp4`;
    const stream = fs.createReadStream(videoPath);
    stream.pipe(res);
});
```

#### 5. Command Line Tools
```javascript
#!/usr/bin/env node
const program = require('commander');

program
    .version('1.0.0')
    .option('-f, --file <file>', 'input file')
    .parse(process.argv);

console.log('Processing file:', program.file);
```

### ❌ Không phù hợp

#### 1. CPU-intensive Applications
- Image/video processing
- Machine learning computations
- Cryptography operations

#### 2. Applications cần Multi-threading
- Heavy mathematical computations
- Data mining

#### 3. Memory-intensive Applications
- Large dataset processing
- In-memory databases

## 5. Node.js vs Other Technologies

### Node.js vs Python
| Đặc điểm | Node.js | Python |
|----------|---------|---------|
| Performance | Nhanh hơn cho I/O | Chậm hơn |
| Ecosystem | NPM (1M+ packages) | PyPI (300K+ packages) |
| Learning curve | Dễ (nếu biết JS) | Dễ |
| Use case | Web apps, APIs | ML, Data Science |

### Node.js vs Java
| Đặc điểm | Node.js | Java |
|----------|---------|------|
| Development speed | Nhanh | Chậm hơn |
| Performance | Tốt cho I/O | Tốt cho CPU |
| Memory usage | Ít hơn | Nhiều hơn |
| Enterprise support | Tốt | Rất tốt |

## 6. Getting Started

### Installation
```bash
# Download từ nodejs.org
# Hoặc dùng package manager

# Windows (Chocolatey)
choco install nodejs

# macOS (Homebrew) 
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Version Management với Node Version Manager
```bash
# Install nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Windows - install nvm-windows
# https://github.com/coreybutler/nvm-windows

# Sử dụng
nvm install 18.17.0
nvm use 18.17.0
nvm list
```

### First Node.js Application
```javascript
// app.js
console.log('Hello, Node.js!');
console.log('Node version:', process.version);
console.log('Platform:', process.platform);

// Chạy
// node app.js
```

### Basic HTTP Server
```javascript
// server.js
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Xin chào từ Node.js server!');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
```

## 7. Development Workflow

### Project Structure
```
my-node-app/
├── package.json          // Project metadata
├── package-lock.json     // Exact dependency versions
├── node_modules/         // Installed packages
├── src/                  // Source code
│   ├── app.js           // Main application
│   ├── routes/          // Route handlers
│   ├── models/          // Data models
│   └── utils/           // Utility functions
├── tests/               // Test files
├── .env                 // Environment variables
├── .gitignore          // Git ignore rules
└── README.md           // Documentation
```

### Essential Tools
```bash
# Nodemon - auto restart
npm install -g nodemon
nodemon app.js

# PM2 - process manager
npm install -g pm2
pm2 start app.js
pm2 list
pm2 stop app.js

# ESLint - code linting
npm install -g eslint
eslint --init
```

## Bài tập thực hành

1. Tạo simple HTTP server trả về JSON
2. So sánh performance sync vs async file operations  
3. Build command line calculator
4. Implement file watcher với fs module
