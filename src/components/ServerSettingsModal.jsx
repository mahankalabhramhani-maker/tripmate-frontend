import React, { useState } from 'react';
import { getApiBaseUrl, setCustomApiBaseUrl, resetCustomApiBaseUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function ServerSettingsModal({ isOpen, onClose }) {
  const { showToast } = useAuth();
  const [urlInput, setUrlInput] = useState(getApiBaseUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const trimmed = urlInput.trim().replace(/\/+$/, '');
    if (!trimmed) return;
    setCustomApiBaseUrl(trimmed);
    showToast(`API Base URL saved: ${trimmed}`, 'success');
    onClose();
  };

  const handleReset = () => {
    resetCustomApiBaseUrl();
    const defaultUrl = getApiBaseUrl();
    setUrlInput(defaultUrl);
    setTestResult({ success: true, message: 'Reset to default backend URL.' });
    showToast('Reset API Base URL to default.', 'info');
  };

  const handleTestConnection = async () => {
    const target = urlInput.trim().replace(/\/+$/, '');
    setTesting(true);
    setTestResult(null);

    try {
      let res = await fetch(`${target}/health`, { method: 'GET' });
      if (!res.ok) {
        res = await fetch(`${target}/destinations`, { method: 'GET' });
      }

      if (res.ok) {
        setTestResult({
          success: true,
          message: 'Connected successfully! Spring Boot backend responded with HTTP ' + res.status,
        });
      } else {
        const coldStartHint = res.status === 502 || res.status === 503 
          ? ' (Render backend may be waking up from sleep; please retry shortly)' 
          : '';
        setTestResult({
          success: false,
          message: `Server returned HTTP ${res.status}${coldStartHint}`,
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Connection failed: ${err.message}. Ensure backend is running with CORS enabled.`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          &times;
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <i className="fa-solid fa-server text-primary" style={{ fontSize: '1.2rem' }}></i>
          <h3>Backend Server Settings</h3>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Configure the Spring Boot REST API endpoint for TripMate.
        </p>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="api-base-url-input">
              <i className="fa-solid fa-link" style={{ marginRight: '6px' }}></i> API Base URL
            </label>
            <input
              type="text"
              id="api-base-url-input"
              className="form-control"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://tripmate-backend-gl4s.onrender.com/api"
              required
            />
            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '8px', lineHeight: 1.4 }}>
              • Cloud backend (Render): <code>https://tripmate-backend-gl4s.onrender.com/api</code><br />
              • Local default: <code>http://localhost:8081/api</code>
            </small>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              <i className="fa-solid fa-check"></i> Save & Reconnect
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleTestConnection}
              disabled={testing}
            >
              {testing ? (
                <>
                  <span className="spinner"></span> Testing...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-plug"></i> Test Connection
                </>
              )}
            </button>
            <button type="button" className="btn btn-glass" onClick={handleReset}>
              Reset
            </button>
          </div>

          {testResult && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: testResult.success ? 'var(--success-light)' : 'var(--danger-light)',
                color: testResult.success ? '#34d399' : '#f87171',
                border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              }}
            >
              <i
                className={`fa-solid ${
                  testResult.success ? 'fa-circle-check' : 'fa-circle-exclamation'
                }`}
              ></i>
              <span>{testResult.message}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ServerSettingsModal;
