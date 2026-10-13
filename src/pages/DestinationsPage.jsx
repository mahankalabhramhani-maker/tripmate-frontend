import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { DestinationCard } from '../components/DestinationCard';

export function DestinationsPage() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'budget-asc', 'budget-desc'

  // Selected destination modal state
  const [selectedDest, setSelectedDest] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.destinations.getAll();
      setDestinations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load destinations from the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (dest) => {
    setSelectedDest(dest);
    setLoadingPlaces(true);
    setPlaces([]);
    try {
      const placesData = await api.places.getByDestination(dest.id);
      setPlaces(Array.isArray(placesData) ? placesData : []);
    } catch (err) {
      console.warn('Could not load places for destination:', err);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedDest(null);
    setPlaces([]);
  };

  // Filter & Sort
  const filteredDestinations = destinations
    .filter((d) => {
      const query = searchTerm.toLowerCase();
      const matchName = d.name?.toLowerCase().includes(query);
      const matchCountry = d.country?.toLowerCase().includes(query);
      const matchDesc = d.description?.toLowerCase().includes(query);
      return matchName || matchCountry || matchDesc;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'budget-asc') return (Number(a.averageBudget) || 0) - (Number(b.averageBudget) || 0);
      if (sortBy === 'budget-desc') return (Number(b.averageBudget) || 0) - (Number(a.averageBudget) || 0);
      return 0;
    });

  return (
    <div className="destinations-page section-py">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 40px' }}>
          <span className="badge badge-accent" style={{ marginBottom: '12px' }}>
            <i className="fa-solid fa-earth-americas"></i> Explore the Globe
          </span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
            Curated Travel <span className="gradient-text">Destinations</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Browse through verified destinations with average budgets, must-see attractions, and local insights to fuel your next expedition.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div
          className="card"
          style={{
            padding: '20px',
            marginBottom: '36px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: '1 1 320px', position: 'relative' }}>
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
              placeholder="Search by city, country, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-solid fa-arrow-down-short-wide"></i> Sort by:
            </label>
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '180px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name (A-Z)</option>
              <option value="budget-asc">Budget: Low to High</option>
              <option value="budget-desc">Budget: High to Low</option>
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              marginBottom: '32px',
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
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{error}</span>
            </div>
            <button onClick={loadDestinations} className="btn btn-outline btn-sm" style={{ color: '#f87171', borderColor: '#f87171' }}>
              Retry
            </button>
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div className="spinner" style={{ width: '44px', height: '44px', margin: '0 auto 16px' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>Loading destinations from TripMate...</p>
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              borderStyle: 'dashed',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.1)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                margin: '0 auto 16px',
              }}
            >
              <i className="fa-solid fa-compass"></i>
            </div>
            <h3>No Destinations Found</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '8px auto 20px', fontSize: '0.92rem' }}>
              {searchTerm ? `No destination matches "${searchTerm}". Try a different search keyword.` : 'No destinations available at the moment.'}
            </p>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="btn btn-outline btn-sm">
                Clear Filter
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '28px',
            }}
          >
            {filteredDestinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                onSelect={(d) => handleOpenDetails(d)}
              />
            ))}
          </div>
        )}

        {/* Destination Details Modal */}
        {selectedDest && (
          <div
            className="modal-overlay"
            onClick={handleCloseDetails}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="modal-content"
              style={{ maxWidth: '640px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h3 style={{ margin: 0 }}>{selectedDest.name}</h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
                    <i className="fa-solid fa-location-dot" style={{ color: 'var(--primary)', marginRight: '6px' }}></i>
                    {selectedDest.country}
                  </div>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="modal-close"
                  aria-label="Close modal"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="modal-body">
                {selectedDest.imageUrl && (
                  <img
                    src={selectedDest.imageUrl}
                    alt={selectedDest.name}
                    style={{
                      width: '100%',
                      height: '240px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '20px',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}

                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '20px' }}>
                  {selectedDest.description || 'A remarkable travel destination offering unforgettable culture, nature, and dining.'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    marginBottom: '24px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Estimated Budget
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
                      ${selectedDest.averageBudget ? Number(selectedDest.averageBudget).toLocaleString() : 'Varies'}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}> / trip</span>
                    </div>
                  </div>
                </div>

                {/* Places to Visit */}
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-landmark" style={{ color: 'var(--secondary)' }}></i> Top Places to Visit
                  </h4>

                  {loadingPlaces ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <div className="spinner" style={{ width: '28px', height: '28px', margin: '0 auto 8px' }}></div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading places...</span>
                    </div>
                  ) : places.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                      No specific places listed yet for this destination.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {places.map((place) => (
                        <div
                          key={place.id}
                          style={{
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{place.name}</div>
                            {place.category && (
                              <span className="badge badge-primary" style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                                {place.category}
                              </span>
                            )}
                          </div>
                          {place.estimatedCost !== undefined && (
                            <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>
                              ${place.estimatedCost}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={handleCloseDetails} className="btn btn-outline btn-sm">
                  Close
                </button>
                <button
                  onClick={() => {
                    handleCloseDetails();
                    navigate(`/planner?destinationId=${selectedDest.id}`);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <i className="fa-solid fa-route"></i> Plan Trip Here
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DestinationsPage;
