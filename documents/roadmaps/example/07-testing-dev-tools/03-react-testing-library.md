# React Testing Library

## Giới thiệu

React Testing Library là công cụ testing được khuyến nghị chính thức bởi React team. Nó tập trung vào testing behavior của components từ góc độ user experience thay vì implementation details.

## Triết lý Testing

React Testing Library tuân theo nguyên tắc:
- **Test behavior, not implementation** - Test những gì user thấy và tương tác
- **Find elements by accessibility** - Sử dụng queries giống như screen readers
- **Avoid testing implementation details** - Không test state, props trực tiếp

## Setup

### Installation

```bash
# React Testing Library
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Additional utilities
npm install --save-dev @testing-library/user-event

# For Next.js
npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};
```

```javascript
// src/setupTests.js
import '@testing-library/jest-dom';

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

## Basic Component Testing

### 1. Simple Component Tests

```jsx
// components/Button.jsx
import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
```

```jsx
// components/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  test('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies correct CSS class for variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('does not call onClick when disabled', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### 2. Form Component Tests

```jsx
// components/LoginForm.jsx
import React, { useState } from 'react';

const LoginForm = ({ onSubmit, isLoading = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({ email, password });
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Login form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <div id="email-error" role="alert" className="error">
            {errors.email}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && (
          <div id="password-error" role="alert" className="error">
            {errors.password}
          </div>
        )}
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        aria-describedby={isLoading ? "loading-status" : undefined}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      
      {isLoading && (
        <div id="loading-status" aria-live="polite">
          Please wait while we log you in
        </div>
      )}
    </form>
  );
};

export default LoginForm;
```

```jsx
// components/LoginForm.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

describe('LoginForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test('renders all form elements', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  test('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByRole('alert', { name: /email is required/i })).toBeInTheDocument();
    expect(screen.getByRole('alert', { name: /password is required/i })).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('shows email validation error for invalid email', async () => {
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByRole('alert', { name: /email is invalid/i })).toBeInTheDocument();
  });

  test('shows password validation error for short password', async () => {
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByLabelText(/password/i), '123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByRole('alert', { name: /password must be at least 6 characters/i })).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    expect(screen.getByText(/please wait while we log you in/i)).toBeInTheDocument();
  });
});
```

## Testing với Context và State Management

### 1. React Context Testing

