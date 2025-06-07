# React Router - Routing và Navigation

## Lý Thuyết

### React Router là gì?

React Router là thư viện routing phổ biến nhất cho React, cho phép tạo Single Page Applications (SPA) với multiple views/pages. Nó quản lý browser history và render các components tương ứng với URL.

### Cài Đặt

```bash
# React Router v6
npm install react-router-dom

# Hoặc với yarn
yarn add react-router-dom
```

### Khái Niệm Cơ Bản

1. **Router**: Container chính quản lý routing
2. **Routes**: Container chứa các route definitions
3. **Route**: Define path và component tương ứng
4. **Link/NavLink**: Navigation components
5. **Navigate**: Programmatic navigation
6. **Outlet**: Render nested routes

## Basic Routing

### 1. Setup Router

```jsx
// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
```

### 2. Navigation Component

```jsx
// components/Navigation.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">MyApp</Link>
      </div>
      
      <ul className="nav-links">
        <li>
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Trang chủ
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/about"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Giới thiệu
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/contact"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Liên hệ
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
```

### 3. Page Components

```jsx
// pages/Home.jsx
import React from 'react';

const Home = () => {
  return (
    <div className="page">
      <h1>Trang Chủ</h1>
      <p>Chào mừng đến với website của chúng tôi!</p>
    </div>
  );
};

export default Home;
```

```jsx
// pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="page">
      <h1>404 - Không Tìm Thấy Trang</h1>
      <p>Trang bạn tìm kiếm không tồn tại.</p>
      <Link to="/">Về trang chủ</Link>
    </div>
  );
};

export default NotFound;
```

## Dynamic Routing & Parameters

### 1. URL Parameters

```jsx
// App.jsx - Route với parameters
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/users/:id" element={<UserProfile />} />
  <Route path="/products/:category/:id" element={<ProductDetail />} />
  <Route path="/search" element={<SearchResults />} />
</Routes>
```

```jsx
// pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { id } = useParams(); // Lấy parameter từ URL
  const navigate = useNavigate(); // Hook để navigate programmatically
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
          throw new Error('User not found');
        }
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/404'); // Navigate đến 404 page
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  if (loading) return <div>Đang tải...</div>;
  if (!user) return <div>Không tìm thấy người dùng</div>;

  return (
    <div className="user-profile">
      <h1>Hồ sơ người dùng</h1>
      <div className="user-info">
        <h2>{user.name}</h2>
        <p>Email: {user.email}</p>
        <p>Phone: {user.phone}</p>
        <button onClick={() => navigate('/users')}>
          Quay lại danh sách
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
```

### 2. Query Parameters

