# TypeScript Fundamentals

TypeScript là JavaScript với static typing, giúp detect bugs sớm và cải thiện developer experience đáng kể.

## Lý thuyết

### Tại sao TypeScript?

**1. Type Safety**
```typescript
// JavaScript - Runtime error
function addNumbers(a, b) {
    return a + b;
}
addNumbers("hello", "world"); // "helloworld" - Unexpected!

// TypeScript - Compile-time error
function addNumbers(a: number, b: number): number {
    return a + b;
}
addNumbers("hello", "world"); // Error: Argument of type 'string' is not assignable to parameter of type 'number'
```

**2. Better IntelliSense**
```typescript
interface User {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
}

const user: User = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    isActive: true
};

// VS Code sẽ auto-complete các properties
user. // id, name, email, isActive sẽ hiện ra
```

**3. Refactoring Safety**
```typescript
// Khi rename interface property, TypeScript sẽ update tất cả usages
interface Product {
    title: string; // Rename thành 'name'
    price: number;
}

// Tất cả nơi sử dụng 'title' sẽ báo error
```

### Basic Types

```typescript
// Primitive Types
let age: number = 25;
let name: string = "John";
let isActive: boolean = true;
let data: null = null;
let value: undefined = undefined;

// Array Types
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["John", "Jane"];

// Tuple Types
let coordinate: [number, number] = [10, 20];
let userInfo: [string, number, boolean] = ["John", 25, true];

// Object Types
let user: {
    name: string;
    age: number;
} = {
    name: "John",
    age: 25
};

// Function Types
function greet(name: string): string {
    return `Hello, ${name}!`;
}

const add = (a: number, b: number): number => a + b;

// Optional Parameters
function createUser(name: string, age?: number): User {
    return {
        id: Math.random(),
        name,
        email: `${name}@example.com`,
        isActive: true,
        age: age || 18
    };
}
```

### Interfaces vs Types

```typescript
// Interface - Extensible
interface User {
    id: number;
    name: string;
}

interface User {
    email: string; // Declaration merging
}

interface AdminUser extends User {
    role: string;
}

// Type Alias - More flexible
type Status = "pending" | "approved" | "rejected";

type User = {
    id: number;
    name: string;
    status: Status;
};

type AdminUser = User & {
    role: string;
    permissions: string[];
};
```

### Union và Intersection Types

```typescript
// Union Types
type ID = string | number;
type Theme = "light" | "dark";

function formatId(id: ID): string {
    if (typeof id === "string") {
        return id.toUpperCase();
    }
    return id.toString();
}

// Intersection Types
type User = {
    name: string;
    email: string;
};

type Admin = {
    role: string;
    permissions: string[];
};

type AdminUser = User & Admin;

const admin: AdminUser = {
    name: "John",
    email: "john@admin.com",
    role: "super-admin",
    permissions: ["read", "write", "delete"]
};
```

## Thực hành

### 1. Setup TypeScript Project

```bash
# Tạo project mới
mkdir typescript-fundamentals
cd typescript-fundamentals

# Initialize npm
npm init -y

# Install TypeScript
npm install -D typescript @types/node
npm install -D ts-node nodemon

# Create TypeScript config
npx tsc --init
```

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**package.json scripts**
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "nodemon --exec ts-node src/index.ts",
    "type-check": "tsc --noEmit"
  }
}
```

### 2. Create Type-Safe Utilities

**src/types/index.ts**
```typescript
// User types
export interface User {
    id: number;
    name: string;
    email: string;
    age?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserInput {
    name: string;
    email: string;
    age?: number;
}

export interface UpdateUserInput {
    name?: string;
    email?: string;
    age?: number;
    isActive?: boolean;
}

// Product types
export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    category: ProductCategory;
    inStock: boolean;
    tags: string[];
}

export type ProductCategory = "electronics" | "clothing" | "books" | "home";

