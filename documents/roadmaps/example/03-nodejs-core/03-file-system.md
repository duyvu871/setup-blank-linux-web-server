# File System (Hệ thống tệp tin)

## Tổng quan

Module `fs` (File System) trong Node.js cung cấp API để tương tác với hệ thống tệp tin. Đây là một trong những module quan trọng nhất, cho phép bạn đọc, ghi, tạo, xóa các tệp tin và thư mục.

## Các phương thức chính

### 1. Đọc tệp tin

#### Synchronous (Đồng bộ)
```javascript
const fs = require('fs');

try {
    const data = fs.readFileSync('file.txt', 'utf8');
    console.log(data);
} catch (error) {
    console.error('Lỗi đọc file:', error);
}
```

#### Asynchronous với Callback
```javascript
const fs = require('fs');

fs.readFile('file.txt', 'utf8', (err, data) => {
    if (err) {
        console.error('Lỗi đọc file:', err);
        return;
    }
    console.log(data);
});
```

#### Asynchronous với Promise
```javascript
const fs = require('fs').promises;

async function readFileAsync() {
    try {
        const data = await fs.readFile('file.txt', 'utf8');
        console.log(data);
    } catch (error) {
        console.error('Lỗi đọc file:', error);
    }
}
```

### 2. Ghi tệp tin

#### Ghi đè tệp tin
```javascript
const fs = require('fs');

// Async với callback
fs.writeFile('output.txt', 'Nội dung mới', 'utf8', (err) => {
    if (err) {
        console.error('Lỗi ghi file:', err);
        return;
    }
    console.log('Ghi file thành công!');
});

// Async với Promise
async function writeFileAsync() {
    try {
        await fs.promises.writeFile('output.txt', 'Nội dung mới', 'utf8');
        console.log('Ghi file thành công!');
    } catch (error) {
        console.error('Lỗi ghi file:', error);
    }
}
```

#### Thêm nội dung vào cuối tệp tin
```javascript
const fs = require('fs');

fs.appendFile('log.txt', 'Dòng log mới\n', 'utf8', (err) => {
    if (err) {
        console.error('Lỗi thêm vào file:', err);
        return;
    }
    console.log('Thêm vào file thành công!');
});
```

### 3. Kiểm tra tệp tin/thư mục

```javascript
const fs = require('fs');

// Kiểm tra tồn tại
fs.access('file.txt', fs.constants.F_OK, (err) => {
    if (err) {
        console.log('File không tồn tại');
    } else {
        console.log('File tồn tại');
    }
});

// Lấy thông tin chi tiết
fs.stat('file.txt', (err, stats) => {
    if (err) {
        console.error('Lỗi:', err);
        return;
    }
    
    console.log('Kích thước:', stats.size);
    console.log('Là file:', stats.isFile());
    console.log('Là thư mục:', stats.isDirectory());
    console.log('Thời gian tạo:', stats.birthtime);
    console.log('Thời gian sửa đổi:', stats.mtime);
});
```

### 4. Thao tác với thư mục

#### Tạo thư mục
```javascript
const fs = require('fs');

// Tạo thư mục đơn
fs.mkdir('new-folder', (err) => {
    if (err) {
        console.error('Lỗi tạo thư mục:', err);
        return;
    }
    console.log('Tạo thư mục thành công');
});

// Tạo thư mục nested với recursive
fs.mkdir('path/to/deep/folder', { recursive: true }, (err) => {
    if (err) {
        console.error('Lỗi tạo thư mục:', err);
        return;
    }
    console.log('Tạo cấu trúc thư mục thành công');
});
```

#### Đọc nội dung thư mục
```javascript
const fs = require('fs');

fs.readdir('.', (err, files) => {
    if (err) {
        console.error('Lỗi đọc thư mục:', err);
        return;
    }
    
    console.log('Danh sách file và thư mục:');
    files.forEach(file => {
        console.log(file);
    });
});

// Với thông tin chi tiết
fs.readdir('.', { withFileTypes: true }, (err, entries) => {
    if (err) {
        console.error('Lỗi đọc thư mục:', err);
        return;
    }
    
    entries.forEach(entry => {
        const type = entry.isDirectory() ? 'Thư mục' : 'File';
        console.log(`${entry.name} - ${type}`);
    });
});
```

