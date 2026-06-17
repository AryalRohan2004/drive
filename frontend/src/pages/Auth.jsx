import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Shield, Car, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Auth.css';

const Auth = ({ defaultIsLogin = true }) => {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [role, setRole] = useState('learner');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const { login, register, isAuthenticated, role: userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsLogin(defaultIsLogin);
  }, [defaultIsLogin]);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (userRole === 'instructor') {
        navigate('/instructor-dashboard', { replace: true });
      } else if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/learner-dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, userRole, navigate, location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Successfully logged in!');
      } else {
        if (role === 'instructor') {
          navigate('/instructor-register');
          return;
        }
        
        await register({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          role,
        });
        toast.success('Account created successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
              onClick={() => { setIsLogin(true); }}
            >
              Login
            </button>
            <button
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(false); }}
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
            {(!isLogin && role === 'instructor') ? (
              <div className="text-center py-4">
                <p className="mb-4 text-muted">Instructor registration requires a few more details to set up your profile.</p>
                <button type="submit" className="btn btn-primary w-100">
                  Continue to Instructor Registration
                </button>
              </div>
            ) : (
              <>
                {!isLogin && (
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
                {!isLogin && (
                  <div className="form-group">
                    <label>Phone Number <span className="text-muted text-sm">(optional)</span></label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="0400 000 000"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {isLogin && (
                  <div className="text-right mb-3">
                    <Link to="/forgot-password" className="text-sm text-link">Forgot password?</Link>
                  </div>
                )}
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? (
                    <><Loader size={18} className="spin-icon" /> Processing...</>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
