# Advanced TypeScript

Sau khi nắm vững TypeScript fundamentals, đây là lúc khám phá các advanced features giúp bạn viết code powerful và maintainable hơn.

## Lý thuyết

### Generics Advanced

**1. Generic Constraints**
```typescript
// Constraint với extends
interface Lengthy {
    length: number;
}

function logLength<T extends Lengthy>(item: T): T {
    console.log(item.length);
    return item;
}

logLength("hello"); // ✅ string has length
logLength([1, 2, 3]); // ✅ array has length
logLength({ length: 5, name: "test" }); // ✅ object has length
// logLength(123); // ❌ number doesn't have length

// Keyof constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const user = { name: "John", age: 30, email: "john@example.com" };
const name = getProperty(user, "name"); // Type: string
const age = getProperty(user, "age"); // Type: number
// getProperty(user, "invalid"); // ❌ Error
```

**2. Conditional Types**
```typescript
// Basic conditional type
type IsArray<T> = T extends any[] ? true : false;

type Test1 = IsArray<string[]>; // true
type Test2 = IsArray<number>; // false

// Advanced conditional with infer
type ArrayElementType<T> = T extends (infer U)[] ? U : never;

type StringArrayElement = ArrayElementType<string[]>; // string
type NumberArrayElement = ArrayElementType<number[]>; // number

// Practical example: Promise unwrapping
type Awaited<T> = T extends Promise<infer U> ? U : T;

type AsyncStringResult = Awaited<Promise<string>>; // string
type SyncStringResult = Awaited<string>; // string
```

**3. Mapped Types**
```typescript
// Built-in utility types
interface User {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
}

type PartialUser = Partial<User>; // All properties optional
type RequiredUser = Required<User>; // All properties required
type UserEmail = Pick<User, 'email'>; // Only email property
type UserWithoutId = Omit<User, 'id'>; // All except id

// Custom mapped types
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

type Stringify<T> = {
    [P in keyof T]: string;
};

// Template literal types
type EventName<T extends string> = `on${Capitalize<T>}`;

type MouseEvents = EventName<"click" | "hover" | "focus">;
// "onClick" | "onHover" | "onFocus"
```

### Utility Types Advanced

**1. Custom Utility Types**
```typescript
// Deep Partial
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface Config {
    api: {
        baseUrl: string;
        timeout: number;
        retries: number;
    };
    database: {
        host: string;
        port: number;
        ssl: boolean;
    };
}

type PartialConfig = DeepPartial<Config>;
// All nested properties become optional

// Deep Required
type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// NonNullable for objects
type NonNullableObject<T> = {
    [P in keyof T]: NonNullable<T[P]>;
};

// Function type utilities
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

function processUser(id: number, name: string): User {
    return { id, name, email: "", isActive: true };
}

type ProcessUserParams = Parameters<typeof processUser>; // [number, string]
type ProcessUserReturn = ReturnType<typeof processUser>; // User
```

**2. Advanced Union Types**
```typescript
// Discriminated Unions
interface LoadingState {
    status: "loading";
}

interface SuccessState {
    status: "success";
    data: any;
}

interface ErrorState {
    status: "error";
    error: string;
}

type AsyncState = LoadingState | SuccessState | ErrorState;

function handleState(state: AsyncState) {
    switch (state.status) {
        case "loading":
            console.log("Loading...");
            break;
        case "success":
            console.log("Data:", state.data); // TypeScript knows data exists
            break;
        case "error":
            console.log("Error:", state.error); // TypeScript knows error exists
            break;
    }
}

// Branded Types
type UserId = number & { __brand: "UserId" };
type ProductId = number & { __brand: "ProductId" };

function createUserId(id: number): UserId {
    return id as UserId;
}

function getUserById(id: UserId): User {
    // Implementation
    return {} as User;
}

const userId = createUserId(123);
// getUserById(456); // ❌ Error: number is not assignable to UserId
getUserById(userId); // ✅ OK
```

### Decorators

```typescript
// Class decorators
function Entity(tableName: string) {
    return function <T extends new (...args: any[]) => {}>(constructor: T) {
        return class extends constructor {
            tableName = tableName;
        };
    };
}

// Method decorators
function Log(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
        console.log(`Calling ${propertyName} with`, args);
        const result = method.apply(this, args);
        console.log(`${propertyName} returned`, result);
        return result;
    };
}

// Property decorators
function Required(target: any, propertyName: string) {
    let value: any;
    
    const getter = () => {
        return value;
    };
    
    const setter = (newVal: any) => {
        if (newVal == null) {
            throw new Error(`${propertyName} is required`);
        }
        value = newVal;
    };
    
    Object.defineProperty(target, propertyName, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
    });
}

@Entity("users")
class User {
    @Required
    public name!: string;
    
    @Required
    public email!: string;
    
    @Log
    public greet(message: string): string {
        return `Hello, ${this.name}! ${message}`;
    }
}
```

## Thực hành

### 1. Advanced Type System

