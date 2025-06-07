# Jest & Vitest - Unit Testing

## Giới thiệu

Jest và Vitest là hai testing frameworks phổ biến nhất cho JavaScript/TypeScript. Jest truyền thống và ổn định, Vitest hiện đại và nhanh hơn.

## Jest Setup

### Installation

```bash
# For Node.js projects
npm install --save-dev jest

# For TypeScript
npm install --save-dev jest @types/jest ts-jest

# For React
npm install --save-dev jest @testing-library/jest-dom
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  // Test environment
  testEnvironment: 'node', // 'jsdom' for React

  // File patterns
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Coverage
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov'],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],

  // TypeScript support
  preset: 'ts-jest',
  
  // Transform files
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
```

## Vitest Setup

### Installation

```bash
# Vitest với Vite
npm install --save-dev vitest

# Additional utilities
npm install --save-dev @vitest/ui @vitest/coverage-v8
```

### Vitest Configuration

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Test environment
    environment: 'node', // 'jsdom', 'happy-dom'
    
    // Global test utilities
    globals: true,
    
    // Setup files
    setupFiles: ['./src/setupTests.ts'],
    
    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
      ]
    },

    // Watch mode
    watch: false
  }
})
```

## Basic Testing Patterns

### 1. Function Testing

```javascript
// math.js
export function add(a, b) {
  return a + b;
}

export function divide(a, b) {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

```javascript
// math.test.js
import { add, divide, calculateTotal } from './math';

describe('Math functions', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(add(1, 2)).toBe(3);
  });

  test('divides numbers correctly', () => {
    expect(divide(10, 2)).toBe(5);
    expect(divide(7, 2)).toBe(3.5);
  });

  test('throws error when dividing by zero', () => {
    expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
  });

  test('calculates total correctly', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 3 }
    ];
    expect(calculateTotal(items)).toBe(35);
  });

  test('handles empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });
});
```

### 2. Async Function Testing

```javascript
// api.js
export async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error('User not found');
  }
  return response.json();
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

```javascript
// api.test.js
import { fetchUser, delay } from './api';

// Mock fetch
global.fetch = jest.fn();

describe('API functions', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('fetches user successfully', async () => {
    const mockUser = { id: 1, name: 'John' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    });

    const user = await fetchUser(1);
    expect(user).toEqual(mockUser);
    expect(fetch).toHaveBeenCalledWith('/api/users/1');
  });

  test('throws error for invalid user', async () => {
    fetch.mockResolvedValueOnce({
      ok: false
    });

    await expect(fetchUser(999)).rejects.toThrow('User not found');
  });

  test('delay function works', async () => {
    const start = Date.now();
    await delay(100);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(100);
  });
});
```

### 3. Class Testing

```javascript
// user.js
export class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.isActive = true;
    this.loginCount = 0;
  }

  login() {
    if (!this.isActive) {
      throw new Error('Account is inactive');
    }
    this.loginCount++;
    this.lastLogin = new Date();
  }

  deactivate() {
    this.isActive = false;
  }

  getProfile() {
    return {
      name: this.name,
      email: this.email,
      isActive: this.isActive,
      loginCount: this.loginCount
    };
  }
}
```

```javascript
// user.test.js
import { User } from './user';

describe('User class', () => {
  let user;

  beforeEach(() => {
    user = new User('John Doe', 'john@example.com');
  });

  test('creates user with correct properties', () => {
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.isActive).toBe(true);
    expect(user.loginCount).toBe(0);
  });

  test('login increases count and sets timestamp', () => {
    const beforeLogin = Date.now();
    user.login();
    
    expect(user.loginCount).toBe(1);
    expect(user.lastLogin).toBeInstanceOf(Date);
    expect(user.lastLogin.getTime()).toBeGreaterThanOrEqual(beforeLogin);
  });

  test('cannot login when inactive', () => {
    user.deactivate();
    expect(() => user.login()).toThrow('Account is inactive');
  });

  test('getProfile returns correct data', () => {
    user.login();
    const profile = user.getProfile();
    
    expect(profile).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      isActive: true,
      loginCount: 1
    });
  });
});
```

## Mocking và Spies

### 1. Function Mocking

```javascript
// emailService.js
export function sendEmail(to, subject, body) {
  // Actual email sending logic
  console.log(`Sending email to ${to}`);
  return Promise.resolve({ success: true });
}

// userService.js
import { sendEmail } from './emailService';

export async function registerUser(userData) {
  // Save user logic here
  const user = { id: 1, ...userData };
  
  // Send welcome email
  await sendEmail(userData.email, 'Welcome!', 'Welcome to our app');
  
  return user;
}
```

```javascript
// userService.test.js
import { registerUser } from './userService';
import { sendEmail } from './emailService';

// Mock the entire module
jest.mock('./emailService');

