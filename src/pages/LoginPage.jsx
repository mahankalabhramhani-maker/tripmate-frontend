import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page section-py" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '440px' }}>
        <div className="card" style={{ padding: '36px 32px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              className="brand-icon"
              style={{ width: '44px', height: '44px', margin: '0 auto 16px', fontSize: '1.3rem' }}
            >
              <i className="fa-solid fa-lock"></i>
            </div>
            <h2>Welcome Back</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
              Sign in to access your saved trips and smart itineraries.
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
              <label className="form-label" htmlFor="login-email">
                <i className="fa-solid fa-envelope" style={{ marginRight: '6px' }}></i> Email Address
              </label>
              <input
                type="email"
                id="login-email"
                className="form-control"
                placeholder="e.g. traveler@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>
                  <i className="fa-solid fa-key" style={{ marginRight: '6px' }}></i> Password
                </label>
              </div>
              <div className="input-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '24px' }}>
              {loading ? (
                <>
                  <span className="spinner"></span> Signing In...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket"></i> Sign In to TripMate
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
