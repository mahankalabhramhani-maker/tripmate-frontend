import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page section-py" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card" style={{ padding: '36px 32px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              className="brand-icon"
              style={{ width: '48px', height: '48px', margin: '0 auto 16px', fontSize: '1.4rem' }}
            >
              <i className="fa-solid fa-user-plus"></i>
            </div>
            <h2>Create Your Account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
              Join TripMate to start planning smarter, budget-friendly journeys.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--danger-light)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">
                <i className="fa-solid fa-user" style={{ marginRight: '6px' }}></i> Full Name
              </label>
              <input
                type="text"
                id="register-name"
                className="form-control"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                <i className="fa-solid fa-envelope" style={{ marginRight: '6px' }}></i> Email Address
              </label>
              <input
                type="email"
                id="register-email"
                className="form-control"
                placeholder="e.g. alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">
                <i className="fa-solid fa-key" style={{ marginRight: '6px' }}></i> Password
              </label>
              <div className="input-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="register-password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm-password">
                <i className="fa-solid fa-check-double" style={{ marginRight: '6px' }}></i> Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="register-confirm-password"
                className="form-control"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ marginTop: '24px' }}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Creating Account...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i> Create Account
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
