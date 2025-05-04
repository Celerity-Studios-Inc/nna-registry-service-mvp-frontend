import React, { createContext, useState, useEffect, useContext } from 'react';

// Task interface for pending items
export interface Task {
  id: string;
  type: 'training_upload' | 'rights_edit';
  assetId: string;
  assetName: string;
  createdAt: string;
}

// Context interface
interface NotificationsContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  removeTask: (taskId: string) => void;
  taskCount: number;
}

// Create context with default values
export const NotificationsContext = createContext<NotificationsContextType>({
  tasks: [],
  addTask: () => {},
  removeTask: () => {},
  taskCount: 0
});

// Custom hook for using the context
export const useNotifications = () => useContext(NotificationsContext);

// Generate a unique ID
const generateId = () => `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Provider component
export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Load tasks from local storage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('nna_tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Failed to parse saved tasks:', e);
      }
    }
  }, []);
  
  // Save tasks to local storage when they change
  useEffect(() => {
    localStorage.setItem('nna_tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // Add a new task
  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    // Check for duplicates
    const isDuplicate = tasks.some(t => 
      t.type === task.type && 
      t.assetId === task.assetId
    );
    
    if (!isDuplicate) {
      const newTask: Task = {
        ...task,
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
    }
  };
  
  // Remove a task
  const removeTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };
  
  return (
    <NotificationsContext.Provider value={{
      tasks,
      addTask,
      removeTask,
      taskCount: tasks.length
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider;