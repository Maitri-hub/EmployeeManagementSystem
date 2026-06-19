import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Eye, EyeOff,
  ArrowRight, AlertCircle, CheckCircle, Copy, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AuthBackground from '../UI/AuthBackground';
import ThemeToggle from '../UI/ThemeToggle';
import Logo from '../UI/Logo';
import PasswordStrength from '../UI/PasswordStrength';

const cardVariants = {
  hidden: { opacity: 0, y: 44, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0, y: -30, scale: 0.95,
    transition: { duration: 0.35, ease: [0.65, 0, 0.35, 1] },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.065, ease: [0.16, 1, 0.3, 1] },
  }),
};

const successVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 30 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
  },
};

function validate(form) {
  const e = {};
  if (!form.name.trim()) e.name = 'Full name is required';
  else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';

  if (!form.email) e.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';

  if (!form.password) e.password = 'Password is required';
  else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';

  if (!form.confirm) e.confirm = 'Please confirm your password';
  else if (form.confirm !== form.password) e.confirm = 'Passwords do not match';

  if (!form.terms) e.terms = 'You must accept the terms to continue';
  return e;
}

function SuccessScreen({ name, verificationLink }) {
  const navigate = useNavigate();
  const { push } = useToast();

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationLink);
      push('Verification link copied!', 'success');
    } catch {
      push('Could not copy link. Please copy it manually.', 'error');
    }
  };

  const openLink = () => {
    window.open(verificationLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      className="glass-card"
      variants={successVariants}
      initial="hidden"
      animate="visible"
      style={{ textAlign: 'center', padding: '48px 36px 38px', maxWidth: 560 }}
    >
      <motion.div
        className="success-ring"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
      >
        <CheckCircle size={28} />
      </motion.div>

      <motion.h2
        className="auth-heading"
        style={{ textAlign: 'center', marginBottom: 10 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        Account created!
      </motion.h2>

      <motion.p
        className="auth-subheading"
        style={{ textAlign: 'center', marginBottom: 22 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        Welcome, <strong style={{ color: 'var(--text-primary)' }}>{name}</strong>!
        Please verify your email before logging in.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-input)',
          borderRadius: 'var(--radius-lg)',
          padding: 16,
          marginBottom: 20,
          textAlign: 'left',
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            marginBottom: 8,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Verification Link
        </p>

        <div
          style={{
            fontSize: 12,
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            wordBreak: 'break-all',
            background: 'rgba(0,0,0,0.14)',
            border: '1px solid var(--border-input)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
          }}
        >
          {verificationLink}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}
      >
        <button className="btn-ghost" onClick={copyLink} type="button">
          <Copy size={15} /> Copy Link
        </button>

        <button className="btn-primary" onClick={openLink} type="button">
          <ExternalLink size={15} /> Open Link
        </button>
      </motion.div>

      <motion.button
        className="btn-ghost"
        onClick={() => navigate('/login')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
      >
        Back to Login <ArrowRight size={16} />
      </motion.button>
    </motion.div>
  );
}

export default function Signup() {
  const { signup } = useAuth();
  const { push } = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', terms: false });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationLink, setVerificationLink] = useState('');

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);

    try {
      const data = await signup(form.name, form.email, form.password);

      console.log('Verification Token:', data.verificationToken);
      console.log('Verification Link:', data.verificationLink);

      setVerificationLink(data.verificationLink);
      push('Account created successfully!', 'success');
      setSuccess(true);
    } catch (error) {
      push(error.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <AuthBackground />
        <ThemeToggle />
        <SuccessScreen
          name={form.name.split(' ')[0]}
          verificationLink={verificationLink}
        />
      </div>
    );
  }

  return (
    <div className="auth-page">
      <AuthBackground />
      <ThemeToggle />

      <motion.div
        className="glass-card"
        style={{ maxWidth: 480 }}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
          <Logo />
        </motion.div>

        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
          <h1 className="auth-heading">Create your account</h1>
          <p className="auth-subheading">
            Join WorkFlow, manage your team smarter
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} noValidate>
          <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
            <div className="form-group">
              <label className="form-label" htmlFor="su-name">Full name</label>
              <div className="input-wrapper">
                <span className="input-icon"><User size={16} /></span>
                <input
                  id="su-name"
                  type="text"
                  className={`form-input${errors.name ? ' error' : ''}`}
                  placeholder="Alex Johnson"
                  value={form.name}
                  onChange={set('name')}
                  autoComplete="name"
                />
              </div>
              <ErrorMsg msg={errors.name} />
            </div>
          </motion.div>

          <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
            <div className="form-group">
              <label className="form-label" htmlFor="su-email">Work email</label>
              <div className="input-wrapper">
                <span className="input-icon"><Mail size={16} /></span>
                <input
                  id="su-email"
                  type="email"
                  className={`form-input${errors.email ? ' error' : ''}`}
                  placeholder="alex@company.com"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                />
              </div>
              <ErrorMsg msg={errors.email} />
            </div>
          </motion.div>

          <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
            <div className="form-group">
              <label className="form-label" htmlFor="su-pw">Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={16} /></span>
                <input
                  id="su-pw"
                  type={showPw ? 'text' : 'password'}
                  className={`form-input${errors.password ? ' error' : ''}`}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                />
                <PwToggle show={showPw} onToggle={() => setShowPw(v => !v)} />
              </div>
              <ErrorMsg msg={errors.password} />
              <PasswordStrength password={form.password} />
            </div>
          </motion.div>

          <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
            <div className="form-group">
              <label className="form-label" htmlFor="su-cf">Confirm password</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={16} /></span>
                <input
                  id="su-cf"
                  type={showCf ? 'text' : 'password'}
                  className={`form-input${errors.confirm ? ' error' : ''}`}
                  placeholder="Re-enter password"
                  value={form.confirm}
                  onChange={set('confirm')}
                  autoComplete="new-password"
                />
                <PwToggle show={showCf} onToggle={() => setShowCf(v => !v)} />
              </div>
              <ErrorMsg msg={errors.confirm} />

              <AnimatePresence>
                {form.confirm && form.confirm === form.password && (
                  <motion.p
                    className="error-msg"
                    style={{ color: 'var(--text-success)' }}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <CheckCircle size={12} /> Passwords match
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div custom={6} variants={fieldVariants} initial="hidden" animate="visible">
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="checkbox-row">
                <input type="checkbox" checked={form.terms} onChange={set('terms')} />
                I agree to the{' '}
                <a href="#terms" onClick={e => e.preventDefault()}>Terms of Service</a>
                {' '}and{' '}
                <a href="#privacy" onClick={e => e.preventDefault()}>Privacy Policy</a>
              </label>
              <ErrorMsg msg={errors.terms} />
            </div>
          </motion.div>

          <motion.div custom={7} variants={fieldVariants} initial="hidden" animate="visible">
            <motion.button
              type="submit"
              className="btn-primary"
              disabled={loading}
              whileHover={!loading ? { scale: 1.012 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              <AnimatePresence mode="wait" initial={false}>
                {loading ? (
                  <motion.span
                    key="ld"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span className="spinner" /> Creating account…
                  </motion.span>
                ) : (
                  <motion.span
                    key="id"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    Create account <ArrowRight size={16} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </form>

        <motion.div custom={8} variants={fieldVariants} initial="hidden" animate="visible">
          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

function ErrorMsg({ msg }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p
          className="error-msg"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          <AlertCircle size={12} /> {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function PwToggle({ show, onToggle }) {
  return (
    <button type="button" className="input-icon-right" onClick={onToggle} aria-label="Toggle visibility">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={show ? 'hide' : 'show'}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.15 }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}