### 5. Xóa tệp tin và thư mục

```javascript
const fs = require('fs');

// Xóa file
fs.unlink('file-to-delete.txt', (err) => {
    if (err) {
        console.error('Lỗi xóa file:', err);
        return;
    }
    console.log('Xóa file thành công');
});

// Xóa thư mục rỗng
fs.rmdir('empty-folder', (err) => {
    if (err) {
        console.error('Lỗi xóa thư mục:', err);
        return;
    }
    console.log('Xóa thư mục thành công');
});

// Xóa thư mục và nội dung (Node.js 14.14.0+)
fs.rm('folder-with-content', { recursive: true, force: true }, (err) => {
    if (err) {
        console.error('Lỗi xóa thư mục:', err);
        return;
    }
    console.log('Xóa thư mục và nội dung thành công');
});
```

## Streams với File System

### Đọc file lớn với Stream
```javascript
const fs = require('fs');

const readStream = fs.createReadStream('large-file.txt', {
    encoding: 'utf8',
    highWaterMark: 1024 // Đọc 1KB mỗi lần
});

readStream.on('data', (chunk) => {
    console.log('Nhận chunk:', chunk.length, 'bytes');
});

readStream.on('end', () => {
    console.log('Đọc file hoàn tất');
});

readStream.on('error', (err) => {
    console.error('Lỗi đọc stream:', err);
});
```

### Ghi file với Stream
```javascript
const fs = require('fs');

const writeStream = fs.createWriteStream('output-large.txt');

writeStream.write('Dòng 1\n');
writeStream.write('Dòng 2\n');
writeStream.write('Dòng 3\n');

writeStream.end(() => {
    console.log('Ghi file hoàn tất');
});

writeStream.on('error', (err) => {
    console.error('Lỗi ghi stream:', err);
});
```

### Copy file với Stream
```javascript
const fs = require('fs');

const readStream = fs.createReadStream('source.txt');
const writeStream = fs.createWriteStream('destination.txt');

readStream.pipe(writeStream);

writeStream.on('finish', () => {
    console.log('Copy file thành công');
});

// Hoặc sử dụng copyFile (đơn giản hơn)
fs.copyFile('source.txt', 'destination.txt', (err) => {
    if (err) {
        console.error('Lỗi copy file:', err);
        return;
    }
    console.log('Copy file thành công');
});
```

## Watching Files (Theo dõi thay đổi)

```javascript
const fs = require('fs');

// Watch một file cụ thể
fs.watchFile('config.json', (curr, prev) => {
    console.log('File config.json đã thay đổi');
    console.log('Thời gian sửa đổi hiện tại:', curr.mtime);
    console.log('Thời gian sửa đổi trước đó:', prev.mtime);
});

// Watch thư mục
fs.watch('./watched-folder', (eventType, filename) => {
    console.log(`Sự kiện: ${eventType}`);
    if (filename) {
        console.log(`File thay đổi: ${filename}`);
    }
});
```

## Best Practices

### 1. Luôn xử lý lỗi
```javascript
const fs = require('fs').promises;

async function safeFileOperation() {
    try {
        const data = await fs.readFile('may-not-exist.txt', 'utf8');
        return data;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('File không tồn tại');
            return null;
        }
        throw error; // Re-throw các lỗi khác
    }
}
```

### 2. Sử dụng async/await thay vì callback
```javascript
const fs = require('fs').promises;

// Tốt
async function processFiles() {
    try {
        const files = await fs.readdir('./data');
        for (const file of files) {
            const content = await fs.readFile(`./data/${file}`, 'utf8');
            console.log(`Xử lý ${file}:`, content.length, 'characters');
        }
    } catch (error) {
        console.error('Lỗi xử lý files:', error);
    }
}

// Tránh callback hell
fs.readdir('./data', (err, files) => {
    if (err) throw err;
    files.forEach(file => {
        fs.readFile(`./data/${file}`, 'utf8', (err, content) => {
            if (err) throw err;
            console.log(`Xử lý ${file}:`, content.length, 'characters');
        });
    });
});
```

