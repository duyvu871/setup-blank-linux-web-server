# Cài đặt và Cấu hình NextJS

## Mục lục
1. [Tạo NextJS Project](#tạo-nextjs-project)
2. [Project Structure](#project-structure)
3. [Configuration Files](#configuration-files)
4. [Environment Variables](#environment-variables)
5. [Development vs Production](#development-vs-production)
6. [Package Management](#package-management)

## Tạo NextJS Project

### Create Next App (Recommended)

```bash
# Tạo project mới
npx create-next-app@latest my-nextjs-app

# Với TypeScript
npx create-next-app@latest my-nextjs-app --typescript

# Với Tailwind CSS
npx create-next-app@latest my-nextjs-app --tailwind

# Với tất cả options
npx create-next-app@latest my-nextjs-app --typescript --tailwind --eslint --app

# Chạy development server
cd my-nextjs-app
npm run dev
```

### Manual Setup

```bash
# Tạo folder và init npm
mkdir my-nextjs-app
cd my-nextjs-app
npm init -y

# Install NextJS và dependencies
npm install next react react-dom

# Install TypeScript (optional)
npm install --save-dev typescript @types/react @types/node

# Install ESLint (optional)
npm install --save-dev eslint eslint-config-next
```

### Package.json Scripts

```json
{
  "name": "my-nextjs-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "export": "next export"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Project Structure

### App Router Structure (NextJS 13+)

```
my-nextjs-app/
├── app/                    # App Router (mới)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   ├── loading.tsx       # Loading UI
│   ├── error.tsx         # Error UI
│   ├── not-found.tsx     # 404 page
│   ├── about/
│   │   └── page.tsx      # /about route
│   ├── blog/
│   │   ├── page.tsx      # /blog route
│   │   └── [slug]/
│   │       └── page.tsx  # /blog/[slug] route
│   └── api/
│       └── users/
│           └── route.ts  # API endpoint
├── components/            # Reusable components
│   ├── ui/
│   │   ├── button.tsx
│   │   └── modal.tsx
│   └── layout/
│       ├── header.tsx
│       └── footer.tsx
├── lib/                  # Utility functions
│   ├── utils.ts
│   └── db.ts
├── hooks/                # Custom hooks
│   └── useAuth.ts
├── types/                # TypeScript types
│   └── index.ts
├── public/               # Static assets
│   ├── images/
│   └── icons/
├── styles/               # Additional styles
│   └── components.css
├── next.config.js        # NextJS configuration
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

### Pages Router Structure (Legacy)

```
my-nextjs-app/
├── pages/                # Pages Router (legacy)
│   ├── _app.tsx         # Custom App component
│   ├── _document.tsx    # Custom Document
│   ├── index.tsx        # Home page (/)
│   ├── about.tsx        # About page (/about)
│   ├── blog/
│   │   ├── index.tsx    # Blog listing (/blog)
│   │   └── [slug].tsx   # Blog post (/blog/[slug])
│   └── api/
│       └── users.ts     # API endpoint
├── components/
├── lib/
├── public/
├── styles/
│   ├── globals.css
│   └── Home.module.css
└── next.config.js
```

### Cấu trúc thư mục nâng cao

```
src/
├── app/                  # App directory
├── components/
│   ├── ui/              # Basic UI components
│   │   ├── button/
│   │   │   ├── index.tsx
│   │   │   ├── button.module.css
│   │   │   └── button.test.tsx
│   │   └── input/
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   └── features/        # Feature-specific components
│       ├── auth/
│       ├── blog/
│       └── dashboard/
├── lib/
│   ├── api/            # API utilities
│   ├── auth/           # Authentication logic
│   ├── database/       # Database utilities
│   └── validations/    # Form validations
├── hooks/
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── useLocalStorage.ts
├── store/              # State management
│   ├── authStore.ts
│   └── userStore.ts
├── types/
│   ├── api.ts
│   ├── auth.ts
│   └── database.ts
└── utils/
    ├── constants.ts
    ├── helpers.ts
    └── formatters.ts
```

## Configuration Files

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@prisma/client']
  },
  
  // Image optimization
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true
      }
    ]
  },
  
  // Rewrites
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.example.com/:path*'
      }
    ]
  },
  
  // Headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ]
      }
    ]
  },
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Custom webpack config
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src')
    }
    
    return config
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'custom-value'
  },
  
  // Output configuration
  output: 'standalone', // For Docker deployment
  
  // Internationalization
  i18n: {
    locales: ['en', 'vi'],
    defaultLocale: 'en'
  },
  
  // Performance
  poweredByHeader: false,
  compress: true,
  
  // Security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript"
  ],
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-page-custom-font": "off",
    "prefer-const": "error",
    "no-unused-vars": "warn",
    "@typescript-eslint/no-unused-vars": "warn"
  },
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "rules": {
        "@typescript-eslint/explicit-function-return-type": "off"
      }
    }
  ]
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
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
          50: '#f9fafb',
          500: '#6b7280',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  darkMode: 'class',
}
```

## Environment Variables

### .env Files

```bash
# .env.local (local development - not committed)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# .env.development (development)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_ENV=development

