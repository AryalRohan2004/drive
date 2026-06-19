import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Quote, ArrowRight } from 'lucide-react';
import { useScrollReveal } from '../hooks/useInteractive';
import './Testimonials.css';

const AnimatedSection = ({ children, className = "" }) => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
  return (
    <div ref={ref} className={`${className} ${isVisible ? 'fade-in' : ''}`} style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.6s ease' }}>
      {children}
    </div>
  );
};

const testimonials = [
  {
    name: "Aarav P.",
    date: "Passed Aug 2025",
    text: "Passed first time! Santosh is patient and explains every manoeuvre clearly. Couldn't have asked for a better instructor."
  },
  {
    name: "Laxmi D.",
    date: "Passed Sep 2025",
    text: "Best driving school in Adelaide. Helped me convert my overseas licence stress-free and taught me all the local rules."
  },
  {
    name: "Marina C.",
    date: "Passed Oct 2025",
    text: "I was so nervous before the test — the test-day package made all the difference. Highly recommend Sanos!"
  },
  {
    name: "Sampradha P.",
    date: "Passed Oct 2025",
    text: "Friendly, professional and on time every lesson. Highly recommend to any learner starting out."
  },
  {
    name: "Ravi M.",
    date: "Passed Jul 2025",
    text: "Knows the SA test routes inside out. The mock tests gave me real confidence to pass on the first go."
  },
  {
    name: "Priya S.",
    date: "Passed Jun 2025",
    text: "Picked me up from uni every week. Made learning so easy and fun. Thank you!"
  },
  {
    name: "Thomas W.",
    date: "Passed May 2025",
    text: "Excellent service. Very clear instructions and helped me get rid of my bad habits before the test."
  },
  {
    name: "Jessica K.",
    date: "Passed Nov 2025",
    text: "I transferred from another school and immediately noticed the difference in quality. Passed easily!"
  }
];

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

const Testimonials = () => {
  return (
    <div className="testimonials-page">
      {/* Hero Section */}
      <section className="testimonials-hero">
        <div className="container text-center">
          <h1 className="h1" style={{ color: 'white', marginBottom: '1rem' }}>Student Success Stories</h1>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '700px', margin: '0 auto' }}>
            Don't just take our word for it. Read what our students have to say about their experience learning to drive with SANOS Driving School.
          </p>
        </div>
      </section>

      {/* Written Reviews */}
      <section className="section bg-light">
        <AnimatedSection className="container">
          <div className="section-header text-center" style={{ marginBottom: '4rem' }}>
            <h2 className="h2" style={{ color: 'var(--primary-blue)' }}>Hear From Our Students</h2>
            <div className="google-rating-display mt-2">
              <span style={{ fontWeight: '700', fontSize: '1.25rem', color: '#111' }}>5.0</span>
              <div style={{ display: 'inline-flex', margin: '0 0.5rem' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="#FBBF24" color="#FBBF24" />)}
              </div>
              <span className="text-muted">Google Rated</span>
            </div>
          </div>
          
          <div className="t-reviews-grid">
            {testimonials.map((testimonial, idx) => (
              <div className="t-review-card" key={idx}>
                <div className="t-review-header">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#FBBF24" color="#FBBF24" />)}
                  </div>
                  <Quote size={28} color="#FDE68A" fill="#FEF3C7" strokeWidth={1} />
                </div>
                <p className="t-review-text">"{testimonial.text}"</p>
                <div className="t-review-author mt-auto">
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.date}</span>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Photo Gallery */}
      <section className="section bg-white border-top">
        <AnimatedSection className="container">
          <div className="section-header text-center" style={{ marginBottom: '3rem' }}>
            <h2 className="h2">Hall of Fame</h2>
            <p className="text-muted text-lg mt-2">Hundreds of students have passed their test with us. You could be next!</p>
          </div>
          
          <div className="t-gallery-grid">
            {successStories.map((story, idx) => (
              <div className="t-gallery-card" key={idx}>
                <img src={story.src} alt={`Successful student ${story.name}`} loading="lazy" />
                <div className="t-gallery-overlay">
                  <p className="t-gallery-message">"{story.message}"</p>
                  <span className="t-gallery-name">- {story.name}</span>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* CTA */}
      <section className="section" style={{ backgroundColor: 'var(--primary-blue)', color: 'white' }}>
        <AnimatedSection className="container text-center py-5">
          <h2 className="h2" style={{ color: 'white', marginBottom: '1rem' }}>Ready to Add Your Picture Here?</h2>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Book your first lesson today and take the first step towards getting your South Australian driver's licence.
          </p>
          <Link to="/book" className="btn btn-primary" style={{ backgroundColor: 'var(--accent-yellow)', color: 'var(--black)', padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
            Book a Lesson Now <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
          </Link>
        </AnimatedSection>
      </section>
    </div>
  );
};

export default Testimonials;
