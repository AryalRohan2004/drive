import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Info } from 'lucide-react';
import './Pricing.css';

const Pricing = () => {
  return (
    <div className="pricing-page">
      <section className="section bg-light text-center">
        <div className="container">
          <h1 className="h1">Driving Lessons & Pricing</h1>
          <p className="text-lg text-muted" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '1rem' }}>
            Transparent pricing with no hidden fees. Choose a single lesson or save more with our bulk packages.
          </p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <h2 className="h2 text-center" style={{ marginBottom: '3rem' }}>Single Lessons</h2>
          <div className="pricing-grid">
            {/* 1 Hour Lesson */}
            <div className="pricing-card">
              <div className="pricing-header">
                <h3 className="h3">1 Hour Lesson</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">135</span>
                </div>
                <p className="text-muted">Perfect for a quick refresher or assessment.</p>
              </div>
              <div className="pricing-features">
                <ul>
                  <li><Check className="icon-success" size={20} /> Door-to-door pickup & drop-off</li>
                  <li><Check className="icon-success" size={20} /> Modern dual-control vehicle</li>
                  <li><Check className="icon-success" size={20} /> 1-on-1 instruction</li>
                </ul>
              </div>
              <div className="pricing-action">
                <Link to="/book?type=1hr" className="btn btn-outline w-100">Book Now</Link>
              </div>
            </div>

            {/* 1.5 Hour Lesson */}
            <div className="pricing-card popular">
              <div className="popular-badge">Most Popular</div>
              <div className="pricing-header">
                <h3 className="h3">1.5 Hour Lesson</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">160</span>
                </div>
                <p className="text-muted">The sweet spot for learning new skills.</p>
              </div>
              <div className="pricing-features">
                <ul>
                  <li><Check className="icon-success" size={20} /> Door-to-door pickup & drop-off</li>
                  <li><Check className="icon-success" size={20} /> Extended practice time</li>
                  <li><Check className="icon-success" size={20} /> Logbook updates included</li>
                </ul>
              </div>
              <div className="pricing-action">
                <Link to="/book?type=1.5hr" className="btn btn-primary w-100">Book Now</Link>
              </div>
            </div>

            {/* 2 Hour Lesson */}
            <div className="pricing-card">
              <div className="pricing-header">
                <h3 className="h3">2 Hour Lesson</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">220</span>
                </div>
                <p className="text-muted">Intensive session for maximum progress.</p>
              </div>
              <div className="pricing-features">
                <ul>
                  <li><Check className="icon-success" size={20} /> Deep dive into complex traffic</li>
                  <li><Check className="icon-success" size={20} /> Mock driving test preparation</li>
                  <li><Check className="icon-success" size={20} /> Comprehensive feedback</li>
                </ul>
              </div>
              <div className="pricing-action">
                <Link to="/book?type=2hr" className="btn btn-outline w-100">Book Now</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container">
          <h2 className="h2 text-center" style={{ marginBottom: '1rem' }}>Bulk Lesson Packages</h2>
          <p className="text-center text-muted" style={{ marginBottom: '3rem' }}>Commit to your driving journey and save.</p>
          
          <div className="packages-grid">
            {/* 10 Lesson Package */}
            <div className="package-card">
              <div className="package-content">
                <h3 className="h3">10 Lesson Package</h3>
                <p className="text-muted" style={{ marginTop: '0.5rem' }}>Ideal for building a solid foundation of driving skills.</p>
                <div className="savings-pill">
                  <Info size={16} /> Save $300 compared to single lessons
                </div>
              </div>
              <div className="package-price">
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">1050</span>
                </div>
                <Link to="/book?package=10lessons" className="btn btn-primary mt-3">Select Package</Link>
              </div>
            </div>

            {/* 20 Lesson Package */}
            <div className="package-card featured-package">
              <div className="package-content">
                <h3 className="h3 text-white">20 Lesson Package</h3>
                <p style={{ marginTop: '0.5rem', opacity: 0.9 }}>Comprehensive training covering all test requirements.</p>
                <div className="savings-pill light">
                  <Info size={16} /> Save $700 compared to single lessons
                </div>
              </div>
              <div className="package-price">
                <div className="price text-white">
                  <span className="currency">$</span>
                  <span className="amount">2000</span>
                </div>
                <Link to="/book?package=20lessons" className="btn btn-white mt-3" style={{ backgroundColor: 'white', color: 'var(--primary-blue)' }}>Select Package</Link>
              </div>
            </div>
          </div>

          <div className="text-center" style={{ marginTop: '3rem' }}>
            <p className="text-muted">Looking for complete packages that include the test and vehicle?</p>
            <Link to="/packages" className="btn btn-outline" style={{ marginTop: '1rem' }}>View Learner Packages</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
