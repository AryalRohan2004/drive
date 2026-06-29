import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { authApi } from '../services/api';
import { toast } from 'react-hot-toast';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword({ email });
      setSuccess(true);
      toast.success('Reset link sent!');
    } catch (err) {
      const serviceUnavailable = [404, 405, 501].includes(err?.status) || !navigator.onLine;
      const message = serviceUnavailable
        ? 'Password reset is currently unavailable. Please try again later.'
        : (err.message || 'Failed to send reset link.');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page section bg-light">
      <div className="container">
        <div className="auth-card">
          <div className="text-center mb-4">
            <Mail size={48} className="icon-blue mx-auto mb-2" />
            <h1 className="h2">Forgot Password</h1>
            <p className="text-muted">Enter your email and we'll send you a reset link.</p>
          </div>

          {error && !success ? (
            <div className="form-error" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ) : null}

          {success ? (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <CheckCircle size={56} className="icon-success" style={{ margin: '0 auto 1.5rem' }} />
              <h3 className="h3">Check your email</h3>
              <p className="text-muted" style={{ margin: '1rem 0 2rem' }}>
                If an account exists for {email}, you'll receive a password reset link shortly.
              </p>
              <Link to="/login" className="btn btn-primary">Back to Login</Link>
            </div>
          ) : (
            <>
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? <><Loader size={18} className="spin-icon" /> Sending...</> : 'Send Reset Link'}
                </button>
              </form>
              <div className="text-center" style={{ marginTop: '1.5rem' }}>
                <Link to="/login" className="text-link text-sm"><ArrowLeft size={16} style={{ verticalAlign: 'middle' }} /> Back to Login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
