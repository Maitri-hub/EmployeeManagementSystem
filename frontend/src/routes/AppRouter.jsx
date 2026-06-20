import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Login          from '../components/Auth/Login';
import Signup         from '../components/Auth/Signup';
import ForgotPassword from '../components/Auth/ForgotPassword';
import Dashboard      from '../components/Layout/Dashboard';
import Profile        from '../components/Layout/Profile';
import Settings       from '../components/Layout/Settings';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute    from './PublicRoute';
import EmployeeList from '../components/Employee/EmployeeList';
import CreateEmployee from '../components/Employee/CreateEmployee';
import EditEmployee from '../components/Employee/EditEmployee';

/* Page-level fade + slide transition wrapper */
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    style={{ width: '100%' }}
  >
    {children}
  </motion.div>
);

/* Simple 404 page */
function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12,
      background: 'var(--bg-page)', color: 'var(--text-primary)',
    }}>
      <h1 style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-2px', opacity: 0.2 }}>404</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Page not found</p>
      <a href="/login" style={{ color: 'var(--text-link)', fontSize: 14, fontWeight: 500 }}>
        ← Back to login
      </a>
    </div>
  );
}

export default function AppRouter() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public (auth) routes */}
        <Route path="/login" element={
          <PublicRoute>
            <PageTransition><Login /></PageTransition>
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <PageTransition><Signup /></PageTransition>
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <PageTransition><ForgotPassword /></PageTransition>
          </PublicRoute>
        } />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PageTransition><Dashboard /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/employees" element={
          <ProtectedRoute>
            <PageTransition><EmployeeList /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/employees/create" element={
        <ProtectedRoute>
          <PageTransition><CreateEmployee /></PageTransition>
        </ProtectedRoute>
      } />
        <Route path="/employees/edit/:id" element={
        <ProtectedRoute>
          <PageTransition><EditEmployee /></PageTransition>
        </ProtectedRoute>
      } />
        <Route path="/employees/:id/edit" element={
          <ProtectedRoute>
            <PageTransition><EditEmployee /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <PageTransition><Settings /></PageTransition>
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

