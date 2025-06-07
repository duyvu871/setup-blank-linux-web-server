# Server-Side Rendering (SSR) trong NextJS

## Tổng quan về Rendering Methods

NextJS cung cấp nhiều phương pháp rendering khác nhau để tối ưu hiệu suất và SEO:

- **Static Generation (SG)**: HTML được tạo tại build time
- **Server-Side Rendering (SSR)**: HTML được tạo cho mỗi request
- **Client-Side Rendering (CSR)**: HTML được tạo trong browser
- **Incremental Static Regeneration (ISR)**: Kết hợp SG và SSR

## Static Generation với getStaticProps

### Cách sử dụng cơ bản
```javascript
// pages/posts.js
function Posts({ posts }) {
  return (
    <div>
      <h1>Danh sách bài viết</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}

export async function getStaticProps() {
  // Fetch data từ API, database, file system, etc.
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();

  return {
    props: {
      posts
    },
    // Revalidate every 3600 seconds (1 hour)
    revalidate: 3600
  };
}

export default Posts;
```

### Với Database
```javascript
import { connectToDatabase } from '../lib/mongodb';

export async function getStaticProps() {
  try {
    const { db } = await connectToDatabase();
    
    const posts = await db
      .collection('posts')
      .find({ published: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return {
      props: {
        posts: JSON.parse(JSON.stringify(posts))
      },
      revalidate: 1800 // 30 minutes
    };
  } catch (error) {
    return {
      props: {
        posts: []
      }
    };
  }
}
```

## Dynamic Static Generation với getStaticPaths

### Tạo dynamic pages
```javascript
// pages/posts/[id].js
function Post({ post }) {
  if (!post) {
    return <div>Bài viết không tồn tại</div>;
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <p>Tác giả: {post.author}</p>
      <p>Ngày đăng: {new Date(post.createdAt).toLocaleDateString()}</p>
    </article>
  );
}

export async function getStaticPaths() {
  // Lấy danh sách các ID posts để pre-generate
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();

  // Tạo paths cho các posts phổ biến
  const paths = posts.slice(0, 10).map(post => ({
    params: { id: post.id.toString() }
  }));

  return {
    paths,
    fallback: 'blocking' // or true, false
  };
}

export async function getStaticProps({ params }) {
  try {
    const res = await fetch(`https://api.example.com/posts/${params.id}`);
    
    if (!res.ok) {
      return {
        notFound: true
      };
    }

    const post = await res.json();

    return {
      props: {
        post
      },
      revalidate: 3600
    };
  } catch (error) {
    return {
      notFound: true
    };
  }
}

export default Post;
```

### Fallback Strategies
```javascript
export async function getStaticPaths() {
  // Chỉ pre-generate các trang quan trọng
  const popularPosts = await getPopularPosts(10);
  
  const paths = popularPosts.map(post => ({
    params: { id: post.id.toString() }
  }));

  return {
    paths,
    // fallback: false - 404 cho paths không có
    // fallback: true - show loading, then generate
    // fallback: 'blocking' - SSR cho paths không có
    fallback: 'blocking'
  };
}
```

## Server-Side Rendering với getServerSideProps

### SSR cho dynamic content
```javascript
// pages/dashboard.js
function Dashboard({ user, notifications }) {
  return (
    <div>
      <h1>Chào mừng, {user.name}!</h1>
      <div>
        <h2>Thông báo ({notifications.length})</h2>
        {notifications.map(notification => (
          <div key={notification.id}>
            <p>{notification.message}</p>
            <small>{notification.createdAt}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req, res, query } = context;
  
  // Lấy token từ cookies
  const token = req.cookies.authToken;
  
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    };
  }

  try {
    // Fetch user data
    const userRes = await fetch('https://api.example.com/user', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!userRes.ok) {
      throw new Error('User not found');
    }
    
    const user = await userRes.json();
    
    // Fetch notifications
    const notificationsRes = await fetch('https://api.example.com/notifications', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const notifications = await notificationsRes.json();

    return {
      props: {
        user,
        notifications
      }
    };
  } catch (error) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    };
  }
}

export default Dashboard;
```

### SSR với search và filtering
```javascript
// pages/products.js
function Products({ products, filters, totalCount }) {
  return (
    <div>
      <h1>Sản phẩm ({totalCount})</h1>
      <ProductFilters currentFilters={filters} />
      <ProductGrid products={products} />
    </div>
  );
}

export async function getServerSideProps({ query }) {
  const {
    page = 1,
    category,
    minPrice,
    maxPrice,
    sort = 'name'
  } = query;

  // Build API URL với filters
  const params = new URLSearchParams({
    page,
    limit: 20,
    sort
  });

  if (category) params.append('category', category);
  if (minPrice) params.append('minPrice', minPrice);
  if (maxPrice) params.append('maxPrice', maxPrice);

  try {
    const res = await fetch(`https://api.example.com/products?${params}`);
    const data = await res.json();

    return {
      props: {
        products: data.products,
        totalCount: data.total,
        filters: {
          category,
          minPrice,
          maxPrice,
          sort,
          page: parseInt(page)
        }
      }
    };
  } catch (error) {
    return {
      props: {
        products: [],
        totalCount: 0,
        filters: {}
      }
    };
  }
}

