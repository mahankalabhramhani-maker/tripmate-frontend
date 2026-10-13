import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function ProfilePage() {
  const { user, logout, updateUser, showToast } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit form state
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.users.getMe();
      setProfile(data);
      setName(data.name || '');
    } catch (err) {
      setError(err.message || 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'warning');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'warning');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = { name: name.trim() };
      if (newPassword) {
        payload.password = newPassword;
      }
      const updated = await api.users.update(profile?.id || user?.id, payload);
      setProfile(updated);
      updateUser({ name: updated.name });
      setNewPassword('');
      setConfirmPassword('');
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'Type "DELETE" to permanently delete your TripMate account and all associated trips:'
    );
    if (confirmation !== 'DELETE') {
      showToast('Account deletion canceled.', 'info');
      return;
    }

    setDeleting(true);
    try {
      await api.users.delete(profile?.id || user?.id);
      showToast('Your account has been deleted.', 'info');
      logout();
      navigate('/');
    } catch (err) {
      showToast(err.message || 'Failed to delete account.', 'error');
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="profile-page section-py">
      <div className="container" style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            className="brand-icon"
            style={{ width: '64px', height: '64px', margin: '0 auto 16px', fontSize: '1.8rem' }}
          >
            <i className="fa-solid fa-user"></i>
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>User Profile</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage your account credentials, view membership info, and security preferences.
          </p>
        </div>

        {error && (
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
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>Loading account information...</p>
          </div>
        ) : (
          <div className="card" style={{ padding: '36px 32px' }}>
            {/* Account Info Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)',
                marginBottom: '28px',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                {(profile?.name || user?.name || 'U').charAt(0).toUpperCase()}
              </div>

              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {profile?.name || user?.name || 'Explorer'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
                  <i className="fa-solid fa-envelope" style={{ marginRight: '6px' }}></i>
                  {profile?.email || user?.email || 'email@example.com'}
                </div>
                {profile?.createdAt && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                    Member since: {new Date(profile.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Profile Form */}
            <form onSubmit={handleUpdateProfile}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Update Information</h3>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="profile-name"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="profile-email"
                  className="form-control"
                  value={profile?.email || user?.email || ''}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Email address cannot be changed once registered.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-password">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  id="profile-password"
                  className="form-control"
                  placeholder="Enter new password (optional)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              {newPassword && (
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-confirm-password">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="profile-confirm-password"
                    className="form-control"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner"></span> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-floppy-disk"></i> Update Profile
                    </>
                  )}
                </button>
                <button type="button" onClick={handleLogout} className="btn btn-outline">
                  <i className="fa-solid fa-right-from-bracket"></i> Sign Out
                </button>
              </div>
            </form>

            {/* Danger Zone */}
            <div
              style={{
                marginTop: '44px',
                paddingTop: '28px',
                borderTop: '1px solid var(--border)',
              }}
            >
              <h4 style={{ color: '#f87171', fontSize: '1.05rem', marginBottom: '8px' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i> Danger Zone
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
                Permanently delete your user profile and all saved trips from the database.
              </p>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="btn btn-outline btn-sm"
                disabled={deleting}
                style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
              >
                {deleting ? 'Deleting Account...' : 'Delete Account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
