# Cài đặt và Cấu trúc Dự án Express

## 1. Cài đặt Express

### Tạo dự án mới
```bash
# Tạo thư mục dự án
mkdir my-express-app
cd my-express-app

# Khởi tạo package.json
npm init -y

# Cài đặt Express
npm install express

# Cài đặt development dependencies
npm install --save-dev nodemon
```

### Express Generator (Optional)
```bash
# Cài đặt express generator
npm install -g express-generator

# Tạo dự án với template
express --view=ejs my-app
cd my-app
npm install
```

## 2. Hello World với Express

### Basic Server
```javascript
// app.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Route đơn giản
app.get('/', (req, res) => {
    res.send('Hello World từ Express!');
});

app.get('/api/users', (req, res) => {
    res.json([
        { id: 1, name: 'Nguyễn Văn A' },
        { id: 2, name: 'Trần Thị B' }
    ]);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
```

### Package.json Scripts
```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## 3. Cấu trúc Dự án Chuẩn

### Basic Structure
```
my-express-app/
├── package.json
├── package-lock.json
├── .env
├── .gitignore
├── app.js                 // Main application file
├── server.js             // Server startup
├── routes/               // Route definitions
│   ├── index.js
│   ├── users.js
│   └── auth.js
├── middleware/           // Custom middleware
│   ├── auth.js
│   ├── error.js
│   └── validation.js
├── models/               // Data models
│   ├── User.js
│   └── Product.js
├── controllers/          // Route handlers
│   ├── userController.js
│   └── authController.js
├── utils/                // Utility functions
│   ├── database.js
│   ├── logger.js
│   └── helpers.js
├── config/               // Configuration files
│   ├── database.js
│   └── app.js
├── public/               // Static files
│   ├── css/
│   ├── js/
│   └── images/
└── views/                // Template files (nếu dùng)
    ├── index.ejs
    └── layout.ejs
```

### Advanced Structure (MVC Pattern)
```
enterprise-express-app/
├── src/
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── productController.js
│   │   └── authController.js
│   ├── services/         // Business logic
│   │   ├── userService.js
│   │   ├── emailService.js
│   │   └── paymentService.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   └── v2/
│   │   └── web/
│   ├── middleware/
│   ├── validators/       // Input validation
│   │   ├── userValidator.js
│   │   └── productValidator.js
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── connection.js
│   └── utils/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                 // API documentation
├── logs/                 // Log files
└── uploads/              // File uploads
```

## 4. Cấu hình Cơ bản

### Environment Variables
```javascript
// .env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=admin
DB_PASS=password
JWT_SECRET=your-secret-key
API_URL=http://localhost:3000
```

### App Configuration
```javascript
// config/app.js
require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET,
    database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASS
    }
};
```

### Main App File
```javascript
// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

module.exports = app;
```

### Server Startup
```javascript
// server.js
const app = require('./app');
const config = require('./config/app');

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`🚀 Server running in ${config.env} mode on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});
```

## 5. Essential Middleware

### Built-in Middleware
```javascript
// Body parsing
app.use(express.json());                    // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Static files
app.use(express.static('public'));          // Serve static files
app.use('/uploads', express.static('uploads')); // Custom static route
```

### Third-party Middleware
```bash
# Cài đặt middleware packages
npm install cors helmet morgan compression dotenv
```

```javascript
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// CORS - Cross Origin Resource Sharing
app.use(cors({
    origin: ['http://localhost:3000', 'https://mydomain.com'],
    credentials: true
}));

// Security headers
app.use(helmet());

// Request logging
app.use(morgan('combined'));

// Gzip compression
app.use(compression());
```

## 6. Environment Setup

### Development Environment
```json
// package.json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "debug": "nodemon --inspect server.js"
  }
}
```

### Nodemon Configuration
```json
// nodemon.json
{
  "watch": ["src", "routes", "middleware"],
  "ext": "js,json",
  "ignore": ["node_modules", "logs"],
  "exec": "node server.js",
  "env": {
    "NODE_ENV": "development"
  }
}
```

### Git Setup
```gitignore
# .gitignore
node_modules/
.env
.env.local
.env.production
logs/
uploads/
dist/
.DS_Store
*.log
```

## 7. API Versioning

### URL Versioning
```javascript
// routes/api/v1/index.js
const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/products', require('./products'));

module.exports = router;

// app.js
app.use('/api/v1', require('./routes/api/v1'));
app.use('/api/v2', require('./routes/api/v2'));
```

### Header Versioning
```javascript
// middleware/version.js
const versionMiddleware = (req, res, next) => {
    const version = req.headers['api-version'] || 'v1';
    req.apiVersion = version;
    next();
};

app.use(versionMiddleware);
```

## 8. Configuration Management

### Multiple Environments
```javascript
// config/index.js
const development = {
    port: 3000,
    database: {
        host: 'localhost',
        name: 'myapp_dev'
    }
};

const production = {
    port: process.env.PORT,
    database: {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME
    }
};

const config = {
    development,
    production
};

module.exports = config[process.env.NODE_ENV || 'development'];
```

### Using config package
```bash
npm install config
```

```javascript
// config/default.json
{
  "server": {
    "port": 3000
  },
  "database": {
    "host": "localhost",
    "name": "myapp"
  }
}

// config/production.json
{
  "server": {
    "port": 8080
  },
  "database": {
    "host": "prod-db-server",
    "name": "myapp_prod"
  }
}

// Usage
const config = require('config');
const port = config.get('server.port');
```

## 9. Debugging

### VS Code Launch Configuration
```json
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Debug Express App",
            "program": "${workspaceFolder}/server.js",
            "env": {
                "NODE_ENV": "development"
            },
            "restart": true,
            "runtimeExecutable": "nodemon",
            "console": "integratedTerminal"
        }
    ]
}
```

### Console Debugging
```javascript
// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
        query: req.query,
        body: req.body,
        headers: req.headers
    });
    next();
});
```

## 10. Best Practices

### Error Handling
```javascript
// Async wrapper for error handling
const asyncWrapper = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Usage
app.get('/users', asyncWrapper(async (req, res) => {
    const users = await User.find();
    res.json(users);
}));
```

### Validation
```javascript
// Input validation middleware
const validateUser = (req, res, next) => {
    const { name, email } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: 'Name và email là bắt buộc'
        });
    }
    
    if (!email.includes('@')) {
        return res.status(400).json({
            success: false,
            message: 'Email không hợp lệ'
        });
    }
    
    next();
};
```

### Response Formatting
```javascript
// Response formatter middleware
app.use((req, res, next) => {
    res.success = (data, message = 'Success') => {
        res.json({
            success: true,
            message,
            data
        });
    };
    
    res.error = (message, status = 500) => {
        res.status(status).json({
            success: false,
            message
        });
    };
    
    next();
});

// Usage
app.get('/users', (req, res) => {
    const users = getUsersFromDB();
    res.success(users, 'Users retrieved successfully');
});
```

## Bài tập thực hành

1. Tạo Express app với cấu trúc MVC
2. Setup environment variables và multiple configs
3. Implement API versioning
4. Tạo debug configuration cho VS Code
