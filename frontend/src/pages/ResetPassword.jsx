import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { authApi } from '../services/api';
import { toast } from 'react-hot-toast';
import './Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword({ token, password });
      setSuccess(true);
      toast.success('Password successfully reset!');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. The link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page section bg-light">
        <div className="container">
          <div className="auth-card text-center">
            <AlertCircle size={48} style={{ color: '#DC2626', margin: '0 auto 1rem' }} />
            <h1 className="h2">Invalid Reset Link</h1>
            <p className="text-muted" style={{ margin: '1rem 0 2rem' }}>This password reset link is invalid or has expired.</p>
            <Link to="/forgot-password" className="btn btn-primary">Request New Link</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page section bg-light">
      <div className="container">
        <div className="auth-card">
          <div className="text-center mb-4">
            <Lock size={48} className="icon-blue mx-auto mb-2" />
            <h1 className="h2">Reset Password</h1>
            <p className="text-muted">Enter your new password below.</p>
          </div>

          {success ? (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <CheckCircle size={56} className="icon-success" style={{ margin: '0 auto 1.5rem' }} />
              <h3 className="h3">Password Reset!</h3>
              <p className="text-muted" style={{ margin: '1rem 0 2rem' }}>Your password has been successfully reset.</p>
              <Link to="/login" className="btn btn-primary">Sign In</Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="auth-error">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? <><Loader size={18} className="spin-icon" /> Resetting...</> : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
