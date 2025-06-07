# Styling và UI trong NextJS

## Tổng quan về Styling Options

NextJS hỗ trợ nhiều cách để styling ứng dụng, từ CSS truyền thống đến các giải pháp CSS-in-JS hiện đại.

### Các phương pháp Styling:
- **CSS Modules**: Scoped CSS
- **Styled Components**: CSS-in-JS
- **Tailwind CSS**: Utility-first CSS
- **SASS/SCSS**: CSS preprocessor
- **Emotion**: CSS-in-JS library
- **Chakra UI/Material-UI**: Component libraries

## CSS Modules

### Setup và sử dụng
```css
/* styles/Home.module.css */
.container {
  min-height: 100vh;
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.main {
  padding: 5rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.title {
  margin: 0;
  line-height: 1.15;
  font-size: 4rem;
  text-align: center;
}

.title a {
  color: #0070f3;
  text-decoration: none;
}

.title a:hover,
.title a:focus,
.title a:active {
  text-decoration: underline;
}

.description {
  text-align: center;
  line-height: 1.5;
  font-size: 1.5rem;
}

.grid {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 800px;
  margin-top: 3rem;
}

.card {
  margin: 1rem;
  padding: 1.5rem;
  text-align: left;
  color: inherit;
  text-decoration: none;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  transition: color 0.15s ease, border-color 0.15s ease;
  width: 45%;
}

.card:hover,
.card:focus,
.card:active {
  color: #0070f3;
  border-color: #0070f3;
}

.card h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.card p {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.5;
}

/* Responsive design */
@media (max-width: 600px) {
  .grid {
    width: 100%;
    flex-direction: column;
  }
  
  .card {
    width: 100%;
  }
}
```

```javascript
// pages/index.js
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Chào mừng đến với <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Bắt đầu bằng cách chỉnh sửa{' '}
          <code>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Tài liệu &rarr;</h2>
            <p>Tìm hiểu về NextJS features và API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Học &rarr;</h2>
            <p>Học NextJS trong một khóa học tương tác với quiz!</p>
          </a>
        </div>
      </main>
    </div>
  );
}
```

### Component CSS Modules
```css
/* components/Button.module.css */
.button {
  background: #0070f3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.button:hover {
  background: #0051a2;
  transform: translateY(-1px);
}

.button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.primary {
  background: #0070f3;
}

.secondary {
  background: #6c757d;
}

.danger {
  background: #dc3545;
}

.large {
  padding: 1rem 2rem;
  font-size: 1.25rem;
}

.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
```

```javascript
// components/Button.js
import styles from './Button.module.css';
import { clsx } from 'clsx'; // Utility for combining classes

function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  onClick,
  ...props 
}) {
  const buttonClass = clsx(
    styles.button,
    styles[variant],
    size !== 'medium' && styles[size],
    disabled && styles.disabled
  );

  return (
    <button 
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
```

## Tailwind CSS

