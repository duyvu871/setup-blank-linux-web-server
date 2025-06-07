# TypeScript với Express

Tích hợp TypeScript vào Express applications để có type safety từ routes đến middleware và error handling.

## Lý thuyết

### Tại sao TypeScript + Express?

**1. Type Safety cho Request/Response**
```typescript
// Without TypeScript
app.post('/users', (req, res) => {
    const { name, email } = req.body; // No type checking
    // What if name is undefined? email is not a string?
    res.json({ id: 1, name, email });
});

// With TypeScript
interface CreateUserRequest {
    name: string;
    email: string;
    age?: number;
}

interface User {
    id: number;
    name: string;
    email: string;
    age?: number;
}

app.post('/users', (req: Request<{}, User, CreateUserRequest>, res: Response<User>) => {
    const { name, email, age } = req.body; // Fully typed!
    const user: User = { id: 1, name, email, age };
    res.json(user); // Type-safe response
});
```

**2. Middleware Type Safety**
```typescript
// Custom middleware với typing
interface AuthenticatedRequest extends Request {
    user?: User;
}

const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify token and set user
    req.user = { id: 1, name: 'John', email: 'john@example.com' };
    next();
};
```

**3. Route Parameter Types**
```typescript
interface UserParamsRequest {
    id: string;
}

interface UpdateUserRequest {
    name?: string;
    email?: string;
}

app.put('/users/:id', 
    (req: Request<UserParamsRequest, User, UpdateUserRequest>, res: Response<User>) => {
        const userId = parseInt(req.params.id); // Type-safe param access
        const updates = req.body; // Typed body
        
        // Implementation
        res.json(updatedUser);
    }
);
```

### Express Types Architecture

```typescript
// Custom type definitions
declare global {
    namespace Express {
        interface Request {
            user?: User;
            requestId?: string;
        }
    }
}

// Base controller interface
interface Controller {
    index?(req: Request, res: Response, next: NextFunction): Promise<void>;
    show?(req: Request, res: Response, next: NextFunction): Promise<void>;
    create?(req: Request, res: Response, next: NextFunction): Promise<void>;
    update?(req: Request, res: Response, next: NextFunction): Promise<void>;
    destroy?(req: Request, res: Response, next: NextFunction): Promise<void>;
}

// API Response types
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message: string;
    timestamp: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
```

## Thực hành

### 1. Setup TypeScript Express Project

```bash
# Initialize project
mkdir typescript-express-api
cd typescript-express-api
npm init -y

# Install dependencies
npm install express cors helmet morgan dotenv
npm install bcryptjs jsonwebtoken joi

# Install dev dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/helmet @types/morgan
npm install -D @types/bcryptjs @types/jsonwebtoken
npm install -D ts-node nodemon concurrently
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
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**package.json scripts**
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "nodemon --exec ts-node src/server.ts",
    "dev:watch": "concurrently \"tsc -w\" \"nodemon dist/server.js\"",
    "type-check": "tsc --noEmit"
  }
}
```

### 2. Type Definitions

**src/types/express.d.ts**
```typescript
import { User } from './user';

declare global {
    namespace Express {
        interface Request {
            user?: User;
            requestId?: string;
            startTime?: number;
        }
    }
}

export {};
```

**src/types/api.ts**
```typescript
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message: string;
    timestamp: string;
    requestId?: string;
}

export interface PaginatedResponse<T> extends Omit<ApiResponse, 'data'> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

export interface ErrorResponse extends ApiResponse {
    success: false;
    errors?: ValidationError[];
    stack?: string;
}
```

**src/types/user.ts**
```typescript
export interface User {
    id: number;
    name: string;
    email: string;
    age?: number;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type UserRole = 'admin' | 'user' | 'moderator';

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    age?: number;
    role?: UserRole;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    age?: number;
    role?: UserRole;
    isActive?: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: Omit<User, 'password'>;
    token: string;
    refreshToken: string;
}

export interface UserParamsRequest {
    id: string;
}

export interface UserQueryRequest {
    page?: string;
    limit?: string;
    search?: string;
    role?: UserRole;
    isActive?: string;
}
```

### 3. Middleware với Type Safety

