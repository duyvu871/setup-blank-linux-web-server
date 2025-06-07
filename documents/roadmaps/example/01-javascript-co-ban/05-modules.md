# Module (CommonJS vs ESM)

## 1. Tại sao cần Modules?

Modules giúp:
- **Tổ chức code**: Chia nhỏ code thành các file riêng biệt
- **Tái sử dụng**: Code có thể được sử dụng ở nhiều nơi
- **Đóng gói**: Che giấu implementation details
- **Quản lý dependencies**: Rõ ràng về các dependencies

## 2. CommonJS (Node.js truyền thống)

CommonJS là hệ thống module mặc định của Node.js từ đầu.

### Export trong CommonJS

#### Cách 1: module.exports
```javascript
// math.js
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

const PI = 3.14159;

// Export object
module.exports = {
    add,
    subtract,
    PI
};
```

#### Cách 2: exports shorthand
```javascript
// utils.js
exports.formatDate = function(date) {
    return date.toLocaleDateString('vi-VN');
};

exports.capitalize = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Lưu ý: Không được gán exports = {...}
```

#### Cách 3: Export function/class trực tiếp
```javascript
// logger.js
module.exports = function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
};

// calculator.js  
class Calculator {
    add(a, b) { return a + b; }
    subtract(a, b) { return a - b; }
}

module.exports = Calculator;
```

### Import trong CommonJS

```javascript
// app.js

// Import object
const math = require('./math');
console.log(math.add(5, 3)); // 8

// Destructuring import
const { add, subtract, PI } = require('./math');
console.log(add(5, 3)); // 8

// Import function trực tiếp
const log = require('./logger');
log('Hello World!');

// Import class
const Calculator = require('./calculator');
const calc = new Calculator();
console.log(calc.add(10, 5)); // 15

// Import built-in modules
const fs = require('fs');
const path = require('path');
const http = require('http');
```

### Đặc điểm CommonJS

```javascript
// 1. Synchronous loading
const data = require('./data'); // Đợi file load xong mới tiếp tục

// 2. Runtime evaluation  
if (condition) {
    const conditionalModule = require('./conditional'); // OK
}

// 3. Caching - module chỉ được execute 1 lần
const math1 = require('./math');
const math2 = require('./math'); // Dùng cached version

// 4. __dirname và __filename có sẵn
console.log(__dirname);  // Thư mục hiện tại
console.log(__filename); // File hiện tại
```

## 3. ES Modules (ESM)

ES Modules là tiêu chuẩn JavaScript hiện đại (ES6+).

### Để sử dụng ESM trong Node.js:

#### Cách 1: File .mjs
```javascript
// math.mjs
export function add(a, b) {
    return a + b;
}
```

#### Cách 2: package.json với "type": "module"
```json
// package.json
{
    "type": "module",
    "main": "app.js"
}
```

### Export trong ESM

#### Named Exports
```javascript
// math.js
export function add(a, b) {
    return a + b;
}

export function subtract(a, b) {
    return a - b;
}

export const PI = 3.14159;

// Hoặc export cùng lúc
function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    return a / b;
}

export { multiply, divide };

// Export với alias
export { multiply as times, divide as dividedBy };
```

#### Default Export
```javascript
// logger.js
export default function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

// calculator.js
export default class Calculator {
    add(a, b) { return a + b; }
    subtract(a, b) { return a - b; }
}

// Có thể có cả default và named exports
export default Calculator;
export const VERSION = '1.0.0';
```

### Import trong ESM

```javascript
// app.js

// Import default
import log from './logger.js';
import Calculator from './calculator.js';

// Named imports
import { add, subtract, PI } from './math.js';

// Import với alias
import { times, dividedBy } from './math.js';
import { add as sum } from './math.js';

// Import tất cả
import * as math from './math.js';
console.log(math.add(5, 3));

// Mixed import
import Calculator, { VERSION } from './calculator.js';

// Dynamic import (async)
async function loadMath() {
    const math = await import('./math.js');
    return math.add(10, 20);
}

// Re-export
export { add, subtract } from './math.js';
export { default as Calculator } from './calculator.js';
```

### Đặc điểm ESM