describe('User registration', () => {
  test('sends welcome email on registration', async () => {
    const userData = { name: 'John', email: 'john@example.com' };
    
    // Mock implementation
    sendEmail.mockResolvedValue({ success: true });
    
    const user = await registerUser(userData);
    
    expect(sendEmail).toHaveBeenCalledWith(
      'john@example.com',
      'Welcome!',
      'Welcome to our app'
    );
    expect(user).toEqual({ id: 1, ...userData });
  });

  test('handles email sending failure', async () => {
    const userData = { name: 'John', email: 'john@example.com' };
    
    // Mock failure
    sendEmail.mockRejectedValue(new Error('Email failed'));
    
    await expect(registerUser(userData)).rejects.toThrow('Email failed');
  });
});
```

### 2. Partial Mocking

```javascript
// config.js
export const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
};

export function getApiConfig() {
  return {
    baseURL: config.apiUrl,
    timeout: config.timeout
  };
}
```

```javascript
// config.test.js
import { config, getApiConfig } from './config';

// Partial mock
jest.mock('./config', () => ({
  ...jest.requireActual('./config'),
  config: {
    apiUrl: 'https://test-api.example.com',
    timeout: 1000,
    retries: 1
  }
}));

test('uses test configuration', () => {
  const apiConfig = getApiConfig();
  expect(apiConfig.baseURL).toBe('https://test-api.example.com');
  expect(apiConfig.timeout).toBe(1000);
});
```

### 3. Spy Functions

```javascript
// analytics.js
export const analytics = {
  track: (event, data) => {
    console.log('Tracking:', event, data);
  }
};

// button.js
import { analytics } from './analytics';

export function handleClick(buttonName) {
  analytics.track('button_click', { button: buttonName });
  return `${buttonName} clicked`;
}
```

```javascript
// button.test.js
import { handleClick } from './button';
import { analytics } from './analytics';

describe('Button handling', () => {
  test('tracks button clicks', () => {
    // Spy on method
    const trackSpy = jest.spyOn(analytics, 'track');
    
    const result = handleClick('submit');
    
    expect(trackSpy).toHaveBeenCalledWith('button_click', { button: 'submit' });
    expect(result).toBe('submit clicked');
    
    // Restore original function
    trackSpy.mockRestore();
  });
});
```

## Test Utilities và Helpers

### 1. Custom Matchers

```javascript
// setupTests.js
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
```

```javascript
// example.test.js
test('custom matcher', () => {
  expect(100).toBeWithinRange(90, 110);
  expect(101).not.toBeWithinRange(0, 100);
});
```

### 2. Test Data Factories

```javascript
// testHelpers.js
export function createUser(overrides = {}) {
  return {
    id: Math.floor(Math.random() * 1000),
    name: 'Test User',
    email: 'test@example.com',
    isActive: true,
    createdAt: new Date(),
    ...overrides
  };
}

export function createProduct(overrides = {}) {
  return {
    id: Math.floor(Math.random() * 1000),
    name: 'Test Product',
    price: 99.99,
    category: 'electronics',
    inStock: true,
    ...overrides
  };
}
```

```javascript
// product.test.js
import { createUser, createProduct } from './testHelpers';

test('user can purchase product', () => {
  const user = createUser({ balance: 200 });
  const product = createProduct({ price: 150 });
  
  // Test logic here
  expect(user.balance).toBeGreaterThan(product.price);
});
```

## Coverage và Best Practices

### 1. Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov'],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Files to include/exclude
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/setupTests.js'
  ]
};
```

### 2. Test Organization

```javascript
// Good test structure
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {
      // Test implementation
    });

    it('should throw error with invalid email', () => {
      // Test implementation
    });

    it('should hash password before saving', () => {
      // Test implementation
    });
  });

  describe('getUserById', () => {
    it('should return user when found', () => {
      // Test implementation
    });

    it('should return null when not found', () => {
      // Test implementation
    });
  });
});
```

## Exercises

### Exercise 1: Calculator Testing
Tạo một calculator class và viết comprehensive tests:

```javascript
// calculator.js
class Calculator {
  constructor() {
    this.history = [];
  }

  add(a, b) {
    const result = a + b;
    this.history.push(`${a} + ${b} = ${result}`);
    return result;
  }

  subtract(a, b) {
    const result = a - b;
    this.history.push(`${a} - ${b} = ${result}`);
    return result;
  }

  multiply(a, b) {
    const result = a * b;
    this.history.push(`${a} * ${b} = ${result}`);
    return result;
  }

  divide(a, b) {
    if (b === 0) throw new Error('Division by zero');
    const result = a / b;
    this.history.push(`${a} / ${b} = ${result}`);
    return result;
  }

  getHistory() {
    return [...this.history];
  }

  clearHistory() {
    this.history = [];
  }
}
```

Viết tests cho tất cả methods, edge cases, và error handling.

### Exercise 2: Async API Testing
Tạo một API service và test với mocking:

```javascript
// apiService.js
class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async get(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }

  async post(endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }
}
```

Test với various HTTP status codes và network errors.

---

**Best Practices:**
- Viết tests trước khi viết code (TDD)
- Test both happy path và edge cases
- Keep tests simple và focused
- Use descriptive test names
- Mock external dependencies
- Maintain good test coverage
- Run tests frequently during development