**src/middleware/auth.ts**
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../types/user';
import { ErrorResponse } from '../types/api';

interface JwtPayload {
    userId: number;
    email: string;
    role: UserRole;
}

export const authenticateToken = async (
    req: Request,
    res: Response<ErrorResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token required',
                timestamp: new Date().toISOString(),
                requestId: req.requestId
            });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        
        // In real app, fetch user from database
        const user: User = {
            id: decoded.userId,
            name: 'John Doe',
            email: decoded.email,
            role: decoded.role,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        req.user = user;
        next();
    } catch (error) {
        res.status(403).json({
            success: false,
            message: 'Invalid or expired token',
            timestamp: new Date().toISOString(),
            requestId: req.requestId
        });
    }
};

export const requireRole = (...roles: UserRole[]) => {
    return (req: Request, res: Response<ErrorResponse>, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
                timestamp: new Date().toISOString(),
                requestId: req.requestId
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                timestamp: new Date().toISOString(),
                requestId: req.requestId
            });
            return;
        }

        next();
    };
};
```

**src/middleware/validation.ts**
```typescript
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ErrorResponse, ValidationError } from '../types/api';

export const validate = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response<ErrorResponse>, next: NextFunction): void => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            const validationErrors: ValidationError[] = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));

            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors,
                timestamp: new Date().toISOString(),
                requestId: req.requestId
            });
            return;
        }

        next();
    };
};

// Validation schemas
export const userValidationSchemas = {
    create: Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        age: Joi.number().min(13).max(120).optional(),
        role: Joi.string().valid('admin', 'user', 'moderator').optional()
    }),

    update: Joi.object({
        name: Joi.string().min(2).max(50).optional(),
        email: Joi.string().email().optional(),
        age: Joi.number().min(13).max(120).optional(),
        role: Joi.string().valid('admin', 'user', 'moderator').optional(),
        isActive: Joi.boolean().optional()
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
};
```

**src/middleware/request-logger.ts**
```typescript
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    req.requestId = uuidv4();
    req.startTime = Date.now();

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Request ID: ${req.requestId}`);
    
    // Log response when it finishes
    res.on('finish', () => {
        const duration = Date.now() - (req.startTime || 0);
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.path} - ` +
            `${res.statusCode} - ${duration}ms - Request ID: ${req.requestId}`
        );
    });

    next();
};
```

### 4. Controllers với Type Safety

**src/controllers/BaseController.ts**
```typescript
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, PaginatedResponse, ErrorResponse } from '../types/api';

export abstract class BaseController {
    protected sendSuccess<T>(
        res: Response<ApiResponse<T>>,
        data: T,
        message: string = 'Success',
        statusCode: number = 200
    ): void {
        res.status(statusCode).json({
            success: true,
            data,
            message,
            timestamp: new Date().toISOString(),
            requestId: res.req.requestId
        });
    }

    protected sendPaginatedSuccess<T>(
        res: Response<PaginatedResponse<T>>,
        data: T[],
        pagination: PaginatedResponse<T>['pagination'],
        message: string = 'Success'
    ): void {
        res.status(200).json({
            success: true,
            data,
            pagination,
            message,
            timestamp: new Date().toISOString(),
            requestId: res.req.requestId
        });
    }

    protected sendError(
        res: Response<ErrorResponse>,
        message: string,
        statusCode: number = 500,
        error?: any
    ): void {
        res.status(statusCode).json({
            success: false,
            message,
            error: error?.message || error,
            timestamp: new Date().toISOString(),
            requestId: res.req.requestId,
            ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
        });
    }

    protected asyncHandler = (
        fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
    ) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    };
}
```

**src/controllers/UserController.ts**
```typescript
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BaseController } from './BaseController';
import {
    User,
    CreateUserRequest,
    UpdateUserRequest,
    LoginRequest,
    AuthResponse,
    UserParamsRequest,
    UserQueryRequest
} from '../types/user';
import { ApiResponse, PaginatedResponse } from '../types/api';

export class UserController extends BaseController {
    // In-memory store (use database in real app)
    private users: User[] = [];
    private nextId = 1;

