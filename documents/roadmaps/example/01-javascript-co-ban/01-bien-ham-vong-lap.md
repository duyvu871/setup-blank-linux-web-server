# Biến, Hàm, Vòng lặp, Điều kiện

## 1. Biến (Variables)

### Khai báo biến
JavaScript có 3 cách khai báo biến: `var`, `let`, và `const`.

```javascript
// var - function scoped (tránh sử dụng)
var name = "John";

// let - block scoped, có thể thay đổi
let age = 25;
age = 26; // OK

// const - block scoped, không thể thay đổi
const PI = 3.14;
// PI = 3.15; // Error!
```

### Quy tắc đặt tên
- Bắt đầu bằng chữ cái, underscore (_) hoặc dollar ($)
- Không có khoảng trắng
- Phân biệt hoa thường
- Sử dụng camelCase cho convention

## 2. Hàm (Functions)

### Function Declaration
```javascript
function greet(name) {
    return `Xin chào ${name}!`;
}

console.log(greet("An")); // "Xin chào An!"
```

### Function Expression
```javascript
const add = function(a, b) {
    return a + b;
};

console.log(add(5, 3)); // 8
```

### Arrow Function (ES6+)
```javascript
const multiply = (a, b) => a * b;

const divide = (a, b) => {
    if (b === 0) return null;
    return a / b;
};
```

## 3. Vòng lặp (Loops)

### For Loop
```javascript
// In số từ 1 đến 5
for (let i = 1; i <= 5; i++) {
    console.log(`Số: ${i}`);
}
```

### While Loop
```javascript
let count = 0;
while (count < 3) {
    console.log(`Count: ${count}`);
    count++;
}
```

### For...of (dành cho arrays)
```javascript
const fruits = ['táo', 'cam', 'chuối'];
for (const fruit of fruits) {
    console.log(fruit);
}
```

### For...in (dành cho objects)
```javascript
const person = { name: 'John', age: 30 };
for (const key in person) {
    console.log(`${key}: ${person[key]}`);
}
```

## 4. Điều kiện (Conditionals)

### If...else
```javascript
const score = 85;

if (score >= 90) {
    console.log('Xuất sắc');
} else if (score >= 70) {
    console.log('Khá');
} else if (score >= 50) {
    console.log('Trung bình');
} else {
    console.log('Yếu');
}
```

### Ternary Operator
```javascript
const age = 20;
const status = age >= 18 ? 'Người lớn' : 'Trẻ em';
console.log(status); // "Người lớn"
```

### Switch Statement
```javascript
const day = 'monday';

switch (day) {
    case 'monday':
        console.log('Thứ 2');
        break;
    case 'tuesday':
        console.log('Thứ 3');
        break;
    default:
        console.log('Ngày khác');
}
```

## Bài tập thực hành

1. Viết hàm tính giai thừa của một số
2. Tạo vòng lặp in bảng cửu chương 
3. Viết hàm kiểm tra số chẵn/lẻ
4. Tạo calculator đơn giản với switch case
