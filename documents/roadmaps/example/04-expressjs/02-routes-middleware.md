# Routes và Middleware

## Tổng quan về Routing

Routing trong Express.js quyết định cách ứng dụng phản hồi với các client requests đến một endpoint cụ thể. Mỗi route được định nghĩa bởi một path và một HTTP method (GET, POST, PUT, DELETE, v.v.).

## Basic Routing

### 1. HTTP Methods

```javascript
const express = require('express');
const app = express();

// GET route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// POST route
app.post('/users', (req, res) => {
    res.json({ message: 'User created' });
});

// PUT route
app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.json({ message: `User ${userId} updated` });
});

// DELETE route
app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.json({ message: `User ${userId} deleted` });
});

// PATCH route
app.patch('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.json({ message: `User ${userId} patched` });
});

// Tất cả HTTP methods
app.all('/secret', (req, res) => {
    res.send(`Bạn đã truy cập /secret bằng method ${req.method}`);
});

app.listen(3000);
```

### 2. Route Parameters

```javascript
const express = require('express');
const app = express();

// Single parameter
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.json({ userId: userId });
});

// Multiple parameters
app.get('/users/:userId/posts/:postId', (req, res) => {
    const { userId, postId } = req.params;
    res.json({ 
        message: `User ${userId}, Post ${postId}` 
    });
});

// Optional parameters với dấu ?
app.get('/posts/:year/:month?', (req, res) => {
    const { year, month } = req.params;
    res.json({ 
        year: year,
        month: month || 'all months'
    });
});

// Wildcard parameters
app.get('/files/*', (req, res) => {
    const filename = req.params[0];
    res.json({ filename: filename });
});

// Route patterns với regex
app.get(/.*fly$/, (req, res) => {
    res.send('Bất kỳ route nào kết thúc bằng "fly"');
});

app.listen(3000);
```

### 3. Query Parameters

```javascript
const express = require('express');
const app = express();

app.get('/search', (req, res) => {
    const { 
        q,          // search query
        page = 1,   // default page = 1
        limit = 10, // default limit = 10
        sort = 'date'
    } = req.query;
    
    res.json({
        query: q,
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sort,
        message: `Searching for "${q}", Page ${page}, ${limit} items per page`
    });
});

// URL: /search?q=nodejs&page=2&limit=20&sort=name
// Output: { query: "nodejs", page: 2, limit: 20, sort: "name", ... }

app.listen(3000);
```

## Route Handlers

### 1. Multiple Handler Functions

```javascript
const express = require('express');
const app = express();

// Logging middleware
const logRequest = (req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next(); // Quan trọng: gọi next() để chuyển sang handler tiếp theo
};

// Authentication middleware
const requireAuth = (req, res, next) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ error: 'Token required' });
    }
    
    // Verify token logic here
    req.user = { id: 1, name: 'John Doe' }; // Mock user
    next();
};

// Route với multiple handlers
app.get('/protected', 
    logRequest,
    requireAuth,
    (req, res) => {
        res.json({ 
            message: 'Protected resource',
            user: req.user
        });
    }
);

// Array of handlers
const middlewares = [logRequest, requireAuth];

app.get('/admin', middlewares, (req, res) => {
    res.json({ message: 'Admin area' });
});

app.listen(3000);
```

### 2. Route Handlers với Error Handling

```javascript
const express = require('express');
const app = express();

// Async route handler
app.get('/async-route', async (req, res, next) => {
    try {
        // Simulate async operation
        const data = await fetchDataFromAPI();
        res.json(data);
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
});

// Wrapper function cho async routes
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Sử dụng asyncHandler
app.get('/users/:id', asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
}));

// Mock functions
async function fetchDataFromAPI() {
    return new Promise((resolve) => {
        setTimeout(() => resolve({ data: 'some data' }), 1000);
    });
}

async function getUserById(id) {
    // Mock user lookup
    return id === '1' ? { id: 1, name: 'John' } : null;
}

app.listen(3000);
```

## Express Router

### 1. Modular Routes

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

// Middleware cho tất cả routes trong router này
router.use((req, res, next) => {
    console.log('User routes middleware');
    next();
});

// GET /users
router.get('/', (req, res) => {
    res.json({ message: 'Get all users' });
});