    public getAllUsers = this.asyncHandler(
        async (
            req: Request<{}, PaginatedResponse<User>, {}, UserQueryRequest>,
            res: Response<PaginatedResponse<User>>
        ): Promise<void> => {
            const { page = '1', limit = '10', search, role, isActive } = req.query;
            
            let filteredUsers = [...this.users];

            // Apply filters
            if (search) {
                const searchLower = search.toLowerCase();
                filteredUsers = filteredUsers.filter(user =>
                    user.name.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower)
                );
            }

            if (role) {
                filteredUsers = filteredUsers.filter(user => user.role === role);
            }

            if (isActive !== undefined) {
                const activeFilter = isActive === 'true';
                filteredUsers = filteredUsers.filter(user => user.isActive === activeFilter);
            }

            // Pagination
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const total = filteredUsers.length;
            const totalPages = Math.ceil(total / limitNum);
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;

            const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

            this.sendPaginatedSuccess(res, paginatedUsers, {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            });
        }
    );

    public getUserById = this.asyncHandler(
        async (
            req: Request<UserParamsRequest, ApiResponse<User>>,
            res: Response<ApiResponse<User>>
        ): Promise<void> => {
            const userId = parseInt(req.params.id);
            const user = this.users.find(u => u.id === userId);

            if (!user) {
                this.sendError(res, 'User not found', 404);
                return;
            }

            this.sendSuccess(res, user, 'User retrieved successfully');
        }
    );

    public createUser = this.asyncHandler(
        async (
            req: Request<{}, ApiResponse<User>, CreateUserRequest>,
            res: Response<ApiResponse<User>>
        ): Promise<void> => {
            const { name, email, password, age, role = 'user' } = req.body;

            // Check if user exists
            const existingUser = this.users.find(u => u.email === email);
            if (existingUser) {
                this.sendError(res, 'User with this email already exists', 409);
                return;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            const newUser: User = {
                id: this.nextId++,
                name,
                email,
                age,
                role,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            this.users.push(newUser);

            this.sendSuccess(res, newUser, 'User created successfully', 201);
        }
    );

    public updateUser = this.asyncHandler(
        async (
            req: Request<UserParamsRequest, ApiResponse<User>, UpdateUserRequest>,
            res: Response<ApiResponse<User>>
        ): Promise<void> => {
            const userId = parseInt(req.params.id);
            const updates = req.body;

            const userIndex = this.users.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                this.sendError(res, 'User not found', 404);
                return;
            }

            // Check email uniqueness if updating email
            if (updates.email && updates.email !== this.users[userIndex].email) {
                const emailExists = this.users.some(u => u.email === updates.email);
                if (emailExists) {
                    this.sendError(res, 'Email already in use', 409);
                    return;
                }
            }

            const updatedUser: User = {
                ...this.users[userIndex],
                ...updates,
                updatedAt: new Date()
            };

            this.users[userIndex] = updatedUser;

            this.sendSuccess(res, updatedUser, 'User updated successfully');
        }
    );

    public deleteUser = this.asyncHandler(
        async (
            req: Request<UserParamsRequest>,
            res: Response<ApiResponse<null>>
        ): Promise<void> => {
            const userId = parseInt(req.params.id);
            const userIndex = this.users.findIndex(u => u.id === userId);

            if (userIndex === -1) {
                this.sendError(res, 'User not found', 404);
                return;
            }

            this.users.splice(userIndex, 1);

            this.sendSuccess(res, null, 'User deleted successfully');
        }
    );

    public login = this.asyncHandler(
        async (
            req: Request<{}, ApiResponse<AuthResponse>, LoginRequest>,
            res: Response<ApiResponse<AuthResponse>>
        ): Promise<void> => {
            const { email, password } = req.body;

            // Find user (in real app, get from database with hashed password)
            const user = this.users.find(u => u.email === email);
            if (!user) {
                this.sendError(res, 'Invalid credentials', 401);
                return;
            }

            // Check password (mock - in real app compare with bcrypt)
            const isValidPassword = true; // await bcrypt.compare(password, user.hashedPassword);
            if (!isValidPassword) {
                this.sendError(res, 'Invalid credentials', 401);
                return;
            }

            // Generate tokens
            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET!,
                { expiresIn: '15m' }
            );

            const refreshToken = jwt.sign(
                { userId: user.id },
                process.env.JWT_REFRESH_SECRET!,
                { expiresIn: '7d' }
            );

            const authResponse: AuthResponse = {
                user,
                token,
                refreshToken
            };

            this.sendSuccess(res, authResponse, 'Login successful');
        }
    );

    public getProfile = this.asyncHandler(
        async (
            req: Request<{}, ApiResponse<User>>,
            res: Response<ApiResponse<User>>
        ): Promise<void> => {
            if (!req.user) {
                this.sendError(res, 'User not authenticated', 401);
                return;
            }

            this.sendSuccess(res, req.user, 'Profile retrieved successfully');
        }
    );
}
```

### 5. Routes với Type Safety

**src/routes/users.ts**
```typescript
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate, userValidationSchemas } from '../middleware/validation';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/login', 
    validate(userValidationSchemas.login),
    userController.login
);

