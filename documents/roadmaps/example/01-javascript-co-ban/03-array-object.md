# Array và Object

## 1. Array (Mảng)

Array là cấu trúc dữ liệu lưu trữ nhiều giá trị trong một biến.

### Tạo Array
```javascript
// Cách 1: Array literal (khuyến nghị)
const fruits = ['táo', 'cam', 'chuối'];
const numbers = [1, 2, 3, 4, 5];

// Cách 2: Array constructor
const colors = new Array('đỏ', 'xanh', 'vàng');

// Array rỗng
const empty = [];
```

### Truy cập phần tử
```javascript
const fruits = ['táo', 'cam', 'chuối'];

console.log(fruits[0]);     // 'táo'
console.log(fruits[1]);     // 'cam'
console.log(fruits.length); // 3
console.log(fruits[fruits.length - 1]); // 'chuối' (phần tử cuối)
```

### Array Methods quan trọng

#### Thêm/xóa phần tử
```javascript
const fruits = ['táo', 'cam'];

// Thêm vào cuối
fruits.push('chuối');
console.log(fruits); // ['táo', 'cam', 'chuối']

// Xóa phần tử cuối
const last = fruits.pop();
console.log(last); // 'chuối'

// Thêm vào đầu
fruits.unshift('xoài');
console.log(fruits); // ['xoài', 'táo', 'cam']

// Xóa phần tử đầu
const first = fruits.shift();
console.log(first); // 'xoài'
```

#### Map - Tạo array mới
```javascript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

const people = [
    { name: 'An', age: 25 },
    { name: 'Bình', age: 30 }
];
const names = people.map(person => person.name);
console.log(names); // ['An', 'Bình']
```

#### Filter - Lọc phần tử
```javascript
const numbers = [1, 2, 3, 4, 5, 6];
const evenNumbers = numbers.filter(num => num % 2 === 0);
console.log(evenNumbers); // [2, 4, 6]

const adults = people.filter(person => person.age >= 18);
```

#### Find - Tìm phần tử đầu tiên
```javascript
const numbers = [1, 3, 5, 2, 4];
const firstEven = numbers.find(num => num % 2 === 0);
console.log(firstEven); // 2

const user = people.find(person => person.name === 'An');
```

#### Reduce - Tính toán tổng hợp
```javascript
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum); // 15

const max = numbers.reduce((acc, num) => acc > num ? acc : num);
console.log(max); // 5
```

#### forEach - Lặp qua từng phần tử
```javascript
const fruits = ['táo', 'cam', 'chuối'];
fruits.forEach((fruit, index) => {
    console.log(`${index}: ${fruit}`);
});
```

## 2. Object (Đối tượng)

Object là cấu trúc dữ liệu lưu trữ key-value pairs.

### Tạo Object
```javascript
// Object literal (khuyến nghị)
const person = {
    name: 'Nguyễn Văn A',
    age: 30,
    city: 'Hà Nội'
};

// Object constructor
const car = new Object();
car.brand = 'Toyota';
car.model = 'Camry';
```

### Truy cập properties
```javascript
const person = {
    name: 'Nguyễn Văn A',
    age: 30,
    'full-name': 'Nguyễn Văn A'
};

// Dot notation
console.log(person.name); // 'Nguyễn Văn A'

// Bracket notation
console.log(person['age']); // 30
console.log(person['full-name']); // 'Nguyễn Văn A'

// Dynamic property access
const prop = 'name';
console.log(person[prop]); // 'Nguyễn Văn A'
```

### Thêm/sửa/xóa properties
```javascript
const person = { name: 'An', age: 25 };

// Thêm property
person.city = 'Hà Nội';
person['email'] = 'an@gmail.com';

// Sửa property
person.age = 26;

// Xóa property
delete person.city;

console.log(person); // { name: 'An', age: 26, email: 'an@gmail.com' }
```

### Object Methods
```javascript
const person = {
    name: 'An',
    age: 25,
    greet: function() {
        return `Xin chào, tôi là ${this.name}`;
    },
    // ES6+ method syntax
    introduce() {
        return `Tôi ${this.age} tuổi`;
    }
};

console.log(person.greet()); // "Xin chào, tôi là An"
```

### Object.keys(), Object.values(), Object.entries()
```javascript
const person = { name: 'An', age: 25, city: 'HN' };

// Lấy tất cả keys
const keys = Object.keys(person);
console.log(keys); // ['name', 'age', 'city']

// Lấy tất cả values
const values = Object.values(person);
console.log(values); // ['An', 25, 'HN']

// Lấy cả key và value
const entries = Object.entries(person);
console.log(entries); // [['name', 'An'], ['age', 25], ['city', 'HN']]
```

### Destructuring
```javascript
const person = { name: 'An', age: 25, city: 'HN' };

// Object destructuring
const { name, age } = person;
console.log(name, age); // 'An' 25

// Với tên biến khác
const { name: fullName, age: years } = person;
console.log(fullName, years); // 'An' 25

// Array destructuring
const colors = ['đỏ', 'xanh', 'vàng'];
const [first, second] = colors;
console.log(first, second); // 'đỏ' 'xanh'
```

### Spread Operator
```javascript
// Với arrays
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];
console.log(combined); // [1, 2, 3, 4, 5, 6]

// Với objects
const person = { name: 'An', age: 25 };
const updatedPerson = {
    ...person,
    age: 26,
    city: 'HN'
};
console.log(updatedPerson); // { name: 'An', age: 26, city: 'HN' }
```

### Nested Objects/Arrays
```javascript
const company = {
    name: 'ABC Corp',
    employees: [
        { name: 'An', department: 'IT' },
        { name: 'Bình', department: 'Marketing' }
    ],
    address: {
        street: '123 ABC Street',
        city: 'Hà Nội',
        country: 'Vietnam'
    }
};

// Truy cập nested data
console.log(company.employees[0].name); // 'An'
console.log(company.address.city); // 'Hà Nội'

// Optional chaining (ES2020)
console.log(company.address?.zipCode); // undefined (không error)
```

## 3. Một số pattern hữu ích

### Chuyển đổi giữa Array và Object
```javascript
// Array of objects to object
const users = [
    { id: 1, name: 'An' },
    { id: 2, name: 'Bình' }
];

const usersObj = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
}, {});

// Object to array
const userArray = Object.values(usersObj);
```

### Kiểm tra tồn tại
```javascript
const person = { name: 'An', age: 25 };

// Kiểm tra property tồn tại
console.log('name' in person); // true
console.log(person.hasOwnProperty('age')); // true

// Kiểm tra array chứa giá trị
const fruits = ['táo', 'cam'];
console.log(fruits.includes('táo')); // true
```

## Bài tập thực hành

1. Tạo array students và filter theo điểm số
2. Sử dụng map để chuyển đổi dữ liệu
3. Tạo object calculator với các method cơ bản
4. Implement function để deep clone object
