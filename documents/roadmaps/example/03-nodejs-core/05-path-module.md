# Path Module (Module đường dẫn)

## Tổng quan

Module `path` trong Node.js cung cấp các utilities để làm việc với đường dẫn file và thư mục. Module này rất quan trọng để xử lý đường dẫn một cách cross-platform (hoạt động trên cả Windows, macOS, và Linux).

## Các phương thức chính

### 1. path.join()

Nối các đoạn đường dẫn lại với nhau sử dụng separator phù hợp với OS.

```javascript
const path = require('path');

// Nối đường dẫn
console.log(path.join('/users', 'john', 'documents', 'file.txt'));
// Linux/macOS: /users/john/documents/file.txt
// Windows: \users\john\documents\file.txt

console.log(path.join('src', 'components', 'Header.js'));
// Linux/macOS: src/components/Header.js
// Windows: src\components\Header.js

// Xử lý '..' và '.'
console.log(path.join('/home', 'user', '..', 'admin', './config.json'));
// /home/admin/config.json

// Xử lý đường dẫn trống
console.log(path.join(''));
// '.'
```

### 2. path.resolve()

Giải quyết chuỗi đường dẫn thành đường dẫn tuyệt đối.

```javascript
const path = require('path');

// Resolve đường dẫn từ current working directory
console.log(path.resolve('file.txt'));
// /current/working/directory/file.txt

console.log(path.resolve('/home', 'user', 'documents'));
// /home/user/documents

console.log(path.resolve('src', 'index.js'));
// /current/working/directory/src/index.js

// Với nhiều arguments
console.log(path.resolve('/foo/bar', './baz'));
// /foo/bar/baz

console.log(path.resolve('/foo/bar', '/tmp/file/'));
// /tmp/file

// Trong Node.js applications
console.log(path.resolve(__dirname, 'config', 'database.json'));
// /path/to/your/app/config/database.json
```

### 3. path.basename()

Lấy phần cuối cùng của đường dẫn (tên file hoặc thư mục).

```javascript
const path = require('path');

console.log(path.basename('/home/user/documents/file.txt'));
// 'file.txt'

console.log(path.basename('/home/user/documents/'));
// 'documents'

// Loại bỏ extension
console.log(path.basename('/home/user/documents/file.txt', '.txt'));
// 'file'

console.log(path.basename('file.backup.txt', '.txt'));
// 'file.backup'

// Với đường dẫn Windows
console.log(path.basename('C:\\Users\\John\\file.txt'));
// 'file.txt'
```

### 4. path.dirname()

Lấy phần thư mục của đường dẫn.

```javascript
const path = require('path');

console.log(path.dirname('/home/user/documents/file.txt'));
// '/home/user/documents'

console.log(path.dirname('/home/user/documents/'));
// '/home/user'

console.log(path.dirname('file.txt'));
// '.'

console.log(path.dirname('/'));
// '/'

// Trong Node.js
console.log(path.dirname(__filename));
// Thư mục chứa file hiện tại
```

### 5. path.extname()

Lấy extension của file.

```javascript
const path = require('path');

console.log(path.extname('file.txt'));
// '.txt'

console.log(path.extname('file.backup.txt'));
// '.txt'

console.log(path.extname('file.'));
// '.'

console.log(path.extname('file'));
// ''

console.log(path.extname('.hidden'));
// ''

console.log(path.extname('.hidden.txt'));
// '.txt'

// Ứng dụng thực tế
function getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
        case '.jpg':
        case '.jpeg':
        case '.png':
        case '.gif':
            return 'image';
        case '.mp4':
        case '.avi':
        case '.mkv':
            return 'video';
        case '.txt':
        case '.md':
        case '.doc':
            return 'document';
        default:
            return 'unknown';
    }
}
```

### 6. path.parse() và path.format()

Phân tích và tạo object đường dẫn.

```javascript
const path = require('path');

// Parse đường dẫn
const pathInfo = path.parse('/home/user/documents/file.txt');
console.log(pathInfo);
/*
{
  root: '/',
  dir: '/home/user/documents',
  base: 'file.txt',
  ext: '.txt',
  name: 'file'
}
*/

// Với Windows
const winPath = path.parse('C:\\Users\\John\\file.txt');
console.log(winPath);
/*
{
  root: 'C:\\',
  dir: 'C:\\Users\\John',
  base: 'file.txt',
  ext: '.txt',
  name: 'file'
}
*/

// Format từ object
const pathObj = {
    root: '/home/',
    dir: '/home/user/documents',
    base: 'newfile.txt'
};
console.log(path.format(pathObj));
// '/home/user/documents/newfile.txt'

// Format với name và ext
const pathObj2 = {
    dir: '/home/user',
    name: 'file',
    ext: '.txt'
};
console.log(path.format(pathObj2));
// '/home/user/file.txt'
```

