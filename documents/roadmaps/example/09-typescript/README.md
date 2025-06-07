# TypeScript for Node.js

TypeScript đã trở thành standard trong Node.js development hiện đại. Section này sẽ dạy bạn từ cơ bản đến nâng cao về TypeScript trong Node.js.

## 🎯 Mục tiêu học tập

Sau khi hoàn thành section này, bạn sẽ:

- Hiểu được tại sao TypeScript quan trọng trong Node.js
- Thiết lập và cấu hình TypeScript project
- Sử dụng types, interfaces, generics hiệu quả
- Tích hợp TypeScript với Express, MongoDB, và các libraries phổ biến
- Debug và test TypeScript applications
- Deploy TypeScript apps lên production

## 📚 Nội dung

### [1. TypeScript Fundamentals](./01-typescript-fundamentals.md)
- **Lý thuyết**: Tại sao TypeScript? Type safety benefits
- **Thực hành**: Setup project, basic types, interfaces
- **Bài tập**: Tạo TypeScript utility functions

### [2. Advanced TypeScript](./02-advanced-typescript.md)
- **Lý thuyết**: Generics, Union types, Conditional types
- **Thực hành**: Type guards, utility types, decorators
- **Bài tập**: Build type-safe data models

### [3. TypeScript với Express](./03-typescript-express.md)
- **Lý thuyết**: Typing Express applications
- **Thực hành**: Middleware, route handlers, error handling
- **Bài tập**: Build typed REST API

### [4. TypeScript với Database](./04-typescript-database.md)
- **Lý thuyết**: ORM/ODM type integration
- **Thực hành**: Prisma, Mongoose với TypeScript
- **Bài tập**: Type-safe database operations

### [5. Testing TypeScript](./05-testing-typescript.md)
- **Lý thuyết**: Testing strategies cho TypeScript
- **Thực hành**: Jest, type mocking, integration tests
- **Bài tập**: Complete test suite

## 🛠️ Tools và Setup

### Required Tools
```bash
# TypeScript compiler
npm install -g typescript

# Development dependencies
npm install -D @types/node @types/express
npm install -D ts-node nodemon
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Recommended VS Code Extensions
- TypeScript Importer
- Auto Rename Tag
- Bracket Pair Colorizer
- TypeScript Hero

## 🏆 Final Project

**E-commerce API với TypeScript**
- Complete REST API với full type safety
- User authentication & authorization
- Product management với inventory
- Order processing system
- Payment integration
- Comprehensive testing
- Production deployment

## 📈 Learning Path

```
Week 1: TypeScript Fundamentals + Advanced Types
Week 2: Express Integration + Database Types
Week 3: Testing + Final Project
Week 4: Deployment + Best Practices
```

## 🔗 Resources

### Official Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript in Node.js](https://nodejs.org/en/knowledge/getting-started/nodejs-with-typescript/)

### Community Resources
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Total TypeScript](https://www.totaltypescript.com/)
- [TypeScript Exercises](https://typescript-exercises.github.io/)

### Libraries với excellent TypeScript support
- **Web Framework**: Express + @types/express
- **Database**: Prisma, TypeORM, Mongoose
- **Validation**: Zod, Joi
- **Testing**: Jest, Vitest
- **Utilities**: Lodash, Date-fns

---

TypeScript không chỉ là "JavaScript with types" - nó thay đổi cách bạn think về code structure và maintainability. Let's dive in! 🚀
