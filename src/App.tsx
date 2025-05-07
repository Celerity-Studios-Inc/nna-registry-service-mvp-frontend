import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

/**
 * Placeholder for Home page component
 */
const HomePage: React.FC = () => (
  <div className="App">
    <header className="App-header">
      <h1>NNA Registry Service</h1>
      <p>Frontend for the Neural Network Architecture Registry</p>
      <p>
        <a href="/login" style={{ color: 'white', textDecoration: 'underline' }}>
          Login
        </a>
      </p>
    </header>
  </div>
);

/**
 * Placeholder for Login page component
 */
const LoginPage: React.FC = () => (
  <div className="App">
    <header className="App-header">
      <h1>Login</h1>
      <p>Login form will be implemented here</p>
      <p>
        <a href="/" style={{ color: 'white', textDecoration: 'underline' }}>
          Back to Home
        </a>
      </p>
    </header>
  </div>
);

/**
 * Main App component with routing
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;