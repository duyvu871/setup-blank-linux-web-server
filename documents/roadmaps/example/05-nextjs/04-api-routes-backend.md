# API Routes và Backend Integration trong NextJS

## Tổng quan về API Routes

NextJS cho phép tạo API endpoints ngay trong ứng dụng React thông qua thư mục `pages/api/`. Mỗi file trong thư mục này trở thành một API route.

### Cấu trúc API Routes
```
pages/
  └── api/
      ├── hello.js           // GET /api/hello
      ├── users/
      │   ├── index.js       // /api/users
      │   ├── [id].js        // /api/users/:id
      │   └── profile.js     // /api/users/profile
      └── auth/
          ├── login.js       // /api/auth/login
          └── register.js    // /api/auth/register
```

## Tạo API Endpoints cơ bản

### Simple API Handler
```javascript
// pages/api/hello.js
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Xin chào từ NextJS API!',
    timestamp: new Date().toISOString()
  });
}
```

### HTTP Methods Handling
```javascript
// pages/api/users/index.js
const users = [
  { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com' },
  { id: 2, name: 'Trần Thị B', email: 'b@example.com' }
];

export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Lấy danh sách users
      res.status(200).json({
        success: true,
        data: users,
        total: users.length
      });
      break;

    case 'POST':
      // Tạo user mới
      const { name, email } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin name hoặc email'
        });
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      
      res.status(201).json({
        success: true,
        data: newUser,
        message: 'Tạo user thành công'
      });
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({
        success: false,
        message: `Method ${method} not allowed`
      });
  }
}
```

### Dynamic API Routes
```javascript
// pages/api/users/[id].js
export default function handler(req, res) {
  const { method, query: { id } } = req;

  switch (method) {
    case 'GET':
      // Lấy thông tin user theo ID
      const user = getUserById(parseInt(id));
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy user'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });
      break;

    case 'PUT':
      // Cập nhật user
      const updateData = req.body;
      const updatedUser = updateUser(parseInt(id), updateData);
      
      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Cập nhật thành công'
      });
      break;

    case 'DELETE':
      // Xóa user
      const deleted = deleteUser(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy user để xóa'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Xóa user thành công'
      });
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
```

## Database Integration

### MongoDB với Mongoose
```javascript
// lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
```

```javascript
// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên'],
    maxlength: [50, 'Tên không được vượt quá 50 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập password'],
    minlength: [6, 'Password phải có ít nhất 6 ký tự'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
```

```javascript
// pages/api/users/index.js
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  await connectToDatabase();

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const users = await User.find({}).select('-password');
        res.status(200).json({
          success: true,
          count: users.length,
          data: users
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Lỗi server'
        });
      }
      break;

    case 'POST':
      try {
        const user = await User.create(req.body);
        res.status(201).json({
          success: true,
          data: user
        });
      } catch (error) {
        if (error.code === 11000) {
          return res.status(400).json({
            success: false,
            message: 'Email đã tồn tại'
          });
        }
        
        res.status(400).json({
          success: false,
          message: error.message
        });
      }
      break;

    default:
      res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
  }
}
```

### MySQL với Prisma
```javascript
// lib/prisma.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

```javascript
// pages/api/products/index.js
import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { page = 1, limit = 10, category } = req.query;
        const skip = (page - 1) * limit;

        const where = category ? { category } : {};

        const [products, total] = await Promise.all([
          prisma.product.findMany({
            where,
            skip: parseInt(skip),
            take: parseInt(limit),
            include: {
              category: true,
              reviews: {
                take: 5,
                orderBy: { createdAt: 'desc' }
              }
            }
          }),
          prisma.product.count({ where })
        ]);

        res.status(200).json({
          success: true,
          data: products,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Lỗi khi lấy danh sách sản phẩm'
        });
      }
      break;

    case 'POST':
      try {
        const product = await prisma.product.create({
          data: req.body,
          include: {
            category: true
          }
        });

        res.status(201).json({
          success: true,
          data: product
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      }
      break;

    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
}
```

## Authentication Implementation

### JWT Authentication
```javascript
// lib/auth.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}
```

```javascript
// pages/api/auth/login.js
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';
import { comparePassword, generateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectToDatabase();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập email và password'
    });
  }

  try {
    // Tìm user và include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc password không đúng'
      });
    }

    // Kiểm tra password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc password không đúng'
      });
    }

    // Tạo JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Set httpOnly cookie
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}`);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
}
```

