import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CalendarCheck, TrendingUp, CarFront, Users, MapPin, Star, CheckCircle } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-grid fade-in">
          <div className="hero-content">
            <span className="badge" style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              South Australia's Trusted Driving School
            </span>
            <h1 className="h1">
              Learn to Drive <span className="text-highlight">Safely & Confidently</span>
            </h1>
            <p className="text-lg">
              Professional driving instruction in Adelaide. Whether you're a first-time learner or converting an overseas licence, we're here to help you succeed.
            </p>
            <div className="hero-buttons">
              <Link to="/book" className="btn btn-primary">Book a Lesson</Link>
              <Link to="/contact" className="btn btn-outline">Get a Quote</Link>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img src="/hero_lesson.png" alt="Driving instructor teaching a student in a modern car" className="hero-image" />
          </div>
        </div>
      </section>

      {/* Trust Indicators / Stats */}
      <section className="stats-section">
        <div className="container stats-grid">
          <div className="stat-item">
            <div className="stat-number">10+</div>
            <div className="stat-label">Years Experience</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">95%</div>
            <div className="stat-label">Pass Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Students Trained</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5.0</div>
            <div className="stat-label">Google Rating</div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="founder-section">
        <div className="container founder-grid">
          <div className="founder-image-wrapper">
            <img src="/founder_instructor.png" alt="Santosh Dhakal - Founder of SANOS Driving School" className="founder-image" />
          </div>
          <div className="founder-content">
            <h2 className="h2" style={{ marginBottom: '1.5rem' }}>Welcome to SANOS Driving School</h2>
            <p className="founder-quote">
              "Founded by Santosh Dhakal, SANOS Driving School is dedicated to providing high-quality, patient, and professional driving education."
            </p>
            <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '1.125rem' }}>
              We understand that learning to drive can be daunting, which is why we focus on creating a supportive and stress-free environment.
            </p>
            <ul className="feature-list" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '500' }}><CheckCircle size={24} color="var(--success-green)" /> High first-time pass rates</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '500' }}><CheckCircle size={24} color="var(--success-green)" /> Overseas licence conversion experts</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '500' }}><CheckCircle size={24} color="var(--success-green)" /> Modern, safe training vehicles</li>
            </ul>
            <Link to="/about" className="btn btn-outline">Learn More About Us</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="features-section">
        <div className="container">
          <div className="section-header text-center" style={{ marginBottom: '4rem' }}>
            <h2 className="h2">Why Choose SANOS</h2>
            <p className="text-muted text-lg" style={{ marginTop: '0.5rem' }}>Experience the difference with Adelaide's premier driving instructors.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper"><ShieldCheck size={28} /></div>
              <h3 className="h4">Qualified Instructor</h3>
              <p>Fully accredited and experienced in South Australian road rules.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><CalendarCheck size={28} /></div>
              <h3 className="h4">Flexible Scheduling</h3>
              <p>Lessons available 7 days a week to fit your busy lifestyle.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><TrendingUp size={28} /></div>
              <h3 className="h4">High Pass Rates</h3>
              <p>Proven teaching methods that help you pass on your first attempt.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><CarFront size={28} /></div>
              <h3 className="h4">Modern Vehicles</h3>
              <p>Learn in a safe, dual-control, and easy-to-drive modern vehicle.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Users size={28} /></div>
              <h3 className="h4">Friendly Style</h3>
              <p>Patient and calm instruction, perfect for nervous beginners.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><MapPin size={28} /></div>
              <h3 className="h4">Local Knowledge</h3>
              <p>Familiar with local testing routes in Adelaide and surrounds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-white border-top">
        <div className="container text-center" style={{ padding: '6rem 0' }}>
          <h2 className="h2" style={{ marginBottom: '1rem' }}>Ready to Start Your Journey?</h2>
          <p className="text-lg text-muted" style={{ marginBottom: '2.5rem', maxWidth: '600px', margin: '1rem auto 2.5rem' }}>Book your first lesson today and take the first step towards driving independence.</p>
          <Link to="/book" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>Book Online Now</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
