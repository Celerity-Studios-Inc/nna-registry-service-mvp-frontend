/**
 * FeedbackDisplay Component
 * 
 * A component that displays feedback messages from the FeedbackContext.
 */
import React from 'react';
import { useFeedback } from '../../contexts/FeedbackContext';
import '../../styles/Feedback.css';

const FeedbackDisplay: React.FC = () => {
  const { messages, removeFeedback } = useFeedback();
  
  if (messages.length === 0) {
    return null;
  }
  
  return (
    <div className="feedback-container">
      {messages.map(message => (
        <div 
          key={message.id}
          className={`feedback-item feedback-${message.type}`}
          data-testid={`feedback-${message.id}`}
        >
          <div className="feedback-content">
            {message.type === 'success' && (
              <span className="feedback-icon">✓</span>
            )}
            {message.type === 'error' && (
              <span className="feedback-icon">✗</span>
            )}
            {message.type === 'warning' && (
              <span className="feedback-icon">⚠</span>
            )}
            {message.type === 'info' && (
              <span className="feedback-icon">ℹ</span>
            )}
            <span className="feedback-message">{message.message}</span>
          </div>
          <button 
            className="feedback-close"
            onClick={() => removeFeedback(message.id)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default FeedbackDisplay;