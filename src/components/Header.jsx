import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo">
          <img src="/logo.jpeg" alt="SANOS Driving School Logo" className="logo-image" />
        </Link>
        
        <nav className={`nav ${isOpen ? 'nav-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/pricing" className="nav-link" onClick={() => setIsOpen(false)}>Pricing & Packages</Link>
          <Link to="/overseas" className="nav-link" onClick={() => setIsOpen(false)}>Overseas Transfer</Link>
          <Link to="/hub" className="nav-link" onClick={() => setIsOpen(false)}>Info Hub</Link>
          <div className="nav-actions">
            <Link to="/login" className="btn btn-outline" onClick={() => setIsOpen(false)}>Login</Link>
            <Link to="/book" className="btn btn-primary" onClick={() => setIsOpen(false)}>Book a Lesson</Link>
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