router.post('/', 
    validate(userValidationSchemas.create),
    userController.createUser
);

// Protected routes
router.use(authenticateToken);

router.get('/profile', userController.getProfile);

router.get('/', userController.getAllUsers);

router.get('/:id', userController.getUserById);

router.put('/:id', 
    validate(userValidationSchemas.update),
    userController.updateUser
);

// Admin only routes
router.delete('/:id', 
    requireRole('admin'),
    userController.deleteUser
);

export default router;
```

**src/app.ts**
```typescript
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { requestLogger } from './middleware/request-logger';
import { ErrorResponse } from './types/api';
import userRoutes from './routes/users';

// Load environment variables
dotenv.config();

class App {
    public app: Application;

    constructor() {
        this.app = express();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeMiddlewares(): void {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(morgan('combined'));
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(requestLogger);
    }

    private initializeRoutes(): void {
        // Health check
        this.app.get('/health', (req: Request, res: Response) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });

        // API routes
        this.app.use('/api/users', userRoutes);

        // 404 handler
        this.app.use('*', (req: Request, res: Response<ErrorResponse>) => {
            res.status(404).json({
                success: false,
                message: `Route ${req.originalUrl} not found`,
                timestamp: new Date().toISOString(),
                requestId: req.requestId
            });
        });
    }

    private initializeErrorHandling(): void {
        this.app.use((
            error: Error,
            req: Request,
            res: Response<ErrorResponse>,
            next: NextFunction
        ) => {
            console.error('Error:', error);

            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                timestamp: new Date().toISOString(),
                requestId: req.requestId,
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            });
        });
    }
}

export default App;
```

**src/server.ts**
```typescript
import App from './app';

const PORT = process.env.PORT || 3000;

const app = new App();

app.app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
```

## Bài tập

### Bài tập 1: E-commerce API Routes

Tạo type-safe routes cho e-commerce system:

```typescript
interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    inStock: boolean;
    images: string[];
}

interface Order {
    id: number;
    userId: number;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered';
}

// Implement ProductController and OrderController với full type safety
```

### Bài tập 2: File Upload Handler

Tạo type-safe file upload system:

```typescript
interface FileUploadRequest {
    files: Express.Multer.File[];
    metadata?: {
        title?: string;
        description?: string;
        tags?: string[];
    };
}

// Implement file upload với validation và type safety
```

### Bài tập 3: Advanced Middleware System

Tạo advanced middleware system:

```typescript
interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests?: boolean;
}

interface CacheConfig {
    ttl: number;
    key: (req: Request) => string;
}

// Implement rate limiting và caching middleware với TypeScript
```

## 🎯 Key Takeaways

1. **Request/Response Typing**: Type-safe API contracts
2. **Middleware Typing**: Custom middleware với proper types
3. **Controller Architecture**: Structured, type-safe controllers
4. **Error Handling**: Consistent error responses với typing
5. **Validation Integration**: Type-safe request validation
6. **Authentication**: Typed auth middleware và user context

## 📚 Next Steps

- Integrate TypeScript với databases (Prisma, TypeORM)
- Learn GraphQL với TypeScript
- Explore real-time features với Socket.io + TypeScript
- Master testing TypeScript Express applications

TypeScript + Express = Production-ready, maintainable APIs! 🚀
