import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar'; // Nhớ import Sidebar mới
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import CreatePostPage from './pages/CreatePostPage';

function App() {
  const isAuthenticated = !!localStorage.getItem('accessToken');

  const Layout = ({ children }) => (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa' }}>

      {/* 1. Sidebar bên trái (Fixed) */}
      {isAuthenticated && <Sidebar />}

      {/* 2. Nội dung bên phải */}
      <div style={{
        flex: 1,
        // Luôn chừa ra 72px bên trái để tránh icon của sidebar che mất nội dung
        marginLeft: isAuthenticated ? '72px' : '0',
        transition: 'margin-left 0.3s ease'
      }}>
        {children}
      </div>
    </div>
  );

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    return <Layout>{children}</Layout>;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />

        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/create-post" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;