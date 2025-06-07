# API Testing với Supertest

## Giới thiệu

Supertest là một thư viện mạnh mẽ để test HTTP APIs. Nó hoạt động tốt với Express applications và cho phép test các endpoints một cách dễ dàng.

## Setup Supertest

### Installation

```bash
# Cài đặt Supertest
npm install --save-dev supertest

# Với Jest
npm install --save-dev jest supertest

# Với TypeScript
npm install --save-dev @types/supertest
```

### Basic Setup

```javascript
// app.js
const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  if (id === '1') {
    res.json({ id: 1, name: 'John Doe', email: 'john@example.com' });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

module.exports = app;
```

```javascript
// app.test.js
const request = require('supertest');
const app = require('./app');

describe('Basic API Tests', () => {
  test('GET /health should return OK', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /users/1 should return user', async () => {
    const response = await request(app)
      .get('/users/1')
      .expect(200);

    expect(response.body).toEqual({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    });
  });

  test('GET /users/999 should return 404', async () => {
    const response = await request(app)
      .get('/users/999')
      .expect(404);

    expect(response.body).toHaveProperty('error', 'User not found');
  });
});
```

## Testing CRUD Operations

### Complete CRUD API

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

// Mock database
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

// GET all users
router.get('/', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const results = users.slice(startIndex, endIndex);
  
  res.json({
    users: results,
    totalCount: users.length,
    page: parseInt(page),
    totalPages: Math.ceil(users.length / limit)
  });
});

// GET user by ID
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// POST create user
router.post('/', (req, res) => {
  const { name, email } = req.body;
  
  // Validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const newUser = {
    id: Math.max(...users.map(u => u.id)) + 1,
    name,
    email
  };
  
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT update user
router.put('/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  users[userIndex] = { ...users[userIndex], name, email };
  res.json(users[userIndex]);
});

// DELETE user
router.delete('/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users.splice(userIndex, 1);
  res.status(204).send();
});

module.exports = router;
```

### CRUD Tests

```javascript
// routes/users.test.js
const request = require('supertest');
const express = require('express');
const usersRouter = require('./users');

const app = express();
app.use(express.json());
app.use('/users', usersRouter);

describe('Users CRUD API', () => {
  beforeEach(() => {
    // Reset users array before each test
    const usersModule = require('./users');
    // Reset to original state
  });

  describe('GET /users', () => {
    test('should return paginated users', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('totalCount');
      expect(response.body).toHaveProperty('page', 1);
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    test('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/users?page=1&limit=1')
        .expect(200);

      expect(response.body.users).toHaveLength(1);
      expect(response.body.page).toBe(1);
    });
  });

  describe('GET /users/:id', () => {
    test('should return specific user', async () => {
      const response = await request(app)
        .get('/users/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
    });

    test('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/users/999')
        .expect(404);
    });
  });

  describe('POST /users', () => {
    test('should create new user', async () => {
      const newUser = {
        name: 'Alice Johnson',
        email: 'alice@example.com'
      };

      const response = await request(app)
        .post('/users')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newUser.name);
      expect(response.body.email).toBe(newUser.email);
    });

    test('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/users')
        .send({ name: 'Alice' }) // Missing email
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Name and email are required');
    });

    test('should return 409 for duplicate email', async () => {
      const duplicateUser = {
        name: 'John Duplicate',
        email: 'john@example.com' // Already exists
      };

      await request(app)
        .post('/users')
        .send(duplicateUser)
        .expect(409);
    });
  });

  describe('PUT /users/:id', () => {
    test('should update existing user', async () => {
      const updatedData = {
        name: 'John Updated',
        email: 'john.updated@example.com'
      };

      const response = await request(app)
        .put('/users/1')
        .send(updatedData)
        .expect(200);

      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.email).toBe(updatedData.email);
    });

    test('should return 404 for non-existent user', async () => {
      await request(app)
        .put('/users/999')
        .send({ name: 'Test', email: 'test@example.com' })
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    test('should delete existing user', async () => {
      await request(app)
        .delete('/users/1')
        .expect(204);

      // Verify user is deleted
      await request(app)
        .get('/users/1')
        .expect(404);
    });

    test('should return 404 for non-existent user', async () => {
      await request(app)
        .delete('/users/999')
        .expect(404);
    });
  });
});
```

## Authentication Testing

### JWT Authentication Setup

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

module.exports = { generateToken, authenticateToken };
```

