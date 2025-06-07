# Testing TypeScript Applications

Testing TypeScript applications đòi hỏi strategies đặc biệt để maintain type safety và ensure code quality. Tìm hiểu cách test hiệu quả từ unit tests đến integration tests.

## Lý thuyết

### TypeScript Testing Challenges

**1. Type Safety trong Tests**
```typescript
// ❌ Type-unsafe test
test('should create user', async () => {
    const user = await userService.createUser({
        name: 'John',
        email: 'john@example.com'
        // Missing required fields - no compile error in JS test
    });
    
    expect(user.id).toBe(1);
    expect(user.nonExistentField).toBeDefined(); // No type error
});

// ✅ Type-safe test
test('should create user', async () => {
    const userData: CreateUserRequest = {
        name: 'John',
        email: 'john@example.com',
        password: 'password123' // TypeScript enforces all required fields
    };
    
    const user: User = await userService.createUser(userData);
    
    expect(user.id).toBeDefined();
    expect(user.name).toBe(userData.name);
    // user.nonExistentField would cause compile error
});
```

**2. Mock Type Safety**
```typescript
// ❌ Unsafe mocking
const mockUserService = {
    createUser: jest.fn().mockResolvedValue({ id: 1 }), // Return type not enforced
    getUser: jest.fn().mockResolvedValue({ wrong: 'shape' }) // Wrong return type
};

// ✅ Type-safe mocking
const mockUserService: jest.Mocked<UserService> = {
    createUser: jest.fn().mockResolvedValue({
        id: 1,
        name: 'John',
        email: 'john@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    } as User), // Must match User interface
    
    getUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn()
};
```

**3. Test Data Type Safety**
```typescript
// Factory pattern với TypeScript
class UserFactory {
    static create(overrides: Partial<User> = {}): User {
        return {
            id: Math.floor(Math.random() * 1000),
            name: 'Test User',
            email: 'test@example.com',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides
        };
    }
    
    static createRequest(overrides: Partial<CreateUserRequest> = {}): CreateUserRequest {
        return {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            ...overrides
        };
    }
}
```

### Testing Architecture

```typescript
// Test types
interface TestContext {
    app: Application;
    prisma: PrismaClient;
    userService: UserService;
    testUser: User;
}

interface ApiTestResponse<T = any> {
    status: number;
    body: ApiResponse<T>;
}

// Test utilities
type MockedService<T> = {
    [P in keyof T]: T[P] extends (...args: any[]) => any
        ? jest.MockedFunction<T[P]>
        : T[P];
};
```

## Thực hành

### 1. Setup Testing Environment

```bash
# Install testing dependencies
npm install -D jest @types/jest ts-jest
npm install -D supertest @types/supertest
npm install -D @testing-library/jest-dom
npm install -D jest-environment-node
```

**jest.config.ts**
```typescript
import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: [
        '**/__tests__/**/*.ts',
        '**/?(*.)+(spec|test).ts'
    ],
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/types/**',
        '!src/**/*.interface.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
    testTimeout: 10000,
    clearMocks: true,
    restoreMocks: true
};

export default config;
```

**src/test/setup.ts**
```typescript
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { join } from 'path';

// Global test setup
declare global {
    var __PRISMA__: PrismaClient;
}

beforeAll(async () => {
    // Setup test database
    const databaseUrl = process.env.TEST_DATABASE_URL || 
        'postgresql://test:test@localhost:5432/test_db';
    
    process.env.DATABASE_URL = databaseUrl;
    
    // Run migrations
    execSync('npx prisma migrate deploy', {
        env: { ...process.env, DATABASE_URL: databaseUrl }
    });
    
    // Create Prisma client
    global.__PRISMA__ = new PrismaClient({
        datasources: {
            db: {
                url: databaseUrl
            }
        }
    });
});

beforeEach(async () => {
    // Clean database before each test
    const tablenames = await global.__PRISMA__.$queryRaw<
        Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
        .map(({ tablename }) => tablename)
        .filter(name => name !== '_prisma_migrations')
        .map(name => `"public"."${name}"`)
        .join(', ');

    try {
        await global.__PRISMA__.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
        console.log({ error });
    }
});

afterAll(async () => {
    await global.__PRISMA__.$disconnect();
});
```

### 2. Test Utilities và Factories

