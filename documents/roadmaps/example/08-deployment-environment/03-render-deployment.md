# Render Deployment

Render là một cloud platform hiện đại cung cấp hosting cho web applications, APIs, databases và static sites với trải nghiệm developer-friendly và pricing minh bạch.

## Tại sao chọn Render?

### Ưu điểm
- **Free Tier**: Generous free tier cho personal projects
- **Auto Deploy**: Git-based deployment với zero-config
- **Managed Databases**: PostgreSQL, Redis được quản lý hoàn toàn
- **SSL**: Free SSL certificates cho tất cả sites
- **Global CDN**: Fast content delivery worldwide
- **Health Checks**: Built-in health monitoring

### Nhược điểm
- Free tier có limitations (sleep after 15 minutes inactivity)
- Ít regions hơn so với AWS/GCP
- Community ecosystem nhỏ hơn

## Service Types trên Render

### 1. Web Services
- Node.js applications
- Auto-scaling capabilities
- Custom domains
- Environment variables

### 2. Static Sites
- Frontend applications (React, Vue, etc.)
- Automatic builds từ Git
- Global CDN distribution

### 3. Background Workers
- Cron jobs
- Queue processors
- Long-running tasks

### 4. Private Services
- Internal microservices
- Database connections
- No external access

## Getting Started

### 1. Project Preparation

**Basic Node.js structure:**
```
my-render-app/
├── package.json
├── package-lock.json
├── server.js
├── .env.example
├── render.yaml (optional)
└── src/
    ├── routes/
    ├── models/
    └── middleware/
```

**package.json requirements:**
```json
{
  "name": "my-render-app",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required'"
  },
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.0.3"
  }
}
```

### 2. Basic Server Setup

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const app = express();

// Render sets PORT automatically
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Render!',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint (recommended for Render)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
```

## Deployment Methods

### Method 1: GitHub Integration (Recommended)

**Bước 1: Push code lên GitHub**
```bash
git init
git add .
git commit -m "Initial commit for Render deployment"
git remote add origin https://github.com/username/my-render-app.git
git push -u origin main
```

**Bước 2: Create Web Service trên Render**
1. Đăng nhập [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect GitHub repository
4. Configure settings:
   - **Name**: my-render-app
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Method 2: Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Method 3: Infrastructure as Code

**render.yaml:**
```yaml
services:
  - type: web
    name: my-app
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: my-postgres-db
          property: connectionString

databases:
  - name: my-postgres-db
    plan: free
    databaseName: myapp
    user: myapp_user

  - name: my-redis
    plan: free
```

## Database Integration

### PostgreSQL Setup

**Bước 1: Create PostgreSQL Database**
1. Render Dashboard → "New" → "PostgreSQL"
2. Configure:
   - **Name**: my-app-db
   - **Database**: myapp
   - **User**: myapp_user
   - **Plan**: Free (1GB storage)

**Bước 2: Get Connection Details**
```javascript
// Database configuration
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Connection test
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('📅 Database time:', result.rows[0].now);
    
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
}

testDatabaseConnection();
```

### Redis Integration

```javascript
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 1,
});

// Redis connection events
redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// Cache helper functions
const cache = {
  async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error('Cache get error:', err);
      return null;
    }
  },

  async set(key, value, ttl = 3600) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error('Cache set error:', err);
      return false;
    }
  },

  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (err) {
      console.error('Cache delete error:', err);
      return false;
    }
  }
};

module.exports = { redis, cache };
```

## Environment Variables

### Development vs Production

**Local (.env):**
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/myapp_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev_secret_key
API_URL=http://localhost:3000
```

**Render Production:**
```bash
# Set via Render dashboard:
NODE_ENV=production
JWT_SECRET=your_production_secret
API_URL=https://your-app.onrender.com

# Auto-generated by Render:
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://user:pass@host:port
PORT=10000
```

### Environment Management

