

# 🚀 Node.js Complete Learning Roadmap

> ✅ **HOÀN THÀNH** - Roadmap đầy đủ với 45+ modules chi tiết, 200+ examples, và 100+ exercises

## 📁 [📖 Xem roadmap chi tiết tại: /example/](./example/)

### 🎯 Quick Links:
- [📋 README Overview](./example/README.md) - Tổng quan và hướng dẫn sử dụng
- [🎓 Completion Guide](./example/ROADMAP-COMPLETION-GUIDE.md) - Hướng dẫn hoàn thành chi tiết

### 📚 Video Resources:
- [Next.js Playlist](https://www.youtube.com/playlist?list=PLFfVmM19UNqn1ZIWvxn1artfz-C6dgAFb)
- [Express.js Playlist](https://www.youtube.com/playlist?list=PLncHg6Kn2JT4smWdJceM0bDg4YUF3yqLu)  
- [React.js Tutorial](https://youtu.be/hoMAVLW-66c)

---

## Nền tảng JavaScript & Web

### 1. JavaScript Cơ Bản

* Biến, hàm, vòng lặp, điều kiện
* Scope, Closure
* Array, Object
* Callback, Promise, Async/Await
* Module (CommonJS vs ESM)

### 2. Kiến thức Web cơ bản

* HTTP & HTTPS
* RESTful API là gì
* Request/Response
* Status Codes
* JSON

---

## Node.js Core

### 3. Tổng quan về Node.js

* Node.js là gì? Tại sao nên dùng?
* Event Loop và cơ chế non-blocking I/O

### 4. Các module cốt lõi của Node.js

* `fs` (File System)
* `http`
* `path`
* `process`
* `events`

### 5. Quản lý gói với NPM/Yarn/pnpm (nên dùng npm cho đồng bộ)

* `package.json`
* Cài đặt dependency
* Script command

---

## 🔧 Giai đoạn 3: ExpressJS – Viết Backend API

### 6. Cài đặt và cấu trúc dự án với Express

* Tạo server Express
* Cấu trúc thư mục backend theo module

### 7. Route & Middleware

* Tạo các route
* `req`, `res`, `next`
* Custom middleware
* Error handling middleware

### 8. Làm việc với dữ liệu

* RESTful API (GET, POST, PUT, DELETE)
* Body parsing (`express.json()`)
* Query Params vs Path Params

### 9. Xác thực & bảo mật

* JWT authentication
* CORS
* Helmet / Rate Limiting

### 10. Kết nối với cơ sở dữ liệu

* MongoDB (với Mongoose) hoặc PostgreSQL (với Prisma/Knex, prisma sẽ dễ tiếp cận hơn)
* CRUD cơ bản

---

## NextJS – Fullstack App với SSR/CSR

### 11. NextJS Cơ bản

* Pages vs App Router
* File-based routing
* SSR vs CSR vs SSG
* API Routes

### 12. Tích hợp backend với NextJS

* Gọi API từ backend Express
* Hoặc dùng API routes của NextJS thay thế Express

### 13. Authentication trong NextJS

* NextAuth.js hoặc custom token-based

### 14. Kết nối với database

* Prisma + MySQL/PostgreSQL
* ORM model, migration, query

---

## React – Giao diện người dùng (react 18)

### 15. React Fundamentals

* JSX, Component, Props, State
* Event Handling
* Conditional Rendering
* List Rendering

### 16. React Hooks

* `useState`, `useEffect`, `useContext`
* Custom hooks

### 17. Routing trong React

* React Router hoặc dùng hệ thống routing của Next.js,

### 18. Giao tiếp với API

* Fetch API, Axios
* Xử lý loading, error, retry

### 19. UI Frameworks

* TailwindCSS
* shadcn/ui, mantine, heroUI

---

## Testing & Dev Tools

### 20. Testing cơ bản

* Jest / Vitest
* Supertest (cho Express)
* React Testing Library

### 21. Dev Tools

* Nodemon / ts-node-dev
* Debugger
* ESLint + Prettier

---

## Triển khai & Môi trường

### 22. Environment

* `.env` và `dotenv`
* Tách dev/prod

### 23. Deployment

* Express: Deploy trên Railway, Render, hoặc VPS (PM2 + Nginx)
* NextJS: Vercel / Netlify
---

## TypeScript 

* Tạo project với TypeScript
* Kiểu dữ liệu: interface, type, enum
* Type cho Express, React, NextJS
* Zod cho validation ()

