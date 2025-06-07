const express = require('express');
const winston = require('winston');
const LokiTransport = require('winston-loki');
const fs = require('fs');
const path = require('path');
const json2csv = require('json2csv').parse;

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Configure Winston logger with Loki transport
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'winston-loki-demo' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new LokiTransport({
      host: "http://loki:3100",
      labels: { job: 'winston-loki-demo' },
      json: true,
      format: winston.format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => {
        console.error('Loki connection error:', err);
      }
    })
  ]
});

// Store logs in memory for reporting
let logStore = [];

// Middleware to store logs
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent')
    };
    logStore.push(logEntry);
    logger.info('Request processed', logEntry);
  });
  next();
});

// Report endpoints
app.get('/reports/csv', (req, res) => {
  try {
    const fields = ['timestamp', 'method', 'path', 'statusCode', 'duration', 'userAgent'];
    const csv = json2csv(logStore, { fields });
    const filename = `report-${Date.now()}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csv);
    
    logger.info('CSV report generated', { filename });
  } catch (err) {
    logger.error('Error generating CSV report', { error: err.message });
    res.status(500).send('Error generating report');
  }
});

app.get('/reports/json', (req, res) => {
  try {
    const filename = `report-${Date.now()}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.json(logStore);
    
    logger.info('JSON report generated', { filename });
  } catch (err) {
    logger.error('Error generating JSON report', { error: err.message });
    res.status(500).send('Error generating report');
  }
});

app.get('/reports/clear', (req, res) => {
  logStore = [];
  logger.info('Log store cleared');
  res.send('Log store cleared');
});

// Demo routes
app.get('/', (req, res) => {
  logger.info('Home page accessed', {
    path: req.path,
    query: req.query
  });
  res.send('Welcome to Winston-Loki Demo!');
});

app.get('/error', (req, res) => {
  logger.error('Error endpoint accessed', {
    error: 'Test error',
    path: req.path
  });
  res.status(500).send('Error generated!');
});

app.get('/warning', (req, res) => {
  logger.warn('Warning endpoint accessed', {
    warning: 'Test warning',
    path: req.path
  });
  res.send('Warning generated!');
});

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check', {
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
  res.send('OK');
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
});