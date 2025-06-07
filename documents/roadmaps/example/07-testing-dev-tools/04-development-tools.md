# Development Tools

## Giới thiệu

Development tools là những công cụ giúp tăng năng suất và chất lượng code trong quá trình phát triển. Phần này sẽ cover các tools phổ biến nhất trong Node.js và React development.

## Hot Reloading và Auto-restart

### 1. Nodemon

Nodemon tự động restart Node.js application khi file thay đổi.

#### Installation và Usage

```bash
# Global installation
npm install -g nodemon

# Local installation
npm install --save-dev nodemon

# Usage
nodemon app.js
nodemon --watch src src/app.js

# With specific extensions
nodemon --ext js,json,html app.js
```

#### Configuration

```json
// nodemon.json
{
  "watch": ["src", "config"],
  "ext": "js,json,ts",
  "ignore": ["node_modules", "dist", "*.test.js"],
  "exec": "node -r dotenv/config src/app.js",
  "env": {
    "NODE_ENV": "development"
  },
  "delay": 2000,
  "restartable": "rs"
}
```

```json
// package.json scripts
{
  "scripts": {
    "dev": "nodemon src/app.js",
    "dev:debug": "nodemon --inspect src/app.js",
    "start": "node src/app.js"
  }
}
```

### 2. ts-node-dev

Faster alternative cho TypeScript projects.

```bash
# Installation
npm install --save-dev ts-node-dev

# Usage
ts-node-dev --respawn --transpile-only src/app.ts
```

```json
// package.json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
    "dev:debug": "ts-node-dev --inspect --respawn --transpile-only src/app.ts"
  }
}
```

### 3. React Hot Reloading

React apps với Create React App đã có built-in hot reloading.

```jsx
// Fast Refresh for custom setups
// webpack.config.js
module.exports = {
  mode: 'development',
  devServer: {
    hot: true,
    open: true,
    port: 3000
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
```

## Debugging Tools

### 1. Node.js Debugging

#### Built-in Debugger

```bash
# Start với debugger
node --inspect app.js
node --inspect-brk app.js  # Break on first line

# With nodemon
nodemon --inspect app.js
```

#### VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Node.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/app.js",
      "console": "integratedTerminal",
      "envFile": "${workspaceFolder}/.env"
    },
    {
      "name": "Attach to Node.js",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "."
    },
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

#### Debug trong Code

```javascript
// app.js
const express = require('express');
const app = express();

app.get('/debug', (req, res) => {
  const data = { message: 'Hello' };
  
  // Set breakpoint here
  debugger;
  
  console.log('Debug data:', data);
  res.json(data);
});

// Debug specific conditions
function calculatePrice(items) {
  let total = 0;
  
  for (const item of items) {
    if (item.price < 0) {
      // Debug negative prices
      debugger;
    }
    total += item.price * item.quantity;
  }
  
  return total;
}
```

### 2. React Developer Tools

#### Installation

```bash
# Browser extension
# Chrome: React Developer Tools
# Firefox: React Developer Tools

# Standalone (for React Native, etc.)
npm install -g react-devtools
react-devtools
```

#### Usage trong Development

```jsx
// components/UserCard.jsx
import React from 'react';

const UserCard = ({ user }) => {
  // React DevTools will show this component name
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {/* DevTools can inspect props, state, context */}
    </div>
  );
};

// Add display name for better debugging
UserCard.displayName = 'UserCard';

export default UserCard;
```

#### Profiler Usage

```jsx
// Using React Profiler programmatically
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component:', id);
  console.log('Phase:', phase);
  console.log('Duration:', actualDuration);
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <UserList />
      <UserDetails />
    </Profiler>
  );
}
```

### 3. Browser Developer Tools

#### Console API Advanced Usage

```javascript
// Different log levels
console.log('Regular message');
console.info('Info message');
console.warn('Warning message');
console.error('Error message');

// Grouped logs
console.group('User Data');
console.log('Name:', user.name);
console.log('Email:', user.email);
console.groupEnd();

// Conditional logging
console.assert(user.age >= 18, 'User must be 18 or older');

// Performance timing
console.time('API Call');
fetch('/api/users')
  .then(() => console.timeEnd('API Call'));

// Table format
console.table([
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 }
]);

// Stack trace
console.trace('Function call stack');
```

