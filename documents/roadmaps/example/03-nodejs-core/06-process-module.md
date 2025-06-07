# Process Module (Module tiến trình)

## Tổng quan

Object `process` là một global object trong Node.js cung cấp thông tin và kiểm soát về Node.js process hiện tại. Đây không phải là module cần require, mà là object có sẵn trong mọi Node.js application.

## Process Information

### 1. Thông tin cơ bản

```javascript
// Phiên bản Node.js
console.log('Node.js version:', process.version);
// v18.17.0

// Thông tin versions của các components
console.log('Versions:', process.versions);
/*
{
  node: '18.17.0',
  v8: '10.2.154.26-node.26',
  uv: '1.44.2',
  zlib: '1.2.13',
  brotli: '1.0.9',
  ares: '1.19.1',
  modules: '108',
  nghttp2: '1.52.0',
  napi: '8',
  llhttp: '6.0.10',
  openssl: '3.0.9+quic',
  cldr: '43.1',
  icu: '73.1',
  tz: '2023c',
  unicode: '15.0',
  ngtcp2: '0.8.1',
  nghttp3: '0.7.0'
}
*/

// Platform information
console.log('Platform:', process.platform);
// 'win32', 'darwin', 'linux', etc.

console.log('Architecture:', process.arch);
// 'x64', 'arm64', 'ia32', etc.

// Process ID
console.log('Process ID:', process.pid);
// 12345

// Parent Process ID
console.log('Parent Process ID:', process.ppid);
// 5678

// Uptime in seconds
console.log('Uptime:', process.uptime());
// 123.456
```

### 2. Memory Usage

```javascript
// Memory usage information
const memoryUsage = process.memoryUsage();
console.log('Memory Usage:', memoryUsage);
/*
{
  rss: 23552000,      // Resident Set Size
  heapTotal: 6537216, // Total heap memory
  heapUsed: 4456784,  // Used heap memory
  external: 1835120,  // External memory
  arrayBuffers: 26064 // Array buffers memory
}
*/

// Format memory để dễ đọc
function formatMemory(bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

console.log('RSS:', formatMemory(memoryUsage.rss));
console.log('Heap Total:', formatMemory(memoryUsage.heapTotal));
console.log('Heap Used:', formatMemory(memoryUsage.heapUsed));

// CPU Usage
const cpuUsage = process.cpuUsage();
console.log('CPU Usage:', cpuUsage);
/*
{
  user: 132379,    // User CPU time in microseconds
  system: 50507    // System CPU time in microseconds
}
*/

// Monitor memory usage
function monitorMemory() {
    setInterval(() => {
        const usage = process.memoryUsage();
        console.log(`Heap Used: ${formatMemory(usage.heapUsed)}`);
        
        // Warning if memory usage is high
        if (usage.heapUsed / usage.heapTotal > 0.9) {
            console.warn('High memory usage detected!');
        }
    }, 5000);
}
```

### 3. Environment Variables

```javascript
// Access environment variables
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PATH:', process.env.PATH);
console.log('HOME:', process.env.HOME || process.env.USERPROFILE);

// Set environment variables
process.env.CUSTOM_VAR = 'custom value';
process.env.API_URL = 'https://api.example.com';

// Environment-based configuration
function getConfig() {
    const env = process.env.NODE_ENV || 'development';
    
    const config = {
        development: {
            dbUrl: 'mongodb://localhost:27017/myapp_dev',
            logLevel: 'debug'
        },
        production: {
            dbUrl: process.env.DATABASE_URL,
            logLevel: 'error'
        },
        test: {
            dbUrl: 'mongodb://localhost:27017/myapp_test',
            logLevel: 'silent'
        }
    };
    
    return config[env];
}

// Load environment from .env file (manual implementation)
function loadEnvFile(filePath = '.env') {
    const fs = require('fs');
    const path = require('path');
    
    try {
        const envPath = path.resolve(process.cwd(), filePath);
        const envData = fs.readFileSync(envPath, 'utf8');
        
        envData.split('\n').forEach(line => {
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
                const value = values.join('=').trim();
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
        
        console.log('Environment file loaded successfully');
    } catch (error) {
        console.log('No environment file found');
    }
}

loadEnvFile();
```

## Command Line Arguments

### 1. Process Arguments

