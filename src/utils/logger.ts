/**
 * Logger utility for consistent logging
 */
class Logger {
  private static instance: Logger;
  private debugMode: boolean = false;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public enableDebug(): void {
    this.debugMode = true;
    console.log('Debug logging enabled');
  }

  public disableDebug(): void {
    this.debugMode = false;
  }

  public debug(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  public info(message: string, ...args: any[]): void {
    console.log(`[INFO] ${message}`, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  public error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }
}

export const logger = Logger.getInstance();