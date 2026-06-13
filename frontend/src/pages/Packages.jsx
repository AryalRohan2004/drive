import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Award, Car, Clock, Info } from 'lucide-react';
import './Packages.css';

const Packages = () => {
  return (
    <div className="packages-page">
      <section className="section bg-light text-center" style={{ paddingBottom: '0' }}>
        <div className="container">
          <span className="package-badge badge-blue">All-Inclusive Packages</span>
          <h1 className="h1" style={{ marginTop: '1rem' }}>Learner Driver Packages</h1>
          <p className="text-lg text-muted" style={{ maxWidth: '600px', margin: '1.5rem auto 0' }}>
            Get everything you need to pass your driving test in one convenient bundle. We handle the vehicle, the lessons, and the test prep.
          </p>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container">
          <div className="packages-grid">
            
            {/* Package 1 */}
            <div className="package-card">
              <div className="package-header">
                <h3 className="h3">Test Day Package</h3>
                <p className="package-desc">Perfect if you're already test-ready</p>
              </div>
              <div className="package-body">
                <div className="package-price-box">
                  <div>
                    <div className="price-amount">$750</div>
                    <div className="price-label">One-time payment</div>
                  </div>
                </div>
                <div className="package-includes">
                  <h4>What's Included</h4>
                  <ul className="package-features">
                    <li><Clock size={20} className="feature-icon" /> 2 hour lesson before test</li>
                    <li><Car size={20} className="feature-icon" /> Test vehicle hire included</li>
                    <li><Award size={20} className="feature-icon" /> Driving test booking</li>
                    <li><Check size={20} className="feature-icon" /> Instructor support on the day</li>
                  </ul>
                </div>
              </div>
              <Link to="/book?package=testday" className="btn btn-outline">Book Package</Link>
            </div>

            {/* Package 2 - Recommended */}
            <div className="package-card" style={{ borderColor: 'var(--primary-blue)', transform: 'translateY(-8px)', boxShadow: 'var(--shadow-xl)' }}>
              <div className="package-header" style={{ background: 'var(--primary-blue)', color: 'var(--white)' }}>
                <span className="package-badge badge-green" style={{ background: 'var(--white)' }}>Highly Recommended</span>
                <h3 className="h3" style={{ color: 'var(--white)' }}>Complete Learner</h3>
                <p className="package-desc" style={{ color: 'rgba(255,255,255,0.8)' }}>From beginner to fully licensed</p>
              </div>
              <div className="package-body">
                <div className="package-price-box">
                  <div>
                    <div className="price-amount">$3500</div>
                    <div className="price-label">One-time payment</div>
                  </div>
                  <div className="savings">Save $500</div>
                </div>
                <div className="package-includes">
                  <h4>What's Included</h4>
                  <ul className="package-features">
                    <li><Clock size={20} className="feature-icon" /> Up to 25 driving lessons</li>
                    <li><Award size={20} className="feature-icon" /> Includes 2 driving tests</li>
                    <li><Car size={20} className="feature-icon" /> Vehicle for both tests</li>
                    <li><Check size={20} className="feature-icon" /> Comprehensive test prep</li>
                    <li><Check size={20} className="feature-icon" /> Priority booking slots</li>
                  </ul>
                </div>
              </div>
              <Link to="/book?package=complete" className="btn btn-primary">Book Package</Link>
            </div>

            {/* Package 3 */}
            <div className="package-card">
              <div className="package-header">
                <h3 className="h3">Learner + 1 Test</h3>
                <p className="package-desc">Great value for confident learners</p>
              </div>
              <div className="package-body">
                <div className="package-price-box">
                  <div>
                    <div className="price-amount">$3000</div>
                    <div className="price-label">One-time payment</div>
                  </div>
                  <div className="savings">Save $250</div>
                </div>
                <div className="package-includes">
                  <h4>What's Included</h4>
                  <ul className="package-features">
                    <li><Clock size={20} className="feature-icon" /> Up to 26 driving classes</li>
                    <li><Award size={20} className="feature-icon" /> Includes 1 driving test</li>
                    <li><Car size={20} className="feature-icon" /> Vehicle for the test</li>
                    <li><Check size={20} className="feature-icon" /> Structured learning plan</li>
                  </ul>
                </div>
              </div>
              <Link to="/book?package=learner1test" className="btn btn-outline">Book Package</Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Packages;