```jsx
// contexts/AuthContext.jsx
import React, { createContext, useContext, useReducer } from 'react';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        user: action.payload, 
        isAuthenticated: true 
      };
    case 'LOGIN_FAILURE':
      return { 
        ...state, 
        isLoading: false, 
        error: action.payload, 
        isAuthenticated: false 
      };
    case 'LOGOUT':
      return { 
        isLoading: false, 
        user: null, 
        isAuthenticated: false, 
        error: null 
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      // Mock API call
      const user = { id: 1, email: credentials.email };
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

```jsx
// components/UserProfile.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in to view your profile</div>;
  }

  return (
    <div>
      <h2>User Profile</h2>
      <p>Email: {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default UserProfile;
```

```jsx
// components/UserProfile.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../contexts/AuthContext';
import UserProfile from './UserProfile';

// Test utility for wrapping components with providers
const renderWithAuth = (component, { user = null, isAuthenticated = false } = {}) => {
  const MockAuthProvider = ({ children }) => {
    const mockAuth = {
      user,
      isAuthenticated,
      isLoading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn()
    };

    return (
      <AuthContext.Provider value={mockAuth}>
        {children}
      </AuthContext.Provider>
    );
  };

  return render(component, { wrapper: MockAuthProvider });
};

describe('UserProfile Component', () => {
  test('shows login message when not authenticated', () => {
    renderWithAuth(<UserProfile />);
    
    expect(screen.getByText(/please log in to view your profile/i)).toBeInTheDocument();
  });

  test('shows user profile when authenticated', () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    
    renderWithAuth(<UserProfile />, {
      user: mockUser,
      isAuthenticated: true
    });
    
    expect(screen.getByText(/user profile/i)).toBeInTheDocument();
    expect(screen.getByText(/email: test@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  test('calls logout when logout button is clicked', async () => {
    const user = userEvent.setup();
    const mockUser = { id: 1, email: 'test@example.com' };
    
    // For real provider testing
    render(
      <AuthProvider>
        <UserProfile />
      </AuthProvider>
    );
    
    // You would need to mock the login first, then test logout
  });
});
```

### 2. Custom Hooks Testing

```jsx
// hooks/useCounter.js
import { useState, useCallback } from 'react';

const useCounter = (initialValue = 0) => {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(prev => prev - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
};

export default useCounter;
```

```jsx
// hooks/useCounter.test.js
import { renderHook, act } from '@testing-library/react';
import useCounter from './useCounter';

describe('useCounter Hook', () => {
  test('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    
    expect(result.current.count).toBe(0);
  });

  test('initializes with custom value', () => {
    const { result } = renderHook(() => useCounter(10));
    
    expect(result.current.count).toBe(10);
  });

  test('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  test('decrements count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });

  test('resets to initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    
    act(() => {
      result.current.increment();
      result.current.increment();
    });
    
    expect(result.current.count).toBe(12);
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.count).toBe(10);
  });
});
```

## Async Testing Patterns

### 1. API Integration Testing

```jsx
// components/UserList.jsx
import React, { useState, useEffect } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/users');
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const userData = await response.json();
        setUsers(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return <div role="status">Loading users...</div>;
  }

  if (error) {
    return <div role="alert">Error: {error}</div>;
  }

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
```

```jsx
// components/UserList.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import UserList from './UserList';

// Mock fetch
global.fetch = jest.fn();

describe('UserList Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('shows loading state initially', () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => []
    });

    render(<UserList />);
    
    expect(screen.getByRole('status', { name: /loading users/i })).toBeInTheDocument();
  });

  test('displays users after successful fetch', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];

    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockUsers
    });

    render(<UserList />);
    
    // Wait for loading to finish and users to appear
    await waitFor(() => {
      expect(screen.getByText(/john doe - john@example.com/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/jane smith - jane@example.com/i)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('displays error message on fetch failure', async () => {
    fetch.mockRejectedValue(new Error('Failed to fetch users'));

    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/error: failed to fetch users/i)).toBeInTheDocument();
  });

  test('displays error message on HTTP error', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500
    });

    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/error: failed to fetch users/i)).toBeInTheDocument();
  });
});
```

### 2. Testing với MSW (Mock Service Worker)

```javascript
// mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ])
    );
  }),

  rest.post('/api/users', (req, res, ctx) => {
    const { name, email } = req.body;
    
    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        name,
        email
      })
    );
  }),

  rest.get('/api/users/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ error: 'Internal server error' })
    );
  })
];
```

```javascript
// mocks/server.js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```javascript
// setupTests.js
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Enable API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests are done
afterAll(() => server.close());
```

## Advanced Testing Patterns

### 1. Testing Error Boundaries

```jsx
// components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert">
          <h2>Something went wrong!</h2>
          <details>
            {this.state.error && this.state.error.toString()}
          </details>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

```jsx
// components/ErrorBoundary.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from './ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary Component', () => {
  // Suppress console.error for cleaner test output
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  test('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });

  test('can recover from error when try again is clicked', async () => {
    const user = userEvent.setup();
    
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));

    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });
});
```

### 2. Testing với Router

```jsx
// components/Navigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav>
      <ul>
        <li>
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            Home
          </Link>
        </li>
        <li>
          <Link 
            to="/about" 
            className={location.pathname === '/about' ? 'active' : ''}
          >
            About
          </Link>
        </li>
        <li>
          <Link 
            to="/contact" 
            className={location.pathname === '/contact' ? 'active' : ''}
          >
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
```