```javascript
// Command line arguments
console.log('Process arguments:', process.argv);
/*
Chạy: node app.js --port 3000 --env production
Output:
[
  'C:\\Program Files\\nodejs\\node.exe',
  'C:\\path\\to\\app.js',
  '--port',
  '3000',
  '--env',
  'production'
]
*/

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2); // Bỏ node path và script path
    const parsed = {};
    
    for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace(/^-+/, ''); // Remove leading dashes
        const value = args[i + 1];
        parsed[key] = value;
    }
    
    return parsed;
}

const cmdArgs = parseArgs();
console.log('Parsed arguments:', cmdArgs);
// { port: '3000', env: 'production' }

// Advanced argument parser
class ArgumentParser {
    constructor() {
        this.options = new Map();
        this.flags = new Set();
    }
    
    addOption(name, description, defaultValue = null) {
        this.options.set(name, { description, defaultValue, value: null });
        return this;
    }
    
    addFlag(name, description) {
        this.flags.add(name);
        return this;
    }
    
    parse(args = process.argv.slice(2)) {
        const result = { options: {}, flags: new Set(), unknown: [] };
        
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            
            if (arg.startsWith('--')) {
                const key = arg.slice(2);
                
                if (this.flags.has(key)) {
                    result.flags.add(key);
                } else if (this.options.has(key) && i + 1 < args.length) {
                    result.options[key] = args[i + 1];
                    i++; // Skip next argument
                } else {
                    result.unknown.push(arg);
                }
            } else if (arg.startsWith('-')) {
                const key = arg.slice(1);
                
                if (this.flags.has(key)) {
                    result.flags.add(key);
                } else {
                    result.unknown.push(arg);
                }
            } else {
                result.unknown.push(arg);
            }
        }
        
        // Set default values
        for (const [name, config] of this.options) {
            if (!(name in result.options) && config.defaultValue !== null) {
                result.options[name] = config.defaultValue;
            }
        }
        
        return result;
    }
    
    showHelp() {
        console.log('Options:');
        for (const [name, config] of this.options) {
            console.log(`  --${name}: ${config.description}`);
            if (config.defaultValue) {
                console.log(`    Default: ${config.defaultValue}`);
            }
        }
        
        console.log('\nFlags:');
        for (const flag of this.flags) {
            console.log(`  --${flag}`);
        }
    }
}

// Sử dụng ArgumentParser
const parser = new ArgumentParser()
    .addOption('port', 'Server port', '3000')
    .addOption('host', 'Server host', 'localhost')
    .addOption('env', 'Environment', 'development')
    .addFlag('verbose')
    .addFlag('help');

const parsedArgs = parser.parse();

if (parsedArgs.flags.has('help')) {
    parser.showHelp();
    process.exit(0);
}

console.log('Options:', parsedArgs.options);
console.log('Flags:', Array.from(parsedArgs.flags));
```

### 2. Working Directory

```javascript
// Current working directory
console.log('Current directory:', process.cwd());

// Change working directory
try {
    process.chdir('/path/to/new/directory');
    console.log('New directory:', process.cwd());
} catch (error) {
    console.error('Failed to change directory:', error.message);
}

// Get directory of current script
console.log('Script directory:', __dirname);
console.log('Script file:', __filename);

// Utility functions
function getProjectRoot() {
    const path = require('path');
    const fs = require('fs');
    
    let currentDir = process.cwd();
    
    while (currentDir !== path.parse(currentDir).root) {
        if (fs.existsSync(path.join(currentDir, 'package.json'))) {
            return currentDir;
        }
        currentDir = path.dirname(currentDir);
    }
    
    return process.cwd();
}

console.log('Project root:', getProjectRoot());
```

## Process Events

### 1. Exit Events

```javascript
// Process exit event
process.on('exit', (code) => {
    console.log(`Process đang thoát với code: ${code}`);
    // Chỉ có thể thực hiện synchronous operations ở đây
});

// Before exit event
process.on('beforeExit', (code) => {
    console.log(`Process sắp thoát với code: ${code}`);
    // Có thể thực hiện asynchronous operations
    
    // Ví dụ: cleanup
    console.log('Cleaning up resources...');
});

// SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log('\nNhận tín hiệu SIGINT (Ctrl+C)');
    console.log('Đang graceful shutdown...');
    
    // Cleanup operations
    setTimeout(() => {
        console.log('Cleanup hoàn tất');
        process.exit(0);
    }, 1000);
});

// SIGTERM (Termination signal)
process.on('SIGTERM', () => {
    console.log('Nhận tín hiệu SIGTERM');
    console.log('Đang graceful shutdown...');
    
    // Cleanup operations
    process.exit(0);
});
```

### 2. Uncaught Exceptions

