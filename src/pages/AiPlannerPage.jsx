import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const TRAVEL_STYLES = ['Budget Explorer', 'Relaxed & Leisure', 'Adventure & Thrill', 'Culture & Luxury'];

const INTEREST_TAGS = [
  'Sightseeing',
  'Local Food & Dining',
  'Historical Monuments',
  'Nature & Hiking',
  'Beaches & Water Sports',
  'Shopping & Markets',
  'Art & Museums',
  'Nightlife',
];

export function AiPlannerPage() {
  const navigate = useNavigate();
  const { isAuthenticated, showToast } = useAuth();

  // Form states
  const [destination, setDestination] = useState('Paris, France');
  const [numberOfDays, setNumberOfDays] = useState(4);
  const [budget, setBudget] = useState(1500);
  const [numberOfTravelers, setNumberOfTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState('Relaxed & Leisure');
  const [selectedInterests, setSelectedInterests] = useState(['Sightseeing', 'Local Food & Dining']);

  // Results & Loading states
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleInterest = (tag) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!destination.trim()) {
      setErrorMessage('Please specify a destination.');
      return;
    }
    if (!budget || Number(budget) <= 0) {
      setErrorMessage('Budget must be greater than $0.');
      return;
    }

    setLoading(true);
    setPlanResult(null);

    try {
      const payload = {
        destination: destination.trim(),
        numberOfDays: Number(numberOfDays),
        budget: Number(budget),
        numberOfTravelers: Number(numberOfTravelers),
        interests: selectedInterests,
        travelStyle,
      };

      const result = await api.ai.generatePlan(payload);
      setPlanResult(result);
      showToast('AI Travel Itinerary generated successfully!', 'success');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to generate AI travel plan. Please check the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-planner-page section-py">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '12px' }}>
            <i className="fa-solid fa-wand-magic-sparkles"></i> AI Intelligent Engine
          </span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
            AI Smart Travel <span className="gradient-text">Planner</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Harness intelligent algorithms to craft optimal day-by-day itineraries, daily meal highlights, and realistic budget allocations tailored to your travel personality.
          </p>
        </div>

        {/* Input Form Card */}
        <div className="card" style={{ padding: '36px 32px', marginBottom: '40px', maxWidth: '840px', margin: '0 auto 40px' }}>
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

          <form onSubmit={handleGeneratePlan} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ai-destination">
                  <i className="fa-solid fa-location-dot" style={{ color: 'var(--primary)', marginRight: '6px' }}></i> Target Destination
                </label>
                <input
                  type="text"
                  id="ai-destination"
                  className="form-control"
                  placeholder="e.g. Kyoto, Japan or Rome, Italy"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ai-days">
                  <i className="fa-solid fa-calendar-days" style={{ marginRight: '6px' }}></i> Duration (Days)
                </label>
                <input
                  type="number"
                  id="ai-days"
                  className="form-control"
                  min="1"
                  max="14"
                  value={numberOfDays}
                  onChange={(e) => setNumberOfDays(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ai-budget">
                  <i className="fa-solid fa-wallet" style={{ color: 'var(--accent)', marginRight: '6px' }}></i> Total Budget (USD)
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
                    id="ai-budget"
                    className="form-control"
                    style={{ paddingLeft: '32px' }}
                    min="100"
                    step="50"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ai-travelers">
                  <i className="fa-solid fa-users" style={{ marginRight: '6px' }}></i> Travelers
                </label>
                <input
                  type="number"
                  id="ai-travelers"
                  className="form-control"
                  min="1"
                  max="20"
                  value={numberOfTravelers}
                  onChange={(e) => setNumberOfTravelers(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ai-style">
                  <i className="fa-solid fa-compass" style={{ marginRight: '6px' }}></i> Travel Style
                </label>
                <select
                  id="ai-style"
                  className="form-control"
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                >
                  {TRAVEL_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interest Tags */}
            <div className="form-group" style={{ marginTop: '8px' }}>
              <label className="form-label">
                <i className="fa-solid fa-heart" style={{ color: 'var(--secondary)', marginRight: '6px' }}></i> Select Travel Themes
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {INTEREST_TAGS.map((tag) => {
                  const isSelected = selectedInterests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.84rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                        background: isSelected ? 'rgba(20, 184, 166, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {isSelected && <i className="fa-solid fa-check" style={{ marginRight: '6px' }}></i>}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ marginTop: '28px' }}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> AI is Generating Itinerary...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i> Generate AI Itinerary & Budget Plan
                </>
              )}
            </button>
          </form>
        </div>

        {/* AI Result Section */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 20px' }}></div>
            <h3>Formulating your smart plan...</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Analyzing attractions, estimating realistic expenditure, and organizing day-by-day routes.
            </p>
          </div>
        )}

        {planResult && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Overview Banner */}
            <div
              className="card"
              style={{
                padding: '32px',
                marginBottom: '28px',
                background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(15, 23, 42, 0.8))',
                borderColor: 'rgba(20, 184, 166, 0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span className="badge badge-accent" style={{ marginBottom: '8px' }}>
                    <i className="fa-solid fa-robot"></i> Generated by {planResult.aiModelUsed || 'TripMate AI Engine'}
                  </span>
                  <h2 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{planResult.destination}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '680px' }}>
                    {planResult.summary}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Est. Total Cost
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ${Number(planResult.estimatedTotalCost || planResult.totalBudget || budget).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips & Recommendations */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {planResult.travelTips && planResult.travelTips.length > 0 && (
                <div className="card" style={{ padding: '24px' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '14px', color: 'var(--accent)' }}>
                    <i className="fa-solid fa-lightbulb" style={{ marginRight: '8px' }}></i> Travel Tips
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8' }}>
                    {planResult.travelTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {planResult.foodRecommendations && planResult.foodRecommendations.length > 0 && (
                <div className="card" style={{ padding: '24px' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '14px', color: 'var(--primary)' }}>
                    <i className="fa-solid fa-utensils" style={{ marginRight: '8px' }}></i> Food & Dining Highlights
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8' }}>
                    {planResult.foodRecommendations.map((food, idx) => (
                      <li key={idx}>{food}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Day by Day Plan */}
            {planResult.itinerary && planResult.itinerary.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Daily Schedule</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {planResult.itinerary.map((dayPlan) => (
                    <div key={dayPlan.day} className="card" style={{ padding: '24px' }}>
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
                        <div>
                          <span className="badge badge-primary" style={{ marginRight: '10px' }}>
                            Day {dayPlan.day}
                          </span>
                          <strong style={{ fontSize: '1.1rem' }}>{dayPlan.title}</strong>
                          {dayPlan.theme && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '10px' }}>
                              ({dayPlan.theme})
                            </span>
                          )}
                        </div>
                        {dayPlan.estimatedDayCost !== undefined && (
                          <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                            ${dayPlan.estimatedDayCost}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.9rem' }}>
                        {dayPlan.morningActivities && (
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--secondary)', marginBottom: '4px' }}>
                              <i className="fa-regular fa-sun" style={{ marginRight: '6px' }}></i> Morning
                            </div>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                              {Array.isArray(dayPlan.morningActivities)
                                ? dayPlan.morningActivities.join(', ')
                                : dayPlan.morningActivities}
                            </p>
                          </div>
                        )}

                        {dayPlan.afternoonActivities && (
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: '4px' }}>
                              <i className="fa-solid fa-cloud-sun" style={{ marginRight: '6px' }}></i> Afternoon
                            </div>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                              {Array.isArray(dayPlan.afternoonActivities)
                                ? dayPlan.afternoonActivities.join(', ')
                                : dayPlan.afternoonActivities}
                            </p>
                          </div>
                        )}

                        {dayPlan.eveningActivities && (
                          <div>
                            <div style={{ fontWeight: 600, color: '#c084fc', marginBottom: '4px' }}>
                              <i className="fa-regular fa-moon" style={{ marginRight: '6px' }}></i> Evening
                            </div>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                              {Array.isArray(dayPlan.eveningActivities)
                                ? dayPlan.eveningActivities.join(', ')
                                : dayPlan.eveningActivities}
                            </p>
                          </div>
                        )}
                      </div>

                      {dayPlan.recommendedMeals && (
                        <div
                          style={{
                            marginTop: '16px',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid var(--border)',
                            fontSize: '0.86rem',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <i className="fa-solid fa-utensils" style={{ color: 'var(--primary)', marginRight: '6px' }}></i>
                          <strong>Recommended Eats:</strong> {dayPlan.recommendedMeals}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AiPlannerPage;
