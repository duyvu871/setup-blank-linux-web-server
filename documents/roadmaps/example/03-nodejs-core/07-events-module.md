# Events Module (Module sự kiện)

## Tổng quan

Module `events` là nền tảng của kiến trúc event-driven trong Node.js. Nó cung cấp EventEmitter class, cho phép objects emit (phát ra) và listen (lắng nghe) events. Đây là pattern cốt lõi được sử dụng trong hầu hết các Node.js modules.

## EventEmitter Basics

### 1. Tạo và sử dụng EventEmitter

```javascript
const EventEmitter = require('events');

// Tạo EventEmitter instance
const emitter = new EventEmitter();

// Đăng ký event listener
emitter.on('message', (data) => {
    console.log('Nhận message:', data);
});

// Emit event
emitter.emit('message', 'Hello World');
// Output: Nhận message: Hello World

// Multiple listeners cho cùng event
emitter.on('message', (data) => {
    console.log('Listener thứ 2:', data);
});

emitter.emit('message', 'Hello Again');
// Output: 
// Nhận message: Hello Again
// Listener thứ 2: Hello Again
```

### 2. Event Methods

```javascript
const EventEmitter = require('events');
const emitter = new EventEmitter();

// on() - đăng ký listener (alias cho addListener)
emitter.on('test', () => console.log('Test event'));

// once() - listener chỉ chạy một lần
emitter.once('init', () => console.log('Initialization completed'));

// addListener() - đăng ký listener (giống on)
emitter.addListener('data', (data) => console.log('Data:', data));

// prependListener() - thêm listener vào đầu danh sách
emitter.prependListener('test', () => console.log('First listener'));

// removeListener() - xóa listener cụ thể
function myHandler() {
    console.log('My handler');
}
emitter.on('remove-test', myHandler);
emitter.removeListener('remove-test', myHandler);

// removeAllListeners() - xóa tất cả listeners
emitter.removeAllListeners('test');

// off() - alias cho removeListener (Node.js 10+)
emitter.off('data', myHandler);

// Emit events
emitter.emit('test');
emitter.emit('init');
emitter.emit('data', { id: 1, value: 'test' });
```

### 3. Event Information

```javascript
const EventEmitter = require('events');
const emitter = new EventEmitter();

// Đăng ký một số listeners
emitter.on('data', () => {});
emitter.on('data', () => {});
emitter.on('error', () => {});

// listenerCount() - đếm số listeners
console.log('Data listeners:', emitter.listenerCount('data')); // 2
console.log('Error listeners:', emitter.listenerCount('error')); // 1

// listeners() - lấy array của listeners
console.log('Data listeners:', emitter.listeners('data'));

// eventNames() - lấy array của event names
console.log('Event names:', emitter.eventNames()); // ['data', 'error']

// rawListeners() - lấy raw listeners (bao gồm wrappers)
console.log('Raw listeners:', emitter.rawListeners('data'));
```

## Error Handling

### 1. Error Events

```javascript
const EventEmitter = require('events');
const emitter = new EventEmitter();

// Error event handler
emitter.on('error', (error) => {
    console.error('Error occurred:', error.message);
});

// Emit error event
emitter.emit('error', new Error('Something went wrong'));

// Nếu không có error listener, process sẽ crash
const dangerousEmitter = new EventEmitter();
// dangerousEmitter.emit('error', new Error('Uncaught error')); // Crashes!

// Safe error handling
function safeEmit(emitter, event, ...args) {
    if (event === 'error' && emitter.listenerCount('error') === 0) {
        console.error('Unhandled error event:', args[0]);
        return false;
    }
    return emitter.emit(event, ...args);
}
```

### 2. Try-catch với Events

