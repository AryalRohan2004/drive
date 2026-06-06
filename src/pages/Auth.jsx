import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Shield, Car } from 'lucide-react';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('learner');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'instructor') {
      navigate('/instructor-dashboard');
    } else {
      navigate('/learner-dashboard');
    }
  };

  return (
    <div className="auth-page section bg-light">
      <div className="container">
        <div className="auth-card">
          <div className="text-center mb-4">
            <Car size={48} className="icon-blue mx-auto mb-2" />
            <h1 className="h2">{isLogin ? 'Welcome Back' : 'Create an Account'}</h1>
            <p className="text-muted">
              {isLogin ? 'Sign in to access your dashboard' : 'Join SANOS Driving School today'}
            </p>
          </div>

          <div className="auth-toggle">
            <button 
              className={`toggle-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button 
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          {!isLogin && (
            <div className="role-selection">
              <div 
                className={`role-card ${role === 'learner' ? 'selected' : ''}`}
                onClick={() => setRole('learner')}
              >
                <User size={24} />
                <span>Learner</span>
              </div>
              <div 
                className={`role-card ${role === 'instructor' ? 'selected' : ''}`}
                onClick={() => setRole('instructor')}
              >
                <Shield size={24} />
                <span>Instructor</span>
              </div>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" required />
              </div>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="john@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" required />
            </div>
            {isLogin && (
              <div className="text-right mb-3">
                <a href="#" className="text-sm text-link">Forgot password?</a>
              </div>
            )}
            <button type="submit" className="btn btn-primary w-100">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
