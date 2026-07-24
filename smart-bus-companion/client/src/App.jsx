import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/ui/Layout';
import ProtectedRoute from './components/ui/ProtectedRoute';
import PwaReloadPrompt from './components/PwaReloadPrompt';
import { PreferencesProvider } from './context/PreferencesContext';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Track from './pages/Track';
import Complaints from './pages/Complaints';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  React.useEffect(() => {
    // Silent refresh on app load
    fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    }).then(res => {
      if (res.ok) {
        res.json().then(data => localStorage.setItem('userRole', data.role));
      }
    }).catch(err => console.error('Initial silent refresh failed:', err));
  }, []);
  return (
    <PreferencesProvider>
      <PwaReloadPrompt />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="track/:routeId" element={<Track />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </PreferencesProvider>
  );
}

export default App;

// style updates
