import React from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';

export function DestinationCard({ destination, onSelectDetails, onSelect }) {
  const navigate = useNavigate();
  const handleSelect = onSelectDetails || onSelect;

  const handlePlanClick = (e) => {
    e.stopPropagation();
    navigate(`/planner?destId=${destination.id}`);
  };

  return (
    <div
      className="card destination-card"
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
      onClick={() => handleSelect && handleSelect(destination)}
    >
      {/* Image Thumbnail */}
      <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden' }}>
        <img
          src={destination.imageUrl || DEFAULT_IMAGE}
          alt={destination.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_IMAGE;
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(11, 15, 25, 0.9) 0%, transparent 60%)',
          }}
        ></div>

        <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
          <span className="badge badge-primary">
            <i className="fa-solid fa-coins"></i> ₹{destination.averageBudget ? destination.averageBudget.toLocaleString() : '15,000'}
          </span>
        </div>

        <div style={{ position: 'absolute', bottom: '14px', left: '16px', right: '16px' }}>
          <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '2px' }}>{destination.name}</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 500 }}>
            <i className="fa-solid fa-location-dot" style={{ marginRight: '4px' }}></i>{destination.country || 'India'}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '14px' }}>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.88rem',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {destination.description || 'Discover historic landmarks, coastal beauty, and vibrant culture.'}
        </p>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
            onClick={handlePlanClick}
          >
            <i className="fa-solid fa-route"></i> Plan Trip
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect && handleSelect(destination);
            }}
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default DestinationCard;
