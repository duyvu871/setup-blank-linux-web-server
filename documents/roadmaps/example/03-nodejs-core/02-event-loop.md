# Event Loop và Non-blocking I/O

## 1. Event Loop là gì?

Event Loop là cơ chế cho phép Node.js thực hiện các tác vụ I/O non-blocking mặc dù JavaScript là single-threaded.

### Single Thread nhưng Non-blocking
```javascript
console.log('Start');

// Non-blocking I/O
setTimeout(() => {
    console.log('Timeout callback');
}, 0);

setImmediate(() => {
    console.log('Immediate callback');
});

console.log('End');

// Output:
// Start
// End  
// Immediate callback
// Timeout callback
```

## 2. Kiến trúc Event Loop

### Event Loop Phases
```
┌───────────────────────────┐
┌─>│           timers          │  // setTimeout, setInterval callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  // I/O callbacks deferred to next loop
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  // internal use only
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  // fetch new I/O events
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  // setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  // e.g. socket.on('close', ...)
   └───────────────────────────┘
```

### Các Phase chi tiết

#### 1. Timers Phase
```javascript
setTimeout(() => {
    console.log('Timer 1');
}, 0);

setTimeout(() => {
    console.log('Timer 2');  
}, 0);

// Cả hai sẽ chạy trong cùng timers phase
```

#### 2. Poll Phase
```javascript
const fs = require('fs');

// File I/O được xử lý trong poll phase
fs.readFile('data.txt', (err, data) => {
    console.log('File read complete');
});
```

#### 3. Check Phase
```javascript
setImmediate(() => {
    console.log('setImmediate 1');
});

setImmediate(() => {
    console.log('setImmediate 2');
});

// Chạy trong check phase
```

## 3. Microtasks vs Macrotasks

### Microtasks (Process.nextTick và Promises)
```javascript
console.log('=== START ===');

setTimeout(() => console.log('setTimeout'), 0);

setImmediate(() => console.log('setImmediate'));

process.nextTick(() => console.log('nextTick 1'));

Promise.resolve().then(() => console.log('Promise 1'));

process.nextTick(() => console.log('nextTick 2'));

Promise.resolve().then(() => console.log('Promise 2'));

console.log('=== END ===');

// Output:
// === START ===
// === END ===
// nextTick 1
// nextTick 2
// Promise 1
// Promise 2
// setImmediate
// setTimeout
```

### Priority Order
```
1. process.nextTick (highest priority)
2. Promise.then/catch/finally
3. setImmediate  
4. setTimeout/setInterval
5. I/O callbacks
6. close callbacks (lowest priority)
```

## 4. Non-blocking I/O

### Blocking vs Non-blocking

#### Blocking (Synchronous)
```javascript
const fs = require('fs');

console.log('Start reading file...');

// Blocks the entire thread
const data = fs.readFileSync('large-file.txt', 'utf8');
console.log('File size:', data.length);

console.log('This runs after file is completely read');
```

#### Non-blocking (Asynchronous)
```javascript
const fs = require('fs');

console.log('Start reading file...');

// Non-blocking - returns immediately
fs.readFile('large-file.txt', 'utf8', (err, data) => {
    if (err) throw err;
    console.log('File size:', data.length);
});

console.log('This runs immediately, not waiting for file');
```

### Thread Pool cho I/O Operations
```javascript
const fs = require('fs');

// Các operations này chạy trong thread pool (libuv)
const files = ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt'];

files.forEach((file, index) => {
    fs.readFile(file, (err, data) => {
        console.log(`File ${index + 1} loaded`);
    });
});

// Tất cả file được đọc song song, không blocking main thread
```

## 5. Ví dụ thực tế

### Web Server với nhiều requests
```javascript
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Home Page</h1>');
    }
    else if (req.url === '/data') {
        // Non-blocking file read
        fs.readFile('data.json', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading data');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    }
    else if (req.url === '/slow') {
        // Simulate slow operation
        setTimeout(() => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Slow response');
        }, 3000);
    }
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});

// Nhiều request có thể được xử lý đồng thời
// không cần đợi request trước hoàn thành
```

