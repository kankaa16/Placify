import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from '../contexts/AuthContext.jsx';

import Login from './Login.jsx';
import Register from './Register.jsx';
import StudentDashboard from './StudentDashboard.jsx';
import PlacementOfficerDashboard from './PlacementOfficerDashboard.jsx';
import StudentOfferUpload from './StudentOfferUpload.jsx';
import ProfilePage from './ProfilePage.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ResumeUpload from './ResumeUpload.jsx';
import Scorecards from './Scorecards.jsx';
import AddCompany from "./AddCompany.jsx";
import ManageCompanies from './ManageCompanies.jsx';

import ProfileStats from '../components/ProfileStats.jsx';
import PlacementAnalytics from './PlacementAnalytics.jsx';
import AdminStudentList from './AdminStudentList.jsx';
import StudentProfile from './StudentProfile.jsx';
import ApprovedOffers from './ApprovedOffers.jsx';
import AdminOfferVerification from './AdminOfferVerification.jsx';
import AIInterviewLanding from '../components/AIInterviewLanding.jsx';
import AIMockInterviewSession from "../components/AIInterviewSession.jsx";
import InterviewScore from '../components/InterviewScore.jsx';
import ExploreRoles from './ExploreRoles.jsx';
const ScorecardsWrapper = () => {
  const { user } = useAuth();
  return <div className="scorecards-wrapper"><Scorecards userId={user?._id} /></div>;
};

const ProfileStatsWrapper = () => {
  const { user } = useAuth();
  if (!user) return <LoadingSpinner />; // wait until user loads
  return <ProfileStats userId={user._id} />;
};



// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Route selector based on role
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

// Separated AppContent to ensure AuthProvider loads before Router
function AppContent() {
  return (
    <Router>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen"
      >
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />


<Route path="/upload-offer" element={<StudentOfferUpload applicationId/>} />

          {/* Protected routes */}
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
  path="/coding-scores"
  element={
    <ProtectedRoute allowedRoles={['student']}>
      <ProfileStatsWrapper />
    </ProtectedRoute>
  }
/>

<Route
  path="/ai-interview"
  element={
    <ProtectedRoute allowedRoles={['student']}>
      <AIInterviewLanding />
    </ProtectedRoute>
  }
/>
<Route
  path="/ai-interview/session/:sessionId"
  element={
    <ProtectedRoute allowedRoles={['student']}>
      <AIMockInterviewSession />
    </ProtectedRoute>
  }
/>

<Route
  path="/ai-interview/score"
  element={
    <ProtectedRoute allowedRoles={['student']}>
      <InterviewScore />
    </ProtectedRoute>
  }
/>

<Route path="/explore-roles" element={<ExploreRoles />} />



          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PlacementOfficerDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/approved-offers" element={<ApprovedOffers />} />
<Route path="/verify-offers" element={<AdminOfferVerification />} />

<Route
  path="/add-company"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AddCompany />
    </ProtectedRoute>
  }
/>


<Route
  path="/manage-companies"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <ManageCompanies />
    </ProtectedRoute>
  }
/>

<Route
  path="/student-management"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminStudentList />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/:id"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <StudentProfile />
    </ProtectedRoute>
  }
/>

          <Route
            path="/placement-analytics"
            element={
              <ProtectedRoute>
                <PlacementAnalytics />
              </ProtectedRoute>
            }
          />


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

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Unauthorized */}
          <Route
            path="/unauthorized"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-error mb-4">Unauthorized Access</h1>
                  <p className="text-text-secondary">
                    You don’t have permission to access this page.
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </motion.div>
    </Router>
  );
}

// Main App
function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background-primary text-text-primary">
        <AppContent />

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
      </div>
    </AuthProvider>
  );
}

export default App;
