import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TripCard } from '../components/TripCard';

export function MyTripsPage() {
  const { showToast } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.trips.getAll();
      setTrips(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load your trips.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip itinerary? This action cannot be undone.')) {
      return;
    }
    try {
      await api.trips.delete(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
      showToast('Trip itinerary deleted successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete trip', 'error');
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesStatus =
      filterStatus === 'ALL' || (trip.status && trip.status.toUpperCase() === filterStatus);
    const matchesSearch =
      !searchQuery ||
      trip.destinationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.interests?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="my-trips-page section-py">
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <div>
            <span className="badge badge-accent" style={{ marginBottom: '8px' }}>
              <i className="fa-solid fa-suitcase-rolling"></i> Saved Itineraries
            </span>
            <h1 style={{ fontSize: '2.4rem', margin: 0 }}>
              My <span className="gradient-text">Trips</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              View, manage, and customize your travel adventures and estimated budgets.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/planner" className="btn btn-primary">
              <i className="fa-solid fa-plus"></i> Plan New Trip
            </Link>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div
          className="card"
          style={{
            padding: '16px 20px',
            marginBottom: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <i
              className="fa-solid fa-magnifying-glass"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            ></i>
            <input
              type="text"
              className="form-control"
              placeholder="Filter by destination or interest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['ALL', 'PLANNED', 'ONGOING', 'COMPLETED'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: filterStatus === status ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background:
                    filterStatus === status ? 'rgba(20, 184, 166, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  color: filterStatus === status ? 'var(--primary)' : 'var(--text-muted)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              marginBottom: '28px',
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
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{error}</span>
            </div>
            <button
              onClick={loadTrips}
              className="btn btn-outline btn-sm"
              style={{ color: '#f87171', borderColor: '#f87171' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Trips Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div className="spinner" style={{ width: '44px', height: '44px', margin: '0 auto 16px' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>Loading your saved itineraries...</p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '64px 24px',
              borderStyle: 'dashed',
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
              <i className="fa-solid fa-suitcase-rolling"></i>
            </div>
            <h3 style={{ marginBottom: '8px' }}>
              {searchQuery || filterStatus !== 'ALL' ? 'No Matching Trips' : 'No Trips Saved Yet'}
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
              {searchQuery || filterStatus !== 'ALL'
                ? 'Try adjusting your filters or search keywords to find your planned trips.'
                : 'Start your journey today by creating a customized trip with your preferred dates, budget, and activities.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <Link to="/planner" className="btn btn-primary">
                <i className="fa-solid fa-plus"></i> Plan Your First Trip
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
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTripsPage;