```javascript
// 1. Static analysis - imports phải ở top level
// ❌ Không được
if (condition) {
    import math from './math.js'; // Error!
}

// ✅ Được
import math from './math.js';
if (condition) {
    math.add(1, 2);
}

// 2. Asynchronous loading
// Modules được load song song

// 3. Live bindings
// math.js
export let count = 0;
export function increment() {
    count++;
}

// app.js  
import { count, increment } from './math.js';
console.log(count); // 0
increment();
console.log(count); // 1 - count đã thay đổi!

// 4. Top-level await (Node.js 14.8+)
const data = await fetch('/api/data');
export default data;
```

## 4. So sánh CommonJS vs ESM

| Đặc điểm | CommonJS | ES Modules |
|----------|----------|------------|
| Cú pháp | `require()` / `module.exports` | `import` / `export` |
| Loading | Synchronous | Asynchronous |
| Timing | Runtime | Compile time |
| Conditional import | ✅ Có | ❌ Không (dùng dynamic import) |
| Tree shaking | ❌ Không | ✅ Có |
| Browser support | ❌ Không | ✅ Có |
| Top-level await | ❌ Không | ✅ Có |

### Ví dụ cùng một module

#### CommonJS version
```javascript
// user-service.js
const fs = require('fs');

class UserService {
    constructor() {
        this.users = [];
    }
    
    addUser(user) {
        this.users.push(user);
    }
    
    getUsers() {
        return this.users;
    }
}

module.exports = UserService;

// app.js
const UserService = require('./user-service');
const service = new UserService();
```

#### ESM version
```javascript
// user-service.js
import fs from 'fs';

export default class UserService {
    constructor() {
        this.users = [];
    }
    
    addUser(user) {
        this.users.push(user);
    }
    
    getUsers() {
        return this.users;
    }
}

// app.js
import UserService from './user-service.js';
const service = new UserService();
```

## 5. Interoperability (Tương tác giữa 2 hệ thống)

### Import CommonJS vào ESM
```javascript
// commonjs-module.js (CommonJS)
module.exports = {
    hello: () => 'Hello from CommonJS'
};

// esm-app.js (ESM)
import cjsModule from './commonjs-module.js';
console.log(cjsModule.hello()); // OK
```

### Import ESM vào CommonJS
```javascript
// esm-module.js (ESM)
export function hello() {
    return 'Hello from ESM';
}

// commonjs-app.js (CommonJS)
async function loadESM() {
    const esmModule = await import('./esm-module.js');
    console.log(esmModule.hello());
}

loadESM();
```

## 6. Best Practices

### Cấu trúc project với modules
```
project/
├── package.json
├── src/
│   ├── utils/
│   │   ├── math.js
│   │   ├── string.js
│   │   └── index.js        // Barrel export
│   ├── services/
│   │   ├── user-service.js
│   │   └── api-service.js
│   ├── models/
│   │   └── user.js
│   └── app.js
└── tests/
```

### Barrel exports (index.js)
```javascript
// src/utils/index.js
export { add, subtract } from './math.js';
export { capitalize, slugify } from './string.js';
export { formatDate } from './date.js';

// Sử dụng
import { add, capitalize, formatDate } from './utils';
// Thay vì
import { add } from './utils/math.js';
import { capitalize } from './utils/string.js';
```

### File naming conventions
```javascript
// ✅ Tốt
import userService from './user-service.js';
import { API_URL } from './constants.js';

// ❌ Tránh
import userService from './UserService.js';
import { API_URL } from './CONSTANTS.js';
```

## 7. Troubleshooting

### Lỗi phổ biến
```javascript
// 1. Quên .js extension trong ESM
import math from './math'; // ❌ Error in ESM
import math from './math.js'; // ✅ Correct

// 2. Mixed export patterns  
export default function() {}
module.exports = function() {} // ❌ Don't mix

// 3. Circular dependencies
// a.js
import { b } from './b.js';
export const a = 'a';

// b.js  
import { a } from './a.js'; // ❌ Circular dependency
export const b = 'b';
```

## Bài tập thực hành

1. Tạo utility modules với both CommonJS và ESM
2. Build một simple project với module structure
3. Convert CommonJS project sang ESM
4. Tạo barrel exports cho các utility functions
