import log4js from 'log4js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure log4js
log4js.configure({
  appenders: {
    // Console appender for development
    console: {
      type: 'console'
    },
    
    // Common log file - rolling by date with 7 days retention
    commonFile: {
      type: 'dateFile',
      filename: path.join(__dirname, '../logs/app'),
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      daysToKeep: 7,
      keepFileExt: true,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%p] %c - %m'
      }
    },
    
    // Error log file - rolling by date with 7 days retention
    errorFile: {
      type: 'dateFile',
      filename: path.join(__dirname, '../logs/error'),
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      daysToKeep: 7,
      keepFileExt: true,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%p] %c - %m%n%s'
      }
    },
    
    // Filter for errors only
    errors: {
      type: 'logLevelFilter',
      appender: 'errorFile',
      level: 'error'
    }
  },
  categories: {
    default: {
      appenders: ['console', 'commonFile', 'errors'],
      level: 'debug'
    },
    server: {
      appenders: ['console', 'commonFile', 'errors'],
      level: 'info'
    },
    routes: {
      appenders: ['console', 'commonFile', 'errors'],
      level: 'info'
    },
    services: {
      appenders: ['console', 'commonFile', 'errors'],
      level: 'info'
    }
  }
});

// Create logger instances
export const getLogger = (category = 'default') => {
  return log4js.getLogger(category);
};

export const serverLogger = log4js.getLogger('server');
export const routesLogger = log4js.getLogger('routes');
export const servicesLogger = log4js.getLogger('services');

export default log4js;

