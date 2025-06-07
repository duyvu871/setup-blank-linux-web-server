# Vercel & Netlify Deployment

Vercel và Netlify là hai platform hàng đầu cho việc deploy frontend applications và JAMstack sites, với focus đặc biệt vào performance, developer experience, và global CDN.

## Khi nào dùng Vercel vs Netlify?

### Vercel
**Best for:**
- Next.js applications (được tạo bởi Vercel team)
- React/Vue/Angular SPAs
- Static sites với advanced optimization
- Serverless functions (Edge Functions)
- Teams cần advanced analytics

**Strengths:**
- Tối ưu hoá đặc biệt cho Next.js
- Edge Functions với low latency
- Advanced image optimization
- Built-in analytics và performance insights
- Excellent developer experience

### Netlify
**Best for:**
- Static site generators (Gatsby, Hugo, Jekyll)
- JAMstack applications
- Form handling và user authentication
- Teams cần CMS integration
- Simple serverless functions

**Strengths:**
- Powerful build system với plugins
- Built-in form handling
- Identity management
- Git-based CMS options
- Large marketplace của plugins

## Vercel Deployment

### Getting Started với Vercel

#### 1. Project Setup cho Next.js

```bash
# Tạo Next.js project
npx create-next-app@latest my-vercel-app
cd my-vercel-app

# Project structure
my-vercel-app/
├── pages/
│   ├── api/
│   │   └── hello.js
│   ├── _app.js
│   └── index.js
├── public/
├── styles/
├── package.json
└── vercel.json (optional)
```

**package.json:**
```json
{
  "name": "my-vercel-app",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "13.4.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
```

#### 2. Environment Variables

```bash
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://localhost:5432/myapp
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_...

# .env.example
NEXT_PUBLIC_API_URL=
DATABASE_URL=
JWT_SECRET=
STRIPE_SECRET_KEY=
```

**Environment Variables Setup:**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Public environment variables
  publicRuntimeConfig: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Server-only environment variables
  serverRuntimeConfig: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  },
}

module.exports = nextConfig
```

#### 3. API Routes

```javascript
// pages/api/users.js
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { db } = await connectToDatabase();
        const users = await db.collection('users').find({}).toArray();
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
      }
      break;

    case 'POST':
      try {
        const { name, email } = req.body;
        const { db } = await connectToDatabase();
        
        const result = await db.collection('users').insertOne({
          name,
          email,
          createdAt: new Date(),
        });
        
        res.status(201).json({ id: result.insertedId });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
```

#### 4. Deployment Configuration

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 10
    }
  },
  "regions": ["hnd1", "sfo1"],
  "github": {
    "silent": true
  }
}
```

### Deployment Methods

#### Method 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

#### Method 2: GitHub Integration

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/my-vercel-app.git
git push -u origin main

# 2. Import project tại vercel.com
# - Connect GitHub
# - Select repository
# - Configure settings
# - Deploy
```

#### Method 3: Git Hooks

```bash
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build project
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
```

### Advanced Vercel Features

#### Edge Functions

```javascript
// pages/api/edge/geolocation.js
export const config = {
  runtime: 'edge',
}

export default function handler(req) {
  const { nextUrl, geo } = req
  
  return new Response(
    JSON.stringify({
      city: geo.city,
      country: geo.country,
      region: geo.region,
      latitude: geo.latitude,
      longitude: geo.longitude,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
```

#### Image Optimization

```javascript
// components/OptimizedImage.js
import Image from 'next/image'

export default function OptimizedImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
      priority={props.priority || false}
      quality={85}
      {...props}
    />
  )
}

// next.config.js
module.exports = {
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/webp', 'image/avif'],
  },
}
```

## Netlify Deployment

### Getting Started với Netlify

#### 1. Static Site Setup

```bash
# Tạo static site project
mkdir my-netlify-site
cd my-netlify-site

# Project structure
my-netlify-site/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── src/
├── netlify.toml
└── package.json
```

**netlify.toml:**
```toml
[build]
  base = "."
  publish = "public"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[dev]
  command = "npm start"
  port = 3000
  publish = "public"

[[plugins]]
  package = "@netlify/plugin-sitemap"

[[plugins]]
  package = "netlify-plugin-minify-html"
```

#### 2. Build Scripts

```json
{
  "name": "my-netlify-site",
  "scripts": {
    "start": "live-server public",
    "build": "webpack --mode production",
    "dev": "webpack serve --mode development",
    "test": "jest"
  },
  "devDependencies": {
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.4",
    "live-server": "^1.2.2"
  }
}
```

#### 3. Netlify Functions

```javascript
// netlify/functions/hello.js
exports.handler = async (event, context) => {
  const { httpMethod, body, queryStringParameters } = event;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    switch (httpMethod) {
      case 'GET':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message: 'Hello from Netlify Functions!',
            timestamp: new Date().toISOString(),
            query: queryStringParameters,
          }),
        };

      case 'POST':
        const data = JSON.parse(body);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message: 'Data received',
            data,
          }),
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