export interface CreateProductInput {
    title: string;
    description: string;
    price: number;
    category: ProductCategory;
    tags?: string[];
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
```

**src/utils/user.ts**
```typescript
import { User, CreateUserInput, UpdateUserInput } from '../types';

export class UserManager {
    private users: User[] = [];
    private nextId = 1;

    createUser(input: CreateUserInput): User {
        const user: User = {
            id: this.nextId++,
            name: input.name,
            email: input.email,
            age: input.age,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.users.push(user);
        return user;
    }

    getUserById(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }

    updateUser(id: number, updates: UpdateUserInput): User | null {
        const userIndex = this.users.findIndex(user => user.id === id);
        
        if (userIndex === -1) {
            return null;
        }

        const updatedUser: User = {
            ...this.users[userIndex],
            ...updates,
            updatedAt: new Date()
        };

        this.users[userIndex] = updatedUser;
        return updatedUser;
    }

    deleteUser(id: number): boolean {
        const userIndex = this.users.findIndex(user => user.id === id);
        
        if (userIndex === -1) {
            return false;
        }

        this.users.splice(userIndex, 1);
        return true;
    }

    getAllUsers(): User[] {
        return [...this.users];
    }

    getActiveUsers(): User[] {
        return this.users.filter(user => user.isActive);
    }

    searchUsers(query: string): User[] {
        const lowercaseQuery = query.toLowerCase();
        return this.users.filter(user => 
            user.name.toLowerCase().includes(lowercaseQuery) ||
            user.email.toLowerCase().includes(lowercaseQuery)
        );
    }
}
```

**src/utils/validation.ts**
```typescript
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateUser = (user: any): void => {
    if (!user.name || typeof user.name !== 'string' || user.name.trim().length === 0) {
        throw new ValidationError('Name is required and must be a non-empty string');
    }

    if (!user.email || typeof user.email !== 'string') {
        throw new ValidationError('Email is required and must be a string');
    }

    if (!validateEmail(user.email)) {
        throw new ValidationError('Email must be in valid format');
    }

    if (user.age !== undefined && (typeof user.age !== 'number' || user.age < 0 || user.age > 150)) {
        throw new ValidationError('Age must be a number between 0 and 150');
    }
};

export const validateProduct = (product: any): void => {
    if (!product.title || typeof product.title !== 'string' || product.title.trim().length === 0) {
        throw new ValidationError('Title is required and must be a non-empty string');
    }

    if (!product.description || typeof product.description !== 'string') {
        throw new ValidationError('Description is required and must be a string');
    }

    if (typeof product.price !== 'number' || product.price <= 0) {
        throw new ValidationError('Price must be a positive number');
    }

    const validCategories = ['electronics', 'clothing', 'books', 'home'];
    if (!validCategories.includes(product.category)) {
        throw new ValidationError(`Category must be one of: ${validCategories.join(', ')}`);
    }
};
```

**src/index.ts**
```typescript
import { UserManager } from './utils/user';
import { validateUser, ValidationError } from './utils/validation';
import { CreateUserInput, UpdateUserInput } from './types';

const userManager = new UserManager();

// Demo functions
function demonstrateTypeScript() {
    console.log('🚀 TypeScript Fundamentals Demo\n');

    // Create users with type safety
    const createUserSafely = (input: CreateUserInput) => {
        try {
            validateUser(input);
            const user = userManager.createUser(input);
            console.log('✅ User created:', user);
            return user;
        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('❌ Validation Error:', error.message);
            } else {
                console.error('❌ Unexpected Error:', error);
            }
            return null;
        }
    };

    // Valid users
    const user1 = createUserSafely({
        name: "John Doe",
        email: "john@example.com",
        age: 25
    });

    const user2 = createUserSafely({
        name: "Jane Smith",
        email: "jane@example.com"
    });

    // Invalid user (will show validation error)
    createUserSafely({
        name: "",
        email: "invalid-email",
        age: -5
    } as CreateUserInput);

