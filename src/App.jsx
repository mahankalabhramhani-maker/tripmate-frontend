import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ServerSettingsModal } from './components/ServerSettingsModal';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { DestinationsPage } from './pages/DestinationsPage';
import { TripPlannerPage } from './pages/TripPlannerPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { TripDetailPage } from './pages/TripDetailPage';
import { AiPlannerPage } from './pages/AiPlannerPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll to top helper on navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  return (
    <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollToTop />

      {/* Top Navigation */}
      <Navbar onOpenServerModal={() => setIsServerModalOpen(true)} />

      {/* Main Content View */}
      <main style={{ flex: '1 0 auto' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/ai-planner" element={<AiPlannerPage />} />

          {/* Protected Routes (Authentication Required) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <TripPlannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-trips"
            element={
              <ProtectedRoute>
                <MyTripsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id"
            element={
              <ProtectedRoute>
                <TripDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Application Footer */}
      <Footer onOpenServerModal={() => setIsServerModalOpen(true)} />

      {/* Backend API Configuration & Health Modal */}
      <ServerSettingsModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
      />
    </div>
  );
}

export default App;
