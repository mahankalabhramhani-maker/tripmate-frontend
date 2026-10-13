import React from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_TRIP_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';

export function TripCard({ trip, onDelete }) {
  const isWithinBudget = trip.isWithinBudget ?? (trip.estimatedCost ? trip.estimatedCost <= trip.budget : true);
  const destinationName = trip.destination?.name || 'Custom Trip';
  const destinationImage = trip.destination?.imageUrl || DEFAULT_TRIP_IMAGE;

  return (
    <div
      className="card trip-card"
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header Banner */}
      <div style={{ position: 'relative', height: '160px', width: '100%', overflow: 'hidden' }}>
        <img
          src={destinationImage}
          alt={destinationName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_TRIP_IMAGE;
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(11, 15, 25, 0.95) 0%, transparent 70%)',
          }}
        ></div>

        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
          <span className={`badge ${trip.status === 'COMPLETED' ? 'badge-success' : 'badge-primary'}`}>
            {trip.status || 'PLANNED'}
          </span>
        </div>

        <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '2px' }}>{destinationName}</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-calendar-day" style={{ marginRight: '5px' }}></i>
            {trip.travelDate ? new Date(trip.travelDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible Date'}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
          <div style={{ background: 'var(--bg-glass)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', textTransform: 'uppercase' }}>Duration</span>
            <strong style={{ fontSize: '0.95rem' }}>{trip.numberOfDays || 1} Days</strong>
          </div>
          <div style={{ background: 'var(--bg-glass)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', textTransform: 'uppercase' }}>Travelers</span>
            <strong style={{ fontSize: '0.95rem' }}>{trip.numberOfTravelers || 1} Pers.</strong>
          </div>
          <div style={{ background: 'var(--bg-glass)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', textTransform: 'uppercase' }}>Places</span>
            <strong style={{ fontSize: '0.95rem' }}>{trip.places ? trip.places.length : 0} Spots</strong>
          </div>
        </div>

        {/* Budget overview */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: isWithinBudget ? 'var(--success-light)' : 'var(--danger-light)',
            border: `1px solid ${isWithinBudget ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Target Budget</span>
            <strong style={{ fontSize: '1rem', color: '#fff' }}>₹{trip.budget ? trip.budget.toLocaleString() : '0'}</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: isWithinBudget ? '#34d399' : '#f87171', display: 'block', fontWeight: 600 }}>
              {isWithinBudget ? '✓ On Budget' : '⚠ Over Budget'}
            </span>
            <strong style={{ fontSize: '0.9rem', color: isWithinBudget ? '#34d399' : '#f87171' }}>
              Est. ₹{trip.estimatedCost ? trip.estimatedCost.toLocaleString() : '0'}
            </strong>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '4px' }}>
          <Link to={`/trips/${trip.id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
            <i className="fa-solid fa-map"></i> View & Itinerary
          </Link>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onDelete && onDelete(trip.id)}
            title="Delete Trip"
            style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.25)' }}
          >
            <i className="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TripCard;
