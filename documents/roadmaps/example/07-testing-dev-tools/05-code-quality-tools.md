# Code Quality Tools

## Giới thiệu

Code quality tools giúp duy trì standards, tìm bugs, và đảm bảo consistency trong codebase. Phần này sẽ cover các tools essential cho professional development.

## ESLint - JavaScript Linting

### 1. ESLint Setup

#### Installation

```bash
# Initialize ESLint
npm init @eslint/config

# Manual installation
npm install --save-dev eslint

# Popular presets
npm install --save-dev @eslint/js @eslint/config-standard
npm install --save-dev eslint-config-airbnb eslint-plugin-import eslint-plugin-react eslint-plugin-jsx-a11y

# TypeScript support
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

#### Basic Configuration

```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    '@eslint/js/recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': 'error',
    'curly': 'error'
  }
};
```

### 2. React ESLint Configuration

```javascript
// .eslintrc.js for React
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended'
  ],
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // React specific rules
    'react/prop-types': 'warn',
    'react/jsx-uses-react': 'off', // React 17+
    'react/react-in-jsx-scope': 'off', // React 17+
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/jsx-props-no-spreading': 'off',
    
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Accessibility rules
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn'
  }
};
```

### 3. TypeScript ESLint Configuration

```javascript
// .eslintrc.js for TypeScript
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking'
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    
    // Disable conflicting base rules
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error']
  }
};
```

### 4. Custom Rules và Plugins

```javascript
// .eslintrc.js with custom rules
module.exports = {
  extends: ['eslint:recommended'],
  rules: {
    // Custom naming conventions
    'camelcase': ['error', { properties: 'never' }],
    
    // Import/Export rules
    'import/order': ['error', {
      groups: [
        'builtin',
        'external', 
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always'
    }],
    
    // Security rules
    'security/detect-eval-with-expression': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    
    // Performance rules
    'react/jsx-no-bind': 'warn',
    'react/jsx-no-leaked-render': 'error'
  },
  plugins: ['import', 'security']
};
```

## Prettier - Code Formatting

### 1. Prettier Setup

#### Installation

```bash
# Install Prettier
npm install --save-dev prettier

# ESLint integration
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```

#### Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "jsxSingleQuote": true,
  "jsxBracketSameLine": false
}
```

```javascript
// .prettierrc.js (for more complex config)
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  
  // Override for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200
      }
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always'
      }
    }
  ]
};
```

```
# .prettierignore
node_modules
dist
build
coverage
*.min.js
*.bundle.js
```

### 2. ESLint + Prettier Integration

```javascript
// .eslintrc.js with Prettier
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'prettier', // Must be last to override other configs
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error'
  }
};
```

### 3. Package Scripts

```json
// package.json
{
  "scripts": {
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "quality": "npm run lint && npm run format:check"
  }
}
```

## Husky - Git Hooks

### 1. Husky Setup

#### Installation

```bash
# Install Husky
npm install --save-dev husky

# Initialize
npx husky install

# Add prepare script
npm set-script prepare "husky install"
```

#### Pre-commit Hooks

```bash
# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint"

# Add pre-push hook
npx husky add .husky/pre-push "npm test"
```

```bash
#!/usr/bin/env sh
# .husky/pre-commit
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run format:check
npm test -- --passWithNoTests
```

```bash
#!/usr/bin/env sh
# .husky/pre-push
. "$(dirname -- "$0")/_/husky.sh"

npm run test:coverage
npm run build
```

### 2. lint-staged Integration

```bash
# Install lint-staged
npm install --save-dev lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
#!/usr/bin/env sh
# .husky/pre-commit
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### 3. Commit Message Linting

```bash
# Install commitlint
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# Add commit-msg hook
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting
        'refactor', // Code refactoring
        'test',     // Testing
        'chore',    // Maintenance
        'perf',     // Performance
        'ci',       // CI/CD
        'build'     // Build system
      ]
    ],
    'subject-case': [2, 'never', ['upper-case']],
    'subject-max-length': [2, 'always', 72]
  }
};
```

## EditorConfig

### Configuration

```ini
# .editorconfig
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab

[*.{yml,yaml}]
indent_size = 2