### 7. path.relative()

Tính đường dẫn tương đối giữa hai đường dẫn.

```javascript
const path = require('path');

console.log(path.relative('/home/user/documents', '/home/user/pictures'));
// '../pictures'

console.log(path.relative('/home/user', '/home/user/documents/file.txt'));
// 'documents/file.txt'

console.log(path.relative('/home/user/documents', '/tmp/file.txt'));
// '../../../tmp/file.txt'

// Ứng dụng thực tế: tạo import paths
function createImportPath(fromFile, toFile) {
    const relativePath = path.relative(path.dirname(fromFile), toFile);
    const withoutExt = relativePath.replace(path.extname(relativePath), '');
    return withoutExt.startsWith('.') ? withoutExt : './' + withoutExt;
}

console.log(createImportPath('/src/components/Header.js', '/src/utils/helpers.js'));
// '../utils/helpers'
```

### 8. path.isAbsolute()

Kiểm tra đường dẫn có phải là absolute hay không.

```javascript
const path = require('path');

console.log(path.isAbsolute('/home/user'));
// true (Unix)

console.log(path.isAbsolute('C:\\Users\\John'));
// true (Windows)

console.log(path.isAbsolute('src/components'));
// false

console.log(path.isAbsolute('./file.txt'));
// false

console.log(path.isAbsolute('../file.txt'));
// false

// Ứng dụng thực tế
function ensureAbsolutePath(inputPath, basePath = process.cwd()) {
    return path.isAbsolute(inputPath) 
        ? inputPath 
        : path.resolve(basePath, inputPath);
}
```

## Properties và Constants

### path.sep

Separator ký tự cho platform hiện tại.

```javascript
const path = require('path');

console.log(path.sep);
// '/' trên Unix
// '\\' trên Windows

// Chia đường dẫn thành array
const pathString = '/home/user/documents/file.txt';
const pathParts = pathString.split(path.sep);
console.log(pathParts);
// ['', 'home', 'user', 'documents', 'file.txt']
```

### path.delimiter

Delimiter cho environment PATH variable.

```javascript
const path = require('path');

console.log(path.delimiter);
// ':' trên Unix
// ';' trên Windows

// Parse PATH environment variable
const pathEnv = process.env.PATH;
const paths = pathEnv.split(path.delimiter);
console.log(paths);
```

### path.posix và path.win32

Access các path methods cho specific platforms.

```javascript
const path = require('path');

// Luôn sử dụng Unix-style paths
console.log(path.posix.join('/home', 'user', 'file.txt'));
// '/home/user/file.txt'

// Luôn sử dụng Windows-style paths
console.log(path.win32.join('C:', 'Users', 'John', 'file.txt'));
// 'C:\\Users\\John\\file.txt'

// Cross-platform development
function normalizePath(inputPath) {
    // Normalize to Unix-style for consistency
    return inputPath.split(path.win32.sep).join(path.posix.sep);
}
```

## Ví dụ thực tế

### 1. File Operations Helper

```javascript
const path = require('path');
const fs = require('fs');

class FileHelper {
    static getProjectRoot() {
        // Tìm project root bằng cách tìm package.json
        let currentDir = __dirname;
        
        while (currentDir !== path.parse(currentDir).root) {
            const packagePath = path.join(currentDir, 'package.json');
            if (fs.existsSync(packagePath)) {
                return currentDir;
            }
            currentDir = path.dirname(currentDir);
        }
        
        throw new Error('Project root not found');
    }
    
    static getConfigPath(configName) {
        const projectRoot = this.getProjectRoot();
        return path.join(projectRoot, 'config', `${configName}.json`);
    }
    
    static getAssetPath(assetName) {
        const projectRoot = this.getProjectRoot();
        return path.join(projectRoot, 'assets', assetName);
    }
    
    static createSafePath(...segments) {
        // Tạo path an toàn, không cho phép path traversal
        const joinedPath = path.join(...segments);
        const resolvedPath = path.resolve(joinedPath);
        
        // Đảm bảo path không thoát khỏi project root
        const projectRoot = this.getProjectRoot();
        if (!resolvedPath.startsWith(projectRoot)) {
            throw new Error('Invalid path: outside project root');
        }
        
        return resolvedPath;
    }
    
    static getRelativeImportPath(fromFile, toFile) {
        const projectRoot = this.getProjectRoot();
        const fromAbs = path.resolve(projectRoot, fromFile);
        const toAbs = path.resolve(projectRoot, toFile);
        
        let relativePath = path.relative(path.dirname(fromAbs), toAbs);
        
        // Remove extension
        relativePath = relativePath.replace(path.extname(relativePath), '');
        
        // Ensure starts with ./ or ../
        if (!relativePath.startsWith('.')) {
            relativePath = './' + relativePath;
        }
        
        return relativePath;
    }
}

// Sử dụng
try {
    console.log('Project root:', FileHelper.getProjectRoot());
    console.log('Config path:', FileHelper.getConfigPath('database'));
    console.log('Asset path:', FileHelper.getAssetPath('logo.png'));
    console.log('Import path:', FileHelper.getRelativeImportPath(
        'src/components/Header.js',
        'src/utils/api.js'
    ));
} catch (error) {
    console.error('Error:', error.message);
}
```

