/**
 * Enhanced Logger Utility
 *
 * A utility for consistent logging with additional features like
 * log levels, persistence, and categorization.
 */

// Log levels in order of severity
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Log category for filtering
export enum LogCategory {
  GENERAL = 'GENERAL',
  TAXONOMY = 'TAXONOMY',
  UI = 'UI',
  API = 'API',
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogSize: number = 1000; // Maximum number of logs to keep in memory
  private isEnabled: boolean = true;
  private isConsoleEnabled: boolean = true;
  private isPersistenceEnabled: boolean = false;

  private constructor() {
    this.loadSettings();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Load logger settings from localStorage
   */
  private loadSettings(): void {
    try {
      const settings = localStorage.getItem('logger_settings');

      if (settings) {
        const parsedSettings = JSON.parse(settings);

        this.logLevel = parsedSettings.logLevel ?? LogLevel.INFO;
        this.isEnabled = parsedSettings.isEnabled ?? true;
        this.isConsoleEnabled = parsedSettings.isConsoleEnabled ?? true;
        this.isPersistenceEnabled =
          parsedSettings.isPersistenceEnabled ?? false;
      }

      // Load persisted logs
      if (this.isPersistenceEnabled) {
        const persistedLogs = localStorage.getItem('logger_logs');

        if (persistedLogs) {
          this.logs = JSON.parse(persistedLogs);
        }
      }
    } catch (error) {
      console.error('Error loading logger settings:', error);

      // Reset to defaults
      this.logLevel = LogLevel.INFO;
      this.isEnabled = true;
      this.isConsoleEnabled = true;
      this.isPersistenceEnabled = false;
    }
  }

  /**
   * Save logger settings to localStorage
   */
  private saveSettings(): void {
    try {
      const settings = {
        logLevel: this.logLevel,
        isEnabled: this.isEnabled,
        isConsoleEnabled: this.isConsoleEnabled,
        isPersistenceEnabled: this.isPersistenceEnabled,
      };

      localStorage.setItem('logger_settings', JSON.stringify(settings));

      // Save logs if persistence is enabled
      if (this.isPersistenceEnabled) {
        localStorage.setItem('logger_logs', JSON.stringify(this.logs));
      }
    } catch (error) {
      console.error('Error saving logger settings:', error);
    }
  }

  /**
   * Set the minimum log level
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.saveSettings();
  }

  /**
   * Enable or disable logging
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.saveSettings();
  }

  /**
   * Enable or disable console output
   */
  public setConsoleEnabled(enabled: boolean): void {
    this.isConsoleEnabled = enabled;
    this.saveSettings();
  }

  /**
   * Enable or disable log persistence
   */
  public setPersistenceEnabled(enabled: boolean): void {
    this.isPersistenceEnabled = enabled;
    this.saveSettings();

    // Clear persisted logs if disabled
    if (!enabled) {
      localStorage.removeItem('logger_logs');
    }
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = [];

    if (this.isPersistenceEnabled) {
      localStorage.removeItem('logger_logs');
    }
  }

  /**
   * Get all logs
   */
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by level and/or category
   */
  public getFilteredLogs(level?: LogLevel, category?: LogCategory): LogEntry[] {
    return this.logs.filter(log => {
      if (level !== undefined && log.level < level) {
        return false;
      }

      if (category !== undefined && log.category !== category) {
        return false;
      }

      return true;
    });
  }

  /**
   * Add a log entry
   */
  private addLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    ...data: any[]
  ): void {
    if (!this.isEnabled || level < this.logLevel) {
      return;
    }

    const timestamp = new Date().toISOString();

    const entry: LogEntry = {
      timestamp,
      level,
      category,
      message,
      data: data.length > 0 ? data : undefined,
    };

    // Add to memory logs
    this.logs.push(entry);

    // Trim logs if exceeding max size
    if (this.logs.length > this.maxLogSize) {
      this.logs = this.logs.slice(-this.maxLogSize);
    }

    // Output to console if enabled
    if (this.isConsoleEnabled) {
      const categoryPrefix = `[${category}]`;

      switch (level) {
        case LogLevel.DEBUG:
          console.debug(categoryPrefix, message, ...data);
          break;
        case LogLevel.INFO:
          console.info(categoryPrefix, message, ...data);
          break;
        case LogLevel.WARN:
          console.warn(categoryPrefix, message, ...data);
          break;
        case LogLevel.ERROR:
          console.error(categoryPrefix, message, ...data);
          break;
      }
    }

    // Save logs if persistence is enabled
    if (this.isPersistenceEnabled) {
      try {
        localStorage.setItem('logger_logs', JSON.stringify(this.logs));
      } catch (error) {
        // If localStorage fails, disable persistence
        this.isPersistenceEnabled = false;
        this.saveSettings();
      }
    }
  }

  /**
   * Log a debug message
   */
  public debug(message: string, ...data: any[]): void {
    this.addLogEntry(LogLevel.DEBUG, LogCategory.GENERAL, message, ...data);
  }

  /**
   * Log an info message
   */
  public info(message: string, ...data: any[]): void {
    this.addLogEntry(LogLevel.INFO, LogCategory.GENERAL, message, ...data);
  }

  /**
   * Log a warning message
   */
  public warn(message: string, ...data: any[]): void {
    this.addLogEntry(LogLevel.WARN, LogCategory.GENERAL, message, ...data);
  }

  /**
   * Log an error message
   */
  public error(message: string, ...data: any[]): void {
    this.addLogEntry(LogLevel.ERROR, LogCategory.GENERAL, message, ...data);
  }

  /**
   * Log a taxonomy-related message
   */
  public taxonomy(level: LogLevel, message: string, ...data: any[]): void {
    this.addLogEntry(level, LogCategory.TAXONOMY, message, ...data);
  }

  /**
   * Log a UI-related message
   */
  public ui(level: LogLevel, message: string, ...data: any[]): void {
    this.addLogEntry(level, LogCategory.UI, message, ...data);
  }

  /**
   * Log an API-related message
   */
  public api(level: LogLevel, message: string, ...data: any[]): void {
    this.addLogEntry(level, LogCategory.API, message, ...data);
  }
}

export const logger = Logger.getInstance();