    if (user1) {
        // Update user with type safety
        const updatedUser = userManager.updateUser(user1.id, {
            age: 26,
            isActive: true
        });
        console.log('✅ User updated:', updatedUser);

        // Search users
        const searchResults = userManager.searchUsers("john");
        console.log('🔍 Search results for "john":', searchResults);

        // Get all active users
        const activeUsers = userManager.getActiveUsers();
        console.log('👥 Active users:', activeUsers.length);
    }
}

// Generic function example
function createApiResponse<T>(success: boolean, data?: T, error?: string) {
    return {
        success,
        data,
        error,
        message: success ? 'Operation successful' : 'Operation failed',
        timestamp: new Date().toISOString()
    };
}

// Type guard example
function isUser(obj: any): obj is User {
    return obj && 
           typeof obj.id === 'number' &&
           typeof obj.name === 'string' &&
           typeof obj.email === 'string' &&
           typeof obj.isActive === 'boolean';
}

// Run the demo
demonstrateTypeScript();

// Generic and type guard examples
const apiResponse = createApiResponse(true, { message: "Hello TypeScript!" });
console.log('\n📦 API Response:', apiResponse);

const unknownObject = userManager.getUserById(1);
if (isUser(unknownObject)) {
    console.log('✅ Object is a User:', unknownObject.name);
} else {
    console.log('❌ Object is not a User');
}
```

## Bài tập

### Bài tập 1: Type-Safe Calculator

Tạo một calculator class với full type safety:

```typescript
// Implement this class with proper typing
class Calculator {
    // Basic operations
    add(a: number, b: number): number
    subtract(a: number, b: number): number
    multiply(a: number, b: number): number
    divide(a: number, b: number): number

    // Advanced operations
    power(base: number, exponent: number): number
    sqrt(value: number): number
    percentage(value: number, percent: number): number

    // History functionality
    getHistory(): CalculationHistory[]
    clearHistory(): void
}

interface CalculationHistory {
    operation: string;
    operands: number[];
    result: number;
    timestamp: Date;
}
```

### Bài tập 2: Generic Data Structure

Implement một generic Stack với type safety:

```typescript
class Stack<T> {
    private items: T[] = [];

    push(item: T): void {
        // Implementation
    }

    pop(): T | undefined {
        // Implementation
    }

    peek(): T | undefined {
        // Implementation
    }

    isEmpty(): boolean {
        // Implementation
    }

    size(): number {
        // Implementation
    }

    toArray(): T[] {
        // Implementation
    }
}

// Usage examples:
const numberStack = new Stack<number>();
const stringStack = new Stack<string>();
const userStack = new Stack<User>();
```

### Bài tập 3: API Client với Type Safety

Tạo một HTTP client với full typing:

```typescript
interface ApiClient {
    get<T>(url: string): Promise<ApiResponse<T>>;
    post<T, U>(url: string, data: U): Promise<ApiResponse<T>>;
    put<T, U>(url: string, data: U): Promise<ApiResponse<T>>;
    delete<T>(url: string): Promise<ApiResponse<T>>;
}

// Implement the ApiClient class
class HttpClient implements ApiClient {
    // Your implementation here
}
```

## 🎯 Key Takeaways

1. **Type Safety**: Catch bugs at compile time, not runtime
2. **Better DX**: IntelliSense, refactoring, documentation
3. **Interfaces vs Types**: Use interfaces for objects, types for unions
4. **Generics**: Write reusable, type-safe code
5. **Type Guards**: Runtime type checking
6. **Union Types**: Handle multiple possible types safely

## 📚 Next Steps

- Learn about advanced TypeScript features (generics, decorators)
- Integrate TypeScript with Express applications
- Explore TypeScript with databases and ORMs
- Master testing TypeScript applications

TypeScript fundamentals tạo nền tảng vững chắc cho toàn bộ Node.js development journey! 🚀