**src/test/factories/UserFactory.ts**
```typescript
import { User, CreateUserRequest } from '../../types/user';
import { faker } from '@faker-js/faker';

export class UserFactory {
    static create(overrides: Partial<User> = {}): User {
        return {
            id: faker.datatype.number({ min: 1, max: 9999 }),
            name: faker.name.fullName(),
            email: faker.internet.email(),
            role: 'USER',
            isActive: true,
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
            ...overrides
        };
    }

    static createRequest(overrides: Partial<CreateUserRequest> = {}): CreateUserRequest {
        return {
            name: faker.name.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'USER',
            ...overrides
        };
    }

    static createMany(count: number, overrides: Partial<User> = {}): User[] {
        return Array.from({ length: count }, () => this.create(overrides));
    }

    static admin(overrides: Partial<User> = {}): User {
        return this.create({
            role: 'ADMIN',
            ...overrides
        });
    }

    static inactive(overrides: Partial<User> = {}): User {
        return this.create({
            isActive: false,
            ...overrides
        });
    }
}
```

**src/test/helpers/DatabaseHelper.ts**
```typescript
import { PrismaClient, User, Post } from '@prisma/client';

export class DatabaseHelper {
    constructor(private prisma: PrismaClient) {}

    async createUser(data: Partial<User> = {}): Promise<User> {
        const userData = UserFactory.create(data);
        return this.prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                role: userData.role,
                isActive: userData.isActive
            }
        });
    }

    async createPost(authorId: number, data: Partial<Post> = {}): Promise<Post> {
        return this.prisma.post.create({
            data: {
                title: data.title || faker.lorem.sentence(),
                content: data.content || faker.lorem.paragraphs(),
                slug: data.slug || faker.lorem.slug(),
                authorId,
                published: data.published ?? true,
                tags: data.tags || [faker.lorem.word(), faker.lorem.word()]
            }
        });
    }

    async createUserWithPosts(userCount: number = 1, postsPerUser: number = 2) {
        const users = [];
        
        for (let i = 0; i < userCount; i++) {
            const user = await this.createUser();
            const posts = [];
            
            for (let j = 0; j < postsPerUser; j++) {
                const post = await this.createPost(user.id);
                posts.push(post);
            }
            
            users.push({ user, posts });
        }
        
        return users;
    }

    async cleanup(): Promise<void> {
        // Clean up in correct order due to foreign keys
        await this.prisma.like.deleteMany();
        await this.prisma.comment.deleteMany();
        await this.prisma.postCategory.deleteMany();
        await this.prisma.post.deleteMany();
        await this.prisma.follow.deleteMany();
        await this.prisma.user.deleteMany();
        await this.prisma.category.deleteMany();
    }
}
```

**src/test/helpers/ApiHelper.ts**
```typescript
import request from 'supertest';
import { Application } from 'express';
import { ApiResponse } from '../../types/api';
import { User } from '../../types/user';

export class ApiHelper {
    constructor(private app: Application) {}

    async loginUser(email: string, password: string): Promise<string> {
        const response = await request(this.app)
            .post('/api/auth/login')
            .send({ email, password })
            .expect(200);

        return response.body.data.token;
    }

    async createAuthenticatedRequest(token: string) {
        return request(this.app).set('Authorization', `Bearer ${token}`);
    }

    async expectApiSuccess<T>(
        requestPromise: request.Test,
        expectedStatus: number = 200
    ): Promise<ApiResponse<T>> {
        const response = await requestPromise.expect(expectedStatus);
        
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('timestamp');
        
        return response.body;
    }

    async expectApiError(
        requestPromise: request.Test,
        expectedStatus: number,
        expectedMessage?: string
    ) {
        const response = await requestPromise.expect(expectedStatus);
        
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message');
        
        if (expectedMessage) {
            expect(response.body.message).toContain(expectedMessage);
        }
        
        return response.body;
    }
}
```

### 3. Unit Tests

