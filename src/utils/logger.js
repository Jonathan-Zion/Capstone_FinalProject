// Simple logging utility
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

export const logger = {
    info: (message, ...args) => {
        console.log(`${colors.blue}[INFO]${colors.reset} ${message}`, ...args);
    },

    success: (message, ...args) => {
        console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`, ...args);
    },

    warning: (message, ...args) => {
        console.warn(`${colors.yellow}[WARNING]${colors.reset} ${message}`, ...args);
    },

    error: (message, ...args) => {
        console.error(`${colors.red}[ERROR]${colors.reset} ${message}`, ...args);
    },

    request: (method, path, statusCode) => {
        const color = statusCode >= 400 ? colors.red : statusCode >= 300 ? colors.yellow : colors.green;
        console.log(`${colors.cyan}[${method}]${colors.reset} ${path} ${color}${statusCode}${colors.reset}`);
    }
};
