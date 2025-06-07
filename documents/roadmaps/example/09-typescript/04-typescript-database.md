# TypeScript với Database

Tích hợp TypeScript với databases để có type safety từ models đến queries, sử dụng Prisma và Mongoose.

## Lý thuyết

### Database + TypeScript Benefits

**1. Type-Safe Queries**
```typescript
// Without TypeScript
const user = await User.findById(123);
console.log(user.name); // No type checking
console.log(user.nonExistentField); // Runtime error

// With TypeScript + Prisma
const user = await prisma.user.findUnique({
    where: { id: 123 }
});
console.log(user?.name); // Type-safe, nullable
console.log(user?.nonExistentField); // Compile error
```

**2. Schema-Driven Development**
```typescript
// Prisma schema automatically generates types
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

// Generated TypeScript types
interface User {
    id: number;
    email: string;
    name: string | null;
    posts: Post[];
    createdAt: Date;
}
```

**3. Relationship Type Safety**
```typescript
// Include relationships with full typing
const userWithPosts = await prisma.user.findUnique({
    where: { id: 1 },
    include: {
        posts: {
            include: {
                comments: true
            }
        }
    }
});

// userWithPosts.posts[0].comments is fully typed!
```

### Prisma vs Mongoose với TypeScript

| Feature | Prisma | Mongoose |
|---------|--------|----------|
| Type Generation | Automatic | Manual interfaces |
| Schema Definition | Prisma schema | TypeScript + decorators |
| Migrations | Built-in | Manual/plugins |
| Queries | Type-safe by default | Requires typing |
| Learning Curve | Easy | Moderate |
| Performance | Excellent | Good |

## Thực hành

### 1. Setup Prisma với TypeScript

```bash
# Initialize project
mkdir typescript-database
cd typescript-database
npm init -y

# Install dependencies
npm install prisma @prisma/client express
npm install bcryptjs jsonwebtoken joi
npm install -D typescript @types/node @types/express
npm install -D @types/bcryptjs @types/jsonwebtoken
npm install -D ts-node nodemon

# Initialize Prisma
npx prisma init
```

**prisma/schema.prisma**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  avatar    String?
  role      Role     @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relationships
  posts     Post[]
  comments  Comment[]
  likes     Like[]
  followers Follow[] @relation("UserFollowers")
  following Follow[] @relation("UserFollowing")

  @@map("users")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  published Boolean  @default(false)
  slug      String   @unique
  tags      String[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  authorId  Int
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments  Comment[]
  likes     Like[]
  categories PostCategory[]

  @@map("posts")
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  authorId  Int
  author    User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  postId    Int
  post      Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  parentId  Int?
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")

  @@map("comments")
}

model Category {
  id          Int    @id @default(autoincrement())
  name        String @unique
  description String?
  slug        String @unique
  
  posts       PostCategory[]

  @@map("categories")
}

model PostCategory {
  postId     Int
  categoryId Int
  
  post       Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([postId, categoryId])
  @@map("post_categories")
}

model Like {
  id     Int @id @default(autoincrement())
  userId Int
  postId Int

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@map("likes")
}

