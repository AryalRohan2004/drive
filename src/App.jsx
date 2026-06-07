import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';

import Pricing from './pages/Pricing';
import Packages from './pages/Packages';
import Overseas from './pages/Overseas';
import Hub from './pages/Hub';
import Contact from './pages/Contact';
import Booking from './pages/Booking';
import Auth from './pages/Auth';
import LearnerDashboard from './pages/LearnerDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import Resources from './pages/Resources';

// Placeholder components for routes not yet implemented
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
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="packages" element={<Packages />} />
        <Route path="overseas" element={<Overseas />} />
        <Route path="hub" element={<Hub />} />
        <Route path="areas" element={<PlaceholderPage title="Service Areas" />} />
        <Route path="contact" element={<Contact />} />
        <Route path="resources" element={<Resources />} />
        <Route path="countries" element={<PlaceholderPage title="Recognised Countries" />} />
        <Route path="faq" element={<PlaceholderPage title="Frequently Asked Questions" />} />
        <Route path="testimonials" element={<PlaceholderPage title="Student Testimonials" />} />
        <Route path="login" element={<Auth defaultIsLogin={true} />} />
        <Route path="signup" element={<Auth defaultIsLogin={false} />} />
        <Route path="book" element={<Booking />} />
        <Route path="learner-dashboard" element={<LearnerDashboard />} />
        <Route path="instructor-dashboard" element={<InstructorDashboard />} />
        <Route path="*" element={<PlaceholderPage title="404 - Page Not Found" />} />
      </Route>
      </Routes>
    </>
  );
}

export default App;
