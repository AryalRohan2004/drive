import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, User } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo">
          <img src="/newLogo.png" alt="SANOS Driving School Logo" className="logo-image" />
        </Link>
        
        <nav className={`nav ${isOpen ? 'nav-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/pricing" className="nav-link" onClick={() => setIsOpen(false)}>Lessons & Pricing</Link>
          <Link to="/packages" className="nav-link" onClick={() => setIsOpen(false)}>Packages</Link>
          <Link to="/overseas" className="nav-link" onClick={() => setIsOpen(false)}>Overseas Licence</Link>
          <Link to="/resources" className="nav-link" onClick={() => setIsOpen(false)}>Resources</Link>
          <Link to="/faq" className="nav-link" onClick={() => setIsOpen(false)}>FAQ</Link>
          <Link to="/contact" className="nav-link" onClick={() => setIsOpen(false)}>Contact</Link>
          <div className="nav-actions">
            <a href="tel:0414475393" className="btn-phone-header">
              <Phone size={16} /> 0414 475 393
            </a>
            <Link to="/login" className="btn btn-outline" onClick={() => setIsOpen(false)}>Login</Link>
            <Link to="/signup" className="btn btn-primary" onClick={() => setIsOpen(false)}>Sign Up</Link>
          </div>
        </nav>

        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
