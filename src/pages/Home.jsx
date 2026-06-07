import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CalendarCheck, TrendingUp, CarFront, Users, MapPin, Star, CheckCircle, ArrowRight, Phone, Search, ChevronDown, GraduationCap, Award, Map, Quote } from 'lucide-react';
import './Home.css';

const successImages = [
  '/Sucess/s2.jpg',
  '/Sucess/s3.jpg',
  '/Sucess/s4.jpg',
  '/Sucess/s5.jpg',
  '/Sucess/s6.jpg',
  '/Sucess/s7.jpg',
  '/Sucess/s9.jpg',
  '/Sucess/s10.jpg',
  '/Sucess/s11.jpg',
  '/Sucess/s12.jpg',
  '/Sucess/715771190_122184341390851469_5977678775086273719_n.jpg'
];

const testimonials = [
  {
    name: "Aarav P.",
    date: "Passed Aug 2025",
    text: "Passed first time! Santosh is patient and explains every manoeuvre clearly."
  },
  {
    name: "Laxmi D.",
    date: "Passed Sep 2025",
    text: "Best driving school in Adelaide. Helped me convert my overseas licence stress-free."
  },
  {
    name: "Marina C.",
    date: "Passed Oct 2025",
    text: "I was so nervous before the test — the test-day package made all the difference."
  },
  {
    name: "Sampradha P.",
    date: "Passed Oct 2025",
    text: "Friendly, professional and on time every lesson. Highly recommend to any learner."
  },
  {
    name: "Ravi M.",
    date: "Passed Jul 2025",
    text: "Knows the SA test routes inside out. The mock tests gave me real confidence."
  },
  {
    name: "Priya S.",
    date: "Passed Jun 2025",
    text: "Picked me up from uni every week. Made learning so easy and fun."
  }
];

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-image" style={{ backgroundImage: "url('/hero_automotive.png')" }}></div>
        <div className="hero-overlay"></div>
        <div className="container hero-content-container fade-in">
          <div className="hero-left">
            <div className="google-rating">
              <Star size={16} fill="#FBBF24" color="#FBBF24" /> 5.0 GOOGLE RATED
            </div>
            <h1 className="hero-title">
              Adelaide's <span className="highlight-gold">Trusted</span><br />
              Driving School
            </h1>
            <p className="hero-description">
              Learn safely, drive confidently, and pass your South Australian driving test with an experienced instructor who's helped 500+ students get their licence.
            </p>
            <div className="hero-action-buttons">
              <Link to="/book" className="btn-hero-primary">Book a Lesson <ArrowRight size={18} /></Link>
              <a href="tel:0414475393" className="btn-hero-glass"><Phone size={18} /> Call 0414 475 393</a>
              <Link to="/quote" className="btn-hero-glass">Get a Quote</Link>
            </div>
            
            <div className="hero-stats-row">
              <div className="hero-stat">
                <GraduationCap size={16} className="stat-icon" />
                <span>500+ Students Trained</span>
              </div>
              <div className="hero-stat">
                <TrendingUp size={16} className="stat-icon" />
                <span>98% Pass Rate</span>
              </div>
              <div className="hero-stat">
                <Award size={16} className="stat-icon" />
                <span>Fully Qualified Instructor</span>
              </div>
              <div className="hero-stat">
                <Map size={16} className="stat-icon" />
                <span>Adelaide Wide Service</span>
              </div>
            </div>
          </div>
          
          <div className="hero-right">
            <div className="glass-card">
              <div className="glass-card-inner">
                <div className="card-logo">
                  <img src="/newLogo.png" alt="Sanos Logo" />
                </div>
                <h3 className="card-title">FIND YOUR INSTRUCTOR</h3>
                
                <div className="form-group">
                  <label>Suburb or postcode</label>
                  <div className="input-with-icon">
                    <Search size={18} className="input-icon" />
                    <input type="text" placeholder="e.g. Mawson Lakes, 5095" />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Transmission</label>
                    <div className="select-wrapper">
                      <select defaultValue="Automatic">
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                      <ChevronDown size={16} className="select-icon" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Lesson type</label>
                    <div className="select-wrapper">
                      <select defaultValue="1 Hour">
                        <option value="1 Hour">1 Hour</option>
                        <option value="2 Hours">2 Hours</option>
                      </select>
                      <ChevronDown size={16} className="select-icon" />
                    </div>
                  </div>
                </div>
                
                <button className="btn-search-instructors">
                  <Search size={18} /> Search Instructors
                </button>
                <button className="btn-find-near-me">
                  <MapPin size={18} color="#E02424" /> Find Instructors Near Me
                </button>
              </div>
            </div>
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

      {/* Our Success Section */}
      <section className="success-section">
        <div className="container">
          <div className="section-header text-center" style={{ marginBottom: '4rem' }}>
            <h2 className="h2">Our Success Stories</h2>
            <p className="text-muted text-lg" style={{ marginTop: '0.5rem' }}>Join hundreds of happy students who passed with us.</p>
          </div>
          
          <div className="success-grid">
            {successImages.map((imgSrc, idx) => (
              <div className="success-card" key={idx}>
                <img src={imgSrc} alt={`Successful student ${idx + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section bg-light">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '4rem' }}>
            <span className="text-sm font-medium" style={{ color: '#DC2626', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Testimonials</span>
            <h2 className="h2" style={{ color: '#1E3A8A', fontFamily: "'Times New Roman', serif", fontSize: '3rem' }}>What our students say</h2>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, idx) => (
              <div className="testimonial-card" key={idx}>
                <div className="testimonial-header">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="#FBBF24" color="#FBBF24" />)}
                  </div>
                  <Quote size={36} color="#FDE68A" fill="#FEF3C7" strokeWidth={1} />
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <hr className="testimonial-divider" />
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.date}</span>
                </div>
              </div>
            ))}
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