# .env.production (production)
NEXT_PUBLIC_API_URL=https://myapp.com/api
NEXT_PUBLIC_APP_ENV=production

# .env.example (template for other developers)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Environment Variables Usage

```typescript
// lib/env.ts
export const env = {
  // Server-side only
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  
  // Client-side accessible (NEXT_PUBLIC_ prefix)
  API_URL: process.env.NEXT_PUBLIC_API_URL!,
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV!,
} as const

// Type-safe environment validation
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_API_URL'
] as const

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
})

// Usage in components
export default function MyComponent() {
  console.log(env.API_URL) // Accessible on client
  // console.log(env.DATABASE_URL) // Error: not accessible on client
  
  return <div>API URL: {env.API_URL}</div>
}
```

## Development vs Production

### Development Features

```bash
# Development server với fast refresh
npm run dev

# Development với custom port
npm run dev -- -p 3001

# Development với turbo mode
npm run dev -- --turbo
```

### Production Build Process

```bash
# Build for production
npm run build

# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# Start production server
npm run start

# Export static site
npm run export
```

### Build Optimization

```javascript
// next.config.js
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,
  
  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
    
    // React strict mode
    reactStrictMode: true,
    
    // Styled components support
    styledComponents: true
  },
  
  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true
        })
      )
      return config
    }
  })
}
```

### Performance Monitoring

```typescript
// lib/analytics.ts
export function reportWebVitals(metric: any) {
  console.log(metric)
  
  // Send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Example: Google Analytics
    gtag('event', metric.name, {
      custom_parameter_1: metric.value,
      custom_parameter_2: metric.label,
    })
  }
}

// pages/_app.tsx hoặc app/layout.tsx
export { reportWebVitals }
```

## Package Management

### Recommended Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    
    // State management
    "zustand": "^4.0.0",
    "@tanstack/react-query": "^5.0.0",
    
    // Styling
    "tailwindcss": "^3.0.0",
    "clsx": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    
    // Forms
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",
    "zod": "^3.0.0",
    
    // Database
    "@prisma/client": "^5.0.0",
    
    // Authentication
    "next-auth": "^4.0.0",
    
    // Icons
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "prisma": "^5.0.0"
  }
}
```

### Workspace Configuration (Monorepo)

```json
// package.json (root)
{
  "name": "my-nextjs-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^1.0.0"
  }
}

// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {}
  }
}
```

## Best Practices

### 1. Project Organization
- Sử dụng absolute imports với path aliases
- Organize components theo features
- Tách logic business ra khỏi UI components
- Sử dụng TypeScript cho type safety

### 2. Performance
- Enable SWC compiler
- Optimize images với next/image
- Use dynamic imports cho code splitting
- Monitor bundle size

### 3. Development Workflow
- Setup ESLint và Prettier
- Use Git hooks với Husky
- Environment-specific configurations
- Automated testing setup

### 4. Security
- Validate environment variables
- Use HTTPS in production
- Implement proper CORS headers
- Sanitize user inputs

## Exercises

1. **Project Setup**: Tạo NextJS project với TypeScript và Tailwind
2. **Configuration**: Setup custom webpack config và path aliases
3. **Environment**: Implement environment-specific configurations
4. **Optimization**: Analyze và optimize bundle size

## Tổng kết

Proper setup và configuration là foundation của mọi NextJS project. Việc organize code structure tốt, configure tools properly, và setup development workflow hiệu quả sẽ giúp project scalable và maintainable trong dài hạn. NextJS cung cấp nhiều built-in optimizations, nhưng cần hiểu cách configure để tận dụng tối đa performance và developer experience.
