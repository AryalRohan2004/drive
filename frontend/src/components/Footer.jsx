import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, MessageCircle, Video, MapPin, Phone, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <Link to="/" className="footer-logo">
            <img src="/newLogo.png" alt="SANOS Driving School Logo" className="footer-logo-image" />
          </Link>
          <p className="footer-desc">
            Professional driving instruction in Adelaide, South Australia. Helping you become a safe and confident driver for life.
          </p>
          <div className="social-links">
            <a href="#" className="social-link"><Share2 size={20} /></a>
            <a href="#" className="social-link"><MessageCircle size={20} /></a>
            <a href="#" className="social-link"><Video size={20} /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/pricing">Pricing & Packages</Link></li>
            <li><Link to="/overseas">Overseas Licence Transfer</Link></li>
            <li><Link to="/hub">Licensing Information Hub</Link></li>
            <li><Link to="/areas">Service Areas</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Resources</h4>
          <ul className="footer-links">
            <li><Link to="/resources">Practice Tests</Link></li>
            <li><Link to="/countries">Recognised Countries</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/testimonials">Testimonials</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Contact</h4>
          <ul className="footer-contact">
            <li>
              <MapPin size={18} className="contact-icon" />
              <span>Adelaide, South Australia</span>
            </li>
            <li>
              <Phone size={18} className="contact-icon" />
              <span>1300 000 000</span>
            </li>
            <li>
              <Mail size={18} className="contact-icon" />
              <span>info@sanosdriving.com.au</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} SANOS Driving School. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
