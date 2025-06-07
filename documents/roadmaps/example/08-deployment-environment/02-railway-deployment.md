# Railway Deployment

Railway là một platform deployment hiện đại được thiết kế đặc biệt cho developers, cung cấp trải nghiệm deploy đơn giản và mạnh mẽ cho Node.js applications.

## Tại sao chọn Railway?

### Ưu điểm
- **Developer Experience**: Setup cực kỳ đơn giản
- **Auto-scaling**: Tự động scale theo traffic
- **Database Integration**: PostgreSQL, MySQL, Redis built-in
- **Git Integration**: Auto-deploy từ GitHub
- **Custom Domains**: Free SSL certificates
- **Pricing**: Pay-as-you-go, rất phù hợp với startup

### Nhược điểm
- Tương đối mới so với Heroku
- Ít documentation community
- Limited free tier

## Getting Started với Railway

### 1. Tạo account và setup

```bash
# Cài đặt Railway CLI
npm install -g @railway/cli

# Login vào Railway
railway login

# Hoặc sử dụng web interface tại railway.app
```

### 2. Project structure chuẩn bị

```
my-app/
├── package.json
├── package-lock.json
├── server.js
├── .env.example
├── railway.json (optional)
└── src/
    └── routes/
```

**package.json cần có:**
```json
{
  "name": "my-railway-app",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### 3. Environment Variables Setup

```javascript
// server.js
require('dotenv').config();

const express = require('express');
const app = express();

// Railway tự động set PORT
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Railway!',
    environment: process.env.NODE_ENV,
    database: process.env.DATABASE_URL ? 'Connected' : 'Not connected'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Deployment Methods

### Method 1: Deploy từ GitHub (Recommended)

**Bước 1: Push code lên GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/my-app.git
git push -u origin main
```

**Bước 2: Connect với Railway**
1. Vào [railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select repository
5. Railway sẽ tự động detect và deploy

### Method 2: Deploy từ CLI

```bash
# Trong project directory
railway login
railway init
railway up

# Hoặc deploy directly
railway deploy
```

### Method 3: Deploy với custom configuration

**railway.json:**
```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
```

## Database Integration

### PostgreSQL Setup

**Bước 1: Add PostgreSQL service**
```bash
# Via CLI
railway add postgresql

# Hoặc via web dashboard
# Project Settings > Add Service > PostgreSQL
```

**Bước 2: Get connection URL**
```bash
# Railway tự động tạo DATABASE_URL environment variable
railway variables
```

**Bước 3: Connect trong code**
```javascript
// Using pg (PostgreSQL)
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

testConnection();
```

### Prisma với Railway

**prisma/schema.prisma:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
}
```

**package.json scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "prisma generate && prisma db push",
    "postinstall": "prisma generate"
  }
}
```

## Environment Variables Management

### Development vs Production

**Local development (.env):**
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/myapp_dev
JWT_SECRET=dev_secret
```

**Railway production:**
```bash
# Set via Railway dashboard hoặc CLI
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your_super_secure_secret

# Railway tự động set:
# - PORT
# - DATABASE_URL (nếu có PostgreSQL service)
```

### Sensitive Variables

```bash
# Đừng bao giờ commit secrets
echo ".env" >> .gitignore

# Use Railway secrets cho production
railway variables set API_KEY=your_secret_key
railway variables set DATABASE_PASSWORD=secure_password
```

## Custom Domains

### Setup Custom Domain

**Bước 1: Add domain trong Railway**
```bash
# Via CLI
railway domain add yourdomain.com

# Hoặc via web dashboard
# Project Settings > Domains > Add Domain
```

**Bước 2: Configure DNS**
```
# Add CNAME record
CNAME yourdomain.com -> your-app.railway.app
```

**Bước 3: SSL Certificate**
Railway tự động provision SSL certificate cho custom domains.

## Monitoring và Logging

### Built-in Monitoring

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
```

### Logs Access

```bash
# View logs via CLI
railway logs

# Follow logs real-time
railway logs --follow

# Filter logs
railway logs --filter "ERROR"
```

## Performance Optimization

### Memory và CPU

```javascript
// server.js
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Worker process
  require('./app.js');
  console.log(`Worker ${process.pid} started`);
}
```

### Caching Strategy

```javascript
const Redis = require('redis');

// Railway Redis addon
const redis = Redis.createClient({
  url: process.env.REDIS_URL
});

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await redis.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      redis.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};

// Usage
app.get('/api/data', cache(300), getData);
```

## Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Check build logs
railway logs --deployment

# Common fixes:
# 1. Ensure package.json has correct start script
# 2. Check Node.js version compatibility
# 3. Verify all dependencies are in package.json
```

**Database Connection Issues:**
```javascript
// Add connection retry logic
const connectWithRetry = () => {
  return pool.connect().catch(err => {
    console.log('Database connection failed, retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  });
};
```

**Environment Variable Issues:**
```bash
# Check current variables
railway variables

# Update variables
railway variables set KEY=value

# Remove variables
railway variables delete KEY
```

## Best Practices

### 1. Code Organization
```
src/
├── controllers/
├── models/
├── routes/
├── middleware/
├── config/
└── utils/
```

### 2. Error Handling
```javascript
// Global error handler
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
```

### 3. Security Headers
```javascript
const helmet = require('helmet');
const cors = require('cors');

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### 4. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

## Hands-on Exercise

### Exercise 1: Deploy Simple API

**Tạo project structure:**
```bash
mkdir railway-api-demo
cd railway-api-demo
npm init -y
npm install express dotenv cors helmet
```

**server.js:**
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Railway API Demo',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Deploy steps:**
1. Push lên GitHub
2. Connect với Railway
3. Set environment variables
4. Test deployed API

### Exercise 2: Database Integration

**Thêm PostgreSQL và user management:**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Users endpoints
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

## Tài nguyên tham khảo

- [Railway Documentation](https://docs.railway.app/)
- [Railway Templates](https://railway.app/templates)
- [Railway Discord Community](https://discord.gg/railway)
- [Railway Blog](https://blog.railway.app/)
- [Environment Variables Best Practices](https://railway.app/blog/environment-variables)

---

**Tips quan trọng:**
- Luôn test locally trước khi deploy
- Sử dụng environment variables cho configuration
- Monitor logs thường xuyên
- Setup health checks cho production apps
- Backup database thường xuyên khi sử dụng Railway PostgreSQL
