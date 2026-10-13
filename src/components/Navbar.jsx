import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar({ onOpenServerModal }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon">
            <i className="fa-solid fa-compass"></i>
          </div>
          <span>TripMate</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="btn-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>

        {/* Navigation Links */}
        <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fa-solid fa-house" style={{ marginRight: '6px' }}></i>Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/destinations"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fa-solid fa-earth-americas" style={{ marginRight: '6px' }}></i>Destinations
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/planner"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fa-solid fa-map-location-dot" style={{ marginRight: '6px' }}></i>Plan Trip
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/ai-planner"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fa-solid fa-wand-magic-sparkles text-primary" style={{ marginRight: '6px' }}></i>AI Itinerary
            </NavLink>
          </li>
          {isAuthenticated && (
            <li>
              <NavLink
                to="/my-trips"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="fa-solid fa-suitcase-rolling" style={{ marginRight: '6px' }}></i>My Trips
              </NavLink>
            </li>
          )}
        </ul>

        {/* Actions & Profile */}
        <div className="navbar-actions">
          {/* API Server Settings Button */}
          <button
            type="button"
            className="btn btn-glass btn-sm"
            onClick={onOpenServerModal}
            title="Configure Spring Boot API Endpoint"
          >
            <i className="fa-solid fa-server text-primary"></i> API
          </button>

          {isAuthenticated ? (
            <div className="user-menu">
              <button
                type="button"
                className="user-badge"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={userDropdownOpen}
              >
                <div className="user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name || 'Account'}</span>
                <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.75rem', opacity: 0.7 }}></i>
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown">
                  <div style={{ padding: '8px 16px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', wordBreak: 'break-all' }}>{user?.email}</div>
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <Link
                    to="/dashboard"
                    className="user-dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <i className="fa-solid fa-gauge-high"></i> Dashboard
                  </Link>
                  <Link
                    to="/my-trips"
                    className="user-dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <i className="fa-solid fa-route"></i> My Trips
                  </Link>
                  <Link
                    to="/profile"
                    className="user-dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <i className="fa-solid fa-user-gear"></i> Profile Settings
                  </Link>
                  <div className="user-dropdown-divider"></div>
                  <button type="button" className="user-dropdown-item" onClick={handleLogout} style={{ color: '#f87171' }}>
                    <i className="fa-solid fa-right-from-bracket"></i> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