#### 4. Form Handling

```html
<!-- public/contact.html -->
<form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field">
  <input type="hidden" name="form-name" value="contact" />
  
  <!-- Honeypot field -->
  <p style="display: none;">
    <label>Don't fill this out: <input name="bot-field" /></label>
  </p>
  
  <div>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required />
  </div>
  
  <div>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required />
  </div>
  
  <div>
    <label for="message">Message:</label>
    <textarea id="message" name="message" required></textarea>
  </div>
  
  <button type="submit">Send Message</button>
</form>
```

### React App trên Netlify

#### 1. Create React App Setup

```bash
# Tạo React app
npx create-react-app my-netlify-react-app
cd my-netlify-react-app

# Build script trong package.json
{
  "scripts": {
    "build": "react-scripts build",
    "postbuild": "react-snap"
  }
}
```

#### 2. Routing với React Router

```javascript
// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
```

**_redirects file cho SPA:**
```
# public/_redirects
/*    /index.html   200
```

#### 3. Environment Variables

```bash
# .env.production
REACT_APP_API_URL=https://your-api.netlify.app
REACT_APP_ANALYTICS_ID=your_analytics_id

# .env.development
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ANALYTICS_ID=dev_analytics_id
```

```javascript
// src/config/api.js
const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  analyticsId: process.env.REACT_APP_ANALYTICS_ID,
};

export default config;
```

### Advanced Features

#### Netlify Identity

```javascript
// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import netlifyIdentity from 'netlify-identity-widget';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Netlify Identity
    netlifyIdentity.init({
      APIUrl: 'https://your-site.netlify.app/.netlify/identity'
    });

    // Check for existing user
    const existingUser = netlifyIdentity.currentUser();
    if (existingUser) {
      setUser(existingUser);
    }

    // Listen for auth events
    netlifyIdentity.on('login', (user) => {
      setUser(user);
      netlifyIdentity.close();
    });

    netlifyIdentity.on('logout', () => {
      setUser(null);
    });

    setLoading(false);
  }, []);

  const login = () => netlifyIdentity.open('login');
  const logout = () => netlifyIdentity.logout();
  const signup = () => netlifyIdentity.open('signup');

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Split Testing

```javascript
// netlify/functions/ab-test.js
const variants = ['A', 'B'];

exports.handler = async (event) => {
  const userAgent = event.headers['user-agent'];
  const ip = event.headers['x-forwarded-for'] || event.headers['x-real-ip'];
  
  // Simple hash-based assignment
  const hash = [...(ip + userAgent)].reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const variant = variants[Math.abs(hash) % variants.length];
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `ab_test=${variant}; Path=/; Max-Age=86400`
    },
    body: JSON.stringify({ variant })
  };
};
```

## Performance Optimization

### Vercel Optimization

#### 1. Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Your config
});

# Analyze bundle
ANALYZE=true npm run build
```

#### 2. Code Splitting

```javascript
// Dynamic imports
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('../components/Heavy'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable SSR for this component
});

// Route-based splitting
const HomePage = dynamic(() => import('../pages/Home'));
const AboutPage = dynamic(() => import('../pages/About'));
```

#### 3. ISR (Incremental Static Regeneration)

```javascript
// pages/posts/[id].js
export async function getStaticProps({ params }) {
  const post = await fetchPost(params.id);

  return {
    props: {
      post,
    },
    // Regenerate page at most once every 60 seconds
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const posts = await fetchPopularPosts();

  return {
    paths: posts.map((post) => ({
      params: { id: post.id },
    })),
    fallback: 'blocking', // Enable ISR for other pages
  };
}
```

