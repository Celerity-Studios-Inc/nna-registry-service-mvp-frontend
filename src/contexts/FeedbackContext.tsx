import React, { createContext, useState, useContext, ReactNode } from 'react';
import FeedbackMessage from '../components/FeedbackMessage';

type FeedbackType = 'success' | 'error' | 'info' | 'warning';

interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  message: string;
  duration?: number;
}

interface FeedbackContextType {
  addFeedback: (type: FeedbackType, message: string, duration?: number) => void;
  removeFeedback: (id: string) => void;
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

  const addFeedback = (type: FeedbackType, message: string, duration = 3000) => {
    const id = Date.now().toString();
    setMessages((prev) => [...prev, { id, type, message, duration }]);
  };

  const removeFeedback = (id: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== id));
  };

  return (
    <FeedbackContext.Provider value={{ addFeedback, removeFeedback }}>
      {children}
      <div className="feedback-container">
        {messages.map((msg) => (
          <FeedbackMessage
            key={msg.id}
            type={msg.type}
            message={msg.message}
            duration={msg.duration}
            onClose={() => removeFeedback(msg.id)}
          />
        ))}
      </div>
    </FeedbackContext.Provider>
  );
};