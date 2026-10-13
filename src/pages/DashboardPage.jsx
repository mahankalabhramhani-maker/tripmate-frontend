import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TripCard } from '../components/TripCard';
import { DestinationCard } from '../components/DestinationCard';

export function DashboardPage() {
  const { user, showToast } = useAuth();
  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tripsRes, destsRes] = await Promise.allSettled([
        api.trips.getAll(),
        api.destinations.getAll(),
      ]);

      if (tripsRes.status === 'fulfilled') {
        setTrips(Array.isArray(tripsRes.value) ? tripsRes.value : []);
      } else {
        console.warn('Trips fetch failed:', tripsRes.reason);
      }

      if (destsRes.status === 'fulfilled') {
        setDestinations(Array.isArray(destsRes.value) ? destsRes.value : []);
      } else {
        console.warn('Destinations fetch failed:', destsRes.reason);
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await api.trips.delete(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
      showToast('Trip deleted successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete trip', 'error');
    }
  };

  // Calculate statistics from real user trips
  const totalTrips = trips.length;
  const totalBudget = trips.reduce((acc, t) => acc + (Number(t.budget) || 0), 0);
  const totalDays = trips.reduce((acc, t) => acc + (Number(t.numberOfDays) || 0), 0);
  const avgDays = totalTrips > 0 ? (totalDays / totalTrips).toFixed(1) : 0;

  return (
    <div className="dashboard-page section-py">
      <div className="container">
        {/* Welcome Header */}
        <div
          className="card"
          style={{
            marginBottom: '32px',
            padding: '32px',
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.12), rgba(15, 23, 42, 0.7))',
            borderColor: 'rgba(20, 184, 166, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span className="badge badge-accent">
                <i className="fa-solid fa-compass fa-spin" style={{ animationDuration: '8s' }}></i> Travel Command Center
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
              Welcome back, <span className="gradient-text">{user?.name || 'Explorer'}</span>! 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px' }}>
              Manage your itineraries, monitor your travel budget, and get personalized smart recommendations for your next getaway.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/planner" className="btn btn-primary">
              <i className="fa-solid fa-plus"></i> Plan New Trip
            </Link>
            <Link to="/ai-planner" className="btn btn-outline">
              <i className="fa-solid fa-wand-magic-sparkles"></i> AI Itinerary
            </Link>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              marginBottom: '24px',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-light)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '1.2rem' }}></i>
              <span>{error}</span>
            </div>
            <button onClick={loadDashboardData} className="btn btn-outline btn-sm" style={{ borderColor: '#f87171', color: '#f87171' }}>
              <i className="fa-solid fa-rotate-right"></i> Retry
            </button>
          </div>
        )}

        {/* Metric Summary Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '36px',
          }}
        >
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Planned Trips
              </span>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(20, 184, 166, 0.15)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="fa-solid fa-route"></i>
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{totalTrips}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
              {totalTrips === 1 ? '1 active journey' : `${totalTrips} total saved journeys`}
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Budget
              </span>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="fa-solid fa-wallet"></i>
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>
              ${totalBudget.toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
              Cumulative estimated expenses
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Days
              </span>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="fa-solid fa-calendar-days"></i>
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{totalDays} days</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
              Avg {avgDays} days per trip
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Catalog Places
              </span>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#c084fc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="fa-solid fa-earth-americas"></i>
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{destinations.length}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
              Available destinations
            </div>
          </div>
        </div>

        {/* Recent Trips Section */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Recent Trips</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Your saved travel itineraries and planned budgets.
              </p>
            </div>
            {trips.length > 0 && (
              <Link to="/my-trips" className="btn btn-outline btn-sm">
                View All ({trips.length}) <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
              </Link>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }}></div>
              <p style={{ color: 'var(--text-muted)' }}>Loading your travel dashboard...</p>
            </div>
          ) : trips.length === 0 ? (
            /* Graceful Empty State */
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                borderStyle: 'dashed',
                borderColor: 'var(--border)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(20, 184, 166, 0.1)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 20px',
                }}
              >
                <i className="fa-solid fa-map-location-dot"></i>
              </div>
              <h3 style={{ marginBottom: '8px' }}>No Trips Planned Yet</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
                Ready to take off? Create your first personalized travel itinerary or let our AI assist your budget planning.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/planner" className="btn btn-primary">
                  <i className="fa-solid fa-plus"></i> Create First Trip
                </Link>
                <Link to="/destinations" className="btn btn-outline">
                  <i className="fa-solid fa-magnifying-glass"></i> Explore Destinations
                </Link>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px',
              }}
            >
              {trips.slice(0, 3).map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
              ))}
            </div>
          )}
        </div>

        {/* Featured Destinations Preview */}
        {destinations.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Inspiration for Your Next Adventure</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Hand-picked destinations available in the live TripMate catalog.
                </p>
              </div>
              <Link to="/destinations" className="btn btn-outline btn-sm">
                Explore All <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px',
              }}
            >
              {destinations.slice(0, 4).map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