### 2. Module Path Resolver

```javascript
const path = require('path');
const fs = require('fs');

class ModulePathResolver {
    constructor(baseDir = process.cwd()) {
        this.baseDir = baseDir;
        this.aliases = new Map();
    }
    
    // Thêm path alias
    addAlias(alias, targetPath) {
        this.aliases.set(alias, path.resolve(this.baseDir, targetPath));
    }
    
    // Resolve module path
    resolve(modulePath) {
        // Check if it's an alias
        for (const [alias, targetPath] of this.aliases) {
            if (modulePath.startsWith(alias + '/')) {
                const relativePart = modulePath.slice(alias.length + 1);
                return path.join(targetPath, relativePart);
            }
        }
        
        // Relative path
        if (modulePath.startsWith('.')) {
            return path.resolve(this.baseDir, modulePath);
        }
        
        // Absolute path
        if (path.isAbsolute(modulePath)) {
            return modulePath;
        }
        
        // Node modules
        return this.resolveNodeModule(modulePath);
    }
    
    resolveNodeModule(moduleName) {
        let currentDir = this.baseDir;
        
        while (currentDir !== path.parse(currentDir).root) {
            const nodeModulesDir = path.join(currentDir, 'node_modules');
            const modulePath = path.join(nodeModulesDir, moduleName);
            
            if (fs.existsSync(modulePath)) {
                return modulePath;
            }
            
            currentDir = path.dirname(currentDir);
        }
        
        throw new Error(`Module not found: ${moduleName}`);
    }
    
    // Tạo relative import path
    createImportPath(fromFile, toFile) {
        const fromAbs = path.resolve(this.baseDir, fromFile);
        const toAbs = this.resolve(toFile);
        
        let relativePath = path.relative(path.dirname(fromAbs), toAbs);
        
        // Remove .js extension nếu có
        if (path.extname(relativePath) === '.js') {
            relativePath = relativePath.slice(0, -3);
        }
        
        // Ensure proper format
        if (!relativePath.startsWith('.')) {
            relativePath = './' + relativePath;
        }
        
        return relativePath;
    }
}

// Sử dụng
const resolver = new ModulePathResolver();

// Setup aliases
resolver.addAlias('@', 'src');
resolver.addAlias('@components', 'src/components');
resolver.addAlias('@utils', 'src/utils');

try {
    console.log(resolver.resolve('@components/Header.js'));
    console.log(resolver.resolve('@utils/api.js'));
    console.log(resolver.resolve('./local-file.js'));
    console.log(resolver.createImportPath(
        'src/components/Header.js',
        '@utils/helpers.js'
    ));
} catch (error) {
    console.error('Error:', error.message);
}
```

### 3. Build Tools Helper