**src/services/__tests__/UserService.test.ts**
```typescript
import { UserService } from '../UserService';
import { UserRepository } from '../../repositories/UserRepository';
import { UserFactory } from '../../test/factories/UserFactory';
import { User } from '../../types/user';

// Mock the repository
jest.mock('../../repositories/UserRepository');

describe('UserService', () => {
    let userService: UserService;
    let mockUserRepository: jest.Mocked<UserRepository>;

    beforeEach(() => {
        mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
        userService = new UserService();
        
        // Replace the repository instance
        (userService as any).userRepository = mockUserRepository;
    });

    describe('register', () => {
        it('should successfully register a new user', async () => {
            // Arrange
            const registerData = UserFactory.createRequest({
                email: 'test@example.com',
                name: 'Test User'
            });
            
            const expectedUser = UserFactory.create({
                email: registerData.email,
                name: registerData.name
            });

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue(expectedUser);

            // Act
            const result = await userService.register(registerData);

            // Assert
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerData.email);
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                email: registerData.email,
                name: registerData.name,
                avatar: registerData.avatar,
                role: registerData.role
            });
            
            expect(result.user).toEqual(expectedUser);
            expect(result.tokens).toHaveProperty('accessToken');
            expect(result.tokens).toHaveProperty('refreshToken');
            expect(typeof result.tokens.accessToken).toBe('string');
            expect(typeof result.tokens.refreshToken).toBe('string');
        });

        it('should throw error when user already exists', async () => {
            // Arrange
            const registerData = UserFactory.createRequest();
            const existingUser = UserFactory.create({ email: registerData.email });

            mockUserRepository.findByEmail.mockResolvedValue(existingUser);

            // Act & Assert
            await expect(userService.register(registerData))
                .rejects.toThrow('User with this email already exists');
            
            expect(mockUserRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        it('should successfully login with valid credentials', async () => {
            // Arrange
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };
            
            const user = UserFactory.create({
                email: loginData.email,
                isActive: true
            });

            mockUserRepository.findByEmail.mockResolvedValue(user);

            // Act
            const result = await userService.login(loginData);

            // Assert
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginData.email);
            expect(result.user).toEqual(user);
            expect(result.tokens).toHaveProperty('accessToken');
            expect(result.tokens).toHaveProperty('refreshToken');
        });

        it('should throw error for non-existent user', async () => {
            // Arrange
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);

            // Act & Assert
            await expect(userService.login(loginData))
                .rejects.toThrow('Invalid credentials');
        });

        it('should throw error for inactive user', async () => {
            // Arrange
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };
            
            const inactiveUser = UserFactory.create({
                email: loginData.email,
                isActive: false
            });

            mockUserRepository.findByEmail.mockResolvedValue(inactiveUser);

            // Act & Assert
            await expect(userService.login(loginData))
                .rejects.toThrow('Account is deactivated');
        });
    });

    describe('followUser', () => {
        it('should successfully follow a user', async () => {
            // Arrange
            const follower = UserFactory.create({ id: 1 });
            const following = UserFactory.create({ id: 2 });

            mockUserRepository.findById
                .mockResolvedValueOnce(follower)
                .mockResolvedValueOnce(following);
            mockUserRepository.follow.mockResolvedValue(true);

            // Act
            const result = await userService.followUser(follower.id, following.id);

            // Assert
            expect(result).toBe(true);
            expect(mockUserRepository.follow).toHaveBeenCalledWith(follower.id, following.id);
        });

        it('should throw error when trying to follow yourself', async () => {
            // Arrange
            const userId = 1;

            // Act & Assert
            await expect(userService.followUser(userId, userId))
                .rejects.toThrow('Cannot follow yourself');
        });

        it('should throw error when user not found', async () => {
            // Arrange
            const followerId = 1;
            const followingId = 2;

            mockUserRepository.findById
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(UserFactory.create());

            // Act & Assert
            await expect(userService.followUser(followerId, followingId))
                .rejects.toThrow('User not found');
        });
    });
});
```

### 4. Integration Tests