```javascript
const EventEmitter = require('events');

class SafeEventEmitter extends EventEmitter {
    safeEmit(event, ...args) {
        try {
            return this.emit(event, ...args);
        } catch (error) {
            console.error(`Error in event '${event}':`, error);
            this.emit('error', error);
            return false;
        }
    }
    
    on(event, listener) {
        const wrappedListener = (...args) => {
            try {
                return listener(...args);
            } catch (error) {
                console.error(`Error in listener for '${event}':`, error);
                this.emit('error', error);
            }
        };
        
        return super.on(event, wrappedListener);
    }
}

const safeEmitter = new SafeEventEmitter();

safeEmitter.on('test', () => {
    throw new Error('Listener error');
});

safeEmitter.on('error', (error) => {
    console.log('Caught error:', error.message);
});

safeEmitter.safeEmit('test'); // Error sẽ được catch
```

## Custom EventEmitter Classes

### 1. Extending EventEmitter

```javascript
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {
    constructor() {
        super();
        this.data = {};
    }
    
    setData(key, value) {
        const oldValue = this.data[key];
        this.data[key] = value;
        
        // Emit event với thông tin thay đổi
        this.emit('dataChanged', {
            key,
            oldValue,
            newValue: value
        });
        
        // Emit specific event cho key
        this.emit(`data:${key}`, value, oldValue);
    }
    
    getData(key) {
        return this.data[key];
    }
    
    getAllData() {
        return { ...this.data };
    }
}

// Sử dụng custom EventEmitter
const myEmitter = new MyEmitter();

myEmitter.on('dataChanged', (change) => {
    console.log(`Data changed: ${change.key} = ${change.newValue}`);
});

myEmitter.on('data:name', (newValue) => {
    console.log(`Name updated to: ${newValue}`);
});

myEmitter.setData('name', 'John');
myEmitter.setData('age', 25);
```

### 2. Real-world Example: Order Processing System

```javascript
const EventEmitter = require('events');

class OrderProcessor extends EventEmitter {
    constructor() {
        super();
        this.orders = new Map();
        this.orderIdCounter = 1;
    }
    
    createOrder(items, customerInfo) {
        const orderId = this.orderIdCounter++;
        const order = {
            id: orderId,
            items,
            customerInfo,
            status: 'created',
            createdAt: new Date(),
            total: this.calculateTotal(items)
        };
        
        this.orders.set(orderId, order);
        
        // Emit order created event
        this.emit('orderCreated', order);
        
        return orderId;
    }
    
    async processOrder(orderId) {
        const order = this.orders.get(orderId);
        if (!order) {
            this.emit('error', new Error(`Order ${orderId} not found`));
            return;
        }
        
        try {
            // Update status và emit events cho mỗi step
            this.updateOrderStatus(orderId, 'processing');
            
            // Validate order
            await this.validateOrder(order);
            this.emit('orderValidated', order);
            
            // Process payment
            await this.processPayment(order);
            this.updateOrderStatus(orderId, 'paid');
            
            // Reserve inventory
            await this.reserveInventory(order);
            this.emit('inventoryReserved', order);
            
            // Ship order
            await this.shipOrder(order);
            this.updateOrderStatus(orderId, 'shipped');
            
            this.emit('orderCompleted', order);
            
        } catch (error) {
            this.updateOrderStatus(orderId, 'failed');
            this.emit('orderFailed', { order, error });
        }
    }
    
    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.get(orderId);
        if (order) {
            const oldStatus = order.status;
            order.status = newStatus;
            order.updatedAt = new Date();
            
            this.emit('statusChanged', {
                orderId,
                oldStatus,
                newStatus,
                order
            });
        }
    }
    
    calculateTotal(items) {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    async validateOrder(order) {
        // Simulate validation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (order.total <= 0) {
            throw new Error('Invalid order total');
        }
        
        if (!order.customerInfo.email) {
            throw new Error('Customer email is required');
        }
    }
    
    async processPayment(order) {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 200));
        
        this.emit('paymentProcessed', {
            orderId: order.id,
            amount: order.total,
            method: 'credit_card'
        });
    }
    
    async reserveInventory(order) {
        // Simulate inventory reservation
        await new Promise(resolve => setTimeout(resolve, 150));
        
        for (const item of order.items) {
            this.emit('itemReserved', {
                orderId: order.id,
                itemId: item.id,
                quantity: item.quantity
            });
        }
    }
    
    async shipOrder(order) {
        // Simulate shipping
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const trackingNumber = `TRK${Date.now()}`;
        order.trackingNumber = trackingNumber;
        
        this.emit('orderShipped', {
            orderId: order.id,
            trackingNumber,
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
    }
    
    getOrder(orderId) {
        return this.orders.get(orderId);
    }
    
    getAllOrders() {
        return Array.from(this.orders.values());
    }
}

// Sử dụng Order Processing System
const orderProcessor = new OrderProcessor();

// Setup event listeners
orderProcessor.on('orderCreated', (order) => {
    console.log(`📝 Order created: #${order.id} - Total: $${order.total}`);
});

