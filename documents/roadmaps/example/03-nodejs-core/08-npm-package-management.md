# NPM và Package Management

## 1. NPM là gì?

NPM (Node Package Manager) là package manager mặc định của Node.js, cho phép cài đặt và quản lý các thư viện JavaScript.

### NPM Registry
- Repository online chứa hơn 1 triệu packages
- Miễn phí cho open source packages
- Có thể host private packages

## 2. package.json

### Tạo package.json
```bash
# Interactive mode
npm init

# Quick mode với defaults
npm init -y

# Với specific fields
npm init --name="my-app" --version="1.0.0"
```

### Cấu trúc package.json
```json
{
  "name": "my-node-app",
  "version": "1.0.0",
  "description": "My awesome Node.js application",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "jest",
    "build": "webpack --mode=production"
  },
  "keywords": ["node", "express", "api"],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

### Các fields quan trọng

#### name và version
```json
{
  "name": "my-package",      // Tên package (unique trên NPM)
  "version": "1.2.3"         // Semantic versioning
}
```

#### main
```json
{
  "main": "index.js"         // Entry point của package
}
```

#### scripts
```json
{
  "scripts": {
    "start": "node server.js",           // npm start
    "dev": "nodemon server.js",          // npm run dev  
    "test": "jest",                      // npm test
    "test:watch": "jest --watch",        // npm run test:watch
    "build": "webpack",                  // npm run build
    "lint": "eslint src/",               // npm run lint
    "format": "prettier --write src/"    // npm run format
  }
}
```

## 3. Cài đặt Dependencies

### Types of Dependencies

#### dependencies (Production)
```bash
# Install và save vào dependencies
npm install express
npm install express mongoose dotenv

# Short form
npm i express
```

#### devDependencies (Development only)
```bash
# Install và save vào devDependencies
npm install --save-dev nodemon
npm install --save-dev jest eslint prettier

# Short form
npm i -D nodemon jest
```

#### Global packages
```bash
# Install globally
npm install -g nodemon
npm install -g pm2
npm install -g create-react-app

# Uninstall global
npm uninstall -g nodemon
```

### Version Specification
```json
{
  "dependencies": {
    "express": "4.18.2",        // Exact version
    "mongoose": "^7.0.3",       // Compatible version (7.x.x)
    "lodash": "~4.17.21",       // Approximately equivalent (4.17.x)
    "moment": ">=2.29.0",       // Greater than or equal
    "axios": "latest"           // Latest version (không khuyên dùng)
  }
}
```

### Semantic Versioning (semver)
```
Version format: MAJOR.MINOR.PATCH

Examples:
- 1.0.0 → 1.0.1 (patch: bug fixes)
- 1.0.0 → 1.1.0 (minor: new features, backward compatible)
- 1.0.0 → 2.0.0 (major: breaking changes)

Symbols:
- ^1.2.3 → >=1.2.3 <2.0.0 (compatible version)
- ~1.2.3 → >=1.2.3 <1.3.0 (approximately equivalent)
- 1.2.3  → exactly 1.2.3
```

## 4. package-lock.json

### Tại sao cần package-lock.json?
```json
// package.json
{
  "dependencies": {
    "express": "^4.18.2"
  }
}

// package-lock.json ghi lại version chính xác được cài
{
  "dependencies": {
    "express": {
      "version": "4.18.2",
      "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz",
      "integrity": "sha512-5/PsL6iGPdfQ/lKM1UuielYgv3BUoJfz1aUwU9vHZ+J7gyvwdQXFEBIEIaxeGf0GIcreATNyBExtalisDbuMqQ=="
    }
  }
}
```

### Lợi ích
- **Reproducible builds**: Cùng versions trên mọi environments
- **Security**: Đảm bảo integrity của packages
- **Performance**: Faster installs

## 5. NPM Commands

### Package Management
```bash
# Cài tất cả dependencies từ package.json
npm install

# Cài package mới
npm install package-name
npm install package-name@version

# Update packages
npm update                    # Update tất cả
npm update package-name       # Update specific package

# Uninstall packages
npm uninstall package-name
npm uninstall -g package-name # Global uninstall

# List installed packages
npm list                      # Local packages
npm list -g                   # Global packages
npm list --depth=0            # Top-level only
```

### Package Information
```bash
# View package info
npm info express
npm view express versions     # Available versions

# Check outdated packages
npm outdated

# Check for security vulnerabilities
npm audit
npm audit fix                 # Auto fix vulnerabilities
```

### Cache Management
```bash
# Clean npm cache
npm cache clean --force

# Verify cache
npm cache verify