### 3. Sử dụng Stream cho file lớn
```javascript
const fs = require('fs');

// Tốt cho file lớn
function processLargeFile(inputPath, outputPath) {
    const readStream = fs.createReadStream(inputPath);
    const writeStream = fs.createWriteStream(outputPath);
    
    readStream.pipe(writeStream);
    
    return new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
        readStream.on('error', reject);
    });
}

// Tránh load toàn bộ file vào memory
async function badForLargeFile(inputPath) {
    const data = await fs.promises.readFile(inputPath); // Nguy hiểm với file lớn
    return data;
}
```

### 4. Kiểm tra quyền truy cập
```javascript
const fs = require('fs');

async function checkFilePermissions(filePath) {
    try {
        // Kiểm tra đọc
        await fs.promises.access(filePath, fs.constants.R_OK);
        console.log('Có thể đọc file');
        
        // Kiểm tra ghi
        await fs.promises.access(filePath, fs.constants.W_OK);
        console.log('Có thể ghi file');
        
        // Kiểm tra thực thi
        await fs.promises.access(filePath, fs.constants.X_OK);
        console.log('Có thể thực thi file');
        
    } catch (error) {
        console.log('Không có quyền truy cập:', error.message);
    }
}
```

## Ví dụ thực tế

### File Logger
```javascript
const fs = require('fs').promises;
const path = require('path');

class FileLogger {
    constructor(logDir = './logs') {
        this.logDir = logDir;
        this.ensureLogDir();
    }
    
    async ensureLogDir() {
        try {
            await fs.mkdir(this.logDir, { recursive: true });
        } catch (error) {
            console.error('Không thể tạo thư mục log:', error);
        }
    }
    
    async log(level, message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;
        
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(this.logDir, `${today}.log`);
        
        try {
            await fs.appendFile(logFile, logEntry);
        } catch (error) {
            console.error('Lỗi ghi log:', error);
        }
    }
    
    async info(message) {
        await this.log('info', message);
    }
    
    async error(message) {
        await this.log('error', message);
    }
    
    async getLogsForDate(date) {
        const logFile = path.join(this.logDir, `${date}.log`);
        try {
            return await fs.readFile(logFile, 'utf8');
        } catch (error) {
            if (error.code === 'ENOENT') {
                return 'Không có log cho ngày này';
            }
            throw error;
        }
    }
}

// Sử dụng
const logger = new FileLogger();
logger.info('Ứng dụng khởi động');
logger.error('Có lỗi xảy ra');
```

### File Manager
```javascript
const fs = require('fs').promises;
const path = require('path');

class FileManager {
    static async copyDirectory(src, dest) {
        await fs.mkdir(dest, { recursive: true });
        
        const entries = await fs.readdir(src, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                await this.copyDirectory(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }
    }
    
    static async getDirectorySize(dirPath) {
        let totalSize = 0;
        
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
                totalSize += await this.getDirectorySize(fullPath);
            } else {
                const stats = await fs.stat(fullPath);
                totalSize += stats.size;
            }
        }
        
        return totalSize;
    }
    
    static async findFiles(dirPath, extension) {
        const results = [];
        
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
                const subResults = await this.findFiles(fullPath, extension);
                results.push(...subResults);
            } else if (path.extname(entry.name) === extension) {
                results.push(fullPath);
            }
        }
        
        return results;
    }
}

// Sử dụng
FileManager.copyDirectory('./source', './backup');
FileManager.getDirectorySize('./projects').then(size => {
    console.log(`Kích thước thư mục: ${size} bytes`);
});
FileManager.findFiles('./src', '.js').then(jsFiles => {
    console.log('File JavaScript tìm thấy:', jsFiles);
});
```

## Bài tập thực hành

### Bài 1: File Organizer
Tạo một chương trình sắp xếp file theo extension vào các thư mục tương ứng.

### Bài 2: Log Analyzer
Viết chương trình đọc và phân tích file log, thống kê số lượng các loại lỗi.

### Bài 3: Backup System
Tạo hệ thống backup tự động copy file từ thư mục này sang thư mục khác.

### Bài 4: File Watcher
Viết chương trình theo dõi thay đổi trong thư mục và ghi log mọi hoạt động.

## Tổng kết

Module File System trong Node.js cung cấp API mạnh mẽ để thao tác với hệ thống tệp tin. Việc hiểu và sử dụng thành thạo module này là rất quan trọng cho việc phát triển ứng dụng Node.js, đặc biệt là các ứng dụng cần xử lý file, logging, và quản lý dữ liệu.