orderProcessor.on('statusChanged', ({ orderId, oldStatus, newStatus }) => {
    console.log(`📊 Order #${orderId}: ${oldStatus} → ${newStatus}`);
});

orderProcessor.on('paymentProcessed', ({ orderId, amount }) => {
    console.log(`💳 Payment processed for order #${orderId}: $${amount}`);
});

orderProcessor.on('orderShipped', ({ orderId, trackingNumber }) => {
    console.log(`🚚 Order #${orderId} shipped - Tracking: ${trackingNumber}`);
});

orderProcessor.on('orderCompleted', (order) => {
    console.log(`✅ Order #${order.id} completed successfully!`);
});

orderProcessor.on('orderFailed', ({ order, error }) => {
    console.log(`❌ Order #${order.id} failed: ${error.message}`);
});

orderProcessor.on('error', (error) => {
    console.error('💥 System error:', error.message);
});

// Test the system
async function testOrderSystem() {
    // Create order
    const orderId = orderProcessor.createOrder([
        { id: 1, name: 'Laptop', price: 999, quantity: 1 },
        { id: 2, name: 'Mouse', price: 25, quantity: 2 }
    ], {
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St'
    });
    
    // Process order
    await orderProcessor.processOrder(orderId);
    
    console.log('\nFinal order state:', orderProcessor.getOrder(orderId));
}

testOrderSystem().catch(console.error);
```

## Event Performance và Memory Management

### 1. Memory Leaks Prevention

```javascript
const EventEmitter = require('events');

class MemoryAwareEmitter extends EventEmitter {
    constructor(options = {}) {
        super();
        this.maxListeners = options.maxListeners || 10;
        this.warningThreshold = options.warningThreshold || 8;
        
        // Monitor listener count
        this.on('newListener', (event) => {
            const count = this.listenerCount(event);
            if (count >= this.warningThreshold) {
                console.warn(`Warning: Event '${event}' has ${count} listeners`);
            }
            if (count >= this.maxListeners) {
                console.error(`Max listeners exceeded for event '${event}'`);
            }
        });
    }
    
    // Auto-cleanup listeners after timeout
    onceWithTimeout(event, listener, timeout = 30000) {
        const timeoutId = setTimeout(() => {
            this.removeListener(event, wrappedListener);
            console.warn(`Listener for '${event}' timed out and was removed`);
        }, timeout);
        
        const wrappedListener = (...args) => {
            clearTimeout(timeoutId);
            this.removeListener(event, wrappedListener);
            listener(...args);
        };
        
        this.on(event, wrappedListener);
        return wrappedListener;
    }
    
    // Cleanup all listeners
    cleanup() {
        const events = this.eventNames();
        events.forEach(event => {
            this.removeAllListeners(event);
        });
        console.log('All listeners cleaned up');
    }
}

// Usage
const emitter = new MemoryAwareEmitter({ maxListeners: 5 });

