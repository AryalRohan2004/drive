import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CalendarCheck, TrendingUp, CarFront, Users, MapPin, Star, CheckCircle } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content fade-in">
          <div className="hero-text">
            <span className="badge">South Australia's Trusted Driving School</span>
            <h1 className="h1">Learn to Drive Safely & Confidently</h1>
            <p className="text-lg">
              Professional driving instruction in Adelaide. Whether you're a first-time learner or converting an overseas licence, we're here to help you succeed.
            </p>
            <div className="hero-actions">
              <Link to="/book" className="btn btn-primary">Book a Lesson</Link>
              <Link to="/contact" className="btn btn-outline bg-white">Get a Quote</Link>
            </div>
          </div>
          <div className="hero-image-placeholder">
            <div className="image-mockup">
              <CarFront size={64} className="text-muted" />
              <span>Premium Hero Image Placeholder</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section about bg-white">
        <div className="container about-grid">
          <div className="about-image">
            <div className="image-mockup">
              <Users size={48} className="text-muted" />
              <span>Founder/Instructor Image Placeholder</span>
            </div>
          </div>
          <div className="about-text">
            <h2 className="h2">Welcome to SANOS Driving School</h2>
            <p className="text-muted">
              Founded by Santosh Dhakal, SANOS Driving School is dedicated to providing high-quality, patient, and professional driving education. We understand that learning to drive can be daunting, which is why we focus on creating a supportive and stress-free environment.
            </p>
            <ul className="feature-list">
              <li><CheckCircle className="icon-success" size={20} /> High first-time pass rates</li>
              <li><CheckCircle className="icon-success" size={20} /> Overseas licence conversion experts</li>
              <li><CheckCircle className="icon-success" size={20} /> Modern, safe training vehicles</li>
            </ul>
            <Link to="/about" className="btn btn-outline" style={{ marginTop: '1.5rem' }}>Learn More About Us</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section why-choose">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="h2">Why Choose SANOS</h2>
            <p className="text-muted">Experience the difference with Adelaide's premier driving instructors.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><ShieldCheck size={28} /></div>
              <h3 className="h4">Qualified Instructor</h3>
              <p className="text-muted">Fully accredited and experienced in South Australian road rules.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><CalendarCheck size={28} /></div>
              <h3 className="h4">Flexible Scheduling</h3>
              <p className="text-muted">Lessons available 7 days a week to fit your busy lifestyle.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><TrendingUp size={28} /></div>
              <h3 className="h4">High Pass Rates</h3>
              <p className="text-muted">Proven teaching methods that help you pass on your first attempt.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><CarFront size={28} /></div>
              <h3 className="h4">Modern Vehicles</h3>
              <p className="text-muted">Learn in a safe, dual-control, and easy-to-drive modern vehicle.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Users size={28} /></div>
              <h3 className="h4">Friendly Style</h3>
              <p className="text-muted">Patient and calm instruction, perfect for nervous beginners.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><MapPin size={28} /></div>
              <h3 className="h4">Local Knowledge</h3>
              <p className="text-muted">Familiar with local testing routes in Adelaide and surrounds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators / Stats */}
      <section className="section stats bg-primary">
        <div className="container stats-grid">
          <div className="stat-item">
            <span className="stat-number">10+</span>
            <span className="stat-label">Years Experience</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">95%</span>
            <span className="stat-label">Pass Rate</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Students Trained</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5.0</span>
            <span className="stat-label">Google Rating</span>
          </div>
        </div>
      </section>
      
      {/* Testimonials Preview */}
      <section className="section testimonials bg-white">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="h2">Student Success Stories</h2>
            <p className="text-muted">Don't just take our word for it.</p>
          </div>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
              <p className="testimonial-text">"Santosh is an amazing instructor! He was so patient with me and helped me build my confidence. I passed my test on the first go!"</p>
              <div className="testimonial-author">- Sarah J.</div>
            </div>
            <div className="testimonial-card">
              <div className="stars"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
              <p className="testimonial-text">"I needed to convert my overseas licence and Santosh explained the SA road rules perfectly. Highly recommend his 3-hour package."</p>
              <div className="testimonial-author">- Rajiv M.</div>
            </div>
            <div className="testimonial-card">
              <div className="stars"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
              <p className="testimonial-text">"The best driving school in Adelaide. The car was always clean, and the lessons were well structured."</p>
              <div className="testimonial-author">- Emily T.</div>
            </div>
          </div>
          
          <div className="text-center" style={{ marginTop: '2rem' }}>
            <Link to="/testimonials" className="btn btn-outline">View All Reviews</Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta">
        <div className="container text-center">
          <h2 className="h2">Ready to Start Your Journey?</h2>
          <p className="text-lg" style={{ marginBottom: '2rem' }}>Book your first lesson today and take the first step towards driving independence.</p>
          <Link to="/book" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>Book Online Now</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