```javascript
// config/environment.js
const config = {
  development: {
    port: process.env.PORT || 3000,
    database: {
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/myapp_dev',
      ssl: false
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
  },
  
  production: {
    port: process.env.PORT || 10000,
    database: {
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    redis: {
      url: process.env.REDIS_URL
    }
  }
};

const environment = process.env.NODE_ENV || 'development';
module.exports = config[environment];
```

## Health Checks và Monitoring

### Advanced Health Check

```javascript
// middleware/healthCheck.js
const { pool } = require('../config/database');
const { redis } = require('../config/redis');

const healthCheck = async (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown',
      redis: 'unknown',
      memory: 'unknown'
    }
  };

  try {
    // Database health
    const dbResult = await pool.query('SELECT 1');
    health.checks.database = dbResult ? 'healthy' : 'unhealthy';
  } catch (err) {
    health.checks.database = 'unhealthy';
    health.message = 'Database connection failed';
  }

  try {
    // Redis health
    await redis.ping();
    health.checks.redis = 'healthy';
  } catch (err) {
    health.checks.redis = 'unhealthy';
  }

  // Memory usage
  const memUsage = process.memoryUsage();
  const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  health.checks.memory = `${memUsageMB}MB`;

  // Overall status
  const isHealthy = health.checks.database === 'healthy' && 
                   health.checks.redis === 'healthy';

  res.status(isHealthy ? 200 : 503).json(health);
};

module.exports = healthCheck;
```

### Application Monitoring

```javascript
// middleware/monitoring.js
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`⚠️ Slow request: ${req.method} ${req.url} took ${duration}ms`);
    }
  });
  
  next();
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
};

module.exports = { requestLogger, errorHandler };
```

## Custom Domains

### Setup Custom Domain

**Bước 1: Add domain trong Render**
1. Service Settings → "Custom Domains"
2. Add domain: `yourdomain.com`
3. Render sẽ cung cấp CNAME record

**Bước 2: Configure DNS**
```
# Add CNAME record tại domain provider
CNAME yourdomain.com -> your-app.onrender.com
```

**Bước 3: SSL Certificate**
Render tự động provision SSL certificate cho custom domains.

### Domain Redirect Setup

