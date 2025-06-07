# State Management trong React

## Lý Thuyết

### State Management là gì?

State Management là cách quản lý và chia sẻ data (state) giữa các components trong ứng dụng React. Khi ứng dụng phức tạp, việc truyền props qua nhiều level components (prop drilling) trở nên khó quản lý.

### Các Phương Pháp State Management

1. **Local State**: useState, useReducer
2. **Context API**: React built-in solution
3. **External Libraries**: Redux, Zustand, Recoil, Jotai
4. **Server State**: React Query, SWR

## Context API

### 1. Tạo Context

```jsx
// context/AppContext.js
import React, { createContext, useContext, useReducer } from 'react';

// Tạo Context
const AppContext = createContext();

// Hook để sử dụng context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Initial state
const initialState = {
  user: null,
  theme: 'light',
  language: 'vi',
  notifications: [],
  cart: {
    items: [],
    total: 0
  }
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case 'ADD_TO_CART':
      const existingItem = state.cart.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: {
            ...state.cart,
            items: state.cart.items.map(item =>
              item.id === action.payload.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          }
        };
      }
      return {
        ...state,
        cart: {
          ...state.cart,
          items: [...state.cart.items, { ...action.payload, quantity: 1 }]
        }
      };
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.filter(item => item.id !== action.payload)
        }
      };
    
    case 'UPDATE_CART_TOTAL':
      const total = state.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return {
        ...state,
        cart: { ...state.cart, total }
      };
    
    default:
      return state;
  }
};

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const actions = {
    setUser: (user) => dispatch({ type: 'SET_USER', payload: user }),
    setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    setLanguage: (language) => dispatch({ type: 'SET_LANGUAGE', payload: language }),
    
    addNotification: (notification) => {
      const id = Date.now();
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { ...notification, id } 
      });
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
      }, 5000);
    },
    
    removeNotification: (id) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }),
    
    addToCart: (product) => {
      dispatch({ type: 'ADD_TO_CART', payload: product });
      dispatch({ type: 'UPDATE_CART_TOTAL' });
    },
    
    removeFromCart: (productId) => {
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
      dispatch({ type: 'UPDATE_CART_TOTAL' });
    }
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};
```

### 2. Sử Dụng Context

```jsx
// App.jsx
import React from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import NotificationList from './components/NotificationList';

function App() {
  return (
    <AppProvider>
      <div className="App">
        <Header />
        <NotificationList />
        <main>
          <ProductList />
          <Cart />
        </main>
      </div>
    </AppProvider>
  );
}

export default App;
```

```jsx
// components/ProductList.jsx
import React from 'react';
import { useAppContext } from '../context/AppContext';

const ProductList = () => {
  const { state, actions } = useAppContext();
  
  const products = [
    { id: 1, name: 'iPhone 15', price: 25000000 },
    { id: 2, name: 'MacBook Air', price: 30000000 },
    { id: 3, name: 'iPad Pro', price: 20000000 }
  ];

  const handleAddToCart = (product) => {
    actions.addToCart(product);
    actions.addNotification({
      type: 'success',
      message: `Đã thêm ${product.name} vào giỏ hàng`
    });
  };

  return (
    <div className="product-list">
      <h2>Sản phẩm</h2>
      <div className="products">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>{product.price.toLocaleString()}đ</p>
            <button onClick={() => handleAddToCart(product)}>
              Thêm vào giỏ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
```

```jsx
// components/Cart.jsx
import React from 'react';
import { useAppContext } from '../context/AppContext';

const Cart = () => {
  const { state, actions } = useAppContext();
  const { cart } = state;

  return (
    <div className="cart">
      <h2>Giỏ hàng ({cart.items.length})</h2>
      
      {cart.items.length === 0 ? (
        <p>Giỏ hàng trống</p>
      ) : (
        <div>
          {cart.items.map(item => (
            <div key={item.id} className="cart-item">
              <span>{item.name}</span>
              <span>x{item.quantity}</span>
              <span>{(item.price * item.quantity).toLocaleString()}đ</span>
              <button onClick={() => actions.removeFromCart(item.id)}>
                Xóa
              </button>
            </div>
          ))}
          
          <div className="cart-total">
            <strong>Tổng: {cart.total.toLocaleString()}đ</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
```

## Redux Toolkit

### 1. Setup Redux Toolkit

```bash
npm install @reduxjs/toolkit react-redux
```

