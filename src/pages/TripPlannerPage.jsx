import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const INTEREST_OPTIONS = [
  'Sightseeing',
  'Culture & History',
  'Beaches & Coastal',
  'Adventure & Hiking',
  'Food & Wine',
  'Relaxation & Wellness',
  'Nightlife & Entertainment',
  'Shopping',
  'Nature & Wildlife',
  'Photography',
];

export function TripPlannerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useAuth();

  const [destinations, setDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  // Form State
  const initialDestId = searchParams.get('destinationId') || searchParams.get('destId') || '';
  const [destinationId, setDestinationId] = useState(initialDestId);
  const [startDate, setStartDate] = useState(() => {
    // Tomorrow by default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 6);
    return nextWeek.toISOString().split('T')[0];
  });
  const [numberOfDays, setNumberOfDays] = useState(5);
  const [budget, setBudget] = useState(1200);
  const [numberOfTravelers, setNumberOfTravelers] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState(['Sightseeing', 'Food & Wine']);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load destinations for the dropdown
  useEffect(() => {
    loadDestinations();
  }, []);

  // Update numberOfDays when startDate or endDate change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 1) {
        setNumberOfDays(diffDays);
      }
    }
  }, [startDate, endDate]);

  const loadDestinations = async () => {
    setLoadingDestinations(true);
    try {
      const data = await api.destinations.getAll();
      const list = Array.isArray(data) ? data : [];
      setDestinations(list);
      if (initialDestId && list.some((d) => String(d.id) === String(initialDestId))) {
        setDestinationId(initialDestId);
      } else if (list.length > 0 && !destinationId) {
        setDestinationId(String(list[0].id));
      }
    } catch (err) {
      console.warn('Failed to load destinations:', err);
    } finally {
      setLoadingDestinations(false);
    }
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!destinationId) {
      setErrorMessage('Please select a destination.');
      return;
    }
    if (!startDate) {
      setErrorMessage('Please choose a travel start date.');
      return;
    }
    if (!budget || Number(budget) <= 0) {
      setErrorMessage('Please enter a valid budget greater than $0.');
      return;
    }
    if (!numberOfTravelers || Number(numberOfTravelers) < 1) {
      setErrorMessage('Number of travelers must be at least 1.');
      return;
    }
    if (!numberOfDays || Number(numberOfDays) < 1) {
      setErrorMessage('Trip duration must be at least 1 day.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        destinationId: Number(destinationId),
        numberOfDays: Number(numberOfDays),
        budget: Number(budget),
        numberOfTravelers: Number(numberOfTravelers),
        travelDate: startDate,
        interests: selectedInterests.join(', '),
        status: 'PLANNED',
      };

      const createdTrip = await api.trips.create(payload);
      showToast('Trip itinerary created successfully!', 'success');
      navigate(createdTrip?.id ? `/trips/${createdTrip.id}` : '/my-trips');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create trip. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDestinationObj = destinations.find((d) => String(d.id) === String(destinationId));

  return (
    <div className="trip-planner-page section-py">
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '12px' }}>
            <i className="fa-solid fa-map"></i> Itinerary Builder
          </span>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '12px' }}>
            Plan Your Next <span className="gradient-text">Adventure</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '580px', margin: '0 auto' }}>
            Fill in your trip parameters, budget, and travel interests. TripMate will save your customized journey and organize your schedule.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              marginBottom: '24px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-light)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card" style={{ padding: '36px 32px' }} noValidate>
          {/* Destination Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="plan-destination">
              <i className="fa-solid fa-location-dot" style={{ color: 'var(--primary)', marginRight: '6px' }}></i>
              Choose Destination
            </label>
            {loadingDestinations ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                Loading available destinations...
              </div>
            ) : (
              <select
                id="plan-destination"
                className="form-control"
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                required
              >
                <option value="">-- Select a Destination --</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}, {d.country} {d.averageBudget ? `(Avg: $${d.averageBudget})` : ''}
                  </option>
                ))}
              </select>
            )}
            {selectedDestinationObj && (
              <div
                style={{
                  marginTop: '10px',
                  fontSize: '0.86rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <i className="fa-solid fa-circle-info" style={{ color: 'var(--secondary)' }}></i>
                <span>{selectedDestinationObj.description}</span>
              </div>
            )}
          </div>

          {/* Dates & Duration Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="plan-start-date">
                <i className="fa-solid fa-calendar" style={{ marginRight: '6px' }}></i> Start Date
              </label>
              <input
                type="date"
                id="plan-start-date"
                className="form-control"
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="plan-end-date">
                <i className="fa-solid fa-calendar-check" style={{ marginRight: '6px' }}></i> End Date
              </label>
              <input
                type="date"
                id="plan-end-date"
                className="form-control"
                value={endDate}
                min={startDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="plan-duration">
                <i className="fa-solid fa-clock" style={{ marginRight: '6px' }}></i> Total Duration (Days)
              </label>
              <input
                type="number"
                id="plan-duration"
                className="form-control"
                min="1"
                max="90"
                value={numberOfDays}
                onChange={(e) => setNumberOfDays(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Budget & Travelers Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="plan-budget">
                <i className="fa-solid fa-wallet" style={{ color: 'var(--accent)', marginRight: '6px' }}></i> Estimated Budget (USD)
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  id="plan-budget"
                  className="form-control"
                  style={{ paddingLeft: '32px' }}
                  min="50"
                  step="50"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="plan-travelers">
                <i className="fa-solid fa-user-group" style={{ marginRight: '6px' }}></i> Number of Travelers
              </label>
              <input
                type="number"
                id="plan-travelers"
                className="form-control"
                min="1"
                max="30"
                value={numberOfTravelers}
                onChange={(e) => setNumberOfTravelers(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Interests Tags */}
          <div className="form-group" style={{ marginTop: '10px' }}>
            <label className="form-label">
              <i className="fa-solid fa-tags" style={{ marginRight: '6px' }}></i> Travel Preferences & Interests
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
              {INTEREST_OPTIONS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? 'rgba(20, 184, 166, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {isSelected && <i className="fa-solid fa-check" style={{ marginRight: '6px' }}></i>}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/dashboard')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner"></span> Saving Trip...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i> Save & View Itinerary
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TripPlannerPage;