```javascript
const path = require('path');
const fs = require('fs');

class BuildPathHelper {
    constructor(config = {}) {
        this.sourceDir = config.sourceDir || 'src';
        this.outputDir = config.outputDir || 'dist';
        this.assetsDir = config.assetsDir || 'assets';
        this.projectRoot = config.projectRoot || process.cwd();
    }
    
    // Get source file path
    getSourcePath(filePath) {
        return path.resolve(this.projectRoot, this.sourceDir, filePath);
    }
    
    // Get output file path
    getOutputPath(filePath) {
        return path.resolve(this.projectRoot, this.outputDir, filePath);
    }
    
    // Get asset path
    getAssetPath(assetPath) {
        return path.resolve(this.projectRoot, this.assetsDir, assetPath);
    }
    
    // Transform source path to output path
    transformPath(sourcePath, options = {}) {
        const { changeExtension, addSuffix } = options;
        
        // Get relative path from source directory
        const sourceFullPath = path.resolve(this.projectRoot, this.sourceDir);
        const relativePath = path.relative(sourceFullPath, sourcePath);
        
        let outputPath = relativePath;
        
        // Change extension if specified
        if (changeExtension) {
            const parsed = path.parse(outputPath);
            outputPath = path.format({
                ...parsed,
                base: '',
                ext: changeExtension
            });
        }
        
        // Add suffix if specified
        if (addSuffix) {
            const parsed = path.parse(outputPath);
            outputPath = path.format({
                ...parsed,
                base: '',
                name: parsed.name + addSuffix
            });
        }
        
        return this.getOutputPath(outputPath);
    }
    
    // Get all files in directory with filter
    getFiles(dirPath, filter = () => true) {
        const fullDirPath = path.resolve(this.projectRoot, dirPath);
        const files = [];
        
        function walk(dir) {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    walk(fullPath);
                } else if (filter(fullPath)) {
                    files.push(fullPath);
                }
            }
        }
        
        walk(fullDirPath);
        return files;
    }
    
    // Create directory structure for file
    ensureDir(filePath) {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    
    // Copy with transformation
    copyWithTransform(sourcePath, targetPath, transform = null) {
        this.ensureDir(targetPath);
        
        if (transform) {
            const content = fs.readFileSync(sourcePath, 'utf8');
            const transformed = transform(content, sourcePath, targetPath);
            fs.writeFileSync(targetPath, transformed);
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    }
}

// Sử dụng
const buildHelper = new BuildPathHelper({
    sourceDir: 'src',
    outputDir: 'dist',
    assetsDir: 'public'
});

// Transform TypeScript files to JavaScript
const tsFiles = buildHelper.getFiles('src', (filePath) => 
    path.extname(filePath) === '.ts'
);

tsFiles.forEach(tsFile => {
    const jsFile = buildHelper.transformPath(tsFile, { 
        changeExtension: '.js' 
    });
    console.log(`Transform: ${tsFile} -> ${jsFile}`);
});

// Copy assets
const assetFiles = buildHelper.getFiles('public');
assetFiles.forEach(assetFile => {
    const publicPath = path.relative(
        path.join(buildHelper.projectRoot, 'public'),
        assetFile
    );
    const outputAsset = buildHelper.getOutputPath(publicPath);
    buildHelper.copyWithTransform(assetFile, outputAsset);
});
```

## Best Practices

### 1. Luôn sử dụng path methods thay vì string concatenation

```javascript
const path = require('path');

// Tốt
const filePath = path.join(__dirname, 'config', 'database.json');

// Tránh
const filePath = __dirname + '/config/database.json'; // Không cross-platform
```

### 2. Sử dụng path.resolve() cho absolute paths

```javascript
const path = require('path');

// Tốt
const configPath = path.resolve(__dirname, '../config/app.json');

// Hoặc
const configPath = path.resolve(process.cwd(), 'config/app.json');
```

### 3. Validate paths để tránh path traversal

```javascript
const path = require('path');

function validatePath(inputPath, basePath) {
    const resolvedPath = path.resolve(basePath, inputPath);
    
    if (!resolvedPath.startsWith(basePath)) {
        throw new Error('Invalid path: outside base directory');
    }
    
    return resolvedPath;
}
```

### 4. Sử dụng path.normalize() để clean up paths

```javascript
const path = require('path');

// Clean up messy paths
const messyPath = '/home/user/../user/./documents/../documents/file.txt';
const cleanPath = path.normalize(messyPath);
console.log(cleanPath); // '/home/user/documents/file.txt'
```

## Bài tập thực hành

### Bài 1: Path Utilities
Tạo class PathUtils với các methods để xử lý đường dẫn file trong project.

### Bài 2: File Organizer
Viết chương trình sắp xếp files theo extension vào các thư mục tương ứng.

### Bài 3: Import Path Generator
Tạo tool tự động generate import paths cho JavaScript/TypeScript modules.

### Bài 4: Build Path Mapper
Viết hệ thống map source files đến output files cho build process.

## Tổng kết

Module Path là công cụ thiết yếu trong Node.js để xử lý đường dẫn file và thư mục một cách cross-platform. Việc hiểu và sử dụng đúng module này giúp:

- Tạo ứng dụng hoạt động nhất quán trên mọi OS
- Tránh các lỗi phổ biến về đường dẫn
- Xây dựng build tools và file processors hiệu quả
- Tạo cấu trúc project linh hoạt và dễ maintain
