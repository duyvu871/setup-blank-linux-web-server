# State Management trong NextJS

## Tổng quan về State Management

State management là cách quản lý và chia sẻ dữ liệu giữa các components trong ứng dụng NextJS. Có nhiều cách tiếp cận từ đơn giản đến phức tạp.

### Các phương pháp State Management:
- **React useState/useReducer**: Local state
- **Context API**: Global state đơn giản
- **Zustand**: Lightweight state management
- **Redux Toolkit**: Enterprise-level state management
- **SWR/React Query**: Server state management

## Local State với React Hooks

### useState Hook
```javascript
// components/Counter.js
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  const increment = () => setCount(prev => prev + step);
  const decrement = () => setCount(prev => prev - step);
  const reset = () => setCount(0);

  return (
    <div>
      <h2>Count: {count}</h2>
      <div>
        <label>
          Step: 
          <input 
            type="number" 
            value={step} 
            onChange={(e) => setStep(Number(e.target.value))}
          />
        </label>
      </div>
      <button onClick={increment}>+{step}</button>
      <button onClick={decrement}>-{step}</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default Counter;
```

### useReducer Hook
```javascript
// hooks/useShoppingCart.js
import { useReducer } from 'react';

const initialState = {
  items: [],
  total: 0,
  itemCount: 0
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          total: state.total + action.payload.price,
          itemCount: state.itemCount + 1
        };
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
        total: state.total + action.payload.price,
        itemCount: state.itemCount + 1
      };

    case 'REMOVE_ITEM':
      const itemToRemove = state.items.find(item => item.id === action.payload);
      
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - (itemToRemove.price * itemToRemove.quantity),
        itemCount: state.itemCount - itemToRemove.quantity
      };

    case 'UPDATE_QUANTITY':
      const { id, quantity } = action.payload;
      const currentItem = state.items.find(item => item.id === id);
      const quantityDiff = quantity - currentItem.quantity;

      return {
        ...state,
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        ),
        total: state.total + (currentItem.price * quantityDiff),
        itemCount: state.itemCount + quantityDiff
      };

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

export function useShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };
}
```

## Context API cho Global State

### Tạo Auth Context
```javascript
// contexts/AuthContext.js
import { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    
    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const user = await response.json();
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
        return { success: true };
      } else {
        const error = await response.json();
        dispatch({ type: 'LOGIN_ERROR', payload: error.message });
        return { success: false, error: error.message };
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: 'Network error' });
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Sử dụng Auth Context
```javascript
// pages/_app.js
import { AuthProvider } from '../contexts/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
```

```javascript
// components/LoginForm.js
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

function LoginForm() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const { login, loading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(credentials);
    
    if (result.success) {
      router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={(e) => setCredentials({
            ...credentials,
            email: e.target.value
          })}
          required
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({
            ...credentials,
            password: e.target.value
          })}
          required
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  );
}

export default LoginForm;
```

## Zustand - Lightweight State Management

### Setup Zustand Store
```javascript
// store/useStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Cart state
      cart: {
        items: [],
        total: 0,
        itemCount: 0
      },

      // User preferences
      preferences: {
        theme: 'light',
        language: 'vi',
        currency: 'VND'
      },

      // UI state
      ui: {
        sidebarOpen: false,
        loading: false,
        notifications: []
      },

      // Cart actions
      addToCart: (product) => set((state) => {
        const existingItem = state.cart.items.find(item => item.id === product.id);
        
        if (existingItem) {
          return {
            cart: {
              ...state.cart,
              items: state.cart.items.map(item =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
              total: state.cart.total + product.price,
              itemCount: state.cart.itemCount + 1
            }
          };
        }

        return {
          cart: {
            ...state.cart,
            items: [...state.cart.items, { ...product, quantity: 1 }],
            total: state.cart.total + product.price,
            itemCount: state.cart.itemCount + 1
          }
        };
      }),

      removeFromCart: (productId) => set((state) => {
        const item = state.cart.items.find(item => item.id === productId);
        if (!item) return state;

        return {
          cart: {
            ...state.cart,
            items: state.cart.items.filter(item => item.id !== productId),
            total: state.cart.total - (item.price * item.quantity),
            itemCount: state.cart.itemCount - item.quantity
          }
        };
      }),

      updateQuantity: (productId, quantity) => set((state) => {
        if (quantity <= 0) {
          return get().removeFromCart(productId);
        }

        const currentItem = state.cart.items.find(item => item.id === productId);
        if (!currentItem) return state;

        const quantityDiff = quantity - currentItem.quantity;

        return {
          cart: {
            ...state.cart,
            items: state.cart.items.map(item =>
              item.id === productId ? { ...item, quantity } : item
            ),
            total: state.cart.total + (currentItem.price * quantityDiff),
            itemCount: state.cart.itemCount + quantityDiff
          }
        };
      }),

      clearCart: () => set((state) => ({
        cart: {
          items: [],
          total: 0,
          itemCount: 0
        }
      })),

      // UI actions
      toggleSidebar: () => set((state) => ({
        ui: {
          ...state.ui,
          sidebarOpen: !state.ui.sidebarOpen
        }
      })),

      setLoading: (loading) => set((state) => ({
        ui: {
          ...state.ui,
          loading
        }
      })),

      addNotification: (notification) => set((state) => ({
        ui: {
          ...state.ui,
          notifications: [
            ...state.ui.notifications,
            { ...notification, id: Date.now() }
          ]
        }
      })),

      removeNotification: (id) => set((state) => ({
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== id)
        }
      })),

      // Preferences actions
      setTheme: (theme) => set((state) => ({
        preferences: {
          ...state.preferences,
          theme
        }
      })),

      setLanguage: (language) => set((state) => ({
        preferences: {
          ...state.preferences,
          language
        }
      }))
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        cart: state.cart,
        preferences: state.preferences
      })
    }
  )
);

