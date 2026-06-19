import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, User, Settings, Bell,
  LayoutDashboard, LogOut, Shield, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import LogoutModal from '../Auth/LogoutModal';
import ThemeToggle from '../UI/ThemeToggle';

const dropdownVariants = {
  hidden:  { opacity: 0, scale: 0.94, y: -8 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 26 },
  },
  exit:    { opacity: 0, scale: 0.94, y: -8, transition: { duration: 0.18 } },
};

export default function Navbar() {
  const { user }   = useAuth();
  const [open, setOpen]       = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const dropRef = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-logo" style={{ textDecoration: 'none' }}>
          <div className="navbar-logo-icon">
            <Layers size={16} color="white" />
          </div>
          WorkFlow
        </Link>

        {/* Right side */}
        <div className="navbar-right">
          {/* Notification bell */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--bg-input)', border: '1px solid var(--border-input)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)', position: 'relative',
            }}
            aria-label="Notifications"
          >
            <Bell size={15} />
            {/* Badge */}
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 7, height: 7, borderRadius: '50%',
              background: '#ef4444',
              border: '1.5px solid var(--bg-page)',
            }} />
          </motion.button>

          <ThemeToggle />

          {/* Avatar dropdown trigger */}
          <div style={{ position: 'relative' }} ref={dropRef}>
            <motion.button
              className="avatar-btn"
              onClick={() => setOpen(v => !v)}
              aria-expanded={open}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="avatar">
                {user.initials || user.name?.slice(0, 2).toUpperCase()}
              </div>
              <span className="avatar-name">{user.name?.split(' ')[0]}</span>
              <motion.span
                className="avatar-chevron"
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.22 }}
              >
                <ChevronDown size={14} />
              </motion.span>
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
              {open && (
                <motion.div
                  className="dropdown"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0 }}
                >
                  {/* Header */}
                  <div className="dropdown-header">
                    <p className="dropdown-username">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                    <span className="dropdown-role">
                      <Shield size={10} /> {user.role}
                    </span>
                  </div>

                  {/* Items */}
                  <div style={{ padding: '4px 0' }}>
                    <Link to="/dashboard" style={{ textDecoration: 'none' }} onClick={() => setOpen(false)}>
                      <DropItem icon={<LayoutDashboard size={15} />} label="Dashboard" />
                    </Link>
                    <Link to="/profile" style={{ textDecoration: 'none' }} onClick={() => setOpen(false)}>
                      <DropItem icon={<User size={15} />} label="My Profile" />
                    </Link>
                    <Link to="/settings" style={{ textDecoration: 'none' }} onClick={() => setOpen(false)}>
                      <DropItem icon={<Settings size={15} />} label="Settings" />
                    </Link>
                  </div>

                  <div className="dropdown-divider" />

                  <div style={{ padding: '4px 0 6px' }}>
                    <button
                      className="dropdown-item danger"
                      style={{ width: '100%' }}
                      onClick={() => { setOpen(false); setLogoutOpen(true); }}
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Logout confirmation modal */}
      <LogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </>
  );
}

function DropItem({ icon, label, danger }) {
  return (
    <motion.div
      className={`dropdown-item${danger ? ' danger' : ''}`}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
    >
      {icon}
      {label}
    </motion.div>
  );
}