```jsx
// pages/SearchResults.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy query parameters
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    if (query) {
      searchProducts();
    }
  }, [query, category, page]);

  const searchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/products/search?q=${query}&category=${category}&page=${page}`
      );
      const data = await response.json();
      setResults(data.products);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery) => {
    // Cập nhật URL với query parameters mới
    setSearchParams({
      q: newQuery,
      category,
      page: '1'
    });
  };

  const handleCategoryChange = (newCategory) => {
    setSearchParams({
      q: query,
      category: newCategory,
      page: '1'
    });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({
      q: query,
      category,
      page: newPage.toString()
    });
  };

  return (
    <div className="search-results">
      <h1>Kết quả tìm kiếm</h1>
      
      <div className="search-controls">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
        />
        
        <select value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
          <option value="all">Tất cả danh mục</option>
          <option value="electronics">Điện tử</option>
          <option value="clothing">Thời trang</option>
          <option value="books">Sách</option>
        </select>
      </div>

      {loading ? (
        <div>Đang tìm kiếm...</div>
      ) : (
        <div className="results">
          <p>Tìm thấy {results.length} sản phẩm cho "{query}"</p>
          <div className="product-grid">
            {results.map(product => (
              <div key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <p>{product.price}đ</p>
                <button onClick={() => navigate(`/products/${product.id}`)}>
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
          
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Trang trước
            </button>
            <span>Trang {page}</span>
            <button 
              onClick={() => handlePageChange(page + 1)}
              disabled={results.length < 10}
            >
              Trang sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
```

## Nested Routing & Layouts

### 1. Nested Routes với Outlet

```jsx
// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import DashboardHome from './pages/DashboardHome';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          
          {/* Nested routes cho dashboard */}
          <Route path="dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
```

```jsx
// components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="layout">
      <Navigation />
      <main className="main-content">
        <Outlet /> {/* Render child routes here */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
```

```jsx
// pages/Dashboard.jsx
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Dashboard</h2>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" end>Tổng quan</NavLink>
          <NavLink to="/dashboard/analytics">Phân tích</NavLink>
          <NavLink to="/dashboard/profile">Hồ sơ</NavLink>
          <NavLink to="/dashboard/settings">Cài đặt</NavLink>
        </nav>
      </aside>
      
      <div className="dashboard-content">
        <Outlet /> {/* Render nested dashboard routes */}
      </div>
    </div>
  );
};

export default Dashboard;
```

## Protected Routes & Authentication

### 1. Protected Route Component

```jsx
// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!isAuthenticated) {
    // Redirect đến login với current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

### 2. Sử Dụng Protected Routes

```jsx
// App.jsx
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin only routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  );
}
```

### 3. Login Component với Redirect

```jsx
// pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy redirect path từ location state
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(credentials.email, credentials.password);
      // Redirect về trang đã cố gắng truy cập
      navigate(from, { replace: true });
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Đăng nhập</h2>
        
        {error && <div className="error">{error}</div>}
        
        <input
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={(e) => setCredentials({...credentials, email: e.target.value})}
          required
        />
        
        <input
          type="password"
          placeholder="Mật khẩu"
          value={credentials.password}
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
};

export default Login;
```

## Programmatic Navigation

### 1. useNavigate Hook

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleViewProduct = () => {
    // Navigate với state
    navigate(`/products/${product.id}`, {
      state: { from: 'product-list' }
    });
  };

  const handleBuyNow = () => {
    // Navigate và replace current entry
    navigate('/checkout', { 
      replace: true,
      state: { product }
    });
  };

  const handleGoBack = () => {
    // Go back to previous page
    navigate(-1);
  };

  const handleGoForward = () => {
    // Go forward in history
    navigate(1);
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.price}đ</p>
      
      <button onClick={handleViewProduct}>
        Xem chi tiết
      </button>
      <button onClick={handleBuyNow}>
        Mua ngay
      </button>
      <button onClick={handleGoBack}>
        Quay lại
      </button>
    </div>
  );
};

export default ProductCard;
```

### 2. Conditional Navigation

```jsx
// hooks/useConditionalNavigation.js
import { useNavigate } from 'react-router-dom';

export const useConditionalNavigation = () => {
  const navigate = useNavigate();

  const navigateWithConfirm = (path, message = 'Bạn có chắc chắn muốn rời khỏi trang này?') => {
    if (window.confirm(message)) {
      navigate(path);
    }
  };

  const navigateWithAuth = (path, isAuthenticated) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/login', { state: { from: path } });
    }
  };

  return { navigateWithConfirm, navigateWithAuth };
};
```

## Route Guards & Middleware

### 1. Route Guard Component

```jsx
// components/RouteGuard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RouteGuard = ({ children, guards = [] }) => {
  const [loading, setLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const checkGuards = async () => {
      try {
        for (const guard of guards) {
          const result = await guard({ user, isAuthenticated, location });
          if (!result.canAccess) {
            navigate(result.redirectTo, { replace: true });
            return;
          }
        }
        setCanAccess(true);
      } catch (error) {
        console.error('Route guard error:', error);
        navigate('/error', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkGuards();
  }, [user, isAuthenticated, location, navigate, guards]);

  if (loading) return <div>Đang kiểm tra quyền truy cập...</div>;
  if (!canAccess) return null;

  return children;
};

export default RouteGuard;
```

### 2. Guard Functions

```jsx
// guards/authGuards.js
export const requireAuth = ({ isAuthenticated }) => {
  return {
    canAccess: isAuthenticated,
    redirectTo: '/login'
  };
};

export const requireRole = (requiredRole) => ({ user, isAuthenticated }) => {
  if (!isAuthenticated) {
    return { canAccess: false, redirectTo: '/login' };
  }
  
  return {
    canAccess: user.role === requiredRole,
    redirectTo: '/unauthorized'
  };
};

export const requireSubscription = ({ user, isAuthenticated }) => {
  if (!isAuthenticated) {
    return { canAccess: false, redirectTo: '/login' };
  }
  
  return {
    canAccess: user.subscription?.status === 'active',
    redirectTo: '/subscribe'
  };
};
```

### 3. Sử Dụng Route Guards

```jsx
// App.jsx
import RouteGuard from './components/RouteGuard';
import { requireAuth, requireRole, requireSubscription } from './guards/authGuards';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route 
          path="/premium/*" 
          element={
            <RouteGuard guards={[requireAuth, requireSubscription]}>
              <PremiumContent />
            </RouteGuard>
          } 
        />
        
        <Route 
          path="/admin/*" 
          element={
            <RouteGuard guards={[requireAuth, requireRole('admin')]}>
              <AdminPanel />
            </RouteGuard>
          } 
        />
      </Routes>
    </Router>
  );
}
```

## Best Practices

### 1. Route Organization
```jsx
// routes/index.js
import { lazy } from 'react';

// Lazy loading components
const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const Dashboard = lazy(() => import('../pages/Dashboard'));

export const routes = [
  {
    path: '/',
    element: Home,
    exact: true
  },
  {
    path: '/about',
    element: About
  },
  {
    path: '/dashboard/*',
    element: Dashboard,
    protected: true
  }
];
```

### 2. Link Styling
```jsx
// Styled NavLink
const StyledNavLink = ({ to, children, ...props }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `nav-link ${isActive ? 'active' : ''}`
      }
      {...props}
    >
      {children}
    </NavLink>
  );
};
```

### 3. Error Boundaries cho Routes
```jsx
// components/RouteErrorBoundary.jsx
import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';

const RouteErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <h1>Oops! Có lỗi xảy ra</h1>
      <p>{error.statusText || error.message}</p>
      <button onClick={() => navigate('/')}>
        Về trang chủ
      </button>
    </div>
  );
};

export default RouteErrorBoundary;
```

## Bài Tập Thực Hành

### Bài 1: E-commerce Routing
Tạo hệ thống routing cho trang e-commerce với: home, products, categories, product detail, cart, checkout.

### Bài 2: Blog với Nested Routes
Tạo blog app với categories, posts, authors, và admin panel.

### Bài 3: Dashboard với Role-based Access
Tạo dashboard với different roles (user, admin, moderator) và protected routes.

### Bài 4: Search & Filter với URL State
Tạo search page với filters được sync với URL parameters.

### Bài 5: Multi-step Form với Routing
Tạo multi-step form với URL cho mỗi step và ability to navigate back/forward.

## Tài Liệu Tham Khảo

- [React Router Documentation](https://reactrouter.com/)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)
- [React Router Examples](https://github.com/remix-run/react-router/tree/dev/examples)