// Test timeout cleanup
emitter.onceWithTimeout('delayed', () => {
    console.log('This should not run if timeout occurs first');
}, 1000);

// Clean up on process exit
process.on('exit', () => {
    emitter.cleanup();
});
```

### 2. Event Performance Monitoring

```javascript
const EventEmitter = require('events');

class PerformanceEventEmitter extends EventEmitter {
    constructor() {
        super();
        this.eventMetrics = new Map();
        this.startTimes = new Map();
    }
    
    emit(event, ...args) {
        const startTime = process.hrtime.bigint();
        
        // Call original emit
        const result = super.emit(event, ...args);
        
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1e6; // Convert to milliseconds
        
        // Update metrics
        this.updateMetrics(event, duration);
        
        return result;
    }
    
    updateMetrics(event, duration) {
        if (!this.eventMetrics.has(event)) {
            this.eventMetrics.set(event, {
                count: 0,
                totalDuration: 0,
                maxDuration: 0,
                minDuration: Infinity,
                averageDuration: 0
            });
        }
        
        const metrics = this.eventMetrics.get(event);
        metrics.count++;
        metrics.totalDuration += duration;
        metrics.maxDuration = Math.max(metrics.maxDuration, duration);
        metrics.minDuration = Math.min(metrics.minDuration, duration);
        metrics.averageDuration = metrics.totalDuration / metrics.count;
        
        // Log slow events
        if (duration > 10) { // Warn if event takes more than 10ms
            console.warn(`Slow event '${event}': ${duration.toFixed(2)}ms`);
        }
    }
    
    getMetrics(event = null) {
        if (event) {
            return this.eventMetrics.get(event);
        }
        return Object.fromEntries(this.eventMetrics);
    }
    
    resetMetrics() {
        this.eventMetrics.clear();
    }
    
    logMetrics() {
        console.log('\n=== Event Performance Metrics ===');
        for (const [event, metrics] of this.eventMetrics) {
            console.log(`Event: ${event}`);
            console.log(`  Count: ${metrics.count}`);
            console.log(`  Average: ${metrics.averageDuration.toFixed(2)}ms`);
            console.log(`  Min: ${metrics.minDuration.toFixed(2)}ms`);
            console.log(`  Max: ${metrics.maxDuration.toFixed(2)}ms`);
            console.log(`  Total: ${metrics.totalDuration.toFixed(2)}ms`);
            console.log('');
        }
    }
}

// Test performance monitoring
const perfEmitter = new PerformanceEventEmitter();

perfEmitter.on('fast', () => {
    // Fast operation
});

perfEmitter.on('slow', () => {
    // Simulate slow operation
    const start = Date.now();
    while (Date.now() - start < 15) {
        // Busy wait for 15ms
    }
});

// Test events
for (let i = 0; i < 100; i++) {
    perfEmitter.emit('fast');
}

for (let i = 0; i < 5; i++) {
    perfEmitter.emit('slow');
}

// Show metrics
perfEmitter.logMetrics();
```

## Advanced Patterns

### 1. Event Middleware

```javascript
const EventEmitter = require('events');

class MiddlewareEventEmitter extends EventEmitter {
    constructor() {
        super();
        this.middleware = new Map();
    }
    
    use(event, middleware) {
        if (!this.middleware.has(event)) {
            this.middleware.set(event, []);
        }
        this.middleware.get(event).push(middleware);
    }
    
    async emit(event, ...args) {
        // Run middleware first
        const middlewares = this.middleware.get(event) || [];
        
        for (const middleware of middlewares) {
            try {
                const result = await middleware(...args);
                if (result === false) {
                    // Middleware can cancel event
                    return false;
                }
            } catch (error) {
                console.error(`Middleware error for '${event}':`, error);
                return false;
            }
        }
        
        // Call original emit
        return super.emit(event, ...args);
    }
}

// Usage
const middlewareEmitter = new MiddlewareEventEmitter();

