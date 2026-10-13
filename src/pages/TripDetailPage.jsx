import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Place Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [placeNotes, setPlaceNotes] = useState('');
  const [addingPlace, setAddingPlace] = useState(false);

  useEffect(() => {
    loadTripDetails();
  }, [id]);

  const loadTripDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.trips.getById(id);
      setTrip(data);
    } catch (err) {
      setError(err.message || 'Failed to load trip details.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = async () => {
    setIsAddModalOpen(true);
    setSelectedDay(1);
    setPlaceNotes('');
    setSelectedPlaceId('');

    const destId = trip?.destination?.id;
    if (destId) {
      setLoadingAvailable(true);
      try {
        const placesData = await api.places.getByDestination(destId);
        const list = Array.isArray(placesData) ? placesData : [];
        setAvailablePlaces(list);
        if (list.length > 0) {
          setSelectedPlaceId(String(list[0].id));
        }
      } catch (err) {
        console.warn('Failed to load places for destination:', err);
      } finally {
        setLoadingAvailable(false);
      }
    }
  };

  const handleAddPlaceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlaceId) {
      showToast('Please select a place to add.', 'warning');
      return;
    }

    setAddingPlace(true);
    try {
      const payload = {
        placeId: Number(selectedPlaceId),
        visitDay: Number(selectedDay),
        notes: placeNotes.trim(),
      };
      const updatedTrip = await api.trips.addPlace(id, payload);
      setTrip(updatedTrip);
      setIsAddModalOpen(false);
      showToast('Place added to your itinerary!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to add place', 'error');
    } finally {
      setAddingPlace(false);
    }
  };

  const handleRemovePlace = async (tripPlaceId) => {
    if (!window.confirm('Remove this place from your itinerary?')) return;
    try {
      const updatedTrip = await api.trips.removePlace(id, tripPlaceId);
      setTrip(updatedTrip);
      showToast('Place removed from itinerary', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to remove place', 'error');
    }
  };

  const handleDeleteTrip = async () => {
    if (!window.confirm('Are you sure you want to delete this entire trip? This cannot be undone.')) return;
    try {
      await api.trips.delete(id);
      showToast('Trip deleted successfully', 'success');
      navigate('/my-trips');
    } catch (err) {
      showToast(err.message || 'Failed to delete trip', 'error');
    }
  };

  if (loading) {
    return (
      <div className="section-py" style={{ textAlign: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: '48px', height: '48px', margin: '80px auto 20px' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading itinerary details...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="section-py container" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '48px 24px' }}>
          <i
            className="fa-solid fa-triangle-exclamation"
            style={{ fontSize: '3rem', color: '#f87171', marginBottom: '16px' }}
          ></i>
          <h2>Trip Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            {error || 'The requested trip itinerary could not be retrieved.'}
          </p>
          <Link to="/my-trips" className="btn btn-primary">
            <i className="fa-solid fa-arrow-left"></i> Back to My Trips
          </Link>
        </div>
      </div>
    );
  }

  const destination = trip.destination || {};
  const places = trip.places || [];
  const daysCount = trip.numberOfDays || 1;

  // Group places by visitDay
  const placesByDay = {};
  for (let d = 1; d <= daysCount; d++) {
    placesByDay[d] = [];
  }
  places.forEach((p) => {
    const day = p.visitDay || 1;
    if (!placesByDay[day]) placesByDay[day] = [];
    placesByDay[day].push(p);
  });

  return (
    <div className="trip-detail-page section-py">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <Link to="/my-trips" style={{ color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i> My Trips
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{destination.name || 'Trip Details'}</span>
        </div>

        {/* Hero Header Card */}
        <div
          className="card"
          style={{
            padding: '36px',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '24px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span className="badge badge-accent">
                  <i className="fa-solid fa-location-dot"></i> {destination.country || 'Destination'}
                </span>
                <span
                  className={`badge ${
                    trip.status === 'COMPLETED'
                      ? 'badge-primary'
                      : trip.status === 'ONGOING'
                      ? 'badge-accent'
                      : 'badge-outline'
                  }`}
                >
                  {trip.status || 'PLANNED'}
                </span>
              </div>

              <h1 style={{ fontSize: '2.4rem', marginBottom: '10px' }}>
                {destination.name || 'Custom Journey'}
              </h1>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  color: 'var(--text-muted)',
                  fontSize: '0.92rem',
                  flexWrap: 'wrap',
                }}
              >
                <span>
                  <i className="fa-solid fa-calendar" style={{ color: 'var(--primary)', marginRight: '6px' }}></i>
                  {trip.travelDate || 'Flexible dates'}
                </span>
                <span>
                  <i className="fa-solid fa-clock" style={{ color: 'var(--secondary)', marginRight: '6px' }}></i>
                  {trip.numberOfDays} Days
                </span>
                <span>
                  <i className="fa-solid fa-users" style={{ color: 'var(--accent)', marginRight: '6px' }}></i>
                  {trip.numberOfTravelers} Traveler{trip.numberOfTravelers > 1 ? 's' : ''}
                </span>
              </div>

              {trip.interests && (
                <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {trip.interests.split(',').map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.78rem',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {item.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={handleOpenAddModal} className="btn btn-primary">
                <i className="fa-solid fa-plus"></i> Add Place
              </button>
              <button
                onClick={handleDeleteTrip}
                className="btn btn-outline"
                style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
              >
                <i className="fa-solid fa-trash"></i> Delete Trip
              </button>
            </div>
          </div>
        </div>

        {/* Budget Overview Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '36px',
          }}
        >
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 600 }}>
              Total Budget
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '6px', color: 'var(--primary)' }}>
              ${Number(trip.budget || 0).toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
              Allocated for {trip.numberOfDays} days
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 600 }}>
              Estimated Expenses
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '6px', color: 'var(--secondary)' }}>
              ${Number(trip.estimatedCost || 0).toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
              From added attractions & activities
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 600 }}>
              Remaining Budget
            </div>
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                marginTop: '6px',
                color: trip.isWithinBudget === false ? '#f87171' : 'var(--accent)',
              }}
            >
              ${Number(trip.remainingBudget ?? (trip.budget - (trip.estimatedCost || 0))).toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
              {trip.isWithinBudget === false ? 'Exceeds budget target' : 'Within target budget'}
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 600 }}>
              Daily Allowance
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '6px' }}>
              ${Math.round(Number(trip.budget || 0) / (trip.numberOfDays || 1)).toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
              Per day allowance
            </div>
          </div>
        </div>

        {/* Day-by-Day Itinerary Schedule */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Daily Schedule & Places</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Organize sightseeing spots and experiences day by day.
              </p>
            </div>
            <button onClick={handleOpenAddModal} className="btn btn-outline btn-sm">
              <i className="fa-solid fa-plus"></i> Add Place to Schedule
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {Array.from({ length: daysCount }, (_, i) => i + 1).map((dayNumber) => {
              const dayPlaces = placesByDay[dayNumber] || [];

              return (
                <div key={dayNumber} className="card" style={{ padding: '24px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border)',
                      paddingBottom: '12px',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(20, 184, 166, 0.15)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      >
                        {dayNumber}
                      </span>
                      <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Day {dayNumber}</h3>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {dayPlaces.length} activity{dayPlaces.length !== 1 ? 'ies' : ''}
                    </span>
                  </div>

                  {dayPlaces.length === 0 ? (
                    <div style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      <p style={{ margin: 0 }}>No spots scheduled for Day {dayNumber}. Click "Add Place" to plan this day.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {dayPlaces.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            padding: '14px 18px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: 'rgba(56, 189, 248, 0.15)',
                                color: 'var(--secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <i className="fa-solid fa-camera"></i>
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.98rem' }}>{item.placeName}</div>
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '12px',
                                  color: 'var(--text-muted)',
                                  fontSize: '0.82rem',
                                  marginTop: '2px',
                                }}
                              >
                                {item.category && <span>Category: {item.category}</span>}
                                {item.location && <span>• {item.location}</span>}
                                {item.notes && <span style={{ fontStyle: 'italic' }}>• "{item.notes}"</span>}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {item.estimatedCost !== undefined && (
                              <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.92rem' }}>
                                ${item.estimatedCost}
                              </span>
                            )}
                            <button
                              onClick={() => handleRemovePlace(item.id)}
                              className="btn btn-outline btn-sm"
                              style={{
                                padding: '4px 10px',
                                borderColor: 'rgba(239, 68, 68, 0.3)',
                                color: '#f87171',
                              }}
                              title="Remove place"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Place Modal */}
        {isAddModalOpen && (
          <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <div className="modal-header">
                <h3>Add Place to Itinerary</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="modal-close"
                  aria-label="Close modal"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <form onSubmit={handleAddPlaceSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label" htmlFor="select-place">
                      Select Attraction / Spot
                    </label>
                    {loadingAvailable ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Loading destination places...</p>
                    ) : availablePlaces.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        No catalog places found for this destination.
                      </p>
                    ) : (
                      <select
                        id="select-place"
                        className="form-control"
                        value={selectedPlaceId}
                        onChange={(e) => setSelectedPlaceId(e.target.value)}
                        required
                      >
                        {availablePlaces.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.category ? `(${p.category})` : ''} - ${p.estimatedCost || 0}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="select-day">
                      Scheduled Visit Day
                    </label>
                    <select
                      id="select-day"
                      className="form-control"
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(Number(e.target.value))}
                      required
                    >
                      {Array.from({ length: daysCount }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          Day {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="place-notes">
                      Custom Notes (Optional)
                    </label>
                    <input
                      type="text"
                      id="place-notes"
                      className="form-control"
                      placeholder="e.g. Visit at sunset, buy tickets in advance"
                      value={placeNotes}
                      onChange={(e) => setPlaceNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={addingPlace || availablePlaces.length === 0}
                  >
                    {addingPlace ? (
                      <>
                        <span className="spinner"></span> Adding...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-plus"></i> Add to Day {selectedDay}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TripDetailPage;
