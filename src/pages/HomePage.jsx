import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { DestinationCard } from '../components/DestinationCard';
import { useAuth } from '../context/AuthContext';

// Safe fallback destinations if backend is cold starting
const FALLBACK_POPULAR = [
  {
    id: 1,
    name: 'Goa',
    country: 'India',
    description: 'Famous for sun-kissed golden beaches, vibrant shacks, Portuguese architecture, and seafood.',
    averageBudget: 18000,
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Hyderabad',
    country: 'India',
    description: 'City of Pearls showcasing Charminar, Golconda Fort, and world-renowned Hyderabadi Dum Biryani.',
    averageBudget: 12000,
    imageUrl: 'https://images.unsplash.com/photo-1605335198889-4d8964344557?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'Jaipur',
    country: 'India',
    description: 'The Pink City filled with majestic royal palaces, Amer Fort, bustling bazaars, and heritage.',
    averageBudget: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
  },
];

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await api.destinations.getAll();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setDestinations(data.slice(0, 3));
        } else if (isMounted) {
          setDestinations(FALLBACK_POPULAR);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Backend loading destinations in fallback mode:', err.message);
          setDestinations(FALLBACK_POPULAR);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section
        style={{
          position: 'relative',
          padding: '100px 0 90px',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.12) 0%, rgba(11, 15, 25, 0) 100%)',
        }}
      >
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-block', marginBottom: '18px' }}>
            <span className="badge badge-primary">
              <i className="fa-solid fa-sparkles"></i> AI-Powered Travel Planning
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 800,
              maxWidth: '850px',
              margin: '0 auto 20px',
              letterSpacing: '-0.03em',
            }}
          >
            Design Perfect Trips, <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Master Your Travel Budget
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--text-muted)',
              maxWidth: '680px',
              margin: '0 auto 36px',
              lineHeight: 1.6,
            }}
          >
            AI TripMate combines real destination pricing, custom day-by-day itineraries, and smart budget analytics to help you explore the world with complete confidence.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={isAuthenticated ? '/planner' : '/register'} className="btn btn-primary btn-lg">
              <i className="fa-solid fa-paper-plane"></i> Start Planning for Free
            </Link>
            <Link to="/ai-planner" className="btn btn-glass btn-lg">
              <i className="fa-solid fa-wand-magic-sparkles text-primary"></i> Try AI Itinerary
            </Link>
          </div>

          {/* Quick Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '20px',
              maxWidth: '860px',
              margin: '60px auto 0',
            }}
          >
            <div className="card" style={{ padding: '18px', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--primary)', fontSize: '1.8rem', marginBottom: '4px' }}>100%</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Budget Accuracy</span>
            </div>
            <div className="card" style={{ padding: '18px', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--accent)', fontSize: '1.8rem', marginBottom: '4px' }}>Dynamic</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Curated Tourist Places</span>
            </div>
            <div className="card" style={{ padding: '18px', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--success)', fontSize: '1.8rem', marginBottom: '4px' }}>Instant</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>AI-Generated Itineraries</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURE HIGHLIGHTS */}
      <section className="section-py" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <span className="badge badge-primary" style={{ marginBottom: '12px' }}>Why TripMate</span>
            <h2>Everything You Need for Seamless Trips</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '8px' }}>
              Built specifically to take the anxiety out of travel budgeting and itinerary coordination.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="card">
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  marginBottom: '18px',
                }}
              >
                <i className="fa-solid fa-calculator"></i>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Real-time Budget Calculator</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Set your spending cap. Every activity and attraction is checked against your allowance so you never return with surprise bills.
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  marginBottom: '18px',
                }}
              >
                <i className="fa-solid fa-brain"></i>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>AI Itinerary Engine</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Generate customized day-by-day itineraries tailored to your travel style, dietary cravings, and activity pace in seconds.
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--success-light)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  marginBottom: '18px',
                }}
              >
                <i className="fa-solid fa-map-pin"></i>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Place Scheduling & Notes</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Add and sequence famous tourist sites, assign days, calculate entry tickets, and store handy personalized visit notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED DESTINATIONS */}
      <section className="section-py">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Trending Spots</span>
              <h2>Popular Travel Destinations</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                Explore popular Indian tourist hubs with verified local attraction pricing.
              </p>
            </div>
            <Link to="/destinations" className="btn btn-outline btn-sm">
              View All Destinations <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }}></i>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {destinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                onSelectDetails={(d) => setSelectedDestination(d)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section style={{ padding: '60px 0 90px' }}>
        <div className="container">
          <div
            className="card"
            style={{
              padding: '48px 36px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <h2 style={{ fontSize: '2rem', marginBottom: '14px' }}>Ready for Your Next Adventure?</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '580px', margin: '0 auto 28px', fontSize: '1rem' }}>
              Create an account or start building a customized travel plan right now. No credit card required.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/planner" className="btn btn-primary btn-lg">
                <i className="fa-solid fa-plus-circle"></i> Create a Trip Now
              </Link>
              <Link to="/destinations" className="btn btn-outline btn-lg">
                <i className="fa-solid fa-magnifying-glass"></i> Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Destination Details Modal */}
      {selectedDestination && (
        <div className="modal-overlay" onClick={() => setSelectedDestination(null)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedDestination(null)}>
              &times;
            </button>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '240px', marginBottom: '20px' }}>
              <img
                src={selectedDestination.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'}
                alt={selectedDestination.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h2>{selectedDestination.name}, {selectedDestination.country}</h2>
            <p style={{ color: 'var(--text-muted)', margin: '12px 0 20px', lineHeight: 1.6 }}>
              {selectedDestination.description}
            </p>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div className="card" style={{ flex: 1, padding: '14px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Estimated Average Budget</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                  ₹{selectedDestination.averageBudget ? selectedDestination.averageBudget.toLocaleString() : '15,000'}
                </strong>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setSelectedDestination(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const id = selectedDestination.id;
                  setSelectedDestination(null);
                  navigate(`/planner?destId=${id}`);
                }}
              >
                <i className="fa-solid fa-route"></i> Plan Trip to {selectedDestination.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
