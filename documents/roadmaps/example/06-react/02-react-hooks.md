# React Hooks

## Lý Thuyết

### Hooks là gì?

Hooks là các function đặc biệt cho phép bạn "hook into" các tính năng của React từ functional components. Hooks được giới thiệu trong React 16.8 và cho phép sử dụng state và các lifecycle methods mà không cần class components.

### Quy Tắc Sử Dụng Hooks

1. **Chỉ gọi Hooks ở top level**: Không gọi trong loops, conditions, hay nested functions
2. **Chỉ gọi Hooks từ React functions**: React components hoặc custom Hooks

## Built-in Hooks

### 1. useState Hook

Quản lý state trong functional components:

```jsx
import React, { useState } from 'react';

const Counter = () => {
  // Khai báo state variable
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [user, setUser] = useState({ name: '', email: '' });

  return (
    <div>
      <p>Bạn đã click {count} lần</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
      
      <input 
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nhập tên..."
      />
      
      <button onClick={() => setUser({ ...user, name: name })}>
        Cập nhật user
      </button>
    </div>
  );
};

export default Counter;
```

### 2. useEffect Hook

Xử lý side effects (API calls, subscriptions, DOM manipulation):

```jsx
import React, { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect chạy sau mỗi render
  useEffect(() => {
    console.log('Component rendered');
  });

  // Effect chỉ chạy một lần sau mount
  useEffect(() => {
    console.log('Component mounted');
    
    // Cleanup function
    return () => {
      console.log('Component will unmount');
    };
  }, []); // Empty dependency array

  // Effect chạy khi userId thay đổi
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]); // Dependency array

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!user) return <div>Không tìm thấy user</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default UserProfile;
```

### 3. useContext Hook

Sử dụng React Context để chia sẻ data giữa components:

```jsx
// context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('token', userData.token);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

```jsx
// components/LoginForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  );
};

export default LoginForm;
```

### 4. useReducer Hook

Quản lý state phức tạp với reducer pattern:

```jsx
import React, { useReducer } from 'react';

// Reducer function
const todoReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: Date.now(),
            text: action.payload,
            completed: false
          }
        ]
      };
    
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload
      };
    
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

const TodoApp = () => {
  const initialState = {
    todos: [],
    filter: 'all' // all, active, completed
  };

  const [state, dispatch] = useReducer(todoReducer, initialState);
  const [inputText, setInputText] = useState('');

  const addTodo = () => {
    if (inputText.trim()) {
      dispatch({ type: 'ADD_TODO', payload: inputText });
      setInputText('');
    }
  };

  const filteredTodos = state.todos.filter(todo => {
    switch (state.filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  return (
    <div>
      <h2>Todo App với useReducer</h2>
      
      <div>
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Thêm todo mới..."
        />
        <button onClick={addTodo}>Thêm</button>
      </div>
      
      <div>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'all' })}>
          Tất cả
        </button>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'active' })}>
          Chưa hoàn thành
        </button>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'completed' })}>
          Đã hoàn thành
        </button>
      </div>
      
      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}>
              Xóa
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoApp;
```

### 5. useRef Hook

Tạo reference đến DOM elements hoặc giữ mutable values:

```jsx
import React, { useRef, useEffect, useState } from 'react';

const FocusInput = () => {
  const inputRef = useRef(null);
  const countRef = useRef(0);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    // Focus vào input khi component mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Đếm số lần render mà không trigger re-render
    countRef.current += 1;
  });

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  return (
    <div>
      <p>Số lần render: {countRef.current}</p>
      
      <input 
        ref={inputRef}
        type="text" 
        placeholder="Nhập text..."
      />
      
      <button onClick={handleFocus}>Focus Input</button>
      <button onClick={handleClear}>Clear Input</button>
      <button onClick={() => setRenderCount(renderCount + 1)}>
        Force Re-render
      </button>
    </div>
  );
};

export default FocusInput;
```

### 6. useMemo Hook

Memoize expensive calculations:

```jsx
import React, { useState, useMemo } from 'react';

const ExpensiveComponent = ({ items, searchTerm }) => {
  const [sortOrder, setSortOrder] = useState('asc');

  // Expensive calculation - chỉ chạy khi items hoặc searchTerm thay đổi
  const filteredItems = useMemo(() => {
    console.log('Filtering items...');
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  // Expensive sorting - chỉ chạy khi filteredItems hoặc sortOrder thay đổi
  const sortedItems = useMemo(() => {
    console.log('Sorting items...');
    return [...filteredItems].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      }
      return b.name.localeCompare(a.name);
    });
  }, [filteredItems, sortOrder]);

  return (
    <div>
      <h3>Danh sách sản phẩm</h3>
      
      <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
        Sắp xếp: {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
      </button>
      
      <p>Tìm thấy {sortedItems.length} sản phẩm</p>
      
      <ul>
        {sortedItems.map(item => (
          <li key={item.id}>
            {item.name} - {item.price}đ
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpensiveComponent;
```

### 7. useCallback Hook

Memoize functions để tránh re-creation:

```jsx
import React, { useState, useCallback, memo } from 'react';

// Child component được memo hóa
const TodoItem = memo(({ todo, onToggle, onDelete }) => {
  console.log(`Rendering TodoItem: ${todo.text}`);
  
  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>Xóa</button>
    </div>
  );
});

const TodoList = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Học React', completed: false },
    { id: 2, text: 'Học Hooks', completed: true }
  ]);

  // useCallback để memoize functions
  const handleToggle = useCallback((id) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []); // Không có dependencies vì sử dụng functional update

  const handleDelete = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  return (
    <div>
      <h3>Todo List với useCallback</h3>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default TodoList;
```

## Custom Hooks

Tạo hooks tùy chỉnh để tái sử dụng logic:

```jsx
// hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Lấy giá trị từ localStorage hoặc sử dụng initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Hàm để set giá trị
  const setValue = (value) => {
    try {
      // Cho phép value là function như useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
```

```jsx
// hooks/useFetch.js
import { useState, useEffect } from 'react';

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};
```

```jsx
// Sử dụng custom hooks
import React from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useFetch } from './hooks/useFetch';

const UserSettings = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [language, setLanguage] = useLocalStorage('language', 'vi');
  
  const { data: users, loading, error } = useFetch('/api/users');

  return (
    <div>
      <h2>Cài đặt người dùng</h2>
      
      <div>
        <label>Theme: </label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      
      <div>
        <label>Ngôn ngữ: </label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </div>
      
      {loading && <p>Đang tải users...</p>}
      {error && <p>Lỗi: {error}</p>}
      {users && (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSettings;
```

## Best Practices

### 1. Hook Dependencies
```jsx
// ✅ Good: Đầy đủ dependencies
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// ❌ Bad: Thiếu dependencies
useEffect(() => {
  fetchUser(userId);
}, []); // ESLint warning
```

### 2. Cleanup trong useEffect
```jsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log('Timer tick');
  }, 1000);

  // Cleanup function
  return () => {
    clearInterval(timer);
  };
}, []);
```

### 3. Functional Updates
```jsx
// ✅ Good: Functional update
setCount(prev => prev + 1);

// ❌ Có thể gây ra stale closure
setCount(count + 1);
```

## Bài Tập Thực Hành

### Bài 1: Shopping Cart với useReducer
Tạo shopping cart sử dụng useReducer với các actions: add, remove, update quantity, clear cart.

### Bài 2: Form Validation với Custom Hook
Tạo custom hook `useForm` để handle form state và validation.

### Bài 3: Real-time Search với useMemo
Tạo search component với debounce và memoization.

### Bài 4: Theme Provider với useContext
Tạo theme system với light/dark mode sử dụng Context API.

### Bài 5: Data Fetching Hook
Tạo custom hook `useApi` với loading states, error handling và caching.

## Tài Liệu Tham Khảo

- [Hooks API Reference](https://react.dev/reference/react)
- [Rules of Hooks](https://react.dev/warnings/invalid-hook-call-warning)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
