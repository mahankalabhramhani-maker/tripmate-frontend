import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="not-found-page section-py" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '540px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '48px 32px' }}>
          <div
            style={{
              fontSize: '5rem',
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: '16px',
            }}
            className="gradient-text"
          >
            404
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Destination Off the Map</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '28px' }}>
            The travel route or page you are looking for doesn't exist, was moved, or requires different coordinates.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary">
              <i className="fa-solid fa-house"></i> Return Home
            </Link>
            <Link to="/destinations" className="btn btn-outline">
              <i className="fa-solid fa-compass"></i> Explore Destinations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
