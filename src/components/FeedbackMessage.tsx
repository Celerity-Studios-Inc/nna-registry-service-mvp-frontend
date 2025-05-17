import React, { useState, useEffect } from 'react';

interface FeedbackMessageProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number; // Duration in milliseconds, defaults to 3000
  onClose?: () => void;
}

/**
 * Component to display feedback messages to the user
 */
const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  type,
  message,
  duration = 3000,
  onClose
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose && onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    onClose && onClose();
  };

  if (!visible) return null;

  return (
    <div className={`feedback-message ${type}`}>
      <div className="feedback-message-content">
        {type === 'success' && <span className="icon">✓</span>}
        {type === 'error' && <span className="icon">✗</span>}
        {type === 'warning' && <span className="icon">⚠</span>}
        {type === 'info' && <span className="icon">ℹ</span>}
        <span className="message">{message}</span>
      </div>
      <button className="close-button" onClick={handleClose}>
        ×
      </button>
    </div>
  );
};

export default FeedbackMessage;