**src/controllers/__tests__/UserController.integration.test.ts**
```typescript
import request from 'supertest';
import { Application } from 'express';
import App from '../../app';
import { DatabaseHelper } from '../../test/helpers/DatabaseHelper';
import { ApiHelper } from '../../test/helpers/ApiHelper';
import { UserFactory } from '../../test/factories/UserFactory';
import { User } from '../../types/user';
import prisma from '../../lib/prisma';

describe('UserController Integration Tests', () => {
    let app: Application;
    let dbHelper: DatabaseHelper;
    let apiHelper: ApiHelper;

    beforeAll(async () => {
        app = new App().app;
        dbHelper = new DatabaseHelper(prisma);
        apiHelper = new ApiHelper(app);
    });

    afterEach(async () => {
        await dbHelper.cleanup();
    });

    describe('POST /api/users', () => {
        it('should create a new user with valid data', async () => {
            // Arrange
            const userData = UserFactory.createRequest({
                email: 'test@example.com',
                name: 'Test User'
            });

            // Act
            const response = await apiHelper.expectApiSuccess<User>(
                request(app)
                    .post('/api/users')
                    .send(userData),
                201
            );

            // Assert
            expect(response.data).toMatchObject({
                email: userData.email,
                name: userData.name,
                role: userData.role || 'USER',
                isActive: true
            });
            expect(response.data.id).toBeDefined();
            expect(response.data.createdAt).toBeDefined();
        });

        it('should return validation error for invalid email', async () => {
            // Arrange
            const invalidUserData = {
                name: 'Test User',
                email: 'invalid-email',
                password: 'password123'
            };

            // Act & Assert
            await apiHelper.expectApiError(
                request(app)
                    .post('/api/users')
                    .send(invalidUserData),
                400,
                'Validation failed'
            );
        });

        it('should return conflict error for duplicate email', async () => {
            // Arrange
            const existingUser = await dbHelper.createUser({
                email: 'existing@example.com'
            });
            
            const duplicateUserData = UserFactory.createRequest({
                email: existingUser.email
            });

            // Act & Assert
            await apiHelper.expectApiError(
                request(app)
                    .post('/api/users')
                    .send(duplicateUserData),
                409,
                'already exists'
            );
        });
    });

    describe('GET /api/users/:id', () => {
        it('should return user by id', async () => {
            // Arrange
            const user = await dbHelper.createUser();

            // Act
            const response = await apiHelper.expectApiSuccess<User>(
                request(app).get(`/api/users/${user.id}`)
            );

            // Assert
            expect(response.data).toMatchObject({
                id: user.id,
                email: user.email,
                name: user.name
            });
        });

        it('should return 404 for non-existent user', async () => {
            // Act & Assert
            await apiHelper.expectApiError(
                request(app).get('/api/users/99999'),
                404,
                'User not found'
            );
        });
    });

    describe('PUT /api/users/:id', () => {
        it('should update user with authentication', async () => {
            // Arrange
            const user = await dbHelper.createUser();
            const token = 'mock-jwt-token'; // In real tests, generate valid JWT
            
            const updateData = {
                name: 'Updated Name',
                role: 'ADMIN' as const
            };

            // Mock authentication middleware for this test
            jest.spyOn(require('../../middleware/auth'), 'authenticateToken')
                .mockImplementation((req, res, next) => {
                    req.user = user;
                    next();
                });

            // Act
            const response = await apiHelper.expectApiSuccess<User>(
                request(app)
                    .put(`/api/users/${user.id}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send(updateData)
            );

            // Assert
            expect(response.data.name).toBe(updateData.name);
            expect(response.data.role).toBe(updateData.role);
        });

        it('should return 401 without authentication', async () => {
            // Arrange
            const user = await dbHelper.createUser();
            const updateData = { name: 'Updated Name' };

            // Act & Assert
            await apiHelper.expectApiError(
                request(app)
                    .put(`/api/users/${user.id}`)
                    .send(updateData),
                401
            );
        });
    });

    describe('GET /api/users', () => {
        it('should return paginated users with filters', async () => {
            // Arrange
            await dbHelper.createUserWithPosts(5, 2);

            // Act
            const response = await apiHelper.expectApiSuccess(
                request(app)
                    .get('/api/users')
                    .query({
                        page: '1',
                        limit: '3',
                        role: 'USER'
                    })
            );

            // Assert
            expect(response.data).toHaveLength(3);
            expect(response.pagination).toMatchObject({
                page: 1,
                limit: 3,
                total: 5,
                totalPages: 2,
                hasNext: true,
                hasPrev: false
            });
        });

        it('should search users by name and email', async () => {
            // Arrange
            await dbHelper.createUser({ name: 'John Doe', email: 'john@example.com' });
            await dbHelper.createUser({ name: 'Jane Smith', email: 'jane@example.com' });
            await dbHelper.createUser({ name: 'Bob Wilson', email: 'bob@example.com' });

            // Act
            const response = await apiHelper.expectApiSuccess(
                request(app)
                    .get('/api/users')
                    .query({ search: 'john' })
            );

            // Assert
            expect(response.data).toHaveLength(1);
            expect(response.data[0].name).toBe('John Doe');
        });
    });
});
```

### 5. E2E Tests

**src/__tests__/e2e/user-workflow.test.ts**
```typescript
import request from 'supertest';
import { Application } from 'express';
import App from '../app';
import { DatabaseHelper } from '../test/helpers/DatabaseHelper';
import { UserFactory } from '../test/factories/UserFactory';
import prisma from '../lib/prisma';