// Add validation middleware
middlewareEmitter.use('userCreated', async (userData) => {
    if (!userData.email) {
        throw new Error('Email is required');
    }
    console.log('Validation passed');
});

// Add logging middleware
middlewareEmitter.use('userCreated', async (userData) => {
    console.log(`Creating user: ${userData.name}`);
});

// Add event listener
middlewareEmitter.on('userCreated', (userData) => {
    console.log(`User created: ${userData.name} (${userData.email})`);
});

// Test
middlewareEmitter.emit('userCreated', {
    name: 'John Doe',
    email: 'john@example.com'
});
```

### 2. Event Namespacing

```javascript
const EventEmitter = require('events');

class NamespacedEventEmitter extends EventEmitter {
    constructor() {
        super();
        this.namespaces = new Map();
    }
    
    namespace(name) {
        if (!this.namespaces.has(name)) {
            const nsEmitter = new EventEmitter();
            this.namespaces.set(name, nsEmitter);
            
            // Forward namespaced events to main emitter
            nsEmitter.on('*', (event, ...args) => {
                this.emit(`${name}:${event}`, ...args);
            });
        }
        return this.namespaces.get(name);
    }
    
    on(event, listener) {
        if (event.includes(':')) {
            const [namespace, eventName] = event.split(':', 2);
            const nsEmitter = this.namespace(namespace);
            return nsEmitter.on(eventName, listener);
        }
        return super.on(event, listener);
    }
    
    emit(event, ...args) {
        if (event.includes(':')) {
            const [namespace, eventName] = event.split(':', 2);
            const nsEmitter = this.namespace(namespace);
            return nsEmitter.emit(eventName, ...args);
        }
        return super.emit(event, ...args);
    }
}

// Usage
const nsEmitter = new NamespacedEventEmitter();

// Listen to namespaced events
nsEmitter.on('user:created', (user) => {
    console.log('User created:', user.name);
});

nsEmitter.on('order:created', (order) => {
    console.log('Order created:', order.id);
});

// Emit namespaced events
nsEmitter.emit('user:created', { name: 'John', email: 'john@example.com' });
nsEmitter.emit('order:created', { id: 123, total: 99.99 });
```

## Best Practices

### 1. Error Handling

```javascript
// Always handle error events
emitter.on('error', (error) => {
    console.error('Event error:', error);
});

// Use try-catch in listeners
emitter.on('data', (data) => {
    try {
        processData(data);
    } catch (error) {
        emitter.emit('error', error);
    }
});
```

### 2. Memory Management

```javascript
// Remove listeners when done
const listener = (data) => console.log(data);
emitter.on('data', listener);

// Later...
emitter.removeListener('data', listener);

// Or use once() for one-time events
emitter.once('init', () => {
    console.log('Initialized');
});
```

### 3. Event Naming

```javascript
// Use consistent naming conventions
emitter.on('userCreated', handler);     // PascalCase
emitter.on('user:created', handler);    // namespace:event
emitter.on('user.created', handler);    // dot notation
emitter.on('USER_CREATED', handler);    // CONSTANT_CASE
```

## Bài tập thực hành

### Bài 1: Chat Room System
Tạo chat room system sử dụng EventEmitter với private messages, room management.

### Bài 2: File Watcher
Implement file watcher với events cho file changes, additions, deletions.

### Bài 3: Game Event System
Xây dựng game event system với player actions, scoring, game state changes.

### Bài 4: Workflow Engine
Tạo workflow engine với event-driven task processing và error handling.

## Tổng kết

Events module là nền tảng của Node.js architecture:

- EventEmitter cung cấp publisher-subscriber pattern
- Cho phép loose coupling giữa các components
- Hỗ trợ asynchronous programming hiệu quả
- Cần chú ý memory management và error handling
- Là base cho nhiều Node.js modules khác (streams, HTTP, etc.)

Hiểu rõ events module giúp xây dựng applications scalable và maintainable.
