/**
 * LogViewer Component
 *
 * A component for viewing and filtering application logs.
 */
import React, { useState, useEffect } from 'react';
import { logger, LogLevel, LogCategory, LogEntry } from '../../utils/logger';
import '../../styles/LogViewer.css';

const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<LogLevel>(LogLevel.DEBUG);
  const [filterCategory, setFilterCategory] = useState<LogCategory | 'ALL'>(
    'ALL'
  );
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  // Fetch logs based on filters
  const fetchLogs = () => {
    if (filterCategory === 'ALL') {
      setLogs(logger.getFilteredLogs(filterLevel));
    } else {
      setLogs(logger.getFilteredLogs(filterLevel, filterCategory));
    }
  };

  // Fetch logs on mount and when filters change
  useEffect(() => {
    fetchLogs();

    // Set up auto-refresh interval
    let interval: NodeJS.Timeout | null = null;

    if (autoRefresh) {
      interval = setInterval(fetchLogs, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [filterLevel, filterCategory, autoRefresh]);

  // Get CSS class for log level
  const getLevelClassName = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'log-level-debug';
      case LogLevel.INFO:
        return 'log-level-info';
      case LogLevel.WARN:
        return 'log-level-warn';
      case LogLevel.ERROR:
        return 'log-level-error';
      default:
        return '';
    }
  };

  // Get text for log level
  const getLevelText = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'DEBUG';
      case LogLevel.INFO:
        return 'INFO';
      case LogLevel.WARN:
        return 'WARN';
      case LogLevel.ERROR:
        return 'ERROR';
      default:
        return 'UNKNOWN';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch (error) {
      return timestamp;
    }
  };

  // Clear logs
  const handleClearLogs = () => {
    logger.clearLogs();
    fetchLogs();
  };

  // Toggle auto-refresh
  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // Toggle collapsed state
  const handleToggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`log-viewer ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="log-viewer-header">
        <button className="log-viewer-toggle" onClick={handleToggleCollapsed}>
          {isCollapsed ? 'Show Logs' : 'Hide Logs'}
        </button>

        {!isCollapsed && (
          <>
            <h3>Log Viewer</h3>

            <div className="log-viewer-controls">
              <div className="log-filter">
                <label>Level:</label>
                <select
                  value={filterLevel}
                  onChange={e =>
                    setFilterLevel(Number(e.target.value) as LogLevel)
                  }
                >
                  <option value={LogLevel.DEBUG}>Debug+</option>
                  <option value={LogLevel.INFO}>Info+</option>
                  <option value={LogLevel.WARN}>Warn+</option>
                  <option value={LogLevel.ERROR}>Error</option>
                </select>
              </div>

              <div className="log-filter">
                <label>Category:</label>
                <select
                  value={filterCategory}
                  onChange={e =>
                    setFilterCategory(e.target.value as LogCategory | 'ALL')
                  }
                >
                  <option value="ALL">All</option>
                  <option value={LogCategory.GENERAL}>General</option>
                  <option value={LogCategory.TAXONOMY}>Taxonomy</option>
                  <option value={LogCategory.UI}>UI</option>
                  <option value={LogCategory.API}>API</option>
                </select>
              </div>

              <button
                className={`auto-refresh-button ${autoRefresh ? 'active' : ''}`}
                onClick={handleToggleAutoRefresh}
              >
                {autoRefresh ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'}
              </button>

              <button className="clear-logs-button" onClick={handleClearLogs}>
                Clear Logs
              </button>

              <button className="refresh-button" onClick={fetchLogs}>
                Refresh
              </button>
            </div>
          </>
        )}
      </div>

      {!isCollapsed && (
        <div className="log-viewer-content">
          {logs.length === 0 ? (
            <div className="no-logs">No logs to display</div>
          ) : (
            <table className="log-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Level</th>
                  <th>Category</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index} className={getLevelClassName(log.level)}>
                    <td className="log-time">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="log-level">{getLevelText(log.level)}</td>
                    <td className="log-category">{log.category}</td>
                    <td className="log-message">
                      <div>{log.message}</div>
                      {log.data && (
                        <div className="log-data">
                          {typeof log.data === 'string'
                            ? log.data
                            : JSON.stringify(log.data, null, 2)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default LogViewer;
