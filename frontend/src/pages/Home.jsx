import { Link } from 'react-router-dom';
import { ShieldCheck, CalendarCheck, TrendingUp, CarFront, Users, MapPin, Star, CheckCircle, ArrowRight, Phone, GraduationCap, Award, Map, Quote } from 'lucide-react';
import { useScrollReveal } from '../hooks/useInteractive';
import './Home.css';

const AnimatedSection = ({ children, className = "" }) => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
  return (
    <div ref={ref} className={`${className} ${isVisible ? 'fade-in' : ''}`} style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.6s ease' }}>
      {children}
    </div>
  );
};

const successStories = [
  { src: '/Sucess/s2.jpg', name: 'Aarav', message: 'Passed first time! Highly recommend Santosh.' },
  { src: '/Sucess/s3.jpg', name: 'Laxmi', message: 'Great instructor, very patient.' },
  { src: '/Sucess/s4.jpg', name: 'Marina', message: 'Helped me overcome my driving anxiety!' },
  { src: '/Sucess/s5.jpg', name: 'Sampradha', message: 'Clear instructions and friendly environment.' },
  { src: '/Sucess/s6.jpg', name: 'Ravi', message: 'Converted my overseas license easily.' },
  { src: '/Sucess/s7.jpg', name: 'Priya', message: 'The mock tests were so helpful.' },
  { src: '/Sucess/s9.jpg', name: 'David', message: 'Best driving school in Adelaide.' },
  { src: '/Sucess/s10.jpg', name: 'Sarah', message: 'Passed with zero errors!' },
  { src: '/Sucess/s11.jpg', name: 'Michael', message: 'Very professional and punctual.' },
  { src: '/Sucess/s12.jpg', name: 'Emma', message: "Got my P's on the first attempt." },
  { src: '/Sucess/715771190_122184341390851469_5977678775086273719_n.jpg', name: 'James', message: 'Thanks for all the help and support.' }
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
                <p className="text-muted" style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.925rem', lineHeight: '1.5', padding: '0 0.5rem' }}>
                  Find the best driving instructors nearest to your location and start your journey today.
                </p>
                <Link to="/find-instructor" className="btn-search-instructors">
                  Find Your Instructor <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators / Stats */}
      <section className="stats-section">
        <AnimatedSection className="container stats-grid">
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
        </AnimatedSection>
      </section>

      {/* Founder Section */}
      <section className="founder-section">
        <AnimatedSection className="container founder-grid">
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
        </AnimatedSection>
      </section>

      {/* Why Choose Us */}
      <section className="features-section">
        <AnimatedSection className="container">
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
        </AnimatedSection>
      </section>

      {/* Our Success Section */}
      <section className="success-section">
        <AnimatedSection className="container">
          <div className="section-header text-center" style={{ marginBottom: '4rem' }}>
            <h2 className="h2">Our Success Stories</h2>
            <p className="text-muted text-lg" style={{ marginTop: '0.5rem' }}>Join hundreds of happy students who passed with us.</p>
          </div>
          
          <div className="success-grid">
            {successStories.map((story, idx) => (
              <div className="success-card" key={idx}>
                <img src={story.src} alt={`Successful student ${story.name}`} loading="lazy" />
                <div className="success-overlay">
                  <p className="success-message">"{story.message}"</p>
                  <span className="success-name">- {story.name}</span>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section bg-light">
        <AnimatedSection className="container">
          <div className="text-center" style={{ marginBottom: '4rem' }}>
            <span className="text-sm font-medium" style={{ color: '#DC2626', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Testimonials</span>
            <h2 className="h2" style={{ color: 'var(--primary-blue)', fontSize: '3rem' }}>What our students say</h2>
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
        </AnimatedSection>
      </section>

      {/* CTA Section */}
      <section className="section bg-white border-top">
        <AnimatedSection className="container" style={{ padding: '6rem 0' }}>
          <div className="cta-grid">
            <div className="cta-content">
              <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '2.8rem' }}>Ready to Start Your Journey?</h2>
              <p className="text-lg text-muted" style={{ marginBottom: '2.5rem', maxWidth: '600px', fontSize: '1.125rem' }}>
                Book your first lesson today and take the first step towards driving independence. Learn in a safe, modern vehicle with Adelaide's most trusted instructors.
              </p>
              <Link to="/book" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                Book Online Now <ArrowRight size={20} />
              </Link>
            </div>
            <div className="cta-image-wrapper">
              <img src="/hero_lesson.png" alt="Student driving" className="cta-image" />
              <div className="cta-image-overlay"></div>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
};

export default Home;
