import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Award, Car, Clock } from 'lucide-react';
import './Packages.css';

const Packages = () => {
  return (
    <div className="packages-page">
      <section className="section bg-light text-center">
        <div className="container">
          <span className="badge">All-Inclusive Packages</span>
          <h1 className="h1">Learner Driver Packages</h1>
          <p className="text-lg text-muted" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '1rem' }}>
            Get everything you need to pass your driving test in one convenient bundle. We handle the vehicle, the lessons, and the test prep.
          </p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <div className="learner-packages-grid">
            {/* Package 3 - Test Day */}
            <div className="l-package-card">
              <div className="l-package-header">
                <h3 className="h3">Test Day Package</h3>
                <p className="text-muted">Perfect if you're already test-ready</p>
              </div>
              <div className="l-package-price">
                <span className="currency">$</span>
                <span className="amount">750</span>
              </div>
              <div className="l-package-features">
                <ul>
                  <li><Clock size={20} className="icon-blue" /> 2 hour lesson before test</li>
                  <li><Car size={20} className="icon-blue" /> Test vehicle hire included</li>
                  <li><Award size={20} className="icon-blue" /> Driving test booking</li>
                  <li><Check size={20} className="icon-blue" /> Instructor support on the day</li>
                </ul>
              </div>
              <Link to="/book?package=testday" className="btn btn-outline w-100">Book Package</Link>
            </div>

            {/* Package 1 - Complete Learner (Recommended) */}
            <div className="l-package-card recommended">
              <div className="recommended-badge">Highly Recommended</div>
              <div className="l-package-header">
                <h3 className="h3 text-white">Complete Learner Package</h3>
                <p style={{ opacity: 0.9 }}>From beginner to fully licensed</p>
              </div>
              <div className="l-package-price text-white">
                <span className="currency">$</span>
                <span className="amount">3500</span>
              </div>
              <div className="l-package-features">
                <ul>
                  <li><Clock size={20} className="icon-white" /> Up to 25 driving lessons</li>
                  <li><Award size={20} className="icon-white" /> Includes 2 driving tests</li>
                  <li><Car size={20} className="icon-white" /> Vehicle for both tests</li>
                  <li><Check size={20} className="icon-white" /> Comprehensive test prep</li>
                  <li><Check size={20} className="icon-white" /> Priority booking slots</li>
                </ul>
              </div>
              <Link to="/book?package=complete" className="btn btn-white w-100" style={{ backgroundColor: 'white', color: 'var(--primary-blue)' }}>Book Package</Link>
            </div>

            {/* Package 2 - Learner + 1 Test */}
            <div className="l-package-card">
              <div className="l-package-header">
                <h3 className="h3">Learner + 1 Test</h3>
                <p className="text-muted">Great value for confident learners</p>
              </div>
              <div className="l-package-price">
                <span className="currency">$</span>
                <span className="amount">3000</span>
              </div>
              <div className="l-package-features">
                <ul>
                  <li><Clock size={20} className="icon-blue" /> Up to 26 driving classes</li>
                  <li><Award size={20} className="icon-blue" /> Includes 1 driving test</li>
                  <li><Car size={20} className="icon-blue" /> Vehicle for the test</li>
                  <li><Check size={20} className="icon-blue" /> Structured learning plan</li>
                </ul>
              </div>
              <Link to="/book?package=learner1test" className="btn btn-outline w-100">Book Package</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Packages;
