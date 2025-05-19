// Mock logger implementation for tests
export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

export enum LogCategory {
  GENERAL = 'GENERAL',
  API = 'API',
  AUTH = 'AUTH',
  TAXONOMY = 'TAXONOMY',
  FILE = 'FILE',
  UI = 'UI',
}

// Create a simple mock of the logger
export const logger = {
  // General logging methods
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),

  // Category-specific logging methods
  api: jest.fn(),
  auth: jest.fn(),
  taxonomy: jest.fn(),
  file: jest.fn(),
  ui: jest.fn(),

  // Internal methods (used by other methods)
  addLogEntry: jest.fn(),
};
