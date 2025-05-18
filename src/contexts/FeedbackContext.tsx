/**
 * FeedbackContext
 * 
 * A React context that provides global feedback functionality
 * for displaying messages, errors, and notifications to the user.
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';

type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  message: string;
  duration?: number;
}

interface FeedbackContextType {
  addFeedback: (type: FeedbackType, message: string, duration?: number) => string;
  removeFeedback: (id: string) => void;
  clearAllFeedback: () => void;
  messages: FeedbackMessage[];
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  
  return context;
};

interface FeedbackProviderProps {
  children: ReactNode;
}

export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  
  // Add a new feedback message
  const addFeedback = (
    type: FeedbackType,
    message: string,
    duration = 5000
  ): string => {
    const id = Date.now().toString();
    
    const newMessage: FeedbackMessage = {
      id,
      type,
      message,
      duration
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // Auto-remove the message after duration (if duration > 0)
    if (duration > 0) {
      setTimeout(() => {
        removeFeedback(id);
      }, duration);
    }
    
    return id;
  };
  
  // Remove a feedback message by ID
  const removeFeedback = (id: string) => {
    setMessages(prevMessages => 
      prevMessages.filter(message => message.id !== id)
    );
  };
  
  // Clear all feedback messages
  const clearAllFeedback = () => {
    setMessages([]);
  };
  
  const value = {
    addFeedback,
    removeFeedback,
    clearAllFeedback,
    messages
  };
  
  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};