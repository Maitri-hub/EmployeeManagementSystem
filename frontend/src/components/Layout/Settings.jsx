import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette, Bell, Shield, UserCog, Sun, Moon,
  Monitor, Globe, Lock, Smartphone, Mail,
  BellRing, BellOff, Eye, KeyRound, Trash2,
  ToggleLeft, LogOut, ChevronRight, Check,
  AlertTriangle, Loader2,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useAuth }  from '../../context/AuthContext';
import Navbar from '../Layout/Navbar';
import AuthBackground from '../UI/AuthBackground';

/* ── Shared layout tokens (same as Profile) ── */
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
  marginBottom: 18,
  display: 'flex', alignItems: 'center', gap: 6,
};

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 22, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

/* ── Toggle switch ── */
function Toggle({ checked, onChange, disabled, accent = 'var(--brand-primary)' }) {
  return (
    <motion.button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        position: 'relative', width: 42, height: 24, borderRadius: 99,
        background: checked ? accent : 'var(--bg-input)',
        border: `1px solid ${checked ? accent : 'var(--border-input)'}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        flexShrink: 0,
        transition: 'background 0.22s, border-color 0.22s',
        opacity: disabled ? 0.45 : 1,
      }}
      whileTap={!disabled ? { scale: 0.93 } : {}}
    >
      <motion.span
        style={{
          position: 'absolute', top: 3, left: 3,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        }}
        animate={{ x: checked ? 18 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </motion.button>
  );
}

/* ── Setting row ── */
function SettingRow({ icon: Icon, iconColor = 'var(--brand-primary)', label, desc, children, border = true }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 0',
      borderBottom: border ? '1px solid var(--border-card)' : 'none',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        background: `color-mix(in srgb, ${iconColor} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${iconColor} 22%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: iconColor, flexShrink: 0,
      }}>
        <Icon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</p>
        {desc && <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

/* ── Theme option button ── */
function ThemeOption({ value, label, icon: Icon, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      style={{
        flex: 1, padding: '12px 8px',
        borderRadius: 'var(--radius-md)',
        background: active ? 'rgba(91,110,245,0.12)' : 'var(--bg-input)',
        border: active ? '1px solid rgba(91,110,245,0.45)' : '1px solid var(--border-input)',
        color: active ? 'var(--text-link)' : 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        transition: 'all 0.2s',
        position: 'relative',
      }}
    >
      <Icon size={18} />
      <span style={{ fontSize: 12, fontWeight: 500 }}>{label}</span>
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            style={{
              position: 'absolute', top: 6, right: 6,
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--brand-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Check size={9} color="#fff" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ── Main component ── */
export default function Settings() {
  const { theme, toggle } = useTheme();
  const { push }          = useToast();
  const { user }          = useAuth();

  /* ── Notification prefs ── */
  const [notifs, setNotifs] = useState({
    emailAlerts:    true,
    pushAlerts:     false,
    weeklyDigest:   true,
    newEmployee:    true,
    deptChanges:    false,
    systemUpdates:  true,
  });
  const setNotif = (key) => (val) => setNotifs(n => ({ ...n, [key]: val }));

  /* ── Security prefs ── */
  const [security, setSecurity] = useState({
    twoFactor:   false,
    sessionAlerts: true,
    loginHistory:  true,
  });
  const setSec = (key) => (val) => setSecurity(s => ({ ...s, [key]: val }));

  /* ── Account prefs ── */
  const [account, setAccount] = useState({
    publicProfile:  false,
    analyticsOpt:   true,
    betaFeatures:   false,
    compactView:    false,
  });
  const setAcc = (key) => (val) => setAccount(a => ({ ...a, [key]: val }));

  /* ── Password change form ── */
  const [pwForm, setPwForm]   = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const handlePasswordSave = async () => {
    if (!pwForm.current)              { push('Current password is required.', 'error'); return; }
    if (pwForm.next.length < 8)       { push('New password must be at least 8 characters.', 'error'); return; }
    if (pwForm.next !== pwForm.confirm){ push('Passwords do not match.', 'error'); return; }
    setPwSaving(true);
    await new Promise(r => setTimeout(r, 1400));
    setPwSaving(false);
    setPwForm({ current: '', next: '', confirm: '' });
    push('Password updated successfully!', 'success');
  };

  /* ── Language options ── */
  const [lang, setLang] = useState('en');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', position: 'relative' }}>
      <AuthBackground />
      <Navbar />

      <div style={{ paddingTop: 64, position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>

          {/* ── Page header ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: 32 }}
          >
            <span className="dashboard-badge" style={{ marginBottom: 12 }}>
              <UserCog size={11} /> Settings
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>
              Preferences & Settings
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Customize your WorkFlow experience across appearance, notifications, and security.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >

            {/* ══════════════════════════════════════════
                SECTION 1 — Appearance
            ══════════════════════════════════════════ */}
            <motion.div variants={itemVariants} style={{ ...CARD, padding: '24px 24px 20px' }}>
              <p style={SECTION_TITLE}><Palette size={13} /> Appearance</p>

              {/* Theme selector */}
              <SettingRow
                icon={Sun}
                label="Color Theme"
                desc="Choose how WorkFlow looks on your device."
              >
                {/* Empty right slot — buttons below */}
              </SettingRow>
              <div style={{ display: 'flex', gap: 10, padding: '12px 0 8px' }}>
                <ThemeOption
                  value="dark"
                  label="Dark"
                  icon={Moon}
                  active={theme === 'dark'}
                  onClick={() => theme !== 'dark' && toggle()}
                />
                <ThemeOption
                  value="light"
                  label="Light"
                  icon={Sun}
                  active={theme === 'light'}
                  onClick={() => theme !== 'light' && toggle()}
                />
                <ThemeOption
                  value="system"
                  label="System"
                  icon={Monitor}
                  active={false}
                  onClick={() => push('System theme detection coming soon.', 'info')}
                />
              </div>

              {/* Compact view */}
              <SettingRow
                icon={Eye}
                iconColor="#8b5cf6"
                label="Compact View"
                desc="Reduce spacing and padding across the dashboard."
                border={false}
              >
                <Toggle checked={account.compactView} onChange={setAcc('compactView')} accent="#8b5cf6" />
              </SettingRow>
            </motion.div>

            {/* ══════════════════════════════════════════
                SECTION 2 — Notifications
            ══════════════════════════════════════════ */}
            <motion.div variants={itemVariants} style={{ ...CARD, padding: '24px 24px 20px' }}>
              <p style={SECTION_TITLE}><Bell size={13} /> Notifications</p>

              <SettingRow icon={Mail} iconColor="#5b6ef5" label="Email Alerts" desc="Receive important updates via email.">
                <Toggle checked={notifs.emailAlerts} onChange={setNotif('emailAlerts')} />
              </SettingRow>
              <SettingRow icon={Smartphone} iconColor="#06b6d4" label="Push Notifications" desc="Browser push alerts for real-time activity.">
                <Toggle checked={notifs.pushAlerts} onChange={setNotif('pushAlerts')} accent="#06b6d4" />
              </SettingRow>
              <SettingRow icon={BellRing} iconColor="#f59e0b" label="Weekly Digest" desc="A weekly summary of team activity delivered on Mondays.">
                <Toggle checked={notifs.weeklyDigest} onChange={setNotif('weeklyDigest')} accent="#f59e0b" />
              </SettingRow>

              {/* Sub-group */}
              <div style={{ padding: '10px 0 4px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Event Triggers
                </p>
              </div>

              <SettingRow icon={Bell} iconColor="#22c55e" label="New Employee Added" desc="Notify when a new profile is created.">
                <Toggle checked={notifs.newEmployee} onChange={setNotif('newEmployee')} accent="#22c55e" />
              </SettingRow>
              <SettingRow icon={Globe} iconColor="#8b5cf6" label="Department Changes" desc="Alerts for department restructures.">
                <Toggle checked={notifs.deptChanges} onChange={setNotif('deptChanges')} accent="#8b5cf6" />
              </SettingRow>
              <SettingRow icon={BellOff} iconColor="#ef4444" label="System Updates" desc="Maintenance windows and release notes." border={false}>
                <Toggle checked={notifs.systemUpdates} onChange={setNotif('systemUpdates')} accent="#ef4444" />
              </SettingRow>
            </motion.div>

            {/* ══════════════════════════════════════════
                SECTION 3 — Security
            ══════════════════════════════════════════ */}
            <motion.div variants={itemVariants} style={{ ...CARD, padding: '24px 24px 20px' }}>
              <p style={SECTION_TITLE}><Shield size={13} /> Security</p>

              {/* 2FA */}
              <SettingRow
                icon={Lock}
                iconColor="#22c55e"
                label="Two-Factor Authentication"
                desc={security.twoFactor ? 'Your account has an extra layer of protection.' : 'Add an extra layer of protection to your account.'}
              >
                <Toggle checked={security.twoFactor} onChange={(v) => { setSec('twoFactor')(v); push(v ? '2FA enabled!' : '2FA disabled.', v ? 'success' : 'info'); }} accent="#22c55e" />
              </SettingRow>
              <SettingRow icon={AlertTriangle} iconColor="#f59e0b" label="Login Alerts" desc="Get notified of sign-ins from new devices or locations.">
                <Toggle checked={security.sessionAlerts} onChange={setSec('sessionAlerts')} accent="#f59e0b" />
              </SettingRow>
              <SettingRow icon={Eye} iconColor="#06b6d4" label="Login History" desc="Track devices and IPs that accessed your account." border={false}>
                <Toggle checked={security.loginHistory} onChange={setSec('loginHistory')} accent="#06b6d4" />
              </SettingRow>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--border-card)', margin: '8px 0 20px' }} />

              {/* Change password sub-form */}
              <p style={{ ...SECTION_TITLE, marginBottom: 14 }}>
                <KeyRound size={13} /> Change Password
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="s-curpw">Current password</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Lock size={15} /></span>
                    <input id="s-curpw" type="password" className="form-input"
                      placeholder="Enter current password"
                      value={pwForm.current}
                      onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="s-newpw">New password</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Lock size={15} /></span>
                    <input id="s-newpw" type="password" className="form-input"
                      placeholder="Min. 8 characters"
                      value={pwForm.next}
                      onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="s-cfpw">Confirm new password</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Lock size={15} /></span>
                    <input id="s-cfpw" type="password" className="form-input"
                      placeholder="Repeat new password"
                      value={pwForm.confirm}
                      onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <motion.button
                  className="btn-primary"
                  onClick={handlePasswordSave}
                  disabled={pwSaving}
                  style={{ width: 'auto', padding: '0 22px', height: 42 }}
                  whileHover={!pwSaving ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!pwSaving ? { scale: 0.97 } : {}}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {pwSaving ? (
                      <motion.span key="sav"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />
                        Updating…
                      </motion.span>
                    ) : (
                      <motion.span key="idl"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <KeyRound size={14} /> Update Password
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>

            {/* ══════════════════════════════════════════
                SECTION 4 — Account Preferences
            ══════════════════════════════════════════ */}
            <motion.div variants={itemVariants} style={{ ...CARD, padding: '24px 24px 20px' }}>
              <p style={SECTION_TITLE}><UserCog size={13} /> Account Preferences</p>

              {/* Language */}
              <SettingRow icon={Globe} iconColor="#06b6d4" label="Language" desc="Interface language for your account.">
                <select
                  value={lang}
                  onChange={e => { setLang(e.target.value); push('Language updated.', 'success'); }}
                  style={{
                    background: 'var(--bg-input)', border: '1px solid var(--border-input)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                    fontSize: 13, padding: '6px 10px', cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                </select>
              </SettingRow>

              <SettingRow icon={Eye} iconColor="#5b6ef5" label="Public Profile" desc="Allow other team members to view your profile.">
                <Toggle checked={account.publicProfile} onChange={setAcc('publicProfile')} />
              </SettingRow>
              <SettingRow icon={ToggleLeft} iconColor="#f59e0b" label="Usage Analytics" desc="Help improve WorkFlow by sharing anonymous usage data.">
                <Toggle checked={account.analyticsOpt} onChange={setAcc('analyticsOpt')} accent="#f59e0b" />
              </SettingRow>
              <SettingRow icon={Globe} iconColor="#22c55e" label="Beta Features" desc="Get early access to experimental features." border={false}>
                <Toggle checked={account.betaFeatures} onChange={(v) => { setAcc('betaFeatures')(v); push(v ? 'Beta features enabled — expect the unexpected! 🚀' : 'Beta features disabled.', v ? 'success' : 'info'); }} accent="#22c55e" />
              </SettingRow>
            </motion.div>

            {/* ══════════════════════════════════════════
                SECTION 5 — Danger zone
            ══════════════════════════════════════════ */}
            <motion.div
              variants={itemVariants}
              style={{ ...CARD, padding: '24px', borderColor: 'rgba(239,68,68,0.18)' }}
            >
              {/* Subtle red glow */}
              <div style={{
                position: 'absolute', top: -30, right: -30, width: 120, height: 120,
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <p style={{ ...SECTION_TITLE, color: 'rgba(239,68,68,0.7)' }}>
                <Trash2 size={13} /> Danger Zone
              </p>

              {[
                {
                  icon: LogOut,
                  label: 'Sign out all devices',
                  desc: 'Revoke all active sessions except this one.',
                  btnLabel: 'Sign out all',
                  color: '#f59e0b',
                },
                {
                  icon: AlertTriangle,
                  label: 'Deactivate account',
                  desc: 'Temporarily suspend access. You can reactivate anytime.',
                  btnLabel: 'Deactivate',
                  color: '#ef4444',
                },
                {
                  icon: Trash2,
                  label: 'Delete account',
                  desc: 'Permanently delete your account and all associated data. This cannot be undone.',
                  btnLabel: 'Delete',
                  color: '#ef4444',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 0',
                    borderBottom: i < 2 ? '1px solid var(--border-card)' : 'none',
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: `${item.color}15`, border: `1px solid ${item.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: item.color, flexShrink: 0,
                  }}>
                    <item.icon size={15} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.desc}</p>
                  </div>
                  <motion.button
                    onClick={() => push(`${item.label} — confirmation required.`, 'info')}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      padding: '7px 14px', borderRadius: 'var(--radius-sm)',
                      background: `${item.color}12`,
                      border: `1px solid ${item.color}28`,
                      color: item.color, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                  >
                    {item.btnLabel}
                  </motion.button>
                </div>
              ))}
            </motion.div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
