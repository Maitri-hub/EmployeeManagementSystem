import { motion } from 'framer-motion';

function getStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Too weak', color: 'weak' };
  if (score === 2) return { score: 2, label: 'Fair', color: 'fair' };
  if (score === 3) return { score: 3, label: 'Good', color: 'good' };
  return { score: 4, label: 'Strong', color: 'strong' };
}

export default function PasswordStrength({ password }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div>
      <div className="strength-bar-row">
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            className={`strength-segment ${seg <= score ? color : ''}`}
          >
            {seg <= score && (
              <motion.div
                style={{ height: '100%', background: 'currentColor', borderRadius: 'inherit' }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, delay: (seg - 1) * 0.06 }}
              />
            )}
          </div>
        ))}
      </div>
      <motion.p
        className="strength-label"
        key={label}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        Password strength: <strong>{label}</strong>
      </motion.p>
    </div>
  );
}
