import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterAssetPage from './pages/RegisterAssetPage';
import SearchAssetsPage from './pages/SearchAssetsPage';
import AssetDetailPage from './pages/AssetDetailPage';
import DashboardPage from './pages/DashboardPage';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/register-asset" element={<RegisterAssetPage />} />
            <Route path="/search-assets" element={<SearchAssetsPage />} />
            <Route path="/assets/:id" element={<AssetDetailPage />} />
            <Route path="/" element={<DashboardPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