```jsx
// components/Navigation.test.jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navigation from './Navigation';

const renderWithRouter = (component, { initialEntries = ['/'] } = {}) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('Navigation Component', () => {
  test('renders all navigation links', () => {
    renderWithRouter(<Navigation />);
    
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  test('highlights active link for home page', () => {
    renderWithRouter(<Navigation />, { initialEntries: ['/'] });
    
    expect(screen.getByRole('link', { name: /home/i })).toHaveClass('active');
    expect(screen.getByRole('link', { name: /about/i })).not.toHaveClass('active');
  });

  test('highlights active link for about page', () => {
    renderWithRouter(<Navigation />, { initialEntries: ['/about'] });
    
    expect(screen.getByRole('link', { name: /about/i })).toHaveClass('active');
    expect(screen.getByRole('link', { name: /home/i })).not.toHaveClass('active');
  });
});
```

## Test Utilities và Custom Renders

### 1. Custom Render Function

```jsx
// test-utils.jsx
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';

// Custom render function với all providers
const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };
```

### 2. Test Data Factories

```jsx
// test-utils/factories.js
export const createUser = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  name: 'Test User',
  email: 'test@example.com',
  avatar: 'https://example.com/avatar.jpg',
  isActive: true,
  createdAt: new Date().toISOString(),
  ...overrides
});

export const createPost = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  title: 'Test Post',
  content: 'This is a test post content',
  author: createUser(),
  createdAt: new Date().toISOString(),
  likes: 0,
  ...overrides
});

export const createComment = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  content: 'This is a test comment',
  author: createUser(),
  postId: 1,
  createdAt: new Date().toISOString(),
  ...overrides
});
```

## Debugging Tests

### 1. Debug Utilities

```jsx
import { render, screen } from '@testing-library/react';
import { debug } from '@testing-library/react';

test('debug example', () => {
  render(<MyComponent />);
  
  // Debug entire document
  screen.debug();
  
  // Debug specific element
  screen.debug(screen.getByRole('button'));
  
  // Log accessible roles
  screen.logTestingPlaygroundURL();
});
```

### 2. Query Debugging

```jsx
test('query debugging', () => {
  render(<MyComponent />);
  
  // These will show helpful error messages
  expect(screen.getByRole('button')).toBeInTheDocument();
  
  // Use *By queries for debugging - they show all available options
  screen.getByRole('button'); // Shows all available roles if not found
  
  // Use testing playground for query suggestions
  screen.logTestingPlaygroundURL();
});
```

## Best Practices

### 1. Query Priority
1. **getByRole** - Most accessible
2. **getByLabelText** - Form elements
3. **getByPlaceholderText** - Input placeholders
4. **getByText** - Non-interactive text
5. **getByDisplayValue** - Form values
6. **getByAltText** - Images
7. **getByTitle** - Title attributes
8. **getByTestId** - Last resort

### 2. Assertion Best Practices

```jsx
// Good - Tests behavior
expect(screen.getByRole('button')).toBeEnabled();
expect(screen.getByText('Success message')).toBeInTheDocument();

// Avoid - Tests implementation
expect(component.state.isLoading).toBe(false);
expect(mockFunction).toHaveBeenCalledWith(specificParams);
```

### 3. Async Testing Patterns

```jsx
// Good - Wait for specific condition
await waitFor(() => {
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});

// Good - Find elements that will appear
const message = await screen.findByText('Success');

// Avoid - Arbitrary waits
await new Promise(resolve => setTimeout(resolve, 1000));
```

## Exercises

### Exercise 1: Todo Application Testing
Tạo comprehensive tests cho một Todo app với:
- Adding todos
- Marking complete/incomplete
- Filtering (all, active, completed)
- Deleting todos
- Local storage persistence

### Exercise 2: Shopping Cart Testing
Test một shopping cart component với:
- Adding/removing items
- Quantity updates
- Price calculations
- Checkout process
- Form validation

---

**Key Takeaways:**
- Focus on user behavior, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Test async operations properly với waitFor/findBy
- Mock external dependencies
- Use proper test isolation
- Write maintainable tests that won't break với refactoring
- Prefer integration tests over unit tests for components