#### Network Tab Usage

```javascript
// Monitor API calls
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Debug': 'true'  // Custom headers for debugging
  },
  body: JSON.stringify(userData)
})
.then(response => {
  // Check response in Network tab
  console.log('Status:', response.status);
  return response.json();
});
```

## Performance Monitoring

### 1. Node.js Performance

#### Basic Monitoring

```javascript
// performance.js
const perf_hooks = require('perf_hooks');

// Mark performance points
perf_hooks.performance.mark('start-operation');

// Simulate some work
setTimeout(() => {
  perf_hooks.performance.mark('end-operation');
  
  // Measure duration
  perf_hooks.performance.measure(
    'operation-duration',
    'start-operation',
    'end-operation'
  );
  
  const measure = perf_hooks.performance.getEntriesByName('operation-duration')[0];
  console.log(`Operation took ${measure.duration}ms`);
}, 1000);
```

#### Memory Usage

```javascript
// memory-monitor.js
function logMemoryUsage() {
  const usage = process.memoryUsage();
  
  console.log('Memory Usage:');
  console.log(`RSS: ${Math.round(usage.rss / 1024 / 1024)} MB`);
  console.log(`Heap Total: ${Math.round(usage.heapTotal / 1024 / 1024)} MB`);
  console.log(`Heap Used: ${Math.round(usage.heapUsed / 1024 / 1024)} MB`);
  console.log(`External: ${Math.round(usage.external / 1024 / 1024)} MB`);
}

// Log every 10 seconds
setInterval(logMemoryUsage, 10000);
```

#### Express Performance Middleware

```javascript
// middleware/performance.js
const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};

module.exports = performanceMiddleware;
```

### 2. React Performance

#### React DevTools Profiler

```jsx
// Optimizing re-renders
import React, { memo, useMemo, useCallback } from 'react';

const ExpensiveComponent = memo(({ data, onUpdate }) => {
  // Expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: item.value * 2
    }));
  }, [data]);

  const handleClick = useCallback((id) => {
    onUpdate(id);
  }, [onUpdate]);

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleClick(item.id)}>
          {item.processed}
        </div>
      ))}
    </div>
  );
});

ExpensiveComponent.displayName = 'ExpensiveComponent';
```

#### Performance Hooks

```jsx
// hooks/usePerformance.js
import { useEffect } from 'react';

export const usePerformance = (componentName) => {
  useEffect(() => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      console.log(`${componentName} render time: ${end - start}ms`);
    };
  });
};

// Usage
function MyComponent() {
  usePerformance('MyComponent');
  
  return <div>Component content</div>;
}
```

### 3. Web Vitals

```javascript
// web-vitals.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(metric);
  
  // Send to your analytics service
  // analytics.track('web-vital', metric);
}

// Measure all Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Database Debugging

### 1. MongoDB Debugging

```javascript
// Enable mongoose debugging
const mongoose = require('mongoose');

// Log all queries
mongoose.set('debug', true);

// Custom debug function
mongoose.set('debug', (collectionName, method, query, doc) => {
  console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
});

// Query performance
const User = require('./models/User');

async function findUsers() {
  const start = Date.now();
  
  const users = await User.find({ isActive: true })
    .explain('executionStats'); // Get query execution stats
  
  console.log('Query time:', Date.now() - start, 'ms');
  console.log('Execution stats:', users.executionStats);
}
```

### 2. SQL Debugging

```javascript
// Sequelize logging
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  logging: (msg) => {
    console.log('SQL:', msg);
  },
  benchmark: true, // Log execution time
});

// Query debugging
const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: DataTypes.STRING
});

async function getUsers() {
  const users = await User.findAll({
    where: { isActive: true },
    logging: console.log // Override global logging
  });
  
  return users;
}
```

## Environment Management

### 1. Environment Variables

```bash
# .env.development
NODE_ENV=development
PORT=3000
DB_URL=mongodb://localhost:27017/myapp_dev
LOG_LEVEL=debug
DEBUG=app:*

