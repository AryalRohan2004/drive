import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LayoutDashboard, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './FloatingUserMenu.css';

const FloatingUserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

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
    <div className="floating-user-menu" ref={menuRef}>
      <div className={`floating-menu-popup ${isOpen ? 'open' : ''}`}>
        <div className="floating-menu-header">
          <span className="role-text">Logged in as {role === 'admin' ? 'Admin' : role === 'instructor' ? 'Instructor' : 'Learner'}</span>
        </div>
        <div className="floating-menu-items">
          <Link to={dashboardLink} className="floating-menu-item" onClick={() => setIsOpen(false)}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/profile" className="floating-menu-item" onClick={() => setIsOpen(false)}>
            <User size={18} />
            <span>System</span>
          </Link>
          <button className="floating-menu-item logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      <button 
        className={`floating-toggle-btn ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Settings Menu"
      >
        <Settings size={28} />
      </button>
    </div>
  );
};

export default FloatingUserMenu;
