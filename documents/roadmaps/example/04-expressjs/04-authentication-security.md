# Authentication và Security trong ExpressJS

## Mục lục
1. [Password Hashing](#password-hashing)
2. [JWT Authentication](#jwt-authentication)
3. [Session-based Authentication](#session-based-authentication)
4. [OAuth2 Integration](#oauth2-integration)
5. [Security Best Practices](#security-best-practices)
6. [Rate Limiting](#rate-limiting)
7. [CORS và CSRF Protection](#cors-và-csrf-protection)
8. [Ví dụ thực tế](#ví-dụ-thực-tế)

## Password Hashing

### Bcrypt cho Password Security

```javascript
const bcrypt = require('bcryptjs');
const express = require('express');
const app = express();

app.use(express.json());

// Hash password khi đăng ký
const hashPassword = async (password) => {
  try {
    const saltRounds = 12; // Độ phức tạp cao
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error('Lỗi hash password');
  }
};

// So sánh password
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Lỗi so sánh password');
  }
};

// User registration
const users = []; // Thực tế sẽ dùng database

app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email và password là bắt buộc'
      });
    }
    
    // Check password strength
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password phải ít nhất 8 ký tự'
      });
    }
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        error: 'Email đã được sử dụng'
      });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = {
      id: Date.now(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    users.push(user);
    
    // Return user without password
    const { password: _, ...userResponse } = user;
    
    res.status(201).json({
      message: 'Đăng ký thành công',
      user: userResponse
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Lỗi server: ' + error.message
    });
  }
});

// User login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email và password là bắt buộc'
      });
    }
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Email hoặc password không đúng'
      });
    }
    
    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Email hoặc password không đúng'
      });
    }
    
    // Success login
    const { password: _, ...userResponse } = user;
    
    res.json({
      message: 'Đăng nhập thành công',
      user: userResponse
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Lỗi server: ' + error.message
    });
  }
});
```

## JWT Authentication

### JWT Implementation

```javascript
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT Secret (nên lưu trong environment variable)
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'your-app-name',
    audience: 'your-app-users'
  });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token không hợp lệ');
  }
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      error: 'Access token is required'
    });
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Token không hợp lệ hoặc đã hết hạn'
    });
  }
};

// Login với JWT
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find and verify user (tương tự như trên)
    const user = users.find(u => u.email === email);
    if (!user || !await comparePassword(password, user.password)) {
      return res.status(401).json({
        error: 'Email hoặc password không đúng'
      });
    }
    
    // Generate tokens
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username
    };
    
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken({ id: user.id });
    
    // Store refresh token (thực tế lưu vào database)
    user.refreshToken = refreshToken;
    
    res.json({
      message: 'Đăng nhập thành công',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Lỗi server: ' + error.message
    });
  }
});

// Refresh token
app.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({
      error: 'Refresh token is required'
    });
  }
  
  try {
    const decoded = verifyToken(refreshToken);
    const user = users.find(u => u.id === decoded.id);
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        error: 'Invalid refresh token'
      });
    }
    
    // Generate new access token
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username
    };
    
    const newAccessToken = generateToken(payload);
    
    res.json({
      accessToken: newAccessToken
    });
    
  } catch (error) {
    res.status(403).json({
      error: 'Invalid refresh token'
    });
  }
});

// Protected route
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Profile data',
    user: req.user
  });
});

// Logout
app.post('/auth/logout', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (user) {
    user.refreshToken = null; // Invalidate refresh token
  }
  
  res.json({
    message: 'Đăng xuất thành công'
  });
});
```

### Role-based Authorization

```javascript
// Role middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Không có quyền truy cập'
      });
    }
    
    next();
  };
};

// Admin only route
app.get('/admin/users', 
  authenticateToken, 
  authorizeRoles('admin'), 
  (req, res) => {
    res.json({
      users: users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role
      }))
    });
  }
);

// Admin or moderator
app.delete('/api/posts/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'moderator'), 
  (req, res) => {
    // Delete post logic
    res.json({ message: 'Post deleted' });
  }
);

// Resource owner or admin
const authorizeResourceOwner = (req, res, next) => {
  const resourceUserId = parseInt(req.params.userId);
  const currentUserId = req.user.id;
  const userRole = req.user.role;
  
  if (currentUserId === resourceUserId || userRole === 'admin') {
    next();
  } else {
    res.status(403).json({
      error: 'Chỉ có thể truy cập tài nguyên của chính mình'
    });
  }
};

app.get('/api/users/:userId/profile', 
  authenticateToken, 
  authorizeResourceOwner, 
  (req, res) => {
    // Get user profile
    res.json({ message: 'User profile' });
  }
);
```

## Session-based Authentication

### Express Session Configuration

```javascript
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  name: 'sessionId', // Đổi tên cookie để tăng bảo mật
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration time mỗi request
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // CSRF protection
  }
}));

// Session-based login
app.post('/auth/session-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user || !await comparePassword(password, user.password)) {
      return res.status(401).json({
        error: 'Email hoặc password không đúng'
      });
    }
    
    // Create session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    res.json({
      message: 'Đăng nhập thành công',
      user: req.session.user
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Lỗi server: ' + error.message
    });
  }
});

// Session authentication middleware
const requireSession = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({
      error: 'Cần đăng nhập'
    });
  }
};

// Session-based protected route
app.get('/dashboard', requireSession, (req, res) => {
  res.json({
    message: 'Dashboard data',
    user: req.session.user
  });
});

// Session logout
app.post('/auth/session-logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Lỗi đăng xuất'
      });
    }
    
    res.clearCookie('sessionId');
    res.json({
      message: 'Đăng xuất thành công'
    });
  });
});
```

## OAuth2 Integration

### Google OAuth2

```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Passport configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = users.find(u => u.googleId === profile.id);
    
    if (user) {
      return done(null, user);
    }
    
    // Create new user
    user = {
      id: Date.now(),
      googleId: profile.id,
      username: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0].value,
      provider: 'google',
      createdAt: new Date()
    };
    
    users.push(user);
    return done(null, user);
    
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize/deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/dashboard');
  }
);

// GitHub OAuth
const GitHubStrategy = require('passport-github2').Strategy;

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = users.find(u => u.githubId === profile.id);
    
    if (user) {
      return done(null, user);
    }
    
    user = {
      id: Date.now(),
      githubId: profile.id,
      username: profile.username,
      email: profile.emails ? profile.emails[0].value : null,
      avatar: profile.photos[0].value,
      provider: 'github',
      createdAt: new Date()
    };
    
    users.push(user);
    return done(null, user);
    
  } catch (error) {
    return done(error, null);
  }
}));

app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);
```

## Security Best Practices

### Helmet.js cho Security Headers

```javascript
const helmet = require('helmet');

// Basic helmet usage
app.use(helmet());

// Custom helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Additional security middleware
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Sanitize data
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP Parameter Pollution
```

## Rate Limiting

### Express Rate Limit

```javascript
const rateLimit = require('express-rate-limit');

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Quá nhiều requests, vui lòng thử lại sau'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

// Strict rate limiting cho auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit login attempts
  message: {
    error: 'Quá nhiều lần đăng nhập, vui lòng thử lại sau 15 phút'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Apply rate limiting
app.use(generalLimiter);
app.use('/auth', authLimiter);

// Custom rate limiter với Redis
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient();

const redisLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: (req) => {
    if (req.user && req.user.role === 'premium') {
      return 1000; // Premium users get more requests
    }
    return 100; // Free users
  },
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  },
});

app.use('/api', apiLimiter);
```

## CORS và CSRF Protection

### CORS Configuration

```javascript
const cors = require('cors');

// Basic CORS
app.use(cors());

// Custom CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://yourapp.com',
      'https://www.yourapp.com'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// CSRF Protection
const csrf = require('csurf');

// CSRF middleware
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Apply CSRF protection to forms
app.use('/api', csrfProtection);

// Provide CSRF token
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

## Ví dụ thực tế

### Complete Authentication System

```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Quá nhiều lần đăng nhập' }
});

// In-memory storage (use database in production)
const users = [];
const blacklistedTokens = new Set();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// Utility functions
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
  
  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  });
  
  return { accessToken, refreshToken };
};

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ error: 'Token đã bị vô hiệu hóa' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token không hợp lệ' });
  }
};

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username từ 3-20 ký tự')
    .isAlphanumeric()
    .withMessage('Username chỉ chứa chữ và số'),
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password ít nhất 8 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password phải có chữ hoa, chữ thường, số và ký tự đặc biệt')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Password là bắt buộc')
];

