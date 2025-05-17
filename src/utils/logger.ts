/**
 * Logger utility for consistent logging
 * Enhanced with timestamp and persistence options
 */

// Log levels
enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

class Logger {
  private static instance: Logger;
  // Flag to enable/disable debug logs in production
  // Check both environment and localStorage to allow enabling in production
  private debugMode: boolean = process.env.NODE_ENV !== 'production' ||
    localStorage.getItem('enableDebugLogs') === 'true';

  private constructor() {
    // Initialize with localStorage setting if available
    if (localStorage.getItem('enableDebugLogs') === 'true') {
      this.debugMode = true;
      console.log('[Logger] Debug logging enabled from localStorage');
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public enableDebug(persist: boolean = false): void {
    this.debugMode = true;

    // Optionally persist the setting
    if (persist) {
      localStorage.setItem('enableDebugLogs', 'true');
    }

    console.log('[Logger] Debug logging enabled');
  }

  public disableDebug(persist: boolean = false): void {
    this.debugMode = false;

    // Optionally remove the persisted setting
    if (persist) {
      localStorage.removeItem('enableDebugLogs');
    }

    console.log('[Logger] Debug logging disabled');
  }

  // Format a log message with timestamp
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  public debug(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message), ...args);
    }
  }

  public info(message: string, ...args: any[]): void {
    console.info(this.formatMessage(LogLevel.INFO, message), ...args);
  }

  public warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage(LogLevel.WARN, message), ...args);
  }

  public error(message: string, ...args: any[]): void {
    console.error(this.formatMessage(LogLevel.ERROR, message), ...args);
  }
}

export const logger = Logger.getInstance();