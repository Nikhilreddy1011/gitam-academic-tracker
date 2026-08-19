import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LayoutWrapper from './components/LayoutWrapper';

// Auth pages (public)
import Login    from './pages/Login';
import Signup   from './pages/Signup';
import Register from './pages/Register';
import OTP      from './pages/OTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';

// Protected pages
import Dashboard from './pages/Dashboard';
import SGPA      from './pages/SGPA';
import Attendance from './pages/Attendance';
import Tasks     from './pages/Tasks';
import Study     from './pages/Study';
import Aptitude  from './pages/Aptitude';
import Materials from './pages/Materials';
import Calendar  from './pages/Calendar';
import Events    from './pages/Events';
import Profile   from './pages/Profile';

// Apply CSS variables from the original HTML (all styles are in index.css)
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── PUBLIC ROUTES ── */}
          <Route path="/login"    element={<Login />} />
          <Route path="/signup"   element={<Signup />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp"      element={<OTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* ── ROOT REDIRECT ── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* ── PROTECTED ROUTES ── */}
          <Route path="/dashboard"  element={<LayoutWrapper><Dashboard /></LayoutWrapper>} />
          <Route path="/sgpa"       element={<LayoutWrapper><SGPA /></LayoutWrapper>} />
          <Route path="/attendance" element={<LayoutWrapper><Attendance /></LayoutWrapper>} />
          <Route path="/tasks"      element={<LayoutWrapper><Tasks /></LayoutWrapper>} />
          <Route path="/planner"    element={<LayoutWrapper><Study /></LayoutWrapper>} />
          <Route path="/aptitude"   element={<LayoutWrapper><Aptitude /></LayoutWrapper>} />
          <Route path="/materials"  element={<LayoutWrapper><Materials /></LayoutWrapper>} />
          <Route path="/calendar"   element={<LayoutWrapper><Calendar /></LayoutWrapper>} />
          <Route path="/events"     element={<LayoutWrapper><Events /></LayoutWrapper>} />
          <Route path="/profile"    element={<LayoutWrapper><Profile /></LayoutWrapper>} />

          {/* ── CATCH ALL ── */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;