[*.py]
indent_size = 4
```

## SonarQube/SonarCloud

### 1. SonarCloud Setup

```yaml
# sonar-project.properties
sonar.projectKey=my-project-key
sonar.organization=my-org
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.js,**/*.spec.js
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.testExecutionReportPaths=coverage/sonar-report.xml
```

### 2. GitHub Actions Integration

```yaml
# .github/workflows/quality.yml
name: Quality Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Check Prettier
        run: npm run format:check
      
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

## TypeScript Type Checking

### 1. Type Checking Scripts

```json
// package.json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    "build": "tsc",
    "build:watch": "tsc --watch"
  }
}
```

### 2. Strict TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "esnext",
    "moduleResolution": "node",
    "lib": ["ES2020", "DOM"],
    
    // Strict type checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    
    // Additional checks
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    
    // Module resolution
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "build"]
}
```

## Bundle Analysis

### 1. Webpack Bundle Analyzer

```bash
# Install
npm install --save-dev webpack-bundle-analyzer

# Add script
npm install --save-dev cross-env
```

```json
// package.json
{
  "scripts": {
    "analyze": "cross-env ANALYZE=true npm run build",
    "build": "webpack --mode production"
  }
}
```

```javascript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    // Add analyzer in analyze mode
    ...(process.env.ANALYZE ? [new BundleAnalyzerPlugin()] : [])
  ]
};
```

### 2. Next.js Bundle Analysis

```bash
# Install
npm install --save-dev @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Next.js config
});
```

## Performance Monitoring

### 1. Lighthouse CI

```bash
# Install
npm install --save-dev @lhci/cli

# Configuration
```

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "startServerCommand": "npm start"
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

### 2. GitHub Actions Lighthouse

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
```

## VS Code Integration

### 1. Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  
  // ESLint
  "eslint.workingDirectories": ["./"],
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  
  // Prettier
  "prettier.requireConfig": true,
  
  // TypeScript
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  
  // File associations
  "files.associations": {
    "*.env.*": "dotenv"
  }
}
```

### 2. Tasks

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "ESLint",
      "type": "shell",
      "command": "npm",
      "args": ["run", "lint"],
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Format",
      "type": "shell",
      "command": "npm",
      "args": ["run", "format"],
      "group": "build"
    },
    {
      "label": "Type Check",
      "type": "shell",
      "command": "npm",
      "args": ["run", "type-check"],
      "group": "build"
    }
  ]
}
```

## Complete Quality Setup Example

### Project Structure

```
my-project/
├── .husky/
│   ├── pre-commit
│   ├── pre-push
│   └── commit-msg
├── src/
├── tests/
├── .eslintrc.js
├── .prettierrc
├── .editorconfig
├── .gitignore
├── commitlint.config.js
├── jest.config.js
├── tsconfig.json
└── package.json
```

### Complete package.json

```json
{
  "name": "my-project",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "quality": "npm run lint && npm run format:check && npm run type-check && npm run test",
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests --passWithNoTests"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  },
  "devDependencies": {
    "@commitlint/cli": "^17.0.0",
    "@commitlint/config-conventional": "^17.0.0",
    "@typescript-eslint/eslint-plugin": "^5.0.0",
    "@typescript-eslint/parser": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^13.0.0",
    "eslint-config-prettier": "^8.0.0",
    "eslint-plugin-prettier": "^4.0.0",
    "husky": "^8.0.0",
    "jest": "^29.0.0",
    "lint-staged": "^13.0.0",
    "prettier": "^2.0.0",
    "typescript": "^4.0.0"
  }
}
```

## Best Practices

### 1. Team Standards

```javascript
// .eslintrc.js - Team rules
module.exports = {
  rules: {
    // Enforce consistent coding style
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    
    // Prevent common bugs
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'error',
    
    // Enforce best practices
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': 'error',
    
    // React specific
    'react/prop-types': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

### 2. Gradual Adoption

```javascript
// .eslintrc.js - Gradual migration
module.exports = {
  rules: {
    // Start with warnings
    'no-console': 'warn',
    'prefer-const': 'warn',
    
    // Gradually increase to errors
    'no-unused-vars': 'error',
    'no-debugger': 'error'
  }
};
```

## Exercises

### Exercise 1: Complete Quality Setup
Setup một project với:
- ESLint với React và TypeScript rules
- Prettier formatting
- Husky hooks
- Commit message linting
- GitHub Actions quality checks

### Exercise 2: Custom ESLint Rules
Tạo custom ESLint rules cho:
- Component naming conventions
- Import ordering
- Custom security rules
- Performance best practices

---

**Quality Tools Summary:**
- **ESLint** - Static analysis và linting
- **Prettier** - Code formatting
- **Husky** - Git hooks automation
- **lint-staged** - Run tools on staged files only
- **commitlint** - Enforce commit message standards
- **TypeScript** - Type checking
- **SonarCloud** - Code quality analysis
- **Bundle analyzers** - Performance monitoring
