import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, FileText, CalendarCheck, HelpCircle } from 'lucide-react';
import './Overseas.css';

const Overseas = () => {
  return (
    <div className="overseas-page">
      <section className="section bg-light text-center">
        <div className="container">
          <span className="badge">International Drivers</span>
          <h1 className="h1">Overseas Licence Transfer</h1>
          <p className="text-lg text-muted" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '1rem' }}>
            Convert your international driver's licence to a South Australian licence with expert guidance and tailored training.
          </p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <div className="process-timeline">
            <h2 className="h2 text-center" style={{ marginBottom: '3rem' }}>The Conversion Process</h2>
            
            <div className="timeline-grid">
              <div className="timeline-step">
                <div className="step-number">1</div>
                <div className="step-icon"><Globe size={32} /></div>
                <h3 className="h4">Check Eligibility</h3>
                <p className="text-muted">Verify if your country is recognised or if you need to take a driving test. (<Link to="/countries" className="text-link">See Recognised Countries</Link>)</p>
              </div>
              <div className="timeline-step">
                <div className="step-number">2</div>
                <div className="step-icon"><FileText size={32} /></div>
                <h3 className="h4">Pass Theory Test</h3>
                <p className="text-muted">Most conversions require passing the South Australian learner's theory test at a Service SA center.</p>
              </div>
              <div className="timeline-step">
                <div className="step-number">3</div>
                <div className="step-icon"><CalendarCheck size={32} /></div>
                <h3 className="h4">Take Driving Lessons</h3>
                <p className="text-muted">Learn the specific SA road rules and prepare for the practical driving test format with an instructor.</p>
              </div>
              <div className="timeline-step">
                <div className="step-number">4</div>
                <div className="step-icon"><HelpCircle size={32} /></div>
                <h3 className="h4">Pass Practical Test</h3>
                <p className="text-muted">Complete your Vehicle On Road Test (VORT) or CBT&A to receive your SA driver's licence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-primary text-white text-center">
        <div className="container">
          <h2 className="h2 text-white" style={{ marginBottom: '1.5rem' }}>Featured Conversion Package</h2>
          <div className="featured-card">
            <h3 className="h3 text-dark">International Conversion Package</h3>
            <p className="text-muted mb-3">Designed specifically for experienced overseas drivers</p>
            <div className="price text-dark" style={{ justifyContent: 'center' }}>
              <span className="currency">$</span>
              <span className="amount">825</span>
            </div>
            <ul className="featured-list text-left text-dark">
              <li>✓ 3 Hours of dedicated driving lessons</li>
              <li>✓ Focus on SA-specific road rules (Give way, U-turns, Speed limits)</li>
              <li>✓ Mock test preparation</li>
              <li>✓ Test vehicle hire included</li>
              <li>✓ Driving test support</li>
            </ul>
            <Link to="/book?package=overseas" className="btn btn-primary w-100 mt-3">Book This Package</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Overseas;