```jsx
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import productSlice from './productSlice';
import cartSlice from './cartSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productSlice,
    cart: cartSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 2. Auth Slice

```jsx
// store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk cho login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk cho logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('token');
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
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
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  }
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
```

### 3. Product Slice

```jsx
// store/productSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ category, search, page = 1 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      
      return {
        products: data.products,
        totalPages: data.totalPages,
        currentPage: page
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentProduct: null,
    categories: [],
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 1,
    filters: {
      category: '',
      search: '',
      priceRange: [0, 100000000]
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        search: '',
        priceRange: [0, 100000000]
      };
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilters, clearFilters, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
```

### 4. Cart Slice

```jsx
// store/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
    itemsCount: 0,
    shippingCost: 0,
    discount: 0
  },
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item) {
        item.quantity = Math.max(0, quantity);
        if (item.quantity === 0) {
          state.items = state.items.filter(item => item.id !== id);
        }
      }
      
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemsCount = 0;
    },
    
    applyDiscount: (state, action) => {
      state.discount = action.payload;
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    setShippingCost: (state, action) => {
      state.shippingCost = action.payload;
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    calculateTotals: (state) => {
      const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      state.itemsCount = state.items.reduce((count, item) => count + item.quantity, 0);
      state.total = subtotal + state.shippingCost - state.discount;
    }
  }
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  applyDiscount,
  setShippingCost
} = cartSlice.actions;

export default cartSlice.reducer;
```

### 5. Sử Dụng Redux trong Components

```jsx
// hooks/redux.js
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

```jsx
// components/ProductCard.jsx
import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { addToCart } from '../store/cartSlice';
import { loginUser } from '../store/authSlice';

const ProductCard = ({ product }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const { items } = useAppSelector(state => state.cart);

  const isInCart = items.some(item => item.id === product.id);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return;
    }
    
    dispatch(addToCart(product));
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">{product.price.toLocaleString()}đ</p>
      <p className="description">{product.description}</p>
      
      <button 
        onClick={handleAddToCart}
        disabled={isInCart}
        className={`btn ${isInCart ? 'btn-disabled' : 'btn-primary'}`}
      >
        {isInCart ? 'Đã có trong giỏ' : 'Thêm vào giỏ'}
      </button>
    </div>
  );
};

export default ProductCard;
```

```jsx
// components/CartSummary.jsx
import React from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { clearCart, applyDiscount } from '../store/cartSlice';

const CartSummary = () => {
  const dispatch = useAppDispatch();
  const { items, total, itemsCount, shippingCost, discount } = useAppSelector(state => state.cart);

  const handleApplyDiscount = (discountCode) => {
    // Validate discount code
    if (discountCode === 'SAVE10') {
      dispatch(applyDiscount(total * 0.1));
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm?')) {
      dispatch(clearCart());
    }
  };

  return (
    <div className="cart-summary">
      <h3>Tóm tắt đơn hàng</h3>
      
      <div className="summary-line">
        <span>Số sản phẩm:</span>
        <span>{itemsCount}</span>
      </div>
      
      <div className="summary-line">
        <span>Subtotal:</span>
        <span>{(total - shippingCost + discount).toLocaleString()}đ</span>
      </div>
      
      <div className="summary-line">
        <span>Phí vận chuyển:</span>
        <span>{shippingCost.toLocaleString()}đ</span>
      </div>
      
      {discount > 0 && (
        <div className="summary-line discount">
          <span>Giảm giá:</span>
          <span>-{discount.toLocaleString()}đ</span>
        </div>
      )}
      
      <div className="summary-line total">
        <span>Tổng cộng:</span>
        <span>{total.toLocaleString()}đ</span>
      </div>
      
      <div className="cart-actions">
        <button onClick={handleClearCart} className="btn btn-secondary">
          Xóa giỏ hàng
        </button>
        <button className="btn btn-primary">
          Thanh toán
        </button>
      </div>
    </div>
  );
};

export default CartSummary;
```

## Zustand (Alternative to Redux)

### 1. Setup Zustand

```bash
npm install zustand
```

```jsx
// stores/useStore.js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Auth state
        user: null,
        isAuthenticated: false,
        
        // Products state
        products: [],
        currentProduct: null,
        loading: false,
        
        // Cart state
        cart: {
          items: [],
          total: 0
        },
        
        // Actions
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        
        login: async (email, password) => {
          set({ loading: true });
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            set({ user: data.user, isAuthenticated: true, loading: false });
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },
        
        logout: () => {
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false });
        },
        
        fetchProducts: async () => {
          set({ loading: true });
          try {
            const response = await fetch('/api/products');
            const products = await response.json();
            set({ products, loading: false });
          } catch (error) {
            set({ loading: false });
          }
        },
        
        addToCart: (product) => {
          const { cart } = get();
          const existingItem = cart.items.find(item => item.id === product.id);
          
          let newItems;
          if (existingItem) {
            newItems = cart.items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            newItems = [...cart.items, { ...product, quantity: 1 }];
          }
          
          const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          set({
            cart: { items: newItems, total }
          });
        },
        
        removeFromCart: (productId) => {
          const { cart } = get();
          const newItems = cart.items.filter(item => item.id !== productId);
          const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          set({
            cart: { items: newItems, total }
          });
        }
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          cart: state.cart
        })
      }
    )
  )
);

export default useStore;
```

