# Xử Lý Dữ Liệu trong ExpressJS

## Mục lục
1. [Request Body Parsing](#request-body-parsing)
2. [Form Data và File Upload](#form-data-và-file-upload)
3. [Validation và Sanitization](#validation-và-sanitization)
4. [Cookie và Session](#cookie-và-session)
5. [Error Handling](#error-handling)
6. [Ví dụ thực tế](#ví-dụ-thực-tế)

## Request Body Parsing

### JSON và URL-encoded Data

```javascript
const express = require('express');
const app = express();

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// Xử lý JSON data
app.post('/api/users', (req, res) => {
  const { name, email, age } = req.body;
  
  // Validate data
  if (!name || !email) {
    return res.status(400).json({
      error: 'Name và email là bắt buộc'
    });
  }
  
  // Process data
  const user = {
    id: Date.now(),
    name,
    email,
    age: age || null
  };
  
  res.status(201).json({
    message: 'User được tạo thành công',
    user
  });
});

// Xử lý form data
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  
  console.log('Contact form:', { name, email, message });
  
  res.redirect('/thank-you');
});
```

### Raw Data Parsing

```javascript
// Parse raw text
app.use('/webhook', express.raw({ type: 'application/octet-stream' }));

// Parse text
app.use('/api/text', express.text({ type: 'text/plain' }));

// Custom parser
app.use('/api/custom', (req, res, next) => {
  if (req.headers['content-type'] === 'application/custom') {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      req.body = parseCustomData(data);
      next();
    });
  } else {
    next();
  }
});
```

## Form Data và File Upload

### Multer cho File Upload

```javascript
const multer = require('multer');
const path = require('path');

// Cấu hình storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload image files'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Single file upload
app.post('/upload/avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Không có file nào được upload'
    });
  }
  
  res.json({
    message: 'Upload thành công',
    file: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    }
  });
});

// Multiple files upload
app.post('/upload/gallery', upload.array('photos', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      error: 'Không có file nào được upload'
    });
  }
  
  const files = req.files.map(file => ({
    filename: file.filename,
    originalname: file.originalname,
    size: file.size
  }));
  
  res.json({
    message: `Upload ${files.length} files thành công`,
    files
  });
});

// Mixed form data với files
app.post('/products', upload.single('image'), (req, res) => {
  const { name, price, description } = req.body;
  const image = req.file;
  
  const product = {
    id: Date.now(),
    name,
    price: parseFloat(price),
    description,
    image: image ? image.filename : null
  };
  
  res.json({
    message: 'Sản phẩm được tạo thành công',
    product
  });
});
```

### Memory Storage cho File Upload

```javascript
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

app.post('/upload/process', memoryUpload.single('document'), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    
    // Process file in memory
    const processedData = await processDocument(buffer);
    
    res.json({
      message: 'File được xử lý thành công',
      result: processedData
    });
  } catch (error) {
    res.status(500).json({
      error: 'Lỗi xử lý file: ' + error.message
    });
  }
});
```

## Validation và Sanitization

### Express Validator

```javascript
const { body, validationResult, param, query } = require('express-validator');

// Validation rules
const userValidation = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên phải từ 2-50 ký tự')
    .trim()
    .escape(),
  
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('age')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Tuổi phải từ 1-120'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Mật khẩu phải ít nhất 8 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải có chữ hoa, chữ thường và số')
];

// Check validation errors middleware
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  
  next();
};

// Use validation
app.post('/api/users', userValidation, checkValidation, (req, res) => {
  const { name, email, age, password } = req.body;
  
  // Data đã được validate và sanitize
  const user = {
    id: Date.now(),
    name,
    email,
    age
  };
  
  res.json({ user });
});

// Validate params
app.get('/api/users/:id', 
  param('id').isInt().withMessage('ID phải là số'),
  checkValidation,
  (req, res) => {
    const userId = parseInt(req.params.id);
    // Find user...
    res.json({ userId });
  }
);

// Validate query params
app.get('/api/products',
  query('page').optional().isInt({ min: 1 }).withMessage('Page phải là số dương'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit từ 1-100'),
  query('category').optional().isIn(['electronics', 'clothing', 'books']),
  checkValidation,
  (req, res) => {
    const { page = 1, limit = 10, category } = req.query;
    // Get products...
    res.json({ page, limit, category });
  }
);
```

### Custom Validation

```javascript
// Custom validator functions
const customValidators = {
  isVietnamesePhoneNumber: (value) => {
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    return phoneRegex.test(value);
  },
  
  isStrongPassword: (value) => {
    return value.length >= 8 && 
           /[a-z]/.test(value) && 
           /[A-Z]/.test(value) && 
           /\d/.test(value) && 
           /[!@#$%^&*]/.test(value);
  }
};

// Use custom validators
const profileValidation = [
  body('phone')
    .custom(customValidators.isVietnamesePhoneNumber)
    .withMessage('Số điện thoại không hợp lệ'),
  
  body('password')
    .custom(customValidators.isStrongPassword)
    .withMessage('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt')
];
```

## Cookie và Session

### Cookies

```javascript
const cookieParser = require('cookie-parser');

app.use(cookieParser('secret-key'));

// Set cookies
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Verify credentials...
  if (isValidCredentials(username, password)) {
    // Set cookie
    res.cookie('username', username, {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true, // Prevent XSS
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict' // CSRF protection
    });
    
    // Signed cookie
    res.cookie('user_id', '12345', { signed: true });
    
    res.json({ message: 'Đăng nhập thành công' });
  } else {
    res.status(401).json({ error: 'Thông tin đăng nhập không đúng' });
  }
});

// Read cookies
app.get('/profile', (req, res) => {
  const username = req.cookies.username;
  const userId = req.signedCookies.user_id;
  
  if (!username) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }
  
  res.json({ username, userId });
});

// Clear cookies
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.clearCookie('user_id');
  res.json({ message: 'Đăng xuất thành công' });
});
```

### Sessions

```javascript
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Session configuration
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/session-store'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Set session data
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (isValidCredentials(username, password)) {
    req.session.user = {
      id: getUserId(username),
      username,
      role: getUserRole(username)
    };
    
    res.json({ message: 'Đăng nhập thành công' });
  } else {
    res.status(401).json({ error: 'Thông tin đăng nhập không đúng' });
  }
});

// Check authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Cần đăng nhập' });
  }
};

// Protected route
app.get('/dashboard', requireAuth, (req, res) => {
  res.json({
    message: 'Chào mừng đến dashboard',
    user: req.session.user
  });
});

// Session data manipulation
app.post('/cart/add', requireAuth, (req, res) => {
  const { productId, quantity } = req.body;
  
  if (!req.session.cart) {
    req.session.cart = [];
  }
  
  req.session.cart.push({ productId, quantity });
  
  res.json({
    message: 'Thêm vào giỏ hàng thành công',
    cartItems: req.session.cart.length
  });
});

// Destroy session
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi đăng xuất' });
    }
    
    res.clearCookie('connect.sid');
    res.json({ message: 'Đăng xuất thành công' });
  });
});
```

## Error Handling

### Error Handling Middleware

```javascript
// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational errors: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming errors: don't leak error details
    console.error('ERROR 💥', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra!'
    });
  }
};

// Use error handling
app.use(globalErrorHandler);

// Example usage
app.get('/api/users/:id', catchAsync(async (req, res, next) => {
  const user = await getUserById(req.params.id);
  
  if (!user) {
    return next(new AppError('Không tìm thấy user', 404));
  }
  
  res.json({ user });
}));
```

## Ví dụ thực tế

### Complete User Management API

```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload setup
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload hình ảnh'), false);
    }
  }
});

// In-memory user storage (thực tế sẽ dùng database)
let users = [];
let nextId = 1;

// Validation rules
const createUserValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Tên phải ít nhất 2 ký tự'),
  body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
  body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Tuổi từ 1-120'),
];

const updateUserValidation = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Tên phải ít nhất 2 ký tự'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
  body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Tuổi từ 1-120'),
];

// Helper function
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Routes
// Get all users
app.get('/api/users', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedUsers = users.slice(startIndex, endIndex);
  
  res.json({
    users: paginatedUsers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: users.length,
      pages: Math.ceil(users.length / limit)
    }
  });
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  if (!user) {
    return res.status(404).json({ error: 'Không tìm thấy user' });
  }
  
  res.json({ user });
});

// Create new user
app.post('/api/users', 
  createUserValidation, 
  checkValidation, 
  (req, res) => {
    const { name, email, age } = req.body;
    
    // Check email uniqueness
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }
    
    const user = {
      id: nextId++,
      name,
      email,
      age: age || null,
      avatar: null,
      createdAt: new Date().toISOString()
    };
    
    users.push(user);
    
    res.status(201).json({
      message: 'User được tạo thành công',
      user
    });
  }
);

// Update user
app.put('/api/users/:id', 
  updateUserValidation, 
  checkValidation, 
  (req, res) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Không tìm thấy user' });
    }
    
    const { name, email, age } = req.body;
    
    // Check email uniqueness (exclude current user)
    if (email && users.find(u => u.email === email && u.id !== userId)) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }
    
    // Update user
    const updatedUser = {
      ...users[userIndex],
      ...(name && { name }),
      ...(email && { email }),
      ...(age !== undefined && { age }),
      updatedAt: new Date().toISOString()
    };
    
    users[userIndex] = updatedUser;
    
    res.json({
      message: 'User được cập nhật thành công',
      user: updatedUser
    });
  }
);

// Upload avatar
app.post('/api/users/:id/avatar', 
  upload.single('avatar'), 
  (req, res) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Không tìm thấy user' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file avatar' });
    }
    
    users[userIndex].avatar = req.file.filename;
    
    res.json({
      message: 'Avatar được upload thành công',
      avatar: req.file.filename
    });
  }
);

// Delete user
app.delete('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Không tìm thấy user' });
  }
  
  users.splice(userIndex, 1);
  
  res.json({ message: 'User được xóa thành công' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File quá lớn' });
    }
  }
  
  res.status(500).json({ error: error.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route không tồn tại' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chạy trên port ${PORT}`);
});
```

## Best Practices

### 1. Validation và Sanitization
- Luôn validate dữ liệu đầu vào
- Sanitize dữ liệu để tránh XSS
- Sử dụng whitelist validation
- Validate cả client và server side

### 2. File Upload Security
- Giới hạn kích thước file
- Kiểm tra file type
- Rename uploaded files
- Store files bên ngoài web root

### 3. Error Handling
- Tạo custom error classes
- Không expose sensitive information
- Log errors properly
- Graceful error handling

### 4. Performance
- Limit request size
- Use compression
- Cache validation results
- Stream large files

## Exercises

1. **Tạo API validation**: Implement một API với validation phức tạp cho user registration
2. **File upload system**: Xây dựng hệ thống upload multiple files với resize image
3. **Form handling**: Tạo form xử lý data với session storage
4. **Error handling**: Implement comprehensive error handling cho một API

## Tổng kết

Chương này đã hướng dẫn cách xử lý dữ liệu trong ExpressJS từ cơ bản đến nâng cao. Bạn đã học được cách parse request body, handle file uploads, validate dữ liệu, quản lý session/cookie và xử lý errors một cách professional. Những kiến thức này là nền tảng quan trọng để xây dựng web applications an toàn và đáng tin cậy.