export default useStore;
```

### Sử dụng Zustand Store
```javascript
// components/ProductCard.js
import useStore from '../store/useStore';

function ProductCard({ product }) {
  const addToCart = useStore((state) => state.addToCart);
  const addNotification = useStore((state) => state.addNotification);

  const handleAddToCart = () => {
    addToCart(product);
    addNotification({
      type: 'success',
      message: `${product.name} đã được thêm vào giỏ hàng`
    });
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.price.toLocaleString()} VND</p>
      <button onClick={handleAddToCart}>
        Thêm vào giỏ hàng
      </button>
    </div>
  );
}

export default ProductCard;
```

```javascript
// components/CartSidebar.js
import useStore from '../store/useStore';

function CartSidebar() {
  const {
    cart,
    ui: { sidebarOpen },
    toggleSidebar,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useStore();

  if (!sidebarOpen) return null;

  return (
    <div className="cart-sidebar">
      <div className="cart-header">
        <h2>Giỏ hàng ({cart.itemCount})</h2>
        <button onClick={toggleSidebar}>✕</button>
      </div>
      
      <div className="cart-items">
        {cart.items.map(item => (
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} />
            <div>
              <h4>{item.name}</h4>
              <p>{item.price.toLocaleString()} VND</p>
              <div className="quantity-controls">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  +
                </button>
                <button onClick={() => removeFromCart(item.id)}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="cart-footer">
        <div className="total">
          Tổng: {cart.total.toLocaleString()} VND
        </div>
        <button onClick={clearCart}>Xóa tất cả</button>
        <button className="checkout-btn">Thanh toán</button>
      </div>
    </div>
  );
}

export default CartSidebar;
```

## Server State Management với SWR

### Setup SWR
```javascript
// lib/fetcher.js
export const fetcher = async (url) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await response.json();
    error.status = response.status;
    throw error;
  }
  
  return response.json();
};
```

```javascript
// pages/_app.js
import { SWRConfig } from 'swr';
import { fetcher } from '../lib/fetcher';

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig value={{
      fetcher,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3
    }}>
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default MyApp;
```

### Custom Hooks với SWR
```javascript
// hooks/usePosts.js
import useSWR from 'swr';

export function usePosts(page = 1, limit = 10) {
  const { data, error, mutate } = useSWR(
    `/api/posts?page=${page}&limit=${limit}`
  );

  return {
    posts: data?.data || [],
    pagination: data?.pagination,
    loading: !error && !data,
    error,
    mutate
  };
}

export function usePost(id) {
  const { data, error, mutate } = useSWR(
    id ? `/api/posts/${id}` : null
  );

  return {
    post: data?.data,
    loading: !error && !data,
    error,
    mutate
  };
}

export async function createPost(postData) {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });

  if (!response.ok) {
    throw new Error('Failed to create post');
  }

  return response.json();
}

export async function updatePost(id, postData) {
  const response = await fetch(`/api/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });

  if (!response.ok) {
    throw new Error('Failed to update post');
  }

  return response.json();
}
```

### Sử dụng SWR trong Components
```javascript
// pages/posts/index.js
import { useState } from 'react';
import { usePosts, createPost } from '../../hooks/usePosts';

function PostsPage() {
  const [page, setPage] = useState(1);
  const { posts, pagination, loading, error, mutate } = usePosts(page);

  const handleCreatePost = async (postData) => {
    try {
      await createPost(postData);
      mutate(); // Revalidate data
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Posts</h1>
      
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
      
      <div className="pagination">
        <button 
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span>Page {page} of {pagination?.pages}</span>
        <button 
          disabled={page >= pagination?.pages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PostsPage;
```

## Redux Toolkit cho Enterprise Apps

### Setup Redux Toolkit
```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import postsSlice from './slices/postsSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    posts: postsSlice,
    ui: uiSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Auth Slice
```javascript
// store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message);
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  }
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
```

### Hooks cho Redux
```javascript
// hooks/redux.js
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

## Best Practices

### 1. State Organization
```javascript
// Organize state by domain
const state = {
  auth: { user, permissions },
  ui: { loading, modals, notifications },
  data: { posts, users, products },
  cache: { ... },
  preferences: { theme, language }
};
```

### 2. Performance Optimization
```javascript
// Use selectors to prevent unnecessary re-renders
const useCartTotal = () => {
  return useStore(
    useCallback(
      (state) => state.cart.items.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      ),
      []
    )
  );
};
```

### 3. Persistence
```javascript
// Persist only necessary state
const persistConfig = {
  name: 'app-storage',
  partialize: (state) => ({
    auth: { user: state.auth.user },
    preferences: state.preferences,
    cart: state.cart
  })
};
```

## Tóm tắt

- Local state với useState/useReducer cho component state
- Context API cho simple global state
- Zustand cho lightweight global state management
- SWR/React Query cho server state
- Redux Toolkit cho complex enterprise applications
- Choose based on complexity và requirements

## Bài tập thực hành

1. Shopping Cart với Zustand:
   - Add/remove items
   - Quantity management
   - Persistence
   - Checkout process

2. Blog với SWR:
   - Posts listing với pagination
   - Real-time updates
   - Optimistic updates
   - Error handling

3. Dashboard với Redux Toolkit:
   - User management
   - Complex state interactions
   - Async operations
   - State normalization
