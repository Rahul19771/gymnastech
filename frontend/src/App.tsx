import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { JudgePanel } from './pages/JudgePanel';
import { Leaderboard } from './pages/Leaderboard';
import { EventDetail } from './pages/EventDetail';
import { EventForm } from './pages/EventForm';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/events"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/events/new"
          element={
            <PrivateRoute>
              <Layout>
                <EventForm />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/events/:id"
          element={
            <PrivateRoute>
              <Layout>
                <EventDetail />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/events/:eventId/judge"
          element={
            <PrivateRoute>
              <Layout>
                <JudgePanel />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/events/:eventId/leaderboard"
          element={
            <PrivateRoute>
              <Layout>
                <Leaderboard />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