### Database operations
```javascript
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'mydb'
});

// Multiple database queries - non-blocking
console.log('Starting queries...');

connection.query('SELECT * FROM users', (err, users) => {
    console.log('Users loaded:', users.length);
});

connection.query('SELECT * FROM products', (err, products) => {
    console.log('Products loaded:', products.length);
});

connection.query('SELECT * FROM orders', (err, orders) => {
    console.log('Orders loaded:', orders.length);
});

console.log('All queries dispatched');

// Output:
// Starting queries...
// All queries dispatched
// Users loaded: 150
// Products loaded: 200  
// Orders loaded: 300
```

## 6. Common Pitfalls

### 1. Blocking Event Loop với CPU-intensive tasks
```javascript
// ❌ BAD - Blocks event loop
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

app.get('/fib/:n', (req, res) => {
    const result = fibonacci(parseInt(req.params.n)); // Blocks for large n
    res.json({ result });
});

// ✅ GOOD - Use worker threads
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
    app.get('/fib/:n', (req, res) => {
        const worker = new Worker(__filename, {
            workerData: { n: parseInt(req.params.n) }
        });
        
        worker.on('message', (result) => {
            res.json({ result });
        });
        
        worker.on('error', (error) => {
            res.status(500).json({ error: error.message });
        });
    });
} else {
    // Worker thread
    const result = fibonacci(workerData.n);
    parentPort.postMessage(result);
}
```

### 2. Too many setImmediate/nextTick
```javascript
// ❌ BAD - Starves event loop
function recursiveImmediate() {
    setImmediate(() => {
        console.log('setImmediate');
        recursiveImmediate(); // Infinite recursion
    });
}

// ✅ GOOD - Allow other events to process
function processItems(items, callback) {
    if (items.length === 0) return callback();
    
    const item = items.shift();
    processItem(item, () => {
        setImmediate(() => processItems(items, callback));
    });
}
```

## 7. Monitoring Event Loop

### Event Loop Lag
```javascript
const { performance, PerformanceObserver } = require('perf_hooks');

// Monitor event loop lag
let start = performance.now();

setInterval(() => {
    const lag = performance.now() - start - 100; // Expected 100ms
    console.log(`Event loop lag: ${lag.toFixed(2)}ms`);
    start = performance.now();
}, 100);
```

### Using clinic.js
```bash
# Install clinic.js
npm install -g clinic

# Profile your application
clinic doctor -- node app.js
clinic bubbleprof -- node app.js
clinic flame -- node app.js
```

## 8. Best Practices

### 1. Avoid blocking operations
```javascript
// ❌ Avoid
const data = fs.readFileSync('file.txt');

// ✅ Prefer
fs.readFile('file.txt', (err, data) => {
    // handle data
});

// ✅ Or with async/await
const data = await fs.promises.readFile('file.txt');
```

### 2. Break up CPU-intensive tasks
```javascript
// ❌ BAD - Processes all items at once
function processAllItems(items) {
    items.forEach(item => {
        processItem(item); // CPU intensive
    });
}

// ✅ GOOD - Process in batches
function processBatch(items, batchSize = 100) {
    const batch = items.splice(0, batchSize);
    
    batch.forEach(item => {
        processItem(item);
    });
    
    if (items.length > 0) {
        setImmediate(() => processBatch(items, batchSize));
    }
}
```

### 3. Handle errors properly
```javascript
// ✅ Always handle errors in callbacks
fs.readFile('file.txt', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    // process data
});

// ✅ Use try-catch with async/await
async function readFileAsync() {
    try {
        const data = await fs.promises.readFile('file.txt');
        return data;
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
}
```

## 9. Debugging Event Loop

### Visualizing with --trace-events
```bash
# Generate trace file
node --trace-events-enabled --trace-event-categories=v8,node app.js

# View in Chrome DevTools
# chrome://tracing/
```

### Using async_hooks
```javascript
const async_hooks = require('async_hooks');

const hook = async_hooks.createHook({
    init(asyncId, type, triggerAsyncId) {
        console.log(`${type}(${asyncId}): trigger: ${triggerAsyncId}`);
    },
    before(asyncId) {
        console.log(`before: ${asyncId}`);
    },
    after(asyncId) {
        console.log(`after: ${asyncId}`);
    },
    destroy(asyncId) {
        console.log(`destroy: ${asyncId}`);
    }
});

hook.enable();
```

## Bài tập thực hành

1. Tạo script đo event loop lag
2. So sánh performance của sync vs async operations
3. Build web server xử lý multiple concurrent requests
4. Implement CPU-intensive task với worker threads