describe('User Workflow E2E Tests', () => {
    let app: Application;
    let dbHelper: DatabaseHelper;

    beforeAll(async () => {
        app = new App().app;
        dbHelper = new DatabaseHelper(prisma);
    });

    afterEach(async () => {
        await dbHelper.cleanup();
    });

    it('should complete full user registration and login flow', async () => {
        // 1. Register new user
        const registerData = UserFactory.createRequest({
            email: 'test@example.com',
            name: 'Test User',
            password: 'password123'
        });

        const registerResponse = await request(app)
            .post('/api/users')
            .send(registerData)
            .expect(201);

        expect(registerResponse.body.success).toBe(true);
        expect(registerResponse.body.data.email).toBe(registerData.email);

        // 2. Login with created user
        const loginData = {
            email: registerData.email,
            password: registerData.password
        };

        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send(loginData)
            .expect(200);

        expect(loginResponse.body.success).toBe(true);
        expect(loginResponse.body.data.token).toBeDefined();
        
        const { token } = loginResponse.body.data;

        // 3. Get user profile with token
        const profileResponse = await request(app)
            .get('/api/users/profile')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(profileResponse.body.data.email).toBe(registerData.email);

        // 4. Update user profile
        const updateData = {
            name: 'Updated Test User',
            role: 'MODERATOR'
        };

        const updateResponse = await request(app)
            .put(`/api/users/${registerResponse.body.data.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateData)
            .expect(200);

        expect(updateResponse.body.data.name).toBe(updateData.name);
    });

    it('should handle user follow/unfollow workflow', async () => {
        // 1. Create two users
        const [user1, user2] = await Promise.all([
            dbHelper.createUser({ name: 'User 1' }),
            dbHelper.createUser({ name: 'User 2' })
        ]);

        // Mock authentication for user1
        const mockAuth = (req: any, res: any, next: any) => {
            req.user = user1;
            next();
        };
        
        jest.spyOn(require('../middleware/auth'), 'authenticateToken')
            .mockImplementation(mockAuth);

        // 2. User1 follows User2
        const followResponse = await request(app)
            .post(`/api/users/${user2.id}/follow`)
            .set('Authorization', 'Bearer mock-token')
            .expect(200);

        expect(followResponse.body.success).toBe(true);

        // 3. Check followers/following
        const followersResponse = await request(app)
            .get(`/api/users/${user2.id}/followers`)
            .expect(200);

        expect(followersResponse.body.data).toHaveLength(1);
        expect(followersResponse.body.data[0].id).toBe(user1.id);

        // 4. User1 unfollows User2
        const unfollowResponse = await request(app)
            .delete(`/api/users/${user2.id}/follow`)
            .set('Authorization', 'Bearer mock-token')
            .expect(200);

        expect(unfollowResponse.body.success).toBe(true);

        // 5. Verify no followers
        const noFollowersResponse = await request(app)
            .get(`/api/users/${user2.id}/followers`)
            .expect(200);

        expect(noFollowersResponse.body.data).toHaveLength(0);
    });
});
```

## Bài tập

### Bài tập 1: Repository Testing

Test PostRepository với complex queries:

```typescript
describe('PostRepository', () => {
    // Test pagination
    // Test filtering by multiple criteria
    // Test sorting by different fields
    // Test relationship loading
    // Test error handling
});
```

### Bài tập 2: Service Layer Testing

Test business logic với mocking:

```typescript
describe('PostService', () => {
    // Test create post with categories
    // Test permission checking
    // Test complex business rules
    // Test transaction rollback
});
```

### Bài tập 3: API Performance Testing

```typescript
describe('API Performance Tests', () => {
    it('should handle concurrent requests', async () => {
        // Test concurrent user creation
        // Test rate limiting
        // Test database connection pooling
    });

    it('should have reasonable response times', async () => {
        // Test response times under load
        // Test query optimization
    });
});
```

## 🎯 Key Takeaways

1. **Type Safety**: Maintain type safety in tests và mocks
2. **Test Structure**: Unit → Integration → E2E testing pyramid
3. **Database Testing**: Proper setup, cleanup, và isolation
4. **Factory Pattern**: Consistent test data generation
5. **Mock Types**: Type-safe mocking với jest.Mocked<T>
6. **Test Utilities**: Reusable helpers cho complex scenarios

## 📚 Next Steps

- Learn property-based testing với fast-check
- Explore visual regression testing
- Master performance testing và profiling
- Study test-driven development (TDD) với TypeScript

Testing TypeScript = Confidence trong code quality! 🚀
