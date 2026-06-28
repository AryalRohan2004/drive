import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Packages from './pages/Packages';
import Overseas from './pages/Overseas';
import Hub from './pages/Hub';
import Contact from './pages/Contact';
import Booking from './pages/Booking';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import InstructorRegistration from './pages/InstructorRegistration';
import LearnerDashboard from './pages/LearnerDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Resources from './pages/Resources';
import Profile from './pages/Profile';
import TrainingRequests from './pages/TrainingRequests';
import Documents from './pages/Documents';
import FindInstructor from './pages/FindInstructor';
import Assignments from './pages/Assignments';
import TransferRequests from './pages/TransferRequests';
import Testimonials from './pages/Testimonials';
import FAQ from './pages/FAQ';

// Placeholder components for routes not yet fully built
const PlaceholderPage = ({ title }) => (
  <div className="container section text-center">
    <h1 className="h1">{title}</h1>
    <p className="text-muted" style={{ marginTop: '1rem' }}>This page is currently under construction.</p>
  </div>
);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public pages */}
          <Route index element={<Home />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="packages" element={<Packages />} />
          <Route path="overseas" element={<Overseas />} />
          <Route path="hub" element={<Hub />} />
          <Route path="areas" element={<PlaceholderPage title="Service Areas" />} />
          <Route path="contact" element={<Contact />} />
          <Route path="resources" element={<Resources />} />
          <Route path="countries" element={<PlaceholderPage title="Recognised Countries" />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="find-instructor" element={<FindInstructor />} />

          {/* Auth pages */}
          <Route path="login" element={<Auth defaultIsLogin={true} />} />
          <Route path="signup" element={<Auth defaultIsLogin={false} />} />
          <Route path="instructor-register" element={<InstructorRegistration />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />

          {/* Protected: Any authenticated user */}
          <Route path="book" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
          <Route path="documents" element={<ProtectedRoute roles={['learner', 'admin']}><Documents /></ProtectedRoute>} />

          {/* Protected: Learner */}
          <Route path="learner-dashboard" element={<ProtectedRoute roles={['learner', 'admin']}><LearnerDashboard /></ProtectedRoute>} />

          {/* Protected: Instructor */}
          <Route path="instructor-dashboard" element={<ProtectedRoute roles={['instructor', 'admin']}><InstructorDashboard /></ProtectedRoute>} />

          {/* Protected: Instructor + Learner + Admin */}
          <Route path="training-requests" element={<ProtectedRoute><TrainingRequests /></ProtectedRoute>} />
          <Route path="transfer-requests" element={<ProtectedRoute><TransferRequests /></ProtectedRoute>} />

          {/* Protected: Admin only */}
          <Route path="admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<PlaceholderPage title="404 - Page Not Found" />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
