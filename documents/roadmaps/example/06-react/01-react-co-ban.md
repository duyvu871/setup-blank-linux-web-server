# React Cơ Bản

## Lý Thuyết

### React là gì?

React là một thư viện JavaScript được phát triển bởi Facebook để xây dựng giao diện người dùng (UI). React sử dụng kiến trúc component-based và virtual DOM để tạo ra các ứng dụng web hiệu quả.

### Đặc điểm chính của React

1. **Component-Based**: Chia UI thành các component độc lập
2. **Virtual DOM**: Tăng hiệu suất render
3. **JSX**: Syntax extension cho JavaScript
4. **One-way Data Flow**: Dữ liệu chảy từ trên xuống dưới
5. **Reusable Components**: Tái sử dụng component

### JSX (JavaScript XML)

JSX cho phép viết HTML-like syntax trong JavaScript:

```jsx
// JSX
const element = <h1>Hello, world!</h1>;

// Tương đương với JavaScript thuần
const element = React.createElement('h1', null, 'Hello, world!');
```

## Ví Dụ Thực Tế

### 1. Component Đầu Tiên

```jsx
// components/Welcome.jsx
import React from 'react';

// Functional Component
function Welcome(props) {
  return <h1>Xin chào, {props.name}!</h1>;
}

// Arrow Function Component
const Welcome2 = ({ name }) => {
  return <h1>Xin chào, {name}!</h1>;
};

export default Welcome;
```

### 2. App Component

```jsx
// App.jsx
import React from 'react';
import Welcome from './components/Welcome';

function App() {
  return (
    <div className="App">
      <Welcome name="Nguyễn Văn A" />
      <Welcome name="Trần Thị B" />
    </div>
  );
}

export default App;
```

### 3. Rendering App

```jsx
// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

### 4. Props và Children

```jsx
// components/Card.jsx
import React from 'react';

const Card = ({ title, children, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      <h2 className="card-title">{title}</h2>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;
```

```jsx
// Sử dụng Card component
<Card title="Thông tin sản phẩm" className="product-card">
  <p>Đây là nội dung bên trong card</p>
  <button>Mua ngay</button>
</Card>
```

### 5. Conditional Rendering

```jsx
// components/UserStatus.jsx
import React from 'react';

const UserStatus = ({ user, isLoggedIn }) => {
  // Cách 1: Sử dụng if statement
  if (isLoggedIn) {
    return <h1>Chào mừng trở lại, {user.name}!</h1>;
  }
  return <h1>Vui lòng đăng nhập.</h1>;
};

// Cách 2: Sử dụng ternary operator
const UserStatus2 = ({ user, isLoggedIn }) => (
  <div>
    {isLoggedIn ? (
      <div>
        <h1>Chào mừng, {user.name}!</h1>
        <p>Email: {user.email}</p>
      </div>
    ) : (
      <div>
        <h1>Vui lòng đăng nhập</h1>
        <button>Đăng nhập</button>
      </div>
    )}
  </div>
);

// Cách 3: Sử dụng && operator
const Notification = ({ message, show }) => (
  <div>
    {show && <div className="alert">{message}</div>}
  </div>
);

export { UserStatus, UserStatus2, Notification };
```

### 6. Lists và Keys

```jsx
// components/ProductList.jsx
import React from 'react';

const ProductList = ({ products }) => {
  return (
    <div className="product-list">
      <h2>Danh sách sản phẩm</h2>
      <ul>
        {products.map(product => (
          <li key={product.id} className="product-item">
            <h3>{product.name}</h3>
            <p>Giá: {product.price.toLocaleString()}đ</p>
            <p>Mô tả: {product.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Sử dụng ProductList
const App = () => {
  const products = [
    { id: 1, name: 'iPhone 15', price: 25000000, description: 'Điện thoại thông minh' },
    { id: 2, name: 'MacBook Air', price: 30000000, description: 'Laptop cao cấp' },
    { id: 3, name: 'iPad Pro', price: 20000000, description: 'Máy tính bảng' }
  ];

  return <ProductList products={products} />;
};

export default ProductList;
```

### 7. Event Handling

```jsx
// components/InteractiveButton.jsx
import React from 'react';

const InteractiveButton = () => {
  // Event handlers
  const handleClick = () => {
    alert('Button được click!');
  };

  const handleMouseOver = (e) => {
    e.target.style.backgroundColor = '#0056b3';
  };

  const handleMouseOut = (e) => {
    e.target.style.backgroundColor = '#007bff';
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn form submit mặc định
    console.log('Form submitted!');
  };

  return (
    <div>
      <button 
        onClick={handleClick}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        style={{ backgroundColor: '#007bff', color: 'white', padding: '10px' }}
      >
        Click me!
      </button>
      
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nhập tên..." />
        <button type="submit">Gửi</button>
      </form>
    </div>
  );
};

export default InteractiveButton;
```

### 8. React Fragment

```jsx
// components/UserInfo.jsx
import React from 'react';

// Cách 1: Sử dụng React.Fragment
const UserInfo = ({ user }) => {
  return (
    <React.Fragment>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <p>{user.phone}</p>
    </React.Fragment>
  );
};

// Cách 2: Sử dụng short syntax
const UserInfo2 = ({ user }) => {
  return (
    <>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <p>{user.phone}</p>
    </>
  );
};

export { UserInfo, UserInfo2 };
```

## Best Practices

### 1. Component Naming
```jsx
// ✅ Good: PascalCase
const UserProfile = () => { ... };

// ❌ Bad: camelCase
const userProfile = () => { ... };
```

### 2. Props Destructuring
```jsx
// ✅ Good: Destructuring props
const UserCard = ({ name, email, avatar }) => { ... };

// ❌ Less readable
const UserCard = (props) => {
  return <div>{props.name}</div>;
};
```

### 3. Default Props
```jsx
// Functional Component với default props
const Button = ({ 
  children, 
  type = 'button', 
  className = '', 
  disabled = false 
}) => {
  return (
    <button 
      type={type} 
      className={`btn ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

### 4. PropTypes (Type Checking)
```jsx
import PropTypes from 'prop-types';

const UserCard = ({ name, age, email }) => {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>Tuổi: {age}</p>
      <p>Email: {email}</p>
    </div>
  );
};

UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
  email: PropTypes.string.isRequired
};

UserCard.defaultProps = {
  age: 18
};
```

## Bài Tập Thực Hành

### Bài 1: Tạo Component TodoItem
Tạo một component hiển thị một todo item với các props: title, completed, priority.

### Bài 2: Tạo Component ProductCard
Tạo component hiển thị thông tin sản phẩm với image, name, price, description và button "Thêm vào giỏ".

### Bài 3: Tạo Component Navigation
Tạo component navigation bar với list các menu items được truyền qua props.

### Bài 4: Conditional Rendering Exercise
Tạo component hiển thị weather information với các trạng thái khác nhau (sunny, rainy, cloudy).

### Bài 5: Event Handling Exercise
Tạo component form đăng ký với validation cơ bản và hiển thị message khi submit.

## Tài Liệu Tham Khảo

- [React Official Documentation](https://react.dev/)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [JSX In Depth](https://react.dev/learn/writing-markup-with-jsx)
- [Components and Props](https://react.dev/learn/passing-props-to-a-component)