### 2. Sử Dụng Zustand

```jsx
// components/ProductList.jsx
import React, { useEffect } from 'react';
import useStore from '../stores/useStore';

const ProductList = () => {
  const { 
    products, 
    loading, 
    fetchProducts, 
    addToCart, 
    isAuthenticated 
  } = useStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="product-list">
      {products.map(product => (
        <div key={product.id} className="product-card">
          <h3>{product.name}</h3>
          <p>{product.price}đ</p>
          <button 
            onClick={() => addToCart(product)}
            disabled={!isAuthenticated}
          >
            Thêm vào giỏ
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
```

```jsx
// components/Cart.jsx
import React from 'react';
import useStore from '../stores/useStore';

const Cart = () => {
  const { cart, removeFromCart } = useStore();

  return (
    <div className="cart">
      <h2>Giỏ hàng</h2>
      {cart.items.length === 0 ? (
        <p>Giỏ hàng trống</p>
      ) : (
        <div>
          {cart.items.map(item => (
            <div key={item.id} className="cart-item">
              <span>{item.name}</span>
              <span>x{item.quantity}</span>
              <span>{item.price * item.quantity}đ</span>
              <button onClick={() => removeFromCart(item.id)}>
                Xóa
              </button>
            </div>
          ))}
          <div className="cart-total">
            Tổng: {cart.total}đ
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
```

## React Query (Server State)

### 1. Setup React Query

```bash
npm install @tanstack/react-query
```

```jsx
// App.jsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        {/* Your app components */}
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
```

### 2. Custom Hooks với React Query

```jsx
// hooks/useProducts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch products
export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch single product
export const useProduct = (productId) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      return response.json();
    },
    enabled: !!productId,
  });
};

// Create product mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Update product mutation
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...productData }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Update specific product in cache
      queryClient.setQueryData(['product', variables.id], data);
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
```

### 3. Sử Dụng React Query

```jsx
// components/ProductList.jsx
import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';

const ProductList = () => {
  const [filters, setFilters] = useState({ category: '', search: '' });
  const { data, isLoading, error, refetch } = useProducts(filters);

  if (isLoading) return <div>Đang tải sản phẩm...</div>;
  if (error) return <div>Lỗi: {error.message}</div>;

  return (
    <div className="product-list">
      <div className="filters">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">Tất cả danh mục</option>
          <option value="electronics">Điện tử</option>
          <option value="clothing">Thời trang</option>
        </select>
        <button onClick={() => refetch()}>Làm mới</button>
      </div>

      <div className="products">
        {data?.products?.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>{product.price}đ</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
```

## Best Practices

### 1. State Organization
```jsx
// ✅ Good: Organize state by domain
const initialState = {
  auth: { user: null, isLoading: false },
  products: { items: [], loading: false },
  cart: { items: [], total: 0 }
};

// ❌ Bad: Flat state structure
const initialState = {
  user: null,
  products: [],
  cartItems: [],
  authLoading: false,
  productsLoading: false
};
```

### 2. Action Naming
```jsx
// ✅ Good: Clear action names
dispatch({ type: 'products/fetchProducts/pending' });
dispatch({ type: 'cart/addItem', payload: product });

// ❌ Bad: Unclear action names
dispatch({ type: 'LOADING' });
dispatch({ type: 'ADD', payload: product });
```

### 3. Selector Pattern
```jsx
// selectors/cartSelectors.js
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartItemsCount = (state) => 
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

// Usage in component
const cartItems = useAppSelector(selectCartItems);
const cartTotal = useAppSelector(selectCartTotal);
```

## Bài Tập Thực Hành

### Bài 1: Todo App với Context API
Tạo todo app sử dụng Context API với CRUD operations và filters.

### Bài 2: E-commerce với Redux Toolkit
Tạo e-commerce app với authentication, products, cart, và orders.

### Bài 3: Blog với React Query
Tạo blog app với infinite scrolling, caching, và optimistic updates.

### Bài 4: Chat App với Zustand
Tạo real-time chat app với user management và message history.

### Bài 5: Dashboard với Mixed State
Combine local state, Context API, và React Query cho complex dashboard.

## Tài Liệu Tham Khảo

- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query/latest)
