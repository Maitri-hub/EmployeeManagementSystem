import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  Zap,
  ImageIcon,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import Navbar from "../Layout/Navbar";
import AuthBackground from "../UI/AuthBackground";
import API_BASE_URL from "../../services/api";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalSkills: 0,
    totalImages: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Employees",
      value: stats.totalEmployees,
      growth: "Open",
      icon: Users,
      color: "#5b6ef5",
      path: "/employees",
    },
    {
      label: "Departments",
      value: stats.totalDepartments,
      growth: "Open",
      icon: Building2,
      color: "#8b5cf6",
      path: "/departments",
    },
    {
      label: "Active Skills",
      value: stats.totalSkills,
      growth: "Open",
      icon: Zap,
      color: "#06b6d4",
      path: "/skills",
    },
    {
      label: "Uploaded Files",
      value: stats.totalImages,
      growth: "Open",
      icon: ImageIcon,
      color: "#f59e0b",
      path: "/employees",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", position: "relative" }}>
      <AuthBackground />
      <Navbar />

      <div style={{ paddingTop: 64, position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 36 }}
          >
            <span className="dashboard-badge">
              <TrendingUp size={11} /> Live Dashboard
            </span>

            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 6 }}>
              Good morning, {user?.name?.split(" ")[0] || "User"} 👋
            </h1>

            <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
              Here's what&apos;s happening across your organization today.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <PlaceholderWidget title="Department Distribution" height={220} path="/departments" />
            <PlaceholderWidget title="Skills Overview" height={220} path="/skills" />
            <PlaceholderWidget title="Recent Employees" height={180} span={2} path="/employees" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, growth, icon: Icon, color, path }) {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(path)}
      style={{
        background: "var(--bg-card)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "var(--glass-border)",
        borderRadius: "var(--radius-lg)",
        padding: "22px 20px",
        boxShadow: "var(--glass-shadow)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `${color}22`,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${color}20`,
            border: `1px solid ${color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
          }}
        >
          <Icon size={18} />
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-link)",
            background: "rgba(91,110,245,0.12)",
            border: "1px solid rgba(91,110,245,0.2)",
            borderRadius: 99,
            padding: "2px 8px",
          }}
        >
          {growth}
        </span>
      </div>

      <p style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 4 }}>
        {value}
      </p>
      <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</p>
    </motion.div>
  );
}

function PlaceholderWidget({ title, height, span, path }) {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      style={{
        background: "var(--bg-card)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "var(--glass-border)",
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        boxShadow: "var(--glass-shadow)",
        gridColumn: span === 2 ? "1 / -1" : undefined,
        minHeight: height,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{title}</p>

        <motion.button
          onClick={() => navigate(path)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            color: "var(--text-link)",
            fontWeight: 500,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          whileHover={{ x: 2 }}
        >
          View all <ArrowRight size={12} />
        </motion.button>
      </div>

      {[75, 88, 66].map((width, i) => (
        <motion.div
          key={i}
          style={{
            height: 12,
            borderRadius: 6,
            background: "var(--border-input)",
            marginBottom: 10,
            width: `${width}%`,
          }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </motion.div>
  );
}