model Follow {
  id          Int @id @default(autoincrement())
  followerId  Int
  followingId Int

  follower  User @relation("UserFollowers", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("UserFollowing", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@map("follows")
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

### 2. Generated Types và Database Client

**src/lib/prisma.ts**
```typescript
import { PrismaClient } from '@prisma/client';

declare global {
    var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances in development
const prisma = globalThis.__prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV === 'development') {
    globalThis.__prisma = prisma;
}

export default prisma;

// Export Prisma types
export type {
    User,
    Post,
    Comment,
    Category,
    PostCategory,
    Like,
    Follow,
    Role,
    Prisma
} from '@prisma/client';

// Custom types derived from Prisma
export type UserWithPosts = Prisma.UserGetPayload<{
    include: { posts: true }
}>;

export type PostWithAuthor = Prisma.PostGetPayload<{
    include: { author: true }
}>;

export type PostWithDetails = Prisma.PostGetPayload<{
    include: {
        author: true;
        comments: {
            include: {
                author: true;
                replies: {
                    include: {
                        author: true;
                    }
                }
            }
        };
        likes: {
            include: {
                user: true;
            }
        };
        categories: {
            include: {
                category: true;
            }
        };
    }
}>;

export type CommentWithReplies = Prisma.CommentGetPayload<{
    include: {
        author: true;
        replies: {
            include: {
                author: true;
            }
        };
    }
}>;
```

### 3. Repository Pattern với Type Safety

**src/repositories/BaseRepository.ts**
```typescript
import { PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';

export interface PaginationOptions {
    page: number;
    limit: number;
}

export interface PaginationResult<T> {
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

export interface SortOption {
    field: string;
    direction: 'asc' | 'desc';
}

export abstract class BaseRepository<T> {
    protected prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    protected async paginate<T>(
        query: any,
        options: PaginationOptions
    ): Promise<PaginationResult<T>> {
        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            query.skip(skip).take(limit),
            this.prisma[this.getModelName()].count({
                where: query._query?.where
            })
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    }

    protected abstract getModelName(): string;
}
```

**src/repositories/UserRepository.ts**
```typescript
import { User, Prisma, UserWithPosts } from '../lib/prisma';
import { BaseRepository, PaginationOptions, PaginationResult } from './BaseRepository';

export interface CreateUserData {
    email: string;
    name: string;
    avatar?: string;
    role?: 'USER' | 'ADMIN' | 'MODERATOR';
}

export interface UpdateUserData {
    name?: string;
    avatar?: string;
    role?: 'USER' | 'ADMIN' | 'MODERATOR';
    isActive?: boolean;
}

export interface UserFilters {
    search?: string;
    role?: 'USER' | 'ADMIN' | 'MODERATOR';
    isActive?: boolean;
    createdAfter?: Date;
    createdBefore?: Date;
}

export class UserRepository extends BaseRepository<User> {
    protected getModelName(): string {
        return 'user';
    }

    async create(data: CreateUserData): Promise<User> {
        return this.prisma.user.create({
            data
        });
    }

    async findById(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id }
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email }
        });
    }

    async findWithPosts(id: number): Promise<UserWithPosts | null> {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                posts: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });
    }

    async findMany(
        filters: UserFilters = {},
        pagination: PaginationOptions
    ): Promise<PaginationResult<User>> {
        const where: Prisma.UserWhereInput = {};

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        if (filters.role) {
            where.role = filters.role;
        }

        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters.createdAfter || filters.createdBefore) {
            where.createdAt = {};
            if (filters.createdAfter) {
                where.createdAt.gte = filters.createdAfter;
            }
            if (filters.createdBefore) {
                where.createdAt.lte = filters.createdBefore;
            }
        }

        const query = this.prisma.user.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return this.paginate(query, pagination);
    }

    async update(id: number, data: UpdateUserData): Promise<User | null> {
        try {
            return await this.prisma.user.update({
                where: { id },
                data
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    return null; // Record not found
                }
            }
            throw error;
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            await this.prisma.user.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    return false; // Record not found
                }
            }
            throw error;
        }
    }

    async getFollowers(userId: number): Promise<User[]> {
        const followers = await this.prisma.follow.findMany({
            where: { followingId: userId },
            include: {
                follower: true
            }
        });

        return followers.map(f => f.follower);
    }

    async getFollowing(userId: number): Promise<User[]> {
        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            include: {
                following: true
            }
        });

        return following.map(f => f.following);
    }

    async follow(followerId: number, followingId: number): Promise<boolean> {
        try {
            await this.prisma.follow.create({
                data: {
                    followerId,
                    followingId
                }
            });
            return true;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    return false; // Already following
                }
            }
            throw error;
        }
    }

    async unfollow(followerId: number, followingId: number): Promise<boolean> {
        try {
            await this.prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId
                    }
                }
            });
            return true;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    return false; // Not following
                }
            }
            throw error;
        }
    }

    async getUserStats(userId: number): Promise<{
        postsCount: number;
        followersCount: number;
        followingCount: number;
        likesReceived: number;
    }> {
        const [postsCount, followersCount, followingCount, likesReceived] = await Promise.all([
            this.prisma.post.count({
                where: { authorId: userId }
            }),
            this.prisma.follow.count({
                where: { followingId: userId }
            }),
            this.prisma.follow.count({
                where: { followerId: userId }
            }),
            this.prisma.like.count({
                where: {
                    post: {
                        authorId: userId
                    }
                }
            })
        ]);

        return {
            postsCount,
            followersCount,
            followingCount,
            likesReceived
        };
    }
}
```

**src/repositories/PostRepository.ts**
```typescript
import { Post, PostWithAuthor, PostWithDetails, Prisma } from '../lib/prisma';
import { BaseRepository, PaginationOptions, PaginationResult } from './BaseRepository';

export interface CreatePostData {
    title: string;
    content: string;
    authorId: number;
    published?: boolean;
    tags?: string[];
    categoryIds?: number[];
}

export interface UpdatePostData {
    title?: string;
    content?: string;
    published?: boolean;
    tags?: string[];
}

export interface PostFilters {
    published?: boolean;
    authorId?: number;
    search?: string;
    tags?: string[];
    categoryIds?: number[];
    createdAfter?: Date;
    createdBefore?: Date;
}

export class PostRepository extends BaseRepository<Post> {
    protected getModelName(): string {
        return 'post';
    }

    async create(data: CreatePostData): Promise<Post> {
        const { categoryIds, ...postData } = data;
        
        return this.prisma.post.create({
            data: {
                ...postData,
                slug: this.generateSlug(data.title),
                ...(categoryIds && {
                    categories: {
                        create: categoryIds.map(categoryId => ({
                            categoryId
                        }))
                    }
                })
            }
        });
    }

    async findById(id: number): Promise<Post | null> {
        return this.prisma.post.findUnique({
            where: { id }
        });
    }

    async findBySlug(slug: string): Promise<PostWithDetails | null> {
        return this.prisma.post.findUnique({
            where: { slug },
            include: {
                author: true,
                comments: {
                    where: {
                        parentId: null // Only top-level comments
                    },
                    include: {
                        author: true,
                        replies: {
                            include: {
                                author: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                likes: {
                    include: {
                        user: true
                    }
                },
                categories: {
                    include: {
                        category: true
                    }
                }
            }
        });
    }

    async findMany(
        filters: PostFilters = {},
        pagination: PaginationOptions
    ): Promise<PaginationResult<PostWithAuthor>> {
        const where: Prisma.PostWhereInput = {};

        if (filters.published !== undefined) {
            where.published = filters.published;
        }

        if (filters.authorId) {
            where.authorId = filters.authorId;
        }

        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { content: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        if (filters.tags && filters.tags.length > 0) {
            where.tags = {
                hasSome: filters.tags
            };
        }

        if (filters.categoryIds && filters.categoryIds.length > 0) {
            where.categories = {
                some: {
                    categoryId: {
                        in: filters.categoryIds
                    }
                }
            };
        }

        if (filters.createdAfter || filters.createdBefore) {
            where.createdAt = {};
            if (filters.createdAfter) {
                where.createdAt.gte = filters.createdAfter;
            }
            if (filters.createdBefore) {
                where.createdAt.lte = filters.createdBefore;
            }
        }

        const query = this.prisma.post.findMany({
            where,
            include: {
                author: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return this.paginate(query, pagination);
    }

    async update(id: number, data: UpdatePostData): Promise<Post | null> {
        try {
            const updateData: any = { ...data };
            
            if (data.title) {
                updateData.slug = this.generateSlug(data.title);
            }

            return await this.prisma.post.update({
                where: { id },
                data: updateData
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    return null;
                }
            }
            throw error;
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            await this.prisma.post.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    return false;
                }
            }
            throw error;
        }
    }

    async likePost(userId: number, postId: number): Promise<boolean> {
        try {
            await this.prisma.like.create({
                data: {
                    userId,
                    postId
                }
            });
            return true;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    return false; // Already liked
                }
            }
            throw error;
        }
    }

    async unlikePost(userId: number, postId: number): Promise<boolean> {
        try {
            await this.prisma.like.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId
                    }
                }
            });
            return true;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    return false; // Not liked
                }
            }
            throw error;
        }
    }

    async getPostLikesCount(postId: number): Promise<number> {
        return this.prisma.like.count({
            where: { postId }
        });
    }

    async isPostLikedByUser(postId: number, userId: number): Promise<boolean> {
        const like = await this.prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });
        return !!like;
    }

    async getTrendingPosts(limit: number = 10): Promise<PostWithAuthor[]> {
        return this.prisma.post.findMany({
            where: {
                published: true,
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            },
            include: {
                author: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            },
            orderBy: [
                {
                    likes: {
                        _count: 'desc'
                    }
                },
                {
                    comments: {
                        _count: 'desc'
                    }
                }
            ],
            take: limit
        });
    }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
            + '-' + Date.now();
    }
}
```

### 4. Service Layer với Business Logic

**src/services/UserService.ts**
```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository, CreateUserData, UpdateUserData, UserFilters } from '../repositories/UserRepository';
import { User } from '../lib/prisma';
import { PaginationOptions } from '../repositories/BaseRepository';

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterUserData extends CreateUserData {
    password: string;
}

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async register(data: RegisterUserData): Promise<{ user: User; tokens: AuthTokens }> {
        // Check if user exists
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 12);

        // Create user
        const user = await this.userRepository.create({
            email: data.email,
            name: data.name,
            avatar: data.avatar,
            role: data.role
        });

        // Generate tokens
        const tokens = this.generateTokens(user);

        return { user, tokens };
    }

    async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
        const { email, password } = credentials;

        // Find user
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check password (in real app, compare with hashed password)
        const isValidPassword = true; // await bcrypt.compare(password, user.hashedPassword);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }

        // Generate tokens
        const tokens = this.generateTokens(user);

        return { user, tokens };
    }

    async getUserProfile(userId: number): Promise<User | null> {
        return this.userRepository.findById(userId);
    }

    async getUserWithPosts(userId: number) {
        return this.userRepository.findWithPosts(userId);
    }

    async updateUser(userId: number, data: UpdateUserData): Promise<User | null> {
        return this.userRepository.update(userId, data);
    }

    async deactivateUser(userId: number): Promise<User | null> {
        return this.userRepository.update(userId, { isActive: false });
    }

    async getUsers(filters: UserFilters, pagination: PaginationOptions) {
        return this.userRepository.findMany(filters, pagination);
    }

    async followUser(followerId: number, followingId: number): Promise<boolean> {
        if (followerId === followingId) {
            throw new Error('Cannot follow yourself');
        }

        // Check if users exist
        const [follower, following] = await Promise.all([
            this.userRepository.findById(followerId),
            this.userRepository.findById(followingId)
        ]);

        if (!follower || !following) {
            throw new Error('User not found');
        }

        return this.userRepository.follow(followerId, followingId);
    }

    async unfollowUser(followerId: number, followingId: number): Promise<boolean> {
        return this.userRepository.unfollow(followerId, followingId);
    }

    async getUserStats(userId: number) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        return this.userRepository.getUserStats(userId);
    }

    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
            const user = await this.userRepository.findById(decoded.userId);
            
            if (!user || !user.isActive) {
                throw new Error('Invalid refresh token');
            }

            return this.generateTokens(user);
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    private generateTokens(user: User): AuthTokens {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET!,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET!,
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }
}
```

## Bài tập

### Bài tập 1: Comment System

Implement comment repository và service:

```typescript
interface CreateCommentData {
    content: string;
    authorId: number;
    postId: number;
    parentId?: number;
}

class CommentRepository extends BaseRepository<Comment> {
    // Implement comment CRUD với threading support
}

class CommentService {
    // Implement business logic cho comments
    // - Create comment/reply
    // - Update comment
    // - Delete comment (soft delete)
    // - Get comment tree
}
```

### Bài tập 2: Advanced Search

Implement full-text search:

```typescript
interface SearchFilters {
    query: string;
    type?: 'posts' | 'users' | 'all';
    dateRange?: {
        from: Date;
        to: Date;
    };
    authorId?: number;
    tags?: string[];
}

class SearchService {
    async search(filters: SearchFilters, pagination: PaginationOptions) {
        // Implement complex search với Prisma
        // Support full-text search, filters, ranking
    }
}
```

### Bài tập 3: Transaction Management

Implement complex business operations:

```typescript
class PostService {
    async createPostWithCategories(
        data: CreatePostData,
        categoryNames: string[]
    ): Promise<PostWithDetails> {
        // Use Prisma transactions
        // 1. Create categories if they don't exist
        // 2. Create post
        // 3. Link post with categories
        // All or nothing operation
    }

    async transferPostOwnership(
        postId: number,
        fromUserId: number,
        toUserId: number
    ): Promise<Post> {
        // Complex transaction
        // 1. Verify ownership
        // 2. Check permissions
        // 3. Transfer ownership
        // 4. Log the transfer
    }
}
```

## 🎯 Key Takeaways

1. **Schema-First**: Prisma schema generates TypeScript types
2. **Type Safety**: End-to-end type safety từ database đến API
3. **Repository Pattern**: Separation of concerns và testability
4. **Transaction Management**: ACID compliance với type safety
5. **Relationship Handling**: Type-safe relationship queries
6. **Performance**: Efficient queries với proper includes/selects

## 📚 Next Steps

- Learn advanced Prisma features (raw queries, views, extensions)
- Explore database optimization và performance monitoring
- Master testing database layers
- Study database migration strategies

TypeScript + Database = Rock-solid, type-safe data layer! 🚀