```javascript
// Uncaught exception handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    
    // Log error
    const fs = require('fs');
    const errorLog = `${new Date().toISOString()}: ${error.stack}\n`;
    fs.appendFileSync('error.log', errorLog);
    
    // Exit process (recommended)
    process.exit(1);
});

// Unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
    
    // Log error
    const fs = require('fs');
    const errorLog = `${new Date().toISOString()}: Unhandled Rejection: ${reason}\n`;
    fs.appendFileSync('error.log', errorLog);
    
    // Exit process
    process.exit(1);
});

// Warning handler
process.on('warning', (warning) => {
    console.warn('Process Warning:', warning.name);
    console.warn('Message:', warning.message);
    console.warn('Stack:', warning.stack);
});
```

### 3. Custom Process Manager

```javascript
class ProcessManager {
    constructor() {
        this.shutdownHandlers = [];
        this.isShuttingDown = false;
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        // Graceful shutdown
        process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
        
        // Error handling
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            this.logError(error);
            this.gracefulShutdown('uncaughtException');
        });
        
        process.on('unhandledRejection', (reason) => {
            console.error('Unhandled Rejection:', reason);
            this.logError(new Error(`Unhandled Rejection: ${reason}`));
            this.gracefulShutdown('unhandledRejection');
        });
    }
    
    addShutdownHandler(handler) {
        this.shutdownHandlers.push(handler);
    }
    
    async gracefulShutdown(signal) {
        if (this.isShuttingDown) return;
        
        console.log(`\nReceived ${signal}, starting graceful shutdown...`);
        this.isShuttingDown = true;
        
        try {
            // Execute shutdown handlers
            for (const handler of this.shutdownHandlers) {
                console.log('Executing shutdown handler...');
                await handler();
            }
            
            console.log('Graceful shutdown completed');
            process.exit(0);
        } catch (error) {
            console.error('Error during shutdown:', error);
            process.exit(1);
        }
    }
    
    logError(error) {
        const fs = require('fs');
        const path = require('path');
        
        const logDir = 'logs';
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        const logFile = path.join(logDir, 'error.log');
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${error.stack}\n\n`;
        
        fs.appendFileSync(logFile, logEntry);
    }
    
    getProcessInfo() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        return {
            pid: process.pid,
            uptime: process.uptime(),
            platform: process.platform,
            nodeVersion: process.version,
            memory: {
                rss: this.formatBytes(memUsage.rss),
                heapTotal: this.formatBytes(memUsage.heapTotal),
                heapUsed: this.formatBytes(memUsage.heapUsed)
            },
            cpu: cpuUsage
        };
    }
    
    formatBytes(bytes) {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    }
    
    startHealthCheck(interval = 30000) {
        setInterval(() => {
            const info = this.getProcessInfo();
            console.log('Health Check:', {
                uptime: `${info.uptime.toFixed(2)}s`,
                memory: info.memory.heapUsed,
                pid: info.pid
            });
        }, interval);
    }
}

// Sử dụng ProcessManager
const processManager = new ProcessManager();

// Add cleanup handlers
processManager.addShutdownHandler(async () => {
    console.log('Closing database connections...');
    // await database.close();
    await new Promise(resolve => setTimeout(resolve, 1000));
});

processManager.addShutdownHandler(async () => {
    console.log('Saving application state...');
    // await saveApplicationState();
    await new Promise(resolve => setTimeout(resolve, 500));
});

// Start health monitoring
processManager.startHealthCheck(10000);

console.log('Application started');
console.log('Process Info:', processManager.getProcessInfo());
```

## Process Control

### 1. Process Exit

```javascript
// Exit with success
process.exit(0);

// Exit with error
process.exit(1);

// Exit with custom code
process.exit(123);

// Graceful exit
function gracefulExit(code = 0) {
    console.log('Performing cleanup...');
    
    // Cleanup operations
    setTimeout(() => {
        console.log('Cleanup completed');
        process.exit(code);
    }, 1000);
}

// Abort process (immediate termination)
// process.abort(); // Uncomment to test - this will crash the process
```

### 2. Process Signals

```javascript
// Send signals to other processes
const { spawn } = require('child_process');

function killProcess(pid, signal = 'SIGTERM') {
    try {
        process.kill(pid, signal);
        console.log(`Sent ${signal} to process ${pid}`);
    } catch (error) {
        console.error(`Failed to kill process ${pid}:`, error.message);
    }
}