### Protected Routes Middleware
```javascript
// lib/middleware/auth.js
import { verifyToken } from '../auth';

export function withAuth(handler) {
  return async (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = decoded;
    return handler(req, res);
  };
}

export function withRole(roles) {
  return function(handler) {
    return withAuth(async (req, res) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      return handler(req, res);
    });
  };
}
```

```javascript
// pages/api/admin/users.js
import { withRole } from '../../../lib/middleware/auth';
import User from '../../../models/User';

async function handler(req, res) {
  if (req.method === 'GET') {
    const users = await User.find({}).select('-password');
    res.status(200).json({
      success: true,
      data: users
    });
  }
}

export default withRole(['admin'])(handler);
```

## File Upload Handling

### Image Upload với Multer
```javascript
// lib/upload.js
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh!'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
```

```javascript
// pages/api/upload.js
import { upload } from '../../lib/upload';
import { withAuth } from '../../lib/middleware/auth';

// Disable bodyParser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const uploadSingle = upload.single('image');

  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file nào được upload'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Upload thành công',
      file: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size
      }
    });
  });
}

export default withAuth(handler);
```

## Error Handling và Validation

### Validation với Joi
```javascript
// lib/validation.js
import Joi from 'joi';

export const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'admin').default('user')
});

export const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().required(),
  stock: Joi.number().integer().min(0).required()
});

export function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
}
```

### Global Error Handler
```javascript
// lib/middleware/errorHandler.js
export function errorHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);

      // Database validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation Error',
          details: Object.values(error.errors).map(err => err.message)
        });
      }

      // Duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate field value entered'
        });
      }

      // JWT errors
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      // Default error
      res.status(500).json({
        success: false,
        message: 'Internal Server Error'
      });
    }
  };
}
```

## API Integration trên Client

### Custom Hooks cho API calls
```javascript
// hooks/useApi.js
import { useState, useEffect } from 'react';

export function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}
```

```javascript
// hooks/useUsers.js
import { useApi } from './useApi';

export function useUsers() {
  const { data, loading, error } = useApi('/api/users');

  return {
    users: data?.data || [],
    loading,
    error
  };
}

export async function createUser(userData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}
```

## Best Practices

### 1. API Response Format
```javascript
// Standardized response format
const successResponse = {
  success: true,
  data: {},
  message: 'Operation successful'
};

const errorResponse = {
  success: false,
  message: 'Error message',
  details: [] // Optional validation details
};
```

### 2. Rate Limiting
```javascript
// lib/middleware/rateLimit.js
const rateLimit = {};

export function withRateLimit(limit = 100, windowMs = 15 * 60 * 1000) {
  return (handler) => {
    return (req, res) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - windowMs;

      if (!rateLimit[ip]) {
        rateLimit[ip] = [];
      }

      // Remove old requests
      rateLimit[ip] = rateLimit[ip].filter(time => time > windowStart);

      if (rateLimit[ip].length >= limit) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests'
        });
      }

      rateLimit[ip].push(now);
      return handler(req, res);
    };
  };
}
```

### 3. API Documentation
```javascript
// pages/api/users/index.js
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
```

## Tóm tắt

- API Routes trong `pages/api/` directory
- Support tất cả HTTP methods
- Database integration với MongoDB/MySQL
- Authentication với JWT và middleware
- File upload handling
- Error handling và validation
- Rate limiting và security
- Client-side API integration

## Bài tập thực hành

1. Tạo Blog API:
   - CRUD operations cho posts
   - Authentication cho admin
   - File upload cho images
   - Comments system

2. E-commerce API:
   - Products management
   - Shopping cart functionality
   - Order processing
   - Payment integration

3. Social Media API:
   - User profiles
   - Posts và likes
   - Real-time notifications
   - Image uploads
