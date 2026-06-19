import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';
import AuthBackground from '../UI/AuthBackground';
import ThemeToggle from '../UI/ThemeToggle';
import Logo from '../UI/Logo';

const cardVariants = {
  hidden:  { opacity: 0, y: 36, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function ForgotPassword() {
  const [email, setEmail]   = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return; }
   setLoading(true);

try {
  const response = await fetch(
    "http://localhost:5000/api/auth/forgot-password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  const data = await response.json();

  setLoading(false);

  if (!response.ok) {
    setError(data.message);
    return;
  }

  console.log("Reset Token:", data.resetToken);
  console.log("Reset Link:", data.resetLink);

  setSent(true);
} catch (error) {
  setLoading(false);
  setError("Something went wrong");
}
  };

  return (
    <div className="auth-page">
      <AuthBackground />
      <ThemeToggle />

      <motion.div
        className="glass-card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Logo />

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '8px 0 16px' }}
            >
              <motion.div
                className="success-ring"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}
              >
                <CheckCircle size={26} />
              </motion.div>
              <h2 className="auth-heading" style={{ textAlign: 'center', marginBottom: 10 }}>Check your inbox</h2>
              <p className="auth-subheading" style={{ textAlign: 'center', marginBottom: 28 }}>
                We sent a reset link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
                It expires in 15 minutes.
              </p>
              <Link to="/login">
                <motion.button
                  className="btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft size={16} /> Back to login
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="auth-heading">Forgot password?</h1>
              <p className="auth-subheading">
                Enter your email and we&apos;ll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label" htmlFor="fp-email">Email address</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Mail size={16} /></span>
                    <input
                      id="fp-email"
                      type="email"
                      className={`form-input${error ? ' error' : ''}`}
                      placeholder="alex@company.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                    />
                  </div>
                  <AnimatePresence>
                    {error && (
                      <motion.p className="error-msg"
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <AlertCircle size={12} /> {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.012 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  style={{ marginBottom: 20 }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {loading ? (
                      <motion.span key="ld" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="spinner" /> Sending…
                      </motion.span>
                    ) : (
                      <motion.span key="id" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        Send reset link <Send size={15} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>
              <p className="auth-footer">
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <ArrowLeft size={13} /> Back to login
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