# View cache location
npm config get cache
```

## 6. NPM Scripts

### Built-in Scripts
```json
{
  "scripts": {
    "start": "node app.js",     // npm start
    "test": "jest",             // npm test
    "prestart": "echo 'Before start'",   // Chạy trước start
    "poststart": "echo 'After start'"    // Chạy sau start
  }
}
```

### Custom Scripts
```json
{
  "scripts": {
    "dev": "nodemon app.js",
    "build": "webpack --mode=production", 
    "deploy": "npm run build && scp -r dist/ user@server:/var/www/",
    "clean": "rm -rf node_modules package-lock.json",
    "fresh": "npm run clean && npm install"
  }
}
```

### Running Scripts
```bash
# Built-in scripts
npm start
npm test

# Custom scripts
npm run dev
npm run build
npm run deploy

# Pass arguments
npm run test -- --watch
npm run build -- --mode=development
```

### Cross-platform Scripts
```json
{
  "scripts": {
    "clean": "rimraf dist",           // Instead of rm -rf
    "copy": "copyfiles src/**/*.html dist",
    "serve": "cross-env NODE_ENV=production node app.js"
  },
  "devDependencies": {
    "rimraf": "^3.0.2",
    "copyfiles": "^2.4.1", 
    "cross-env": "^7.0.3"
  }
}
```

## 7. Alternative Package Managers

### Yarn
```bash
# Install Yarn
npm install -g yarn

# Basic commands
yarn init
yarn add express
yarn add --dev nodemon
yarn install
yarn remove express
yarn upgrade

# Run scripts
yarn start
yarn dev
```

### pnpm
```bash
# Install pnpm
npm install -g pnpm

# Basic commands
pnpm init
pnpm add express
pnpm add -D nodemon
pnpm install
pnpm remove express

# Benefits: Disk space efficient, faster installs
```

### Comparison
| Feature | NPM | Yarn | pnpm |
|---------|-----|------|------|
| Speed | Medium | Fast | Fastest |
| Disk usage | High | High | Low |
| Workspaces | Yes | Yes | Yes |
| Security | Good | Good | Good |

## 8. Publishing Packages

### Preparing Package
```json
{
  "name": "my-awesome-package",
  "version": "1.0.0",
  "description": "An awesome package",
  "main": "index.js",
  "files": [
    "index.js",
    "lib/",
    "README.md"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/username/my-awesome-package.git"
  }
}
```

### Publishing Process
```bash
# 1. Create NPM account
npm adduser

# 2. Login
npm login

# 3. Test package locally
npm pack

# 4. Publish
npm publish

# 5. Update version và publish lại
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0
npm publish
```

## 9. Best Practices

### Security
```bash
# Audit dependencies regularly
npm audit

# Use exact versions cho critical dependencies
{
  "dependencies": {
    "security-critical-package": "1.2.3"  // No ^ or ~
  }
}

# Check package reputation
npm info package-name
# Xem: weekly downloads, last publish date, maintainers
```

### Performance
```bash
# Use .npmrc để optimize
echo "save-exact=true" >> .npmrc        # Save exact versions
echo "progress=false" >> .npmrc         # Disable progress bar
echo "audit=false" >> .npmrc            # Skip audit (faster)
```

### Dependencies Management
```json
{
  "dependencies": {
    // Only production dependencies
    "express": "^4.18.2"
  },
  "devDependencies": {
    // Development tools only
    "nodemon": "^2.0.22",
    "jest": "^29.5.0"
  },
  "peerDependencies": {
    // For libraries - let user choose version
    "react": ">=16.8.0"
  }
}
```

### Project Structure
```
my-project/
├── package.json
├── package-lock.json      // Commit to version control
├── node_modules/          // Add to .gitignore
├── .npmrc                 // NPM configuration
├── .nvmrc                 // Node version specification
└── src/
```

## 10. Troubleshooting

### Common Issues
```bash
# Permission errors (macOS/Linux)
sudo chown -R $(whoami) ~/.npm

# Clear cache
npm cache clean --force

# Remove node_modules và reinstall
rm -rf node_modules package-lock.json
npm install

# Check NPM configuration
npm config list
npm config get registry

# Reset configuration
npm config delete registry
```

### Working behind corporate firewall
```bash
# Set proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Use different registry
npm config set registry https://registry.yarnpkg.com

# For self-signed certificates
npm config set strict-ssl false
```

## Bài tập thực hành

1. Tạo Node.js project với custom npm scripts
2. Publish một simple utility package lên NPM
3. Set up development environment với nodemon và testing
4. Compare performance của npm vs yarn vs pnpm