```javascript
// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Mock users database
const users = [
  {
    id: 1,
    email: 'john@example.com',
    password: '$2b$10$...' // pre-hashed password
  }
];

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user);
  res.json({ token, user: { id: user.id, email: user.email } });
});

// Protected profile endpoint
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
```

### Authentication Tests

```javascript
// routes/auth.test.js
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const authRouter = require('./auth');

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Authentication API', () => {
  let validToken;

  beforeAll(async () => {
    // Create a valid token for protected route tests
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123'
      });
    
    if (response.status === 200) {
      validToken = response.body.token;
    }
  });

  describe('POST /auth/login', () => {
    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should reject invalid email', async () => {
      await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);
    });

    test('should reject invalid password', async () => {
      await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
    });

    test('should require email and password', async () => {
      await request(app)
        .post('/auth/login')
        .send({ email: 'john@example.com' }) // Missing password
        .expect(400);
    });
  });

  describe('GET /auth/profile', () => {
    test('should return profile with valid token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
    });

    test('should reject request without token', async () => {
      await request(app)
        .get('/auth/profile')
        .expect(401);
    });

    test('should reject invalid token', async () => {
      await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });

    test('should reject malformed authorization header', async () => {
      await request(app)
        .get('/auth/profile')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });
  });
});
```

## Database Integration Testing

### Setup với Test Database

```javascript
// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbURI = process.env.NODE_ENV === 'test' 
      ? process.env.TEST_DB_URI 
      : process.env.DB_URI;
      
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

### Database Integration Tests

```javascript
// tests/integration/users.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');

describe('Users Integration Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_DB_URI);
  });

  beforeEach(async () => {
    // Clean database before each test
    await User.deleteMany({});
    
    // Seed test data
    await User.create([
      { name: 'John Doe', email: 'john@example.com', password: 'hashed123' },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'hashed456' }
    ]);
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  test('GET /users should return all users', async () => {
    const response = await request(app)
      .get('/users')
      .expect(200);

    expect(response.body.users).toHaveLength(2);
  });

  test('POST /users should create new user', async () => {
    const newUser = {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/users')
      .send(newUser)
      .expect(201);

    expect(response.body.name).toBe(newUser.name);
    
    // Verify in database
    const userInDB = await User.findById(response.body.id);
    expect(userInDB).toBeTruthy();
    expect(userInDB.email).toBe(newUser.email);
  });

  test('should handle duplicate email error', async () => {
    const duplicateUser = {
      name: 'John Duplicate',
      email: 'john@example.com', // Already exists
      password: 'password123'
    };

    await request(app)
      .post('/users')
      .send(duplicateUser)
      .expect(409);
  });
});
```

## Testing Middleware

### Custom Middleware Testing

```javascript
// middleware/validation.js
const validateUser = (req, res, next) => {
  const { name, email } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.push('Valid email is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const rateLimiter = (req, res, next) => {
  // Simple rate limiting logic
  const clientId = req.ip;
  const requests = req.app.locals.requests || {};
  const now = Date.now();
  const timeWindow = 60000; // 1 minute
  const maxRequests = 10;

  if (!requests[clientId]) {
    requests[clientId] = [];
  }

  // Remove old requests
  requests[clientId] = requests[clientId].filter(
    time => now - time < timeWindow
  );

  if (requests[clientId].length >= maxRequests) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  requests[clientId].push(now);
  req.app.locals.requests = requests;
  next();
};

module.exports = { validateUser, rateLimiter };
```

### Middleware Tests

```javascript
// middleware/validation.test.js
const request = require('supertest');
const express = require('express');
const { validateUser, rateLimiter } = require('./validation');

describe('Middleware Tests', () => {
  describe('validateUser middleware', () => {
    let app;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.post('/test', validateUser, (req, res) => {
        res.json({ success: true });
      });
    });

    test('should pass with valid data', async () => {
      await request(app)
        .post('/test')
        .send({ name: 'John Doe', email: 'john@example.com' })
        .expect(200);
    });

    test('should reject invalid name', async () => {
      const response = await request(app)
        .post('/test')
        .send({ name: 'J', email: 'john@example.com' })
        .expect(400);

      expect(response.body.errors).toContain('Name must be at least 2 characters');
    });

    test('should reject invalid email', async () => {
      const response = await request(app)
        .post('/test')
        .send({ name: 'John', email: 'invalid-email' })
        .expect(400);

      expect(response.body.errors).toContain('Valid email is required');
    });
  });

  describe('rateLimiter middleware', () => {
    let app;

    beforeEach(() => {
      app = express();
      app.locals.requests = {}; // Reset rate limiter
      app.get('/test', rateLimiter, (req, res) => {
        res.json({ success: true });
      });
    });

    test('should allow requests under limit', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app)
          .get('/test')
          .expect(200);
      }
    });

    test('should block requests over limit', async () => {
      // Make maximum allowed requests
      for (let i = 0; i < 10; i++) {
        await request(app).get('/test').expect(200);
      }

      // Next request should be blocked
      await request(app)
        .get('/test')
        .expect(429);
    });
  });
});
```

## Advanced Testing Patterns

### Testing File Uploads

```javascript
// routes/upload.test.js
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../app');

describe('File Upload API', () => {
  const testFilePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

  beforeAll(() => {
    // Create test file if it doesn't exist
    if (!fs.existsSync(testFilePath)) {
      fs.writeFileSync(testFilePath, 'fake image data');
    }
  });

  test('should upload file successfully', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('file', testFilePath)
      .expect(200);

    expect(response.body).toHaveProperty('filename');
    expect(response.body).toHaveProperty('size');
  });

  test('should reject request without file', async () => {
    await request(app)
      .post('/upload')
      .expect(400);
  });
});
```

### Testing WebSocket Endpoints

```javascript
// websocket.test.js
const Client = require('socket.io-client');
const server = require('../server');

describe('WebSocket Tests', () => {
  let clientSocket;
  let serverSocket;

  beforeAll((done) => {
    server.listen(() => {
      const port = server.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      server.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    server.close();
    clientSocket.close();
  });

  test('should communicate between client and server', (done) => {
    clientSocket.on('hello', (arg) => {
      expect(arg).toBe('world');
      done();
    });
    serverSocket.emit('hello', 'world');
  });
});
```

## Best Practices

### 1. Test Organization

```javascript
// Good test structure
describe('API Endpoint Tests', () => {
  describe('Authentication', () => {
    // Auth-related tests
  });

  describe('CRUD Operations', () => {
    describe('Create', () => {
      // Create tests
    });

    describe('Read', () => {
      // Read tests
    });
  });

  describe('Error Handling', () => {
    // Error scenarios
  });
});
```

### 2. Test Data Management

```javascript
// fixtures/users.js
module.exports = {
  validUser: {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!'
  },

  invalidUsers: [
    { name: '', email: 'john@example.com' }, // Empty name
    { name: 'John', email: 'invalid-email' }, // Invalid email
    { name: 'John' } // Missing email
  ]
};
```

### 3. Common Test Utilities

```javascript
// testUtils.js
const request = require('supertest');

async function loginAndGetToken(app, credentials) {
  const response = await request(app)
    .post('/auth/login')
    .send(credentials);
  
  return response.body.token;
}

function createAuthHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = { loginAndGetToken, createAuthHeader };
```

## Exercises

### Exercise 1: E-commerce API Testing
Tạo comprehensive tests cho một e-commerce API với các endpoints:
- Products CRUD
- Shopping cart operations
- Order management
- User authentication

### Exercise 2: Real-time Chat API
Test một chat application với:
- User registration/login
- WebSocket connections
- Message sending/receiving
- Room management

---

**Key Points:**
- Test all HTTP methods và status codes
- Include authentication và authorization tests
- Test với real database (integration tests)
- Mock external dependencies
- Test error scenarios và edge cases
- Use proper test data management
- Organize tests logically
- Maintain test isolation
