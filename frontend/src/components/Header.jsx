import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, User, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isAuthenticated, user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/');
  };

  const dashboardLink = role === 'admin'
    ? '/admin'
    : role === 'instructor'
      ? '/instructor-dashboard'
      : '/learner-dashboard';

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src="/newLogo.png" alt="SANOS Driving School Logo" className="logo-image" />
        </Link>

        <nav className={`nav ${isOpen ? 'nav-open' : ''}`}>
          <div className="nav-links">
            <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/pricing" className="nav-link" onClick={() => setIsOpen(false)}>Lessons & Pricing</Link>
            <Link to="/packages" className="nav-link" onClick={() => setIsOpen(false)}>Packages</Link>
            <Link to="/overseas" className="nav-link" onClick={() => setIsOpen(false)}>Overseas Licence</Link>
            <Link to="/resources" className="nav-link" onClick={() => setIsOpen(false)}>Resources</Link>
            <Link to="/faq" className="nav-link" onClick={() => setIsOpen(false)}>FAQ</Link>
            <Link to="/contact" className="nav-link" onClick={() => setIsOpen(false)}>Contact</Link>
          </div>
          <div className="nav-actions">
            <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Dark Mode">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <a href="tel:0414475393" className="btn-phone-header">
              <Phone size={16} className="phone-icon-animate" /> 0414 475 393
            </a>
            {!isAuthenticated && (
              <>
                <Link to="/login" className="btn btn-outline" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/signup" className="btn btn-primary" onClick={() => setIsOpen(false)}>Sign Up</Link>
              </>
            )}
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
