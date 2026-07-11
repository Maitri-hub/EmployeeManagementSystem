import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  User,
  Settings,
  Bell,
  LayoutDashboard,
  LogOut,
  Shield,
  Layers,
  Users,
  Building2,
  Zap,
  CalendarDays,
  CalendarPlus,
  WalletCards,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link, NavLink } from "react-router-dom";
import LogoutModal from "../Auth/LogoutModal";
import ThemeToggle from "../UI/ThemeToggle";

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.94, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 26 },
  },
  exit: { opacity: 0, scale: 0.94, y: -8, transition: { duration: 0.18 } },
};

export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const dropRef = useRef(null);

  const role = user?.role?.toLowerCase();
  const isAdmin = role === "admin";
  const isApprover = ["admin", "manager", "hr"].includes(role);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  return (
    <>
      <nav className="navbar">
        <Link to="/dashboard" className="navbar-logo" style={{ textDecoration: "none" }}>
          <div className="navbar-logo-icon">
            <Layers size={16} color="white" />
          </div>
          WorkFlow
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 28, flex: 1 }}>
          <TopLink to="/dashboard" icon={<LayoutDashboard size={14} />} label="Dashboard" />

          {isAdmin && (
            <>
              <TopLink to="/employees" icon={<Users size={14} />} label="Employees" />
              <TopLink to="/departments" icon={<Building2 size={14} />} label="Departments" />
              <TopLink to="/skills" icon={<Zap size={14} />} label="Skills" />
            </>
          )}

          {isApprover ? (
            <>
              <TopLink to="/leaves" icon={<CalendarDays size={14} />} label="Leave Requests" />
              <TopLink to="/leaves/balances" icon={<WalletCards size={14} />} label="Balances" />
            </>
          ) : (
            <>
              <TopLink to="/leaves/apply" icon={<CalendarPlus size={14} />} label="Apply Leave" />
              <TopLink to="/my-leaves" icon={<CalendarDays size={14} />} label="My Leaves" />
            </>
          )}
        </div>

        <div className="navbar-right">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--bg-input)",
              border: "1px solid var(--border-input)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-secondary)",
              position: "relative",
            }}
            aria-label="Notifications"
          >
            <Bell size={15} />
            <span
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#ef4444",
                border: "1.5px solid var(--bg-page)",
              }}
            />
          </motion.button>

          <ThemeToggle />

          <div style={{ position: "relative" }} ref={dropRef}>
            <motion.button
              className="avatar-btn"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="avatar">{user.initials || user.name?.slice(0, 2).toUpperCase()}</div>
              <span className="avatar-name">{user.name?.split(" ")[0]}</span>
              <motion.span className="avatar-chevron" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}>
                <ChevronDown size={14} />
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {open && (
                <motion.div
                  className="dropdown"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{ position: "absolute", top: "calc(100% + 10px)", right: 0 }}
                >
                  <div className="dropdown-header">
                    <p className="dropdown-username">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                    <span className="dropdown-role">
                      <Shield size={10} /> {user.role}
                    </span>
                  </div>

                  <div style={{ padding: "4px 0" }}>
                    <Link to="/dashboard" style={{ textDecoration: "none" }} onClick={() => setOpen(false)}>
                      <DropItem icon={<LayoutDashboard size={15} />} label="Dashboard" />
                    </Link>

                    {isAdmin && (
                      <>
                        <Link to="/employees" style={{ textDecoration: "none" }} onClick={() => setOpen(false)}>
                          <DropItem icon={<Users size={15} />} label="Employees" />
                        </Link>
                        <Link to="/departments" style={{ textDecoration: "none" }} onClick={() => setOpen(false)}>
                          <DropItem icon={<Building2 size={15} />} label="Departments" />
                        </Link>
                        <Link to="/skills" style={{ textDecoration: "none" }} onClick={() => setOpen(false)}>
                          <DropItem icon={<Zap size={15} />} label="Skills" />
                        </Link>
                      </>
                    )}

                    {isApprover ? (
                      <>
                        <Link to="/leaves" style={{ textDecoration: "none" }} onClick={() => setOpen(false)}>
                          <DropItem icon={<CalendarDays size={15} />} label="Leave Requests" />
                        </Link>
                        <Link to="/leaves/balances" style={{ textDecoration: "none" }} onClick={() => setOpen(false)}>
                          <DropItem icon={<WalletCards size={15} />} label="Leave Balances" />
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/leaves/apply" style={{ textDecoration: "none" }} onClick={() => setOpen(false)}>
                          <DropItem icon={<CalendarPlus size={15} />} label="Apply Leave" />
                        </Link>
                        <Link to="/my-leaves" style={{ textDecoration: "none" }} onClick={() => setOpen(false)}>
                          <DropItem icon={<CalendarDays size={15} />} label="My Leaves" />
                        </Link>
                      </>
                    )}

                    <Link to="/profile" style={{ textDecoration: "none" }} onClick={() => setOpen(false)}>
                      <DropItem icon={<User size={15} />} label="My Profile" />
                    </Link>
                    <Link to="/settings" style={{ textDecoration: "none" }} onClick={() => setOpen(false)}>
                      <DropItem icon={<Settings size={15} />} label="Settings" />
                    </Link>
                  </div>

                  <div className="dropdown-divider" />

                  <div style={{ padding: "4px 0 6px" }}>
                    <button
                      className="dropdown-item danger"
                      style={{ width: "100%" }}
                      onClick={() => {
                        setOpen(false);
                        setLogoutOpen(true);
                      }}
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

      <LogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </>
  );
}

function TopLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 12px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
        color: isActive ? "var(--text-link)" : "var(--text-secondary)",
        background: isActive ? "rgba(91,110,245,0.12)" : "transparent",
        border: isActive ? "1px solid rgba(91,110,245,0.2)" : "1px solid transparent",
      })}
    >
      {icon}
      {label}
    </NavLink>
  );
}

function DropItem({ icon, label, danger }) {
  return (
    <motion.div className={`dropdown-item${danger ? " danger" : ""}`} whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
      {icon}
      {label}
    </motion.div>
  );
}