```javascript
// middleware/domainRedirect.js
const domainRedirect = (req, res, next) => {
  const host = req.get('Host');
  
  // Redirect to primary domain
  if (host === 'your-app.onrender.com') {
    return res.redirect(301, `https://yourdomain.com${req.url}`);
  }
  
  // Force HTTPS
  if (req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${host}${req.url}`);
  }
  
  next();
};

module.exports = domainRedirect;
```

## Performance Optimization

### Caching Strategy

```javascript
// middleware/cache.js
const { cache } = require('../config/redis');

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await cache.get(key);
      if (cached) {
        console.log(`🎯 Cache hit: ${key}`);
        return res.json(cached);
      }
    } catch (err) {
      console.error('Cache error:', err);
    }

    // Override res.json to cache response
    const originalJson = res.json;
    res.json = function(data) {
      // Cache successful responses
      if (res.statusCode === 200) {
        cache.set(key, data, duration).catch(console.error);
        console.log(`💾 Cached: ${key}`);
      }
      originalJson.call(this, data);
    };

    next();
  };
};

module.exports = cacheMiddleware;
```

### Request Optimization

```javascript
// middleware/compression.js
const compression = require('compression');

// Gzip compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

// Rate limiting
const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different limits for different endpoints
app.use('/api/auth', createRateLimit(15 * 60 * 1000, 5, 'Too many login attempts'));
app.use('/api', createRateLimit(15 * 60 * 1000, 100, 'Too many API requests'));
```

## Background Workers

### Cron Jobs

```javascript
// workers/scheduler.js
const cron = require('node-cron');
const { pool } = require('../config/database');

// Cleanup old records daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('🧹 Running cleanup job...');
  
  try {
    const result = await pool.query(
      'DELETE FROM logs WHERE created_at < NOW() - INTERVAL \'30 days\''
    );
    console.log(`✅ Cleaned up ${result.rowCount} old log records`);
  } catch (err) {
    console.error('❌ Cleanup job failed:', err);
  }
});

// Health check every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    await pool.query('SELECT 1');
    console.log('💓 Health check passed');
  } catch (err) {
    console.error('💔 Health check failed:', err);
  }
});

console.log('⏰ Scheduled jobs initialized');
```

### Queue Processing

```javascript
// workers/emailQueue.js
const Queue = require('bull');
const redis = require('../config/redis');

const emailQueue = new Queue('email processing', {
  redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  }
});

// Process email jobs
emailQueue.process('send-email', async (job) => {
  const { to, subject, html } = job.data;
  
  console.log(`📧 Processing email to ${to}`);
  
  // Email sending logic here
  await sendEmail({ to, subject, html });
  
  console.log(`✅ Email sent to ${to}`);
});

// Add job to queue
const addEmailJob = (emailData) => {
  return emailQueue.add('send-email', emailData, {
    attempts: 3,
    backoff: 'exponential',
    delay: 2000
  });
};

module.exports = { emailQueue, addEmailJob };
```

## Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Check build logs trong Render dashboard
# Common issues:
# 1. Missing dependencies trong package.json
# 2. Node version compatibility
# 3. Build command errors

# Fix example:
# package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Database Connection Issues:**
```javascript
// Add connection retry logic
const connectWithRetry = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await pool.connect();
      console.log('✅ Database connected');
      break;
    } catch (err) {
      retries++;
      console.log(`❌ Database connection failed (attempt ${retries}/${maxRetries})`);
      
      if (retries === maxRetries) {
        throw err;
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};
```

**Memory Issues:**
```javascript
// Memory monitoring
const checkMemoryUsage = () => {
  const usage = process.memoryUsage();
  const mbUsage = {
    rss: Math.round(usage.rss / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024)
  };

  console.log('Memory usage:', mbUsage);

  // Alert if memory usage is high
  if (mbUsage.heapUsed > 400) {
    console.warn('⚠️ High memory usage detected');
  }
};

// Check every 10 minutes
setInterval(checkMemoryUsage, 10 * 60 * 1000);
```

## Hands-on Exercise

### Exercise 1: Full-stack Application

**Backend API:**
```javascript
// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API routes
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

**Database Schema:**
```sql
-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email) VALUES 
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com');
```

### Exercise 2: Monitoring Dashboard

```javascript
// routes/monitoring.js
const express = require('express');
const { pool } = require('../config/database');
const { redis } = require('../config/redis');

const router = express.Router();

router.get('/status', async (req, res) => {
  const status = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    services: {}
  };

  // Check database
  try {
    await pool.query('SELECT 1');
    status.services.database = { status: 'healthy', latency: '< 10ms' };
  } catch (err) {
    status.services.database = { status: 'unhealthy', error: err.message };
  }

  // Check Redis
  try {
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;
    status.services.redis = { status: 'healthy', latency: `${latency}ms` };
  } catch (err) {
    status.services.redis = { status: 'unhealthy', error: err.message };
  }

  // Memory usage
  const memUsage = process.memoryUsage();
  status.memory = {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
  };

  const isHealthy = status.services.database.status === 'healthy' && 
                   status.services.redis.status === 'healthy';

  res.status(isHealthy ? 200 : 503).json(status);
});

module.exports = router;
```

## Tài nguyên tham khảo

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [Render Status Page](https://status.render.com/)
- [Render Pricing](https://render.com/pricing)
- [Render vs Heroku Comparison](https://render.com/render-vs-heroku-comparison)

---

**Tips quan trọng:**
- Sử dụng health checks để ensure uptime
- Monitor memory usage trên free tier
- Setup proper error handling và logging
- Use Redis cho caching để improve performance
- Always test deployment trước khi production
