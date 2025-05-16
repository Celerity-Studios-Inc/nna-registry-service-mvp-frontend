/**
 * Logger utility for NNA Registry Service
 * 
 * Provides consistent logging with configurable levels and prefixes.
 * In production, only errors and warnings are displayed by default.
 */

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Determine if we're in development environment
const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  private static instance: Logger;
  private debugMode: boolean = isDevelopment;
  private currentLevel: LogLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Enable debug mode to show all log messages
   */
  public enableDebug(): void {
    this.debugMode = true;
    this.currentLevel = LogLevel.DEBUG;
    console.log('[LOGGER] Debug logging enabled');
  }

  /**
   * Disable debug mode to only show important log messages
   */
  public disableDebug(): void {
    this.debugMode = false;
    this.currentLevel = LogLevel.WARN;
    console.log('[LOGGER] Debug logging disabled');
  }

  /**
   * Set the minimum log level to display
   */
  public setLevel(level: LogLevel): void {
    this.currentLevel = level;
    console.log(`[LOGGER] Log level set to ${LogLevel[level]}`);
  }

  /**
   * Debug level logging (development only by default)
   */
  public debug(message: string, ...args: any[]): void {
    if (this.currentLevel <= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Info level logging
   */
  public info(message: string, ...args: any[]): void {
    if (this.currentLevel <= LogLevel.INFO) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Warning level logging
   */
  public warn(message: string, ...args: any[]): void {
    if (this.currentLevel <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  /**
   * Error level logging (always displayed)
   */
  public error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  /**
   * Specialized logging for taxonomy mappings
   */
  public taxonomyMapping(hfn: string, mfa: string, source?: string): void {
    if (this.currentLevel <= LogLevel.DEBUG) {
      console.log(`[TAXONOMY] ${source ? `[${source}] ` : ''}${hfn} -> ${mfa}`);
    }
  }
}

export const logger = Logger.getInstance();