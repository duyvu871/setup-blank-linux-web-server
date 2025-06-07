# Scope và Closure

## 1. Scope (Phạm vi biến)

Scope xác định nơi mà biến có thể được truy cập trong code.

### Global Scope
```javascript
const globalVar = 'Tôi là biến global';

function anyFunction() {
    console.log(globalVar); // OK - có thể truy cập
}
```

### Function Scope
```javascript
function outerFunction() {
    const functionVar = 'Tôi là biến function';
    
    function innerFunction() {
        console.log(functionVar); // OK - có thể truy cập
    }
}

// console.log(functionVar); // Error - không thể truy cập bên ngoài
```

### Block Scope (ES6+)
```javascript
if (true) {
    let blockVar = 'Tôi chỉ tồn tại trong block này';
    const anotherBlockVar = 'Tôi cũng vậy';
    var functionScopedVar = 'Tôi vẫn function scoped';
}

// console.log(blockVar); // Error
// console.log(anotherBlockVar); // Error
console.log(functionScopedVar); // OK - var không có block scope
```

### Lexical Scope
```javascript
function outer() {
    const x = 10;
    
    function inner() {
        console.log(x); // 10 - inner có thể truy cập biến của outer
    }
    
    inner();
}
```

## 2. Closure

Closure là khi một hàm "nhớ" được biến từ scope bên ngoài nó, ngay cả khi scope đó đã kết thúc.

### Ví dụ cơ bản
```javascript
function createCounter() {
    let count = 0; // Biến private
    
    return function() {
        count++; // Vẫn có thể truy cập count
        return count;
    };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

### Ứng dụng: Tạo Private Variables
```javascript
function createBankAccount(initialBalance) {
    let balance = initialBalance;
    
    return {
        deposit: function(amount) {
            balance += amount;
            console.log(`Nạp ${amount}. Số dư: ${balance}`);
        },
        withdraw: function(amount) {
            if (amount <= balance) {
                balance -= amount;
                console.log(`Rút ${amount}. Số dư: ${balance}`);
            } else {
                console.log('Số dư không đủ');
            }
        },
        getBalance: function() {
            return balance;
        }
    };
}

const account = createBankAccount(1000);
account.deposit(500);  // Nạp 500. Số dư: 1500
account.withdraw(200); // Rút 200. Số dư: 1300
// balance không thể truy cập trực tiếp từ bên ngoài
```

### Closure trong Loops (Vấn đề phổ biến)
```javascript
// Vấn đề với var
for (var i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log(i); // In ra 3, 3, 3
    }, 100);
}

// Giải pháp 1: Dùng let
for (let i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log(i); // In ra 0, 1, 2
    }, 100);
}

// Giải pháp 2: Dùng closure
for (var i = 0; i < 3; i++) {
    (function(index) {
        setTimeout(function() {
            console.log(index); // In ra 0, 1, 2
        }, 100);
    })(i);
}
```

### Module Pattern với Closure
```javascript
const myModule = (function() {
    // Private variables
    let privateVar = 'Tôi là private';
    let counter = 0;
    
    // Private functions
    function privateFunction() {
        console.log('Đây là private function');
    }
    
    // Public API
    return {
        increment: function() {
            counter++;
            return counter;
        },
        decrement: function() {
            counter--;
            return counter;
        },
        getCount: function() {
            return counter;
        },
        callPrivate: function() {
            privateFunction();
        }
    };
})();

console.log(myModule.getCount()); // 0
myModule.increment(); // 1
myModule.callPrivate(); // "Đây là private function"
// myModule.privateVar; // undefined - không thể truy cập
```

## Lợi ích của Closure

1. **Encapsulation**: Tạo private variables/methods
2. **Data Persistence**: Dữ liệu được lưu giữ giữa các lần gọi hàm
3. **Factory Functions**: Tạo ra các object có cùng structure
4. **Callbacks**: Duy trì context khi truyền hàm

## Bài tập thực hành

1. Tạo function `createMultiplier(n)` trả về hàm nhân với n
2. Viết function tạo stopwatch có start(), stop(), reset()
3. Tạo shopping cart với add(), remove(), getTotal()
4. Implement function debounce đơn giản