// GET /users/:id
router.get('/:id', (req, res) => {
    res.json({ message: `Get user ${req.params.id}` });
});

// POST /users
router.post('/', (req, res) => {
    res.json({ message: 'Create user' });
});

// PUT /users/:id
router.put('/:id', (req, res) => {
    res.json({ message: `Update user ${req.params.id}` });
});

// DELETE /users/:id
router.delete('/:id', (req, res) => {
    res.json({ message: `Delete user ${req.params.id}` });
});

module.exports = router;
```

```javascript
// routes/posts.js
const express = require('express');
const router = express.Router();

// Nested routes: /posts/:postId/comments
router.get('/:postId/comments', (req, res) => {
    res.json({ 
        message: `Comments for post ${req.params.postId}` 
    });
});

router.post('/:postId/comments', (req, res) => {
    res.json({ 
        message: `Create comment for post ${req.params.postId}` 
    });
});

router.get('/', (req, res) => {
    res.json({ message: 'Get all posts' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Create post' });
});

module.exports = router;
```

```javascript
// app.js - Main application file
const express = require('express');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');

const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'API Server',
        endpoints: {
            users: '/api/users',
            posts: '/api/posts'
        }
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

### 2. Advanced Router Features

```javascript
// routes/api.js
const express = require('express');
const router = express.Router();

// Router-level middleware
router.use('/admin', (req, res, next) => {
    // Check admin privileges
    if (req.headers['x-admin-key'] !== 'secret-admin-key') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
});

// Parameterized routes với validation
router.param('id', (req, res, next, id) => {
    // Validate ID format
    if (!/^\\d+$/.test(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    // Attach parsed ID to request
    req.parsedId = parseInt(id);
    next();
});

router.get('/items/:id', (req, res) => {
    res.json({ 
        message: `Item with ID: ${req.parsedId}`,
        type: typeof req.parsedId
    });
});

// Route chaining
router.route('/books')
    .get((req, res) => {
        res.json({ message: 'Get all books' });
    })
    .post((req, res) => {
        res.json({ message: 'Create book' });
    });

router.route('/books/:id')
    .get((req, res) => {
        res.json({ message: `Get book ${req.params.id}` });
    })
    .put((req, res) => {
        res.json({ message: `Update book ${req.params.id}` });
    })
    .delete((req, res) => {
        res.json({ message: `Delete book ${req.params.id}` });
    });

module.exports = router;
```

## Middleware Deep Dive

### 1. Types of Middleware

```javascript
const express = require('express');
const app = express();

// 1. Application-level middleware
app.use((req, res, next) => {
    console.log('Application-level middleware');
    req.timestamp = Date.now();
    next();
});

// 2. Router-level middleware
const router = express.Router();
router.use((req, res, next) => {
    console.log('Router-level middleware');
    next();
});

// 3. Error-handling middleware
app.use((err, req, res, next) => {
    console.error('Error middleware:', err.message);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 4. Built-in middleware
app.use(express.json());                    // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static('public'));          // Serve static files

// 5. Third-party middleware
const cors = require('cors');
const morgan = require('morgan');

app.use(cors());                            // Enable CORS
app.use(morgan('combined'));                // HTTP request logger

app.listen(3000);
```

### 2. Custom Middleware

```javascript
const express = require('express');
const app = express();

// Request logging middleware
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
    next();
};

// Request timing middleware
const requestTimer = (req, res, next) => {
    req.startTime = Date.now();
    
    // Override res.end to calculate duration
    const originalEnd = res.end;
    res.end = function(...args) {
        const duration = Date.now() - req.startTime;
        console.log(`Request completed in ${duration}ms`);
        originalEnd.apply(this, args);
    };
    
    next();
};

// Rate limiting middleware
const createRateLimiter = (maxRequests, windowMs) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!requests.has(clientId)) {
            requests.set(clientId, []);
        }
        
        const clientRequests = requests.get(clientId);
        
        // Remove old requests outside the window
        const validRequests = clientRequests.filter(
            time => now - time < windowMs
        );
        
        if (validRequests.length >= maxRequests) {
            return res.status(429).json({
                error: 'Too many requests',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
        
        validRequests.push(now);
        requests.set(clientId, validRequests);
        
        next();
    };
};

// Request validation middleware
const validateJSON = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        if (!req.is('application/json')) {
            return res.status(400).json({
                error: 'Content-Type must be application/json'
            });
        }
    }
    next();
};

// Apply middleware
app.use(requestLogger);
app.use(requestTimer);
app.use('/api', createRateLimiter(100, 60000)); // 100 requests per minute
app.use(express.json());
app.use(validateJSON);

// Test routes
app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint', timestamp: req.startTime });
});

app.post('/api/data', (req, res) => {
    res.json({ message: 'Data received', data: req.body });
});

app.listen(3000);
```

### 3. Conditional Middleware

```javascript
const express = require('express');
const app = express();

// Environment-based middleware
const developmentOnly = (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('Development middleware executed');
        next();
    } else {
        next();
    }
};

// Path-based conditional middleware
const apiOnly = (middleware) => {
    return (req, res, next) => {
        if (req.path.startsWith('/api')) {
            middleware(req, res, next);
        } else {
            next();
        }
    };
};

// Method-based conditional middleware
const postOnly = (middleware) => {
    return (req, res, next) => {
        if (req.method === 'POST') {
            middleware(req, res, next);
        } else {
            next();
        }
    };
};

// Header-based conditional middleware
const authRequired = (req, res, next) => {
    if (req.headers.authorization) {
        console.log('User authenticated');
        req.user = { id: 1, name: 'John' }; // Mock user
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
};

const optionalAuth = (req, res, next) => {
    if (req.headers.authorization) {
        req.user = { id: 1, name: 'John' }; // Mock user
    }
    next();
};

// Apply conditional middleware
app.use(developmentOnly);
app.use(apiOnly(express.json()));
app.use('/api/protected', authRequired);
app.use('/api/public', optionalAuth);

app.get('/api/protected/data', (req, res) => {
    res.json({ 
        message: 'Protected data',
        user: req.user
    });
});

app.get('/api/public/data', (req, res) => {
    res.json({ 
        message: 'Public data',
        user: req.user || null
    });
});

app.listen(3000);
```

## Error Handling Middleware

### 1. Basic Error Handling

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Routes that might throw errors
app.get('/error', (req, res, next) => {
    const error = new Error('Something went wrong!');
    error.status = 500;
    next(error); // Pass error to error handling middleware
});

app.get('/async-error', async (req, res, next) => {
    try {
        throw new Error('Async error occurred');
    } catch (error) {
        next(error);
    }
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
    // Log error
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    
    // Default error status
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(status).json({
        error: {
            message: message,
            status: status,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 handler (must be after all routes)
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Route not found',
            status: 404,
            path: req.path
        }
    });
});

app.listen(3000);
```

### 2. Advanced Error Handling

```javascript
const express = require('express');
const app = express();

// Custom error classes
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(field, value) {
        super(`Invalid value '${value}' for field '${field}'`, 400);
        this.field = field;
        this.value = value;
    }
}

// Error handling utilities
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

const createError = (message, statusCode) => {
    return new AppError(message, statusCode);
};

// Routes with error handling
app.get('/users/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
        return next(new ValidationError('id', id));
    }
    
    // Simulate database lookup
    if (id === '999') {
        return next(createError('User not found', 404));
    }
    
    if (id === '500') {
        throw new Error('Database connection failed');
    }
    
    res.json({ user: { id: parseInt(id), name: 'John Doe' } });
}));

