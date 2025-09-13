import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

import { AuthProvider, useAuth } from '../contexts/AuthContext.jsx';

import Login from './Login.jsx';
import Register from './Register.jsx';  
import StudentDashboard from './StudentDashboard.jsx';
import PlacementOfficerDashboard from './PlacementOfficerDashboard.jsx';
import ProfilePage from './ProfilePage.jsx';  

import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ResumeUpload from './ResumeUpload.jsx';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'admin':
      return <PlacementOfficerDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      <AuthProvider>
        <Router>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            <Routes>
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route 
                path="/student-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />

                  </ProtectedRoute>
                  
                }
              />
              <Route 
                path="/resume-analyzer"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ResumeUpload />
                  </ProtectedRoute> 
                }
              />

              <Route 
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <PlacementOfficerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Profile */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                } 
              />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route 
                path="/unauthorized" 
                element={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-error mb-4">Unauthorized Access</h1>
                      <p className="text-text-secondary">You don't have permission to access this page.</p>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </motion.div>
        </Router>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#2D3748',
              color: '#E2E8F0',
              border: '1px solid #9F70FD',
            },
            success: {
              iconTheme: { primary: '#48BB78', secondary: '#E2E8F0' },
            },
            error: {
              iconTheme: { primary: '#F56565', secondary: '#E2E8F0' },
            },
          }}
        />
      </AuthProvider>
    </div>
  );
}

export default App;