**src/types/advanced.ts**
```typescript
// Result type for error handling
export type Result<T, E = Error> = 
    | { success: true; data: T; error?: never }
    | { success: false; data?: never; error: E };

// Async Result
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// Builder pattern types
export interface Builder<T> {
    build(): T;
}

export type FluentBuilder<T, K extends keyof T = keyof T> = {
    [P in K]: (value: T[P]) => FluentBuilder<T, Exclude<K, P>>;
} & (K extends never ? Builder<T> : {});

// Database query builder types
export interface QueryBuilder<T> {
    select<K extends keyof T>(...fields: K[]): QueryBuilder<Pick<T, K>>;
    where(condition: Partial<T>): QueryBuilder<T>;
    orderBy<K extends keyof T>(field: K, direction: 'ASC' | 'DESC'): QueryBuilder<T>;
    limit(count: number): QueryBuilder<T>;
    execute(): Promise<T[]>;
}

// Event system types
export type EventMap = {
    [K: string]: any[];
};

export interface TypedEventEmitter<T extends EventMap> {
    on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): this;
    emit<K extends keyof T>(event: K, ...args: T[K]): boolean;
    off<K extends keyof T>(event: K, listener: (...args: T[K]) => void): this;
}
```

**src/utils/result.ts**
```typescript
import { Result, AsyncResult } from '../types/advanced';

export class ResultUtils {
    static ok<T>(data: T): Result<T> {
        return { success: true, data };
    }

    static err<E>(error: E): Result<never, E> {
        return { success: false, error };
    }

    static async fromPromise<T>(promise: Promise<T>): AsyncResult<T> {
        try {
            const data = await promise;
            return ResultUtils.ok(data);
        } catch (error) {
            return ResultUtils.err(error as Error);
        }
    }

    static map<T, U>(result: Result<T>, fn: (data: T) => U): Result<U> {
        if (result.success) {
            return ResultUtils.ok(fn(result.data));
        }
        return result;
    }

    static flatMap<T, U>(result: Result<T>, fn: (data: T) => Result<U>): Result<U> {
        if (result.success) {
            return fn(result.data);
        }
        return result;
    }

    static match<T, U>(
        result: Result<T>,
        onSuccess: (data: T) => U,
        onError: (error: Error) => U
    ): U {
        if (result.success) {
            return onSuccess(result.data);
        }
        return onError(result.error);
    }
}

// Usage example
export async function fetchUser(id: number): AsyncResult<User> {
    return ResultUtils.fromPromise(
        fetch(`/api/users/${id}`).then(res => res.json())
    );
}

export async function processUserData(id: number): AsyncResult<string> {
    const userResult = await fetchUser(id);
    
    return ResultUtils.map(userResult, user => 
        `User: ${user.name} (${user.email})`
    );
}
```

**src/builders/user-builder.ts**
```typescript
import { FluentBuilder } from '../types/advanced';

interface User {
    id: number;
    name: string;
    email: string;
    age?: number;
    isActive: boolean;
    roles: string[];
}

class UserBuilderImpl implements FluentBuilder<User> {
    private user: Partial<User> = {
        isActive: true,
        roles: []
    };

    id(value: number): FluentBuilder<User, Exclude<keyof User, 'id'>> {
        this.user.id = value;
        return this as any;
    }

    name(value: string): FluentBuilder<User, Exclude<keyof User, 'name'>> {
        this.user.name = value;
        return this as any;
    }

    email(value: string): FluentBuilder<User, Exclude<keyof User, 'email'>> {
        this.user.email = value;
        return this as any;
    }

    age(value: number): FluentBuilder<User, Exclude<keyof User, 'age'>> {
        this.user.age = value;
        return this as any;
    }

    isActive(value: boolean): FluentBuilder<User, Exclude<keyof User, 'isActive'>> {
        this.user.isActive = value;
        return this as any;
    }

    roles(value: string[]): FluentBuilder<User, Exclude<keyof User, 'roles'>> {
        this.user.roles = value;
        return this as any;
    }

    addRole(role: string): this {
        this.user.roles = [...(this.user.roles || []), role];
        return this;
    }

    build(): User {
        if (!this.user.id || !this.user.name || !this.user.email) {
            throw new Error('Missing required fields: id, name, email');
        }
        
        return this.user as User;
    }
}

export const UserBuilder = () => new UserBuilderImpl();

// Usage
const user = UserBuilder()
    .id(1)
    .name("John Doe")
    .email("john@example.com")
    .age(30)
    .addRole("admin")
    .addRole("user")
    .build();
```

