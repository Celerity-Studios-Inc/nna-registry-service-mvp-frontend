/**
 * Shared type definitions for error handling
 */

export type ErrorSeverity = 'error' | 'warning' | 'info' | 'success';

export interface ErrorMessage {
  message: string;
  severity: ErrorSeverity;
  title?: string;
  autoHide?: boolean;
}

export type ErrorHandler = (
  message: string | ErrorMessage,
  severity?: ErrorSeverity
) => void;
