# Pages và Routing trong NextJS

## Tổng quan về File-based Routing

NextJS sử dụng hệ thống routing dựa trên file system, nơi mỗi file trong thư mục `pages/` tự động trở thành một route.

### Cấu trúc cơ bản
```
pages/
  ├── index.js           // Route: /
  ├── about.js           // Route: /about
  ├── contact.js         // Route: /contact
  └── blog/
      ├── index.js       // Route: /blog
      └── post.js        // Route: /blog/post
```

### Tạo page đơn giản
```javascript
// pages/about.js
function About() {
  return (
    <div>
      <h1>Về chúng tôi</h1>
      <p>Đây là trang giới thiệu về công ty.</p>
    </div>
  );
}

export default About;
```

## Dynamic Routes (Route động)

### Single Dynamic Route
```javascript
// pages/posts/[id].js
import { useRouter } from 'next/router';

function Post() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>Bài viết #{id}</h1>
      <p>Nội dung bài viết với ID: {id}</p>
    </div>
  );
}

export default Post;
```

### Multiple Dynamic Routes
```javascript
// pages/blog/[category]/[slug].js
import { useRouter } from 'next/router';

function BlogPost() {
  const router = useRouter();
  const { category, slug } = router.query;

  return (
    <div>
      <h1>Danh mục: {category}</h1>
      <h2>Bài viết: {slug}</h2>
    </div>
  );
}

export default BlogPost;
```

### Catch-all Routes
```javascript
// pages/docs/[...slug].js
import { useRouter } from 'next/router';

function Docs() {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <div>
      <h1>Tài liệu</h1>
      <p>Đường dẫn: {Array.isArray(slug) ? slug.join('/') : slug}</p>
    </div>
  );
}

export default Docs;
```

## Navigation với Link Component

### Cách sử dụng Link
```javascript
import Link from 'next/link';

function Navigation() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/">
            <a>Trang chủ</a>
          </Link>
        </li>
        <li>
          <Link href="/about">
            <a>Giới thiệu</a>
          </Link>
        </li>
        <li>
          <Link href="/posts/1">
            <a>Bài viết đầu tiên</a>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
```

### Dynamic Navigation
```javascript
import Link from 'next/link';

function PostList({ posts }) {
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <Link href={`/posts/${post.id}`}>
            <a>{post.title}</a>
          </Link>
        </div>
      ))}
    </div>
  );
}
```

### Programmatic Navigation
```javascript
import { useRouter } from 'next/router';

function LoginForm() {
  const router = useRouter();

  const handleLogin = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      if (response.success) {
        // Chuyển hướng sau khi đăng nhập thành công
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Form content */}
    </form>
  );
}
```

## Nested Routes và Layout

### Nested Layout Pattern
```javascript
// components/Layout.js
import Navbar from './Navbar';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default Layout;
```

```javascript
// pages/_app.js
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
```

### Conditional Layout
```javascript
// pages/_app.js
function MyApp({ Component, pageProps }) {
  // Sử dụng layout được định nghĩa ở component level
  const getLayout = Component.getLayout || ((page) => page);

  return getLayout(<Component {...pageProps} />);
}

// pages/admin/dashboard.js
import AdminLayout from '../../components/AdminLayout';

function Dashboard() {
  return <div>Admin Dashboard</div>;
}

Dashboard.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default Dashboard;
```

## Route Guards và Middleware

### Protecting Routes
```javascript
// components/ProtectedRoute.js
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div>Đang tải...</div>;
  if (!user) return null;

  return children;
}

export default ProtectedRoute;
```

### Middleware (NextJS 12+)
```javascript
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Kiểm tra authentication cho admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token');
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect từ old URLs
  if (request.nextUrl.pathname === '/old-path') {
    return NextResponse.redirect(new URL('/new-path', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/old-path']
};
```

## API Routes

### Tạo API Endpoint
```javascript
// pages/api/users.js
export default function handler(req, res) {
  if (req.method === 'GET') {
    // Lấy danh sách users
    const users = [
      { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com' },
      { id: 2, name: 'Trần Thị B', email: 'b@example.com' }
    ];
    res.status(200).json(users);
  } else if (req.method === 'POST') {
    // Tạo user mới
    const { name, email } = req.body;
    const newUser = { id: Date.now(), name, email };
    res.status(201).json(newUser);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
```

### Dynamic API Routes
```javascript
// pages/api/users/[id].js
export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Lấy thông tin user theo ID
    const user = getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } else if (req.method === 'PUT') {
    // Cập nhật user
    const updatedUser = updateUser(id, req.body);
    res.status(200).json(updatedUser);
  } else if (req.method === 'DELETE') {
    // Xóa user
    deleteUser(id);
    res.status(204).end();
  }
}
```

## Route Parameters và Query

### Accessing Route Parameters
```javascript
// pages/products/[category]/[id].js
import { useRouter } from 'next/router';

function Product() {
  const router = useRouter();
  const { category, id, color, size } = router.query;

  return (
    <div>
      <h1>Sản phẩm ID: {id}</h1>
      <p>Danh mục: {category}</p>
      {color && <p>Màu sắc: {color}</p>}
      {size && <p>Kích thước: {size}</p>}
    </div>
  );
}

export default Product;
```

### Shallow Routing
```javascript
import { useRouter } from 'next/router';

function ProductFilter() {
  const router = useRouter();

  const applyFilter = (filterType, value) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, [filterType]: value }
      },
      undefined,
      { shallow: true } // Không reload page
    );
  };

  return (
    <div>
      <button onClick={() => applyFilter('color', 'red')}>
        Màu đỏ
      </button>
      <button onClick={() => applyFilter('size', 'large')}>
        Size L
      </button>
    </div>
  );
}
```

## Best Practices

### 1. Route Organization
```
pages/
  ├── index.js
  ├── about.js
  └── products/
      ├── index.js
      ├── [id].js
      └── categories/
          ├── index.js
          └── [category].js
```

### 2. Loading States
```javascript
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

function MyComponent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  if (loading) return <div>Đang chuyển trang...</div>;

  return <div>Nội dung trang</div>;
}
```

### 3. Error Handling
```javascript
// pages/404.js
export default function Custom404() {
  return (
    <div>
      <h1>404 - Không tìm thấy trang</h1>
      <p>Trang bạn đang tìm kiếm không tồn tại.</p>
    </div>
  );
}

// pages/500.js
export default function Custom500() {
  return (
    <div>
      <h1>500 - Lỗi server</h1>
      <p>Đã xảy ra lỗi trên server.</p>
    </div>
  );
}
```

## Tóm tắt

- NextJS sử dụng file-based routing system
- Dynamic routes với `[param]` syntax
- Link component cho navigation tối ưu
- API routes cho backend functionality
- Middleware cho route protection
- Shallow routing cho URL updates
- Custom error pages cho UX tốt hơn

## Bài tập thực hành

1. Tạo blog system với:
   - Trang chủ hiển thị danh sách bài viết
   - Trang chi tiết bài viết với dynamic route
   - Trang danh mục với nested routes

2. Implement authentication system:
   - Login/Register pages
   - Protected admin routes
   - Middleware cho route guards

3. Xây dựng e-commerce routes:
   - Products listing với filters
   - Product detail pages
   - Shopping cart với API routes