**src/database/query-builder.ts**
```typescript
import { QueryBuilder } from '../types/advanced';

export class TypedQueryBuilder<T> implements QueryBuilder<T> {
    private selectedFields?: (keyof T)[];
    private whereConditions: Partial<T>[] = [];
    private orderByClause?: { field: keyof T; direction: 'ASC' | 'DESC' };
    private limitClause?: number;

    constructor(private tableName: string) {}

    select<K extends keyof T>(...fields: K[]): QueryBuilder<Pick<T, K>> {
        this.selectedFields = fields;
        return this as any;
    }

    where(condition: Partial<T>): QueryBuilder<T> {
        this.whereConditions.push(condition);
        return this;
    }

    orderBy<K extends keyof T>(field: K, direction: 'ASC' | 'DESC'): QueryBuilder<T> {
        this.orderByClause = { field, direction };
        return this;
    }

    limit(count: number): QueryBuilder<T> {
        this.limitClause = count;
        return this;
    }

    private buildQuery(): string {
        let query = 'SELECT ';
        
        if (this.selectedFields) {
            query += this.selectedFields.join(', ');
        } else {
            query += '*';
        }
        
        query += ` FROM ${this.tableName}`;
        
        if (this.whereConditions.length > 0) {
            const conditions = this.whereConditions
                .map(condition => 
                    Object.entries(condition)
                        .map(([key, value]) => `${key} = '${value}'`)
                        .join(' AND ')
                )
                .join(' AND ');
            query += ` WHERE ${conditions}`;
        }
        
        if (this.orderByClause) {
            query += ` ORDER BY ${String(this.orderByClause.field)} ${this.orderByClause.direction}`;
        }
        
        if (this.limitClause) {
            query += ` LIMIT ${this.limitClause}`;
        }
        
        return query;
    }

    async execute(): Promise<T[]> {
        const query = this.buildQuery();
        console.log('Executing query:', query);
        
        // Mock database execution
        return [] as T[];
    }
}

// Usage example
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
}

const users = await new TypedQueryBuilder<User>('users')
    .select('name', 'email')
    .where({ age: 25 })
    .orderBy('name', 'ASC')
    .limit(10)
    .execute();
```

**src/events/typed-emitter.ts**
```typescript
import { EventEmitter } from 'events';
import { EventMap, TypedEventEmitter } from '../types/advanced';

export class TypedEventEmitterImpl<T extends EventMap> 
    extends EventEmitter 
    implements TypedEventEmitter<T> {
    
    on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): this {
        return super.on(event as string, listener);
    }

    emit<K extends keyof T>(event: K, ...args: T[K]): boolean {
        return super.emit(event as string, ...args);
    }

    off<K extends keyof T>(event: K, listener: (...args: T[K]) => void): this {
        return super.off(event as string, listener);
    }

    once<K extends keyof T>(event: K, listener: (...args: T[K]) => void): this {
        return super.once(event as string, listener);
    }
}

// Usage example
interface AppEvents {
    'user:created': [User];
    'user:updated': [User, Partial<User>];
    'user:deleted': [number];
    'error': [Error];
}

export const appEvents = new TypedEventEmitterImpl<AppEvents>();

// Type-safe event handling
appEvents.on('user:created', (user) => {
    console.log('New user created:', user.name);
});

appEvents.on('user:updated', (user, changes) => {
    console.log(`User ${user.name} updated:`, changes);
});

appEvents.emit('user:created', {
    id: 1,
    name: "John",
    email: "john@example.com",
    isActive: true
});
```

## Bài tập

### Bài tập 1: Advanced Generic Repository

```typescript
interface Repository<T, K> {
    create(entity: Omit<T, 'id'>): Promise<T>;
    findById(id: K): Promise<T | null>;
    findAll(): Promise<T[]>;
    update(id: K, updates: Partial<T>): Promise<T | null>;
    delete(id: K): Promise<boolean>;
    findWhere(conditions: Partial<T>): Promise<T[]>;
}

// Implement TypedRepository class
class TypedRepository<T extends { id: K }, K = number> implements Repository<T, K> {
    // Your implementation here
}

// Usage:
const userRepo = new TypedRepository<User, number>();
const productRepo = new TypedRepository<Product, string>();
```

### Bài tập 2: Type-Safe State Machine

```typescript
type State = 'idle' | 'loading' | 'success' | 'error';
type Event = 'FETCH' | 'SUCCESS' | 'ERROR' | 'RESET';

type StateMachine<S extends string, E extends string> = {
    [CurrentState in S]: {
        [CurrentEvent in E]?: S;
    };
};

// Implement a type-safe state machine
class TypedStateMachine<S extends string, E extends string> {
    // Your implementation here
}
```

### Bài tập 3: Advanced Validation System

```typescript
type ValidationRule<T> = (value: T) => string | null;

interface Validator<T> {
    required(): Validator<T>;
    minLength(length: number): Validator<T>;
    email(): Validator<T>;
    custom(rule: ValidationRule<T>): Validator<T>;
    validate(value: T): ValidationResult;
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

// Implement the validation system
class ValidatorBuilder<T> implements Validator<T> {
    // Your implementation here
}
```

## 🎯 Key Takeaways

1. **Generic Constraints**: Use `extends` to constrain generic types
2. **Conditional Types**: Create types that depend on conditions
3. **Mapped Types**: Transform existing types systematically
4. **Utility Types**: Build reusable type transformations
5. **Branded Types**: Create distinct types from same primitives
6. **Type-Safe Builders**: Fluent APIs with compile-time safety
7. **Advanced Patterns**: Repository, State Machine, Event System

## 📚 Next Steps

- Apply advanced types in Express applications
- Learn TypeScript decorators and metadata
- Explore TypeScript with GraphQL and tRPC
- Master TypeScript performance optimization

Advanced TypeScript mở ra infinite possibilities cho type-safe development! 🚀