// Mongoose/MongoDB error handler
const handleMongoError = (err) => {
    if (err.name === 'CastError') {
        return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
    }
    
    if (err.code === 11000) {
        const value = err.errmsg.match(/(["'])(\\\\?.)*?\\1/)[0];
        return new AppError(`Duplicate field value: ${value}`, 400);
    }
    
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => val.message);
        return new AppError(`Invalid input data: ${errors.join('. ')}`, 400);
    }
    
    return err;
};

// JWT error handler
const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

// Global error handling middleware
app.use((err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('ERROR 💥:', err);
    }
    
    // Handle specific error types
    if (err.name === 'CastError') error = handleMongoError(error);
    if (err.name === 'ValidationError') error = handleMongoError(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (err.code === 11000) error = handleMongoError(error);
    
    // Send error response
    const statusCode = error.statusCode || 500;
    const status = error.status || 'error';
    
    res.status(statusCode).json({
        status: status,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && {
            error: error,
            stack: error.stack
        })
    });
});

app.listen(3000);
```

## Ví dụ thực tế: RESTful API với Routes và Middleware

```javascript
// models/User.js (Mock database)
class User {
    constructor(id, name, email) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = new Date();
    }
}

// Mock database
let users = [
    new User(1, 'John Doe', 'john@example.com'),
    new User(2, 'Jane Smith', 'jane@example.com')
];
let nextId = 3;

