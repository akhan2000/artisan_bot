// src/App.tsx

import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatWindow from './components/ChatWindow/ChatWindow';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import { AuthContext } from './context/AuthContext';
import { CircularProgress } from '@mui/material';

const App: React.FC = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    // Render a loader while authentication state is being determined
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ChatWindow />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" /> : <Register />} 
        />
        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;