# .env.production
NODE_ENV=production
PORT=8080
DB_URL=mongodb://cluster.mongodb.net/myapp_prod
LOG_LEVEL=error
```

```javascript
// config/index.js
require('dotenv').config();

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3000,
  DB_URL: process.env.DB_URL,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Validation
  validate() {
    const required = ['DB_URL'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
};

config.validate();

module.exports = config;
```

### 2. Cross-env for Scripts

```json
// package.json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development nodemon src/app.js",
    "test": "cross-env NODE_ENV=test jest",
    "build": "cross-env NODE_ENV=production webpack --mode production",
    "start": "cross-env NODE_ENV=production node dist/app.js"
  },
  "devDependencies": {
    "cross-env": "^7.0.3"
  }
}
```

## Logging

### 1. Winston Logger

```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'my-app' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
```

```javascript
// Usage in Express
const logger = require('./logger');

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({ error: 'Internal server error' });
});
```

### 2. Debug Module

```javascript
// Using debug module
const debug = require('debug');

const dbDebug = debug('app:db');
const authDebug = debug('app:auth');
const apiDebug = debug('app:api');

// Usage
dbDebug('Connecting to database...');
authDebug('User %s logged in', userId);
apiDebug('API response: %O', responseData);
```

```bash
# Enable debugging
DEBUG=app:* npm run dev
DEBUG=app:db,app:auth npm run dev
DEBUG=* npm run dev  # All debug output
```

## Source Maps

### 1. Node.js Source Maps

```javascript
// Enable source map support
require('source-map-support').install();

// For TypeScript
// tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSourceMap": false,
    "mapRoot": "./maps"
  }
}
```

### 2. Webpack Source Maps

```javascript
// webpack.config.js
module.exports = {
  mode: 'development',
  devtool: 'eval-source-map', // Fast rebuilds
  // devtool: 'source-map', // Production quality
  
  // For production
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        sourceMap: true
      })
    ]
  }
};
```

## Development Workflow Tools

### 1. Concurrently

```bash
# Install
npm install --save-dev concurrently

# Usage
npx concurrently "npm run server" "npm run client"
```

```json
// package.json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\" \"npm run watch-css\"",
    "server": "nodemon backend/app.js",
    "client": "react-scripts start",
    "watch-css": "sass --watch src/styles:src/css"
  }
}
```

### 2. Wait-on

```bash
# Wait for services to be ready
npm install --save-dev wait-on

# Usage
wait-on http://localhost:3000 && npm run test
```

```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"wait-on http://localhost:5000 && npm run client\"",
    "test:e2e": "wait-on http://localhost:3000 && cypress run"
  }
}
```

## VS Code Extensions và Settings

### 1. Recommended Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### 2. Workspace Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.associations": {
    "*.env.*": "dotenv"
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Best Practices

### 1. Development Setup

```javascript
// Development-only middleware
if (process.env.NODE_ENV === 'development') {
  // Enable detailed error pages
  app.use(require('errorhandler')());
  
  // CORS for development
  app.use(require('cors')({
    origin: 'http://localhost:3000',
    credentials: true
  }));
  
  // Request logging
  app.use(require('morgan')('dev'));
}
```

### 2. Error Handling

```javascript
// Graceful error handling
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});
```

## Exercises

### Exercise 1: Complete Development Setup
Setup một project với:
- Nodemon cho auto-restart
- Winston cho logging
- Environment variables
- VS Code debugging configuration
- Performance monitoring

### Exercise 2: Debugging Workshop
Tạo intentional bugs và practice debugging:
- Memory leaks
- Infinite loops
- API errors
- Database connection issues

---

**Key Tools Summary:**
- **Nodemon/ts-node-dev** - Auto-restart applications
- **VS Code Debugger** - Powerful debugging capabilities
- **React DevTools** - Component inspection và profiling
- **Winston** - Production-ready logging
- **Performance APIs** - Monitor application performance
- **Environment management** - Separate configs cho different environments