// Check validation errors
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
// Register
app.post('/auth/register', 
  registerValidation, 
  checkValidation, 
  async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if user exists
      if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email đã tồn tại' });
      }
      
      if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Username đã tồn tại' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user
      const user = {
        id: Date.now(),
        username,
        email,
        password: hashedPassword,
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        lastLogin: null
      };
      
      users.push(user);
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);
      user.refreshToken = refreshToken;
      
      res.status(201).json({
        message: 'Đăng ký thành công',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Login
app.post('/auth/login', 
  authLimiter,
  loginValidation, 
  checkValidation, 
  async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ error: 'Thông tin đăng nhập không đúng' });
      }
      
      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({ error: 'Tài khoản đã bị khóa' });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Thông tin đăng nhập không đúng' });
      }
      
      // Update last login
      user.lastLogin = new Date();
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);
      user.refreshToken = refreshToken;
      
      res.json({
        message: 'Đăng nhập thành công',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        },
        accessToken,
        refreshToken
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Refresh token
app.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = users.find(u => u.id === decoded.id);
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }
    
    // Generate new tokens
    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    
    res.json(tokens);
    
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// Logout
app.post('/auth/logout', authenticateToken, (req, res) => {
  // Add token to blacklist
  blacklistedTokens.add(req.token);
  
  // Clear refresh token
  const user = users.find(u => u.id === req.user.id);
  if (user) {
    user.refreshToken = null;
  }
  
  res.json({ message: 'Đăng xuất thành công' });
});

// Change password
app.post('/auth/change-password', 
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password ít nhất 8 ký tự')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password phải có chữ hoa, chữ thường, số và ký tự đặc biệt')
  ],
  checkValidation,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = users.find(u => u.id === req.user.id);
      
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      
      // Invalidate all sessions
      user.refreshToken = null;
      blacklistedTokens.add(req.token);
      
      res.json({ message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' });
      
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Protected route
app.get('/api/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  
  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }
  });
});

// Admin only route
app.get('/admin/users', 
  authenticateToken, 
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  },
  (req, res) => {
    const userList = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin
    }));
    
    res.json({ users: userList });
  }
);

// Error handling
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chạy trên port ${PORT}`);
});
```

## Best Practices

### 1. Password Security
- Sử dụng bcrypt với salt rounds >= 12
- Implement password policies
- Consider password history
- Use secure password reset flows

### 2. JWT Security
- Short access token expiration
- Implement token blacklisting
- Use secure JWT secrets
- Include necessary claims only

### 3. Session Security
- Use secure session stores
- Implement session timeouts
- Regenerate session IDs
- Secure cookie settings

### 4. General Security
- Always use HTTPS in production
- Implement rate limiting
- Validate all inputs
- Log security events
- Keep dependencies updated

## Exercises

1. **JWT Authentication**: Implement complete JWT auth với refresh tokens
2. **OAuth Integration**: Tích hợp Google và GitHub OAuth
3. **Multi-factor Authentication**: Thêm 2FA với TOTP
4. **Password Reset**: Implement secure password reset flow
5. **Security Audit**: Thực hiện security review cho existing app

## Tổng kết

Authentication và Security là những yếu tố quan trọng nhất trong web development. Chương này đã cung cấp knowledge và tools cần thiết để implement secure authentication systems, từ basic password hashing đến advanced techniques như JWT, OAuth2, và comprehensive security measures. Luôn nhớ security là một quá trình liên tục, không phải một lần setup.
