# Environment Variables

Environment Variables là một phần quan trọng trong việc quản lý cấu hình ứng dụng, đặc biệt trong các môi trường deployment khác nhau.

## Lý thuyết

### Environment Variables là gì?

Environment Variables (biến môi trường) là các giá trị được lưu trữ bên ngoài source code, giúp:

- **Tách biệt cấu hình**: Không hardcode sensitive data trong code
- **Flexibility**: Dễ dàng thay đổi config giữa các environments
- **Security**: Bảo vệ secrets và API keys
- **Portability**: Ứng dụng chạy được trên nhiều environments

### Common Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=admin
DB_PASSWORD=secret123

# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# API Keys
JWT_SECRET=super-secret-key
STRIPE_SECRET_KEY=sk_test_xxxxx
SENDGRID_API_KEY=SG.xxxxx

# Third-party Services
REDIS_URL=redis://localhost:6379
CLOUDINARY_URL=cloudinary://xxxxx
```

## Ví dụ thực tế

### 1. Setup Environment Variables trong Node.js

**Cài đặt dotenv:**
```bash
npm install dotenv
```

**Tạo file .env:**
```env
# .env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/myapp
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Load environment variables:**
```javascript
// config/env.js
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'myapp',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  redis: {
    url: process.env.REDIS_URL
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  }
};

module.exports = config;
```

### 2. Environment-specific Configuration

**config/database.js:**
```javascript
const config = require('./env');

const databaseConfig = {
  development: {
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    username: config.database.user,
    password: config.database.password,
    dialect: 'postgresql',
    logging: console.log
  },
  test: {
    host: config.database.host,
    port: config.database.port,
    database: `${config.database.name}_test`,
    username: config.database.user,
    password: config.database.password,
    dialect: 'postgresql',
    logging: false
  },
  production: {
    url: config.database.url,
    dialect: 'postgresql',
    logging: false,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

module.exports = databaseConfig[config.env];
```

### 3. Validation Environment Variables

**config/validation.js:**
```javascript
const Joi = require('joi');

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  PORT: Joi.number()
    .positive()
    .default(3000),
  
  DATABASE_URL: Joi.string()
    .required()
    .description('Database connection URL'),
  
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('JWT secret key'),
  
  STRIPE_SECRET_KEY: Joi.string()
    .pattern(/^sk_(test|live)_/)
    .required()
    .description('Stripe secret key'),
  
  EMAIL_USER: Joi.string()
    .email()
    .required()
    .description('Email user for sending emails'),
  
  EMAIL_PASS: Joi.string()
    .required()
    .description('Email password or app password'),
  
  REDIS_URL: Joi.string()
    .uri()
    .default('redis://localhost:6379')
    .description('Redis connection URL')
}).unknown(true);

const { error, value: validatedEnv } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

module.exports = validatedEnv;
```

### 4. Environment Variables trong Frontend

**Next.js example:**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Public variables (accessible in browser)
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
  // Private variables (server-side only)
  serverRuntimeConfig: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
  }
};

module.exports = nextConfig;
```

**React with Vite:**
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    'process.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_STRIPE_PUBLISHABLE_KEY),
  }
});
```

## Best Practices

### 1. Security Best Practices

```bash
# ✅ Good practices
JWT_SECRET=very-long-random-string-with-special-chars-123!@#
DATABASE_URL=postgresql://user:pass@host:5432/db
API_KEY=sk_live_random_key_here

# ❌ Bad practices
JWT_SECRET=123
PASSWORD=password
API_KEY=test_key
```

### 2. File Structure

```
project/
├── .env                    # Local development (not committed)
├── .env.example           # Template (committed)
├── .env.local             # Local overrides (not committed)
├── .env.development       # Development config (committed)
├── .env.staging           # Staging config (committed)
├── .env.production        # Production config (secure storage)
└── config/
    ├── env.js            # Environment loader
    ├── database.js       # Database config
    └── validation.js     # Environment validation
```

### 3. .gitignore Setup

```gitignore
# Environment files
.env
.env.local
.env.*.local

# Keep example files
!.env.example
!.env.development
!.env.staging
```

### 4. Environment Validation

```javascript
// utils/validateEnv.js
function validateEnv() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'STRIPE_SECRET_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  
  // Validate NODE_ENV
  const validEnvs = ['development', 'staging', 'production', 'test'];
  if (!validEnvs.includes(process.env.NODE_ENV)) {
    throw new Error(`NODE_ENV must be one of: ${validEnvs.join(', ')}`);
  }
}

module.exports = validateEnv;
```

## Bài tập thực hành

### Bài tập 1: Setup Basic Environment
1. Tạo file `.env` với các biến cơ bản
2. Setup dotenv trong Node.js app
3. Tạo config module để load environment variables
4. Validate các biến bắt buộc

### Bài tập 2: Multi-Environment Setup
1. Tạo `.env.development`, `.env.staging`, `.env.production`
2. Setup logic để load đúng file theo NODE_ENV
3. Test switching giữa các environments

### Bài tập 3: Environment Validation
1. Cài đặt Joi hoặc tự viết validation
2. Validate tất cả environment variables
3. Tạo meaningful error messages
4. Test với invalid values

### Bài tập 4: Frontend Environment Variables
1. Setup environment variables trong React/Next.js
2. Tạo build scripts cho different environments
3. Test public vs private variables

### Bài tập 5: Security Audit
1. Review tất cả environment variables
2. Identify sensitive data
3. Ensure không có secrets trong git history
4. Setup environment variable rotation plan

## Tài liệu tham khảo

### Official Documentation
- [Node.js Environment Variables](https://nodejs.org/api/process.html#process_process_env)
- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

### Security Resources
- [OWASP Environment Security](https://owasp.org/www-project-application-security-verification-standard/)
- [12 Factor App - Config](https://12factor.net/config)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### Tools
- [dotenv-safe](https://github.com/rolodato/dotenv-safe) - Safe loading of environment variables
- [env-cmd](https://github.com/toddbluhm/env-cmd) - Run commands with environment variables
- [cross-env](https://github.com/kentcdodds/cross-env) - Cross-platform environment variables

---

**Lưu ý quan trọng**: 
- Không bao giờ commit `.env` files chứa sensitive data
- Sử dụng strong, unique secrets cho production
- Validate environment variables at startup
- Document tất cả required environment variables
- Rotate secrets định kỳ