// Check if process exists
function processExists(pid) {
    try {
        process.kill(pid, 0); // Signal 0 just checks if process exists
        return true;
    } catch (error) {
        return false;
    }
}

// Process monitoring
function monitorProcess(pid) {
    const interval = setInterval(() => {
        if (processExists(pid)) {
            console.log(`Process ${pid} is running`);
        } else {
            console.log(`Process ${pid} has stopped`);
            clearInterval(interval);
        }
    }, 1000);
    
    return interval;
}
```

## Ví dụ thực tế

### 1. Application Launcher

```javascript
const path = require('path');
const fs = require('fs');

class ApplicationLauncher {
    constructor() {
        this.config = this.loadConfig();
        this.setupProcess();
    }
    
    loadConfig() {
        // Load từ command line arguments
        const args = process.argv.slice(2);
        const config = {
            env: 'development',
            port: 3000,
            host: 'localhost',
            verbose: false
        };
        
        // Parse arguments
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            switch (arg) {
                case '--env':
                    config.env = args[++i];
                    break;
                case '--port':
                    config.port = parseInt(args[++i]);
                    break;
                case '--host':
                    config.host = args[++i];
                    break;
                case '--verbose':
                    config.verbose = true;
                    break;
            }
        }
        
        // Load từ environment variables
        if (process.env.NODE_ENV) config.env = process.env.NODE_ENV;
        if (process.env.PORT) config.port = parseInt(process.env.PORT);
        if (process.env.HOST) config.host = process.env.HOST;
        
        // Load từ config file
        const configFile = path.join(process.cwd(), `config/${config.env}.json`);
        if (fs.existsSync(configFile)) {
            const fileConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
            Object.assign(config, fileConfig);
        }
        
        return config;
    }
    
    setupProcess() {
        // Set process title
        process.title = `myapp-${this.config.env}`;
        
        // Setup environment
        process.env.NODE_ENV = this.config.env;
        
        // Logging
        if (this.config.verbose) {
            console.log('Process ID:', process.pid);
            console.log('Node.js version:', process.version);
            console.log('Platform:', process.platform);
            console.log('Configuration:', this.config);
        }
        
        // Error handling
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            this.shutdown(1);
        });
        
        process.on('unhandledRejection', (reason) => {
            console.error('Unhandled Rejection:', reason);
            this.shutdown(1);
        });
        
        // Graceful shutdown
        process.on('SIGINT', () => this.shutdown(0));
        process.on('SIGTERM', () => this.shutdown(0));
    }
    
    async start() {
        console.log(`Starting application in ${this.config.env} mode...`);
        console.log(`Server will run on ${this.config.host}:${this.config.port}`);
        
        // Your application startup logic here
        // For example: start HTTP server, connect to database, etc.
        
        console.log('Application started successfully');
        
        // Keep process alive
        process.stdin.resume();
    }
    
    async shutdown(exitCode = 0) {
        console.log('Shutting down application...');
        
        try {
            // Cleanup logic here
            // For example: close database connections, save state, etc.
            
            console.log('Shutdown completed');
            process.exit(exitCode);
        } catch (error) {
            console.error('Error during shutdown:', error);
            process.exit(1);
        }
    }
}

