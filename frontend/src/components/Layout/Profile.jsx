import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Building2, Shield,
  Camera, Check, Pencil, X, Loader2,
  BadgeCheck, CalendarDays, MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Layout/Navbar';
import AuthBackground from '../UI/AuthBackground';

/* ── Motion variants — identical cadence to Dashboard ── */
const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 22, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

/* ── Inline styles that reuse CSS variables ── */
const CARD = {
  background: 'var(--bg-card)',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: 'var(--glass-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--glass-shadow)',
  position: 'relative',
  overflow: 'hidden',
};

const SECTION_TITLE = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: 16,
};

/* Stat pill shown in the avatar panel */
function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px',
      background: 'var(--bg-input)',
      border: '1px solid var(--border-input)',
      borderRadius: 'var(--radius-md)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: `${color}20`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, flexShrink: 0,
      }}>
        <Icon size={15} />
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{value}</p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{label}</p>
      </div>
    </div>
  );
}

/* Reusable field row with icon + editable input */
function ProfileField({ id, label, icon: Icon, value, onChange, type = 'text', disabled }) {
  return (
    <div className="form-group" style={{ marginBottom: 16 }}>
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className="input-wrapper">
        <span className="input-icon"><Icon size={15} /></span>
        <input
          id={id}
          type={type}
          className="form-input"
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        />
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function Profile() {
  const { user }  = useAuth();
  const { push }  = useToast();

  /* Local editable state seeded from AuthContext user */
  const [form, setForm] = useState({
    name:       user?.name       ?? '',
    email:      user?.email      ?? '',
    phone:      user?.phone      ?? '+1 (555) 012-3456',
    department: user?.department ?? 'Engineering',
    location:   user?.location   ?? 'San Francisco, CA',
  });

  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [editing,  setEditing]  = useState(false);
  /* Snapshot to restore on cancel */
  const snapshot = useRef({ ...form });

  const field = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleEdit = () => {
    snapshot.current = { ...form };
    setEditing(true);
    setSaved(false);
  };

  const handleCancel = () => {
    setForm({ ...snapshot.current });
    setEditing(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { push('Name cannot be empty.', 'error'); return; }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      push('Enter a valid email address.', 'error'); return;
    }
    setSaving(true);
    /* Simulate API delay */
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setEditing(false);
    setSaved(true);
    push('Profile updated successfully!', 'success');
    setTimeout(() => setSaved(false), 2500);
  };

  /* Derive avatar initials from current form name */
  const initials = form.name
    .split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', position: 'relative' }}>
      <AuthBackground />
      <Navbar />

      <div style={{ paddingTop: 64, position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>

          {/* ── Page header ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: 32 }}
          >
            <span className="dashboard-badge" style={{ marginBottom: 12 }}>
              <User size={11} /> My Profile
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>
              Account Profile
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Manage your personal information and account details.
            </p>
          </motion.div>

          {/* ── Two-column layout ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 320px) 1fr',
              gap: 20,
              alignItems: 'start',
            }}
          >
            {/* ── LEFT: Avatar card ── */}
            <motion.div variants={itemVariants} style={{ ...CARD, padding: '28px 24px' }}>
              {/* Subtle gradient shimmer top-right */}
              <div style={{
                position: 'absolute', top: -40, right: -40,
                width: 140, height: 140, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(91,110,245,0.18) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* Avatar circle + camera overlay */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ position: 'relative', marginBottom: 14 }}>
                  <motion.div
                    style={{
                      width: 88, height: 88, borderRadius: '50%',
                      background: 'var(--brand-gradient)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, fontWeight: 800, color: '#fff',
                      letterSpacing: '-0.5px',
                      boxShadow: '0 0 0 4px var(--bg-card), 0 0 0 6px var(--border-card)',
                    }}
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.2 }}
                  >
                    {initials}
                  </motion.div>

                  {/* Camera button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => push('Photo upload coming soon.', 'info')}
                    style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--brand-gradient)',
                      border: '2px solid var(--bg-page)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#fff',
                    }}
                    aria-label="Upload photo"
                  >
                    <Camera size={13} />
                  </motion.button>
                </div>

                <p style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 3 }}>
                  {form.name || 'Your Name'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
                  {form.email}
                </p>

                {/* Role badge */}
                <span className="dropdown-role" style={{ fontSize: 11 }}>
                  <Shield size={10} /> {user?.role ?? 'Employee'}
                </span>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--border-card)', marginBottom: 20 }} />

              {/* Quick stats */}
              <p style={SECTION_TITLE}>Quick info</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <StatPill icon={Building2}    label="Department"   value={form.department} color="#5b6ef5" />
                <StatPill icon={MapPin}       label="Location"     value={form.location}   color="#8b5cf6" />
                <StatPill icon={CalendarDays} label="Member since" value="Jan 2024"         color="#06b6d4" />
                <StatPill icon={BadgeCheck}   label="Status"       value="Active"           color="#22c55e" />
              </div>
            </motion.div>

            {/* ── RIGHT: Editable form card ── */}
            <motion.div variants={itemVariants} style={{ ...CARD, padding: '28px 28px 24px' }}>
              {/* Card header row */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 24,
              }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px', marginBottom: 2 }}>
                    Personal Information
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {editing ? 'Fields are now editable — save when ready.' : 'Click Edit to update your details.'}
                  </p>
                </div>

                {/* Edit / Cancel toggle */}
                <AnimatePresence mode="wait" initial={false}>
                  {!editing ? (
                    <motion.button
                      key="edit"
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.88 }}
                      transition={{ duration: 0.18 }}
                      className="btn-ghost"
                      onClick={handleEdit}
                      style={{ width: 'auto', padding: '0 16px', height: 38, gap: 6, fontSize: 13 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Pencil size={14} /> Edit
                    </motion.button>
                  ) : (
                    <motion.button
                      key="cancel"
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.88 }}
                      transition={{ duration: 0.18 }}
                      className="btn-ghost"
                      onClick={handleCancel}
                      style={{ width: 'auto', padding: '0 16px', height: 38, gap: 6, fontSize: 13 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <X size={14} /> Cancel
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Fields grid ── */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0 20px',
              }}>
                <ProfileField
                  id="pf-name"      label="Full Name"
                  icon={User}       value={form.name}
                  onChange={field('name')} disabled={!editing}
                />
                <ProfileField
                  id="pf-email"     label="Email Address"
                  icon={Mail}       type="email"
                  value={form.email} onChange={field('email')}
                  disabled={!editing}
                />
                <ProfileField
                  id="pf-phone"     label="Phone Number"
                  icon={Phone}      type="tel"
                  value={form.phone} onChange={field('phone')}
                  disabled={!editing}
                />
                <ProfileField
                  id="pf-dept"      label="Department"
                  icon={Building2}  value={form.department}
                  onChange={field('department')} disabled={!editing}
                />
                <div style={{ gridColumn: '1 / -1' }}>
                  <ProfileField
                    id="pf-location"  label="Location"
                    icon={MapPin}     value={form.location}
                    onChange={field('location')} disabled={!editing}
                  />
                </div>
                {/* Role — always disabled, managed by admin */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <ProfileField
                    id="pf-role"    label="Role (managed by admin)"
                    icon={Shield}   value={user?.role ?? 'Employee'}
                    onChange={() => {}} disabled
                  />
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--border-card)', margin: '8px 0 20px' }} />

              {/* Save button row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
                <AnimatePresence>
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 5,
                        fontSize: 13, color: 'var(--text-success)', fontWeight: 500 }}
                    >
                      <Check size={14} /> Saved
                    </motion.span>
                  )}
                </AnimatePresence>

                <motion.button
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={!editing || saving}
                  style={{
                    width: 'auto', padding: '0 24px', height: 44,
                    opacity: (!editing || saving) ? 0.5 : 1,
                    cursor: (!editing || saving) ? 'not-allowed' : 'pointer',
                  }}
                  whileHover={editing && !saving ? { scale: 1.02, y: -1 } : {}}
                  whileTap={editing && !saving ? { scale: 0.97 } : {}}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {saving ? (
                      <motion.span key="saving"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 7 }}
                      >
                        <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />
                        Saving…
                      </motion.span>
                    ) : (
                      <motion.span key="idle"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 7 }}
                      >
                        <Check size={14} /> Save Changes
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Bottom: Activity / danger zone row ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}
          >
            {/* Recent activity */}
            <motion.div variants={itemVariants} style={{ ...CARD, padding: '24px' }}>
              <p style={SECTION_TITLE}>Recent Activity</p>
              {[
                { action: 'Profile viewed',        time: '2 minutes ago',  dot: '#5b6ef5' },
                { action: 'Password changed',       time: '3 days ago',     dot: '#22c55e' },
                { action: 'Login from new device',  time: '1 week ago',     dot: '#f59e0b' },
                { action: 'Department updated',     time: '2 weeks ago',    dot: '#8b5cf6' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.35 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0',
                    borderBottom: i < 3 ? '1px solid var(--border-card)' : 'none',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{item.action}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.time}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Danger zone */}
            <motion.div variants={itemVariants} style={{ ...CARD, padding: '24px' }}>
              <p style={SECTION_TITLE}>Danger Zone</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                Permanent actions that affect your account. Proceed with caution.
              </p>

              {[
                { label: 'Deactivate account', desc: 'Temporarily disable your access.', color: '#f59e0b' },
                { label: 'Delete account',     desc: 'Permanently remove all your data.', color: '#ef4444' },
              ].map((action, i) => (
                <motion.div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: i < 1 ? '1px solid var(--border-card)' : 'none',
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: action.color, marginBottom: 2 }}>
                      {action.label}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{action.desc}</p>
                  </div>
                  <motion.button
                    onClick={() => push(`${action.label} — feature coming soon.`, 'info')}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                      background: `${action.color}15`,
                      border: `1px solid ${action.color}30`,
                      color: action.color, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: 16,
                    }}
                  >
                    {action.label.split(' ')[0]}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
