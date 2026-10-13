import React from 'react';
import { Link } from 'react-router-dom';

export function Footer({ onOpenServerModal }) {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          {/* Brand info */}
          <div className="footer-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div className="brand-icon" style={{ width: '30px', height: '30px', fontSize: '0.95rem' }}>
                <i className="fa-solid fa-compass"></i>
              </div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#fff' }}>TripMate</h4>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '340px' }}>
              AI-driven smart travel planning and budget assistant. Plan seamless itineraries, discover stunning attractions, and stay within your financial targets.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <span className="badge badge-primary">
                <i className="fa-solid fa-bolt"></i> Spring Boot + Vite
              </span>
              <span className="badge badge-success">
                <i className="fa-solid fa-shield-halved"></i> TiDB Cloud MySQL
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <h5>Navigation</h5>
            <ul>
              <li><Link to="/">Home Overview</Link></li>
              <li><Link to="/destinations">Explore Destinations</Link></li>
              <li><Link to="/planner">Smart Trip Planner</Link></li>
              <li><Link to="/ai-planner">AI Itinerary Generator</Link></li>
              <li><Link to="/my-trips">My Saved Journeys</Link></li>
            </ul>
          </div>

          {/* Popular places */}
          <div className="footer-col">
            <h5>Featured Destinations</h5>
            <ul>
              <li><Link to="/destinations">Goa Beachfronts</Link></li>
              <li><Link to="/destinations">Hyderabad Heritage</Link></li>
              <li><Link to="/destinations">Jaipur Royal Palaces</Link></li>
              <li><Link to="/destinations">Manali Alpine Valley</Link></li>
              <li><Link to="/destinations">Kashmir Gondola Peaks</Link></li>
            </ul>
          </div>

          {/* Cloud & Tech */}
          <div className="footer-col">
            <h5>Deployment & APIs</h5>
            <ul>
              <li><a href="https://tripmate-backend-gl4s.onrender.com/api/health" target="_blank" rel="noreferrer"><i className="fa-solid fa-heart-pulse text-primary"></i> Backend Status</a></li>
              {onOpenServerModal && (
                <li>
                  <button
                    onClick={onOpenServerModal}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'inherit',
                      cursor: 'pointer',
                      fontSize: 'inherit',
                      textAlign: 'left',
                    }}
                  >
                    <i className="fa-solid fa-gear" style={{ marginRight: '6px' }}></i> API Server Settings
                  </button>
                </li>
              )}
              <li><a href="https://github.com/mahankalabhramhani-maker/tripmate-frontend" target="_blank" rel="noreferrer"><i className="fa-brands fa-github"></i> Frontend Repo</a></li>
              <li><a href="https://github.com/mahankalabhramhani-maker/tripmate-backend" target="_blank" rel="noreferrer"><i className="fa-brands fa-github"></i> Backend Repo</a></li>
              <li><a href="https://tripmate-frontend-pi.vercel.app/" target="_blank" rel="noreferrer"><i className="fa-solid fa-cloud"></i> Vercel Deployment</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} AI TripMate. All rights reserved. Crafted with precision for travelers.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span><i className="fa-solid fa-lock" style={{ marginRight: '6px' }}></i>Stateless JWT Secure</span>
            <span><i className="fa-solid fa-microchip" style={{ marginRight: '6px' }}></i>AI Itinerary Powered</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