export default Products;
```

## Incremental Static Regeneration (ISR)

### On-demand revalidation
```javascript
// pages/posts/[id].js
export async function getStaticProps({ params }) {
  const post = await getPost(params.id);

  return {
    props: {
      post
    },
    // Regenerate page khi có request sau 60 giây
    revalidate: 60
  };
}

// pages/api/revalidate.js
export default async function handler(req, res) {
  // Kiểm tra secret token để bảo mật
  if (req.query.secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    // Trigger revalidation cho page cụ thể
    await res.revalidate(`/posts/${req.query.id}`);
    return res.json({ revalidated: true });
  } catch (err) {
    return res.status(500).send('Error revalidating');
  }
}
```

### ISR với database updates
```javascript
// lib/posts.js
export async function updatePost(id, data) {
  // Cập nhật database
  const updatedPost = await db.posts.update(id, data);
  
  // Trigger ISR revalidation
  await fetch(`${process.env.SITE_URL}/api/revalidate?secret=${process.env.REVALIDATE_SECRET}&id=${id}`);
  
  return updatedPost;
}
```

## So sánh Rendering Methods

### Khi nào sử dụng Static Generation
```javascript
// ✅ Tốt cho: Blog posts, landing pages, documentation
export async function getStaticProps() {
  const posts = await getBlogPosts();
  
  return {
    props: { posts },
    revalidate: 3600 // Update hourly
  };
}
```

### Khi nào sử dụng SSR
```javascript
// ✅ Tốt cho: User dashboard, admin panels, personalized content
export async function getServerSideProps({ req }) {
  const userSession = await getUserSession(req);
  const personalizedData = await getPersonalizedData(userSession.userId);
  
  return {
    props: { personalizedData }
  };
}
```

### Khi nào sử dụng Client-Side Rendering
```javascript
// ✅ Tốt cho: Interactive dashboards, real-time data
import useSWR from 'swr';

function Dashboard() {
  const { data, error } = useSWR('/api/dashboard', fetcher, {
    refreshInterval: 1000 // Update every second
  });

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return <div>{data.content}</div>;
}
```

## Performance Optimization

### Image Optimization với Next/Image
```javascript
import Image from 'next/image';

function ProductCard({ product }) {
  return (
    <div>
      <Image
        src={product.image}
        alt={product.name}
        width={300}
        height={200}
        priority={product.featured} // Load ngay cho featured products
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
      />
      <h3>{product.name}</h3>
    </div>
  );
}
```

### Font Optimization
```javascript
// pages/_app.js
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
});

export default function MyApp({ Component, pageProps }) {
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  );
}
```

### Bundle Analysis
```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer({
  // Your Next.js config
  experimental: {
    appDir: true
  }
});
```

## Error Handling và Loading States

### Error Boundaries
```javascript
// components/ErrorBoundary.js
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h1>Đã xảy ra lỗi.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Loading Components
```javascript
// components/Loading.js
function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  );
}

// pages/posts/[id].js
import { useRouter } from 'next/router';
import Loading from '../../components/Loading';

function Post({ post }) {
  const router = useRouter();

  // Show loading for fallback pages
  if (router.isFallback) {
    return <Loading />;
  }

  return <div>{post.title}</div>;
}
```

## Best Practices

### 1. Choose the right rendering method
- **Static Generation**: Cho content ít thay đổi
- **SSR**: Cho personalized/dynamic content
- **CSR**: Cho interactive features
- **ISR**: Cho content cần cập nhật định kỳ

### 2. Data fetching optimization
```javascript
// Combine multiple API calls
export async function getStaticProps() {
  const [posts, categories, tags] = await Promise.all([
    fetch('/api/posts'),
    fetch('/api/categories'),
    fetch('/api/tags')
  ]);

  return {
    props: {
      posts: await posts.json(),
      categories: await categories.json(),
      tags: await tags.json()
    }
  };
}
```

### 3. Error handling
```javascript
export async function getServerSideProps() {
  try {
    const data = await fetchData();
    return { props: { data } };
  } catch (error) {
    console.error('Data fetch error:', error);
    return {
      props: { data: null },
      // Hoặc redirect đến error page
      // redirect: { destination: '/error', permanent: false }
    };
  }
}
```

## Tóm tắt

- Static Generation tốt cho SEO và performance
- SSR phù hợp cho dynamic, personalized content
- ISR kết hợp lợi ích của cả hai
- getStaticPaths cho dynamic static pages
- getServerSideProps cho real-time data
- Client-side rendering cho interactive features

## Bài tập thực hành

1. Tạo blog với Static Generation:
   - List posts với getStaticProps
   - Post detail với getStaticPaths
   - Implement ISR cho auto-update

2. Xây dựng dashboard với SSR:
   - User authentication check
   - Personalized content
   - Real-time notifications

3. E-commerce product catalog:
   - Static product pages
   - Dynamic search results với SSR
   - Client-side filtering và sorting
