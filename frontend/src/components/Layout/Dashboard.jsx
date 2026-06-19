import { motion } from 'framer-motion';
import { Users, Building2, Zap, ImageIcon, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Layout/Navbar';
import AuthBackground from '../UI/AuthBackground';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

const STAT_CARDS = [
  { label: 'Total Employees',   value: '248',  growth: '+12%', icon: Users,       color: '#5b6ef5' },
  { label: 'Departments',       value: '14',   growth: '+2%',  icon: Building2,   color: '#8b5cf6' },
  { label: 'Active Skills',     value: '63',   growth: '+8%',  icon: Zap,         color: '#06b6d4' },
  { label: 'Uploaded Files',    value: '1,024',growth: '+31%', icon: ImageIcon,   color: '#f59e0b' },
];

export default function Dashboard() {
  const { user } = useAuth();
  console.log("Dashboard User:", user);
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', position: 'relative' }}>
      <AuthBackground />
      <Navbar />

      <div style={{ paddingTop: 64, position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

          {/* Welcome banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 36 }}
          >
            <span className="dashboard-badge">
              <TrendingUp size={11} /> Live Dashboard
            </span>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6 }}>
              Good morning, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              Here&apos;s what&apos;s happening across your organization today.
            </p>
          </motion.div>

          {/* Stat cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}
          >
            {STAT_CARDS.map(card => (
              <StatCard key={card.label} {...card} />
            ))}
          </motion.div>

          {/* Placeholder widgets */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
          >
            <PlaceholderWidget title="Department Distribution" height={220} />
            <PlaceholderWidget title="Skills Overview" height={220} />
            <PlaceholderWidget title="Recent Employees" height={180} span={2} />
          </motion.div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, growth, icon: Icon, color }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: 'var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '22px 20px',
        boxShadow: 'var(--glass-shadow)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: `${color}22`, filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}20`,
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          <Icon size={18} />
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, color: '#22c55e',
          background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 99, padding: '2px 8px',
        }}>
          {growth}
        </span>
      </div>

      <p style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</p>
    </motion.div>
  );
}

function PlaceholderWidget({ title, height, span }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: 'var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--glass-shadow)',
        gridColumn: span === 2 ? '1 / -1' : undefined,
        minHeight: height,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</p>
        <motion.button
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 12, color: 'var(--text-link)', fontWeight: 500,
            background: 'none', border: 'none', cursor: 'pointer',
          }}
          whileHover={{ x: 2 }}
        >
          View all <ArrowRight size={12} />
        </motion.button>
      </div>
      {/* Skeleton rows */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            height: 12, borderRadius: 6,
            background: 'var(--border-input)',
            marginBottom: 10,
            width: `${75 + Math.random() * 20}%`,
          }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </motion.div>
  );
}