// Usage
const launcher = new ApplicationLauncher();
launcher.start().catch(error => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
```

### 2. Process Monitor

```javascript
class ProcessMonitor {
    constructor(options = {}) {
        this.interval = options.interval || 5000;
        this.thresholds = {
            memory: options.memoryThreshold || 100 * 1024 * 1024, // 100MB
            cpu: options.cpuThreshold || 80 // 80%
        };
        this.alerts = [];
        this.isMonitoring = false;
    }
    
    start() {
        if (this.isMonitoring) return;
        
        console.log('Starting process monitoring...');
        this.isMonitoring = true;
        
        this.monitorInterval = setInterval(() => {
            this.checkHealth();
        }, this.interval);
        
        // Log initial state
        this.logProcessInfo();
    }
    
    stop() {
        if (!this.isMonitoring) return;
        
        console.log('Stopping process monitoring...');
        this.isMonitoring = false;
        
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }
    }
    
    checkHealth() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        // Memory check
        if (memUsage.heapUsed > this.thresholds.memory) {
            this.alert('HIGH_MEMORY', {
                current: this.formatBytes(memUsage.heapUsed),
                threshold: this.formatBytes(this.thresholds.memory)
            });
        }
        
        // Log periodic info
        if (Date.now() % (60000) < this.interval) { // Every minute
            this.logProcessInfo();
        }
    }
    
    alert(type, data) {
        const alert = {
            type,
            timestamp: new Date().toISOString(),
            data,
            pid: process.pid
        };
        
        this.alerts.push(alert);
        console.warn(`[ALERT] ${type}:`, data);
        
        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }
    }
    
    logProcessInfo() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        const info = {
            timestamp: new Date().toISOString(),
            pid: process.pid,
            uptime: `${process.uptime().toFixed(2)}s`,
            memory: {
                rss: this.formatBytes(memUsage.rss),
                heapTotal: this.formatBytes(memUsage.heapTotal),
                heapUsed: this.formatBytes(memUsage.heapUsed),
                external: this.formatBytes(memUsage.external)
            },
            cpu: {
                user: `${(cpuUsage.user / 1000).toFixed(2)}ms`,
                system: `${(cpuUsage.system / 1000).toFixed(2)}ms`
            }
        };
        
        console.log('[MONITOR]', JSON.stringify(info, null, 2));
    }
    
    formatBytes(bytes) {
        return (bytes / 1024 / 1024).toFixed(2) + 'MB';
    }
    
    getReport() {
        return {
            processInfo: {
                pid: process.pid,
                uptime: process.uptime(),
                version: process.version,
                platform: process.platform
            },
            currentMemory: process.memoryUsage(),
            currentCpu: process.cpuUsage(),
            alerts: this.alerts.slice(-10), // Last 10 alerts
            isMonitoring: this.isMonitoring
        };
    }
}

// Usage
const monitor = new ProcessMonitor({
    interval: 5000,
    memoryThreshold: 50 * 1024 * 1024 // 50MB
});

monitor.start();

// Stop monitoring on process exit
process.on('exit', () => {
    monitor.stop();
});

// Example: expose monitoring data via HTTP
const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(monitor.getReport(), null, 2));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3001, () => {
    console.log('Monitoring server running on http://localhost:3001/health');
});
```

## Best Practices

### 1. Graceful Shutdown

```javascript
function setupGracefulShutdown(cleanupFunction) {
    let isShuttingDown = false;
    
    async function shutdown(signal) {
        if (isShuttingDown) return;
        isShuttingDown = true;
        
        console.log(`Received ${signal}, starting graceful shutdown...`);
        
        try {
            await cleanupFunction();
            console.log('Graceful shutdown completed');
            process.exit(0);
        } catch (error) {
            console.error('Error during shutdown:', error);
            process.exit(1);
        }
    }
    
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}
```

### 2. Environment Configuration

```javascript
function getConfig() {
    const env = process.env.NODE_ENV || 'development';
    
    const config = {
        env,
        port: parseInt(process.env.PORT) || 3000,
        host: process.env.HOST || 'localhost',
        dbUrl: process.env.DATABASE_URL,
        logLevel: process.env.LOG_LEVEL || (env === 'production' ? 'error' : 'debug')
    };
    
    // Validate required environment variables
    if (env === 'production' && !config.dbUrl) {
        console.error('DATABASE_URL is required in production');
        process.exit(1);
    }
    
    return config;
}
```

### 3. Error Logging

```javascript
function setupErrorLogging() {
    const fs = require('fs');
    const path = require('path');
    
    function logError(error, context = '') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${context}\n${error.stack}\n\n`;
        
        // Ensure log directory exists
        const logDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        // Write to log file
        const logFile = path.join(logDir, 'error.log');
        fs.appendFileSync(logFile, logEntry);
    }
    
    process.on('uncaughtException', (error) => {
        logError(error, 'Uncaught Exception');
        process.exit(1);
    });
    
    process.on('unhandledRejection', (reason) => {
        logError(new Error(reason), 'Unhandled Rejection');
        process.exit(1);
    });
}
```

## Bài tập thực hành

### Bài 1: Process Information Dashboard
Tạo dashboard hiển thị thông tin process realtime.

### Bài 2: Application Configuration Manager
Viết system quản lý configuration từ multiple sources (CLI, env vars, files).

### Bài 3: Process Health Monitor
Tạo monitoring system với alerting khi process có vấn đề.

### Bài 4: Graceful Shutdown Handler
Implement comprehensive graceful shutdown system.

## Tổng kết

Process module cung cấp toàn quyền kiểm soát Node.js process, bao gồm:

- Truy cập thông tin process và environment
- Xử lý command line arguments
- Quản lý process lifecycle và events
- Error handling và graceful shutdown
- Performance monitoring và health checks

Hiểu rõ process module giúp tạo ra applications robust, maintainable và production-ready.