### Setup Tailwind
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        secondary: {
          500: '#6366f1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .btn {
    @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors;
  }
  
  .btn-primary {
    @apply btn bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500;
  }
  
  .btn-secondary {
    @apply btn bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500;
  }
  
  .card {
    @apply bg-white shadow rounded-lg p-6 border border-gray-200;
  }
  
  .form-input {
    @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

### Tailwind Components
```javascript
// components/Card.js
function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// components/ProductCard.js
function ProductCard({ product, onAddToCart }) {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover rounded-md group-hover:scale-105 transition-transform"
        />
        {product.discount && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
            -{product.discount}%
          </span>
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-3">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-primary-600">
              {product.price.toLocaleString()} VND
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {product.originalPrice.toLocaleString()} VND
              </span>
            )}
          </div>
          
          <button 
            onClick={() => onAddToCart(product)}
            className="btn-primary"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </Card>
  );
}

export default ProductCard;
```

### Responsive Design với Tailwind
```javascript
// components/Layout.js
function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                MyApp
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                Trang chủ
              </a>
              <a href="/products" className="text-gray-600 hover:text-gray-900">
                Sản phẩm
              </a>
              <a href="/about" className="text-gray-600 hover:text-gray-900">
                Giới thiệu
              </a>
            </nav>
            
            <div className="md:hidden">
              <button className="text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Về chúng tôi</h3>
              <p className="text-gray-300">
                Công ty chuyên cung cấp các sản phẩm chất lượng cao.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/" className="hover:text-white">Trang chủ</a></li>
                <li><a href="/products" className="hover:text-white">Sản phẩm</a></li>
                <li><a href="/contact" className="hover:text-white">Liên hệ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Theo dõi</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-300 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-300 hover:text-white">Instagram</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
```

## Styled Components

### Setup Styled Components
```bash
npm install styled-components
npm install -D babel-plugin-styled-components
```

```javascript
// .babelrc
{
  "presets": ["next/babel"],
  "plugins": [["styled-components", { "ssr": true }]]
}
```

```javascript
// pages/_document.js
import Document from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }
}
```

### Styled Components Examples
```javascript
// components/styled/Button.js
import styled, { css } from 'styled-components';

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  ${props => props.variant === 'primary' && css`
    background-color: #3b82f6;
    color: white;
    
    &:hover {
      background-color: #2563eb;
    }
  `}

  ${props => props.variant === 'secondary' && css`
    background-color: #e5e7eb;
    color: #374151;
    
    &:hover {
      background-color: #d1d5db;
    }
  `}

  ${props => props.size === 'large' && css`
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  `}

  ${props => props.size === 'small' && css`
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  `}

  ${props => props.fullWidth && css`
    width: 100%;
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default Button;
```

```javascript
// components/styled/Card.js
import styled from 'styled-components';

export const Card = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s ease-in-out;

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

export const CardHeader = styled.div`
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }
  
  p {
    margin: 0.25rem 0 0 0;
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

export const CardBody = styled.div`
  margin-bottom: 1rem;
`;

export const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;
```

### Theme Provider
```javascript
// themes/theme.js
export const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      900: '#1e3a8a',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      500: '#6b7280',
      900: '#111827',
    },
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
};
```

```javascript
// pages/_app.js
import { ThemeProvider } from 'styled-components';
import { theme } from '../themes/theme';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
```

## Component Libraries

### Chakra UI Setup
```bash
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

```javascript
// pages/_app.js
import { ChakraProvider } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      100: '#f7fafc',
      900: '#1a202c',
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
```

```javascript
// components/ProductGrid.js
import {
  SimpleGrid,
  Box,
  Image,
  Text,
  Button,
  Badge,
  Stack,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';

function ProductCard({ product }) {
  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={useColorModeValue('white', 'gray.800')}
      shadow="md"
      _hover={{ shadow: 'lg' }}
      transition="all 0.2s"
    >
      <Image src={product.image} alt={product.name} h="200px" w="full" objectFit="cover" />
      
      <Box p="6">
        <Box display="flex" alignItems="baseline">
          {product.isNew && (
            <Badge borderRadius="full" px="2" colorScheme="teal">
              Mới
            </Badge>
          )}
          <Box
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            ml="2"
          >
            {product.category}
          </Box>
        </Box>

        <Heading as="h3" size="md" mt="1" fontWeight="semibold" lineHeight="tight" noOfLines={2}>
          {product.name}
        </Heading>

        <Text color="gray.600" fontSize="sm" mt="2" noOfLines={3}>
          {product.description}
        </Text>

        <Stack direction="row" align="center" justify="space-between" mt="4">
          <Text fontWeight="bold" fontSize="lg" color="brand.900">
            {product.price.toLocaleString()} VND
          </Text>
          <Button colorScheme="blue" size="sm">
            Thêm vào giỏ
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

function ProductGrid({ products }) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </SimpleGrid>
  );
}

export default ProductGrid;
```

## Dark Mode Implementation

### Tailwind Dark Mode
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media'
  // ... rest of config
}
```

```javascript
// hooks/useDarkMode.js
import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(stored ? JSON.parse(stored) : prefersDark);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return [isDark, setIsDark];
}
```

```javascript
// components/ThemeToggle.js
import { useDarkMode } from '../hooks/useDarkMode';

function ThemeToggle() {
  const [isDark, setIsDark] = useDarkMode();

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
    >
      {isDark ? '🌞' : '🌙'}
    </button>
  );
}

export default ThemeToggle;
```

## Performance Optimization

### CSS Optimization
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

### Critical CSS
```javascript
// pages/_app.js
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Remove server-side injected CSS
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
```

## Best Practices

### 1. CSS Organization
```
styles/
  ├── globals.css
  ├── components/
  │   ├── Button.module.css
  │   └── Card.module.css
  ├── pages/
  │   ├── Home.module.css
  │   └── About.module.css
  └── utils/
      └── utilities.css
```

### 2. Responsive Design
```css
/* Mobile-first approach */
.container {
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 3rem;
  }
}
```

### 3. Performance
```javascript
// Lazy load heavy CSS
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});
```

## Tóm tắt

- CSS Modules cho scoped styling
- Tailwind CSS cho utility-first approach
- Styled Components cho CSS-in-JS
- Component libraries cho rapid development
- Dark mode support với theme switching
- Performance optimization với critical CSS

## Bài tập thực hành

1. E-commerce Interface:
   - Product grid với responsive design
   - Shopping cart với animations
   - Dark/light theme toggle

2. Dashboard với Chakra UI:
   - Charts và data visualization
   - Responsive sidebar navigation
   - Form components với validation

3. Blog Theme với Tailwind:
   - Typography system
   - Code syntax highlighting
   - SEO-optimized layouts