// middleware/auth.js
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    // Mock token verification
    if (token === 'valid-token') {
        req.user = { id: 1, role: 'admin' };
        next();
    } else {
        res.status(403).json({ error: 'Invalid token' });
    }
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            res.status(403).json({ error: `${role} role required` });
        }
    };
};

// middleware/validation.js
const validateUser = (req, res, next) => {
    const { name, email } = req.body;
    
    if (!name || name.trim().length < 2) {
        return res.status(400).json({ 
            error: 'Name is required and must be at least 2 characters' 
        });
    }
    
    if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
        return res.status(400).json({ 
            error: 'Valid email is required' 
        });
    }
    
    // Check for duplicate email
    const existingUser = users.find(u => u.email === email && u.id !== parseInt(req.params.id));
    if (existingUser) {
        return res.status(409).json({ 
            error: 'Email already exists' 
        });
    }
    
    next();
};

// routes/users.js
const express = require('express');
const router = express.Router();

// Get all users
router.get('/', (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    
    let filteredUsers = users;
    
    // Search functionality
    if (search) {
        filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    res.json({
        users: paginatedUsers,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredUsers.length / limit),
            totalUsers: filteredUsers.length,
            hasNext: endIndex < filteredUsers.length,
            hasPrev: startIndex > 0
        }
    });
});

// Get user by ID
router.get('/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
});

// Create new user
router.post('/', validateUser, (req, res) => {
    const { name, email } = req.body;
    
    const newUser = new User(nextId++, name, email);
    users.push(newUser);
    
    res.status(201).json({ 
        message: 'User created successfully',
        user: newUser 
    });
});

// Update user
router.put('/:id', authenticateToken, validateUser, (req, res) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const { name, email } = req.body;
    users[userIndex].name = name;
    users[userIndex].email = email;
    users[userIndex].updatedAt = new Date();
    
    res.json({ 
        message: 'User updated successfully',
        user: users[userIndex] 
    });
});

// Delete user
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const deletedUser = users.splice(userIndex, 1)[0];
    
    res.json({ 
        message: 'User deleted successfully',
        user: deletedUser 
    });
});

module.exports = router;

// app.js - Main application
const express = require('express');
const userRoutes = require('./routes/users');

const app = express();

// Global middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Mount routes
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        method: req.method,
        path: req.path
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  GET    /api/users`);
    console.log(`  GET    /api/users/:id`);
    console.log(`  POST   /api/users`);
    console.log(`  PUT    /api/users/:id`);
    console.log(`  DELETE /api/users/:id`);
    console.log(`  GET    /health`);
});
```

## Best Practices

### 1. Route Organization
- Sử dụng Express Router để tách routes thành modules
- Nhóm related routes trong cùng file
- Sử dụng consistent naming convention

### 2. Middleware Strategy
- Đặt middleware theo thứ tự logic
- Sử dụng error handling middleware cuối cùng
- Tạo reusable middleware functions

### 3. Error Handling
- Luôn handle errors trong async routes
- Sử dụng consistent error response format
- Log errors để debugging

### 4. Security
- Validate và sanitize input data
- Implement authentication và authorization
- Use HTTPS trong production

## Bài tập thực hành

### Bài 1: Blog API
Tạo REST API cho blog với routes để quản lý posts, comments, và categories.

### Bài 2: E-commerce API
Xây dựng API cho e-commerce với products, orders, và shopping cart.

### Bài 3: Task Management API
Tạo API quản lý tasks với authentication và role-based permissions.

### Bài 4: File Upload API
Implement file upload với validation và storage management.

## Tổng kết

Routes và Middleware là nền tảng của Express.js applications:

- Routes định nghĩa endpoints và cách xử lý requests
- Middleware cung cấp reusable functionality
- Router giúp tổ chức code modular
- Error handling middleware xử lý lỗi centralized
- Proper middleware ordering và error handling là critical cho production apps