### Netlify Optimization

#### 1. Build Optimization

```toml
# netlify.toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_ENV = "production"
  NODE_OPTIONS = "--max_old_space_size=4096"

[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.html]
  pretty_urls = true

[build.processing.images]
  compress = true
```

#### 2. Asset Optimization

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets/images',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: { progressive: true, quality: 85 },
              optipng: { enabled: false },
              pngquant: { quality: [0.65, 0.90], speed: 4 },
              gifsicle: { interlaced: false },
              webp: { quality: 85 }
            },
          },
        ],
      },
    ],
  },
};
```

## Monitoring và Analytics

### Vercel Analytics

```javascript
// pages/_app.js
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

// Custom event tracking
import { track } from '@vercel/analytics';

const handleButtonClick = () => {
  track('Button Clicked', { page: 'homepage' });
};
```

### Netlify Analytics

```html
<!-- Add to <head> -->
<script>
  window.netlifyAnalytics = {
    userId: 'user-123',
    customProperties: {
      version: '1.0.0',
      plan: 'premium'
    }
  };
</script>
```

## CI/CD Integration

### GitHub Actions với Vercel

```yaml
# .github/workflows/vercel.yml
name: Vercel Production Deployment
env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

on:
  push:
    branches:
      - main

jobs:
  Deploy-Production:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
        
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Netlify Build Hooks

```javascript
// netlify/functions/trigger-build.js
exports.handler = async (event, context) => {
  const webhook = process.env.NETLIFY_BUILD_HOOK;
  
  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trigger: 'api',
        timestamp: new Date().toISOString(),
      }),
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Build triggered successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

## Hands-on Exercises

### Exercise 1: Next.js App với Vercel

**Tạo blog app:**
```bash
npx create-next-app@latest my-blog --typescript --tailwind --eslint
cd my-blog
```

**Dynamic routing:**
```javascript
// pages/posts/[slug].js
import { GetStaticProps, GetStaticPaths } from 'next';

interface Post {
  slug: string;
  title: string;
  content: string;
  date: string;
}

export default function Post({ post }: { post: Post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <time>{post.date}</time>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await fetchPost(params?.slug as string);
  
  return {
    props: { post },
    revalidate: 3600, // Revalidate every hour
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await fetchAllPosts();
  
  return {
    paths: posts.map(post => ({ params: { slug: post.slug } })),
    fallback: 'blocking',
  };
};
```

### Exercise 2: React SPA với Netlify

**Setup React app với routing:**
```javascript
// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
```

**Contact form với Netlify:**
```javascript
// src/components/ContactForm.tsx
import { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'contact',
          ...formData
        }).toString()
      });
      
      alert('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      alert('Error sending message');
    }
  };

  return (
    <form name="contact" method="POST" data-netlify="true" onSubmit={handleSubmit}>
      <input type="hidden" name="form-name" value="contact" />
      
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        placeholder="Your Name"
        required
      />
      
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        placeholder="Your Email"
        required
      />
      
      <textarea
        name="message"
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
        placeholder="Your Message"
        required
      />
      
      <button type="submit">Send Message</button>
    </form>
  );
};

export default ContactForm;
```

## Tài nguyên tham khảo

### Vercel
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Examples](https://github.com/vercel/examples)
- [Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions)

### Netlify
- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Netlify Identity](https://docs.netlify.com/visitor-access/identity/)
- [JAMstack Best Practices](https://jamstack.org/best-practices/)

---

**So sánh nhanh:**

| Feature | Vercel | Netlify |
|---------|--------|---------|
| **Best for** | Next.js, React apps | Static sites, JAMstack |
| **Build time** | Very fast | Fast |
| **Functions** | Edge Functions | Serverless Functions |
| **Free tier** | Generous | Very generous |
| **Analytics** | Built-in (paid) | Built-in |
| **Forms** | Custom solution | Built-in |
| **Identity** | Custom solution | Built-in |
| **CDN** | Global | Global |

**Tips chọn platform:**
- **Chọn Vercel** nếu: Sử dụng Next.js, cần Edge Functions, focus vào performance
- **Chọn Netlify** nếu: Static site, cần form handling, CMS integration, plugins ecosystem
