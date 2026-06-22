import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  DollarSign,
  X,
} from "lucide-react";

import { getEmployees, deleteEmployee } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Navbar from "../Layout/Navbar";
import AuthBackground from "../UI/AuthBackground";

const GLASS = {
  background: "var(--bg-card)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "var(--glass-border)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--glass-shadow)",
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 340, damping: 26 },
  },
  exit: { opacity: 0, scale: 0.9, y: 14, transition: { duration: 0.18 } },
};

function SkeletonRow() {
  return (
    <motion.div
      style={{
        ...GLASS,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.6, repeat: Infinity }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "var(--border-input)",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ height: 12, width: "35%", borderRadius: 6, background: "var(--border-input)" }} />
        <div style={{ height: 10, width: "55%", borderRadius: 6, background: "var(--border-input)" }} />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ height: 10, width: 70, borderRadius: 6, background: "var(--border-input)" }} />
      ))}
    </motion.div>
  );
}

function InitialsAvatar({ name, color = "#5b6ef5" }) {
  const initials = (name || "??")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}, ${color}bb)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function SkillChip({ label }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 500,
        background: "rgba(91,110,245,0.12)",
        border: "1px solid rgba(91,110,245,0.2)",
        color: "var(--text-link)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function DeleteModal({ employee, onConfirm, onCancel, busy }) {
  const employeeName = employee?.user?.name || "Employee";

  return (
    <AnimatePresence>
      {employee && (
        <motion.div
          className="modal-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onCancel}
        >
          <motion.div
            className="modal-card"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon">
              <Trash2 size={24} />
            </div>

            <h2 className="modal-title">Delete Employee?</h2>

            <p className="modal-body">
              Are you sure you want to delete <strong>{employeeName}</strong>?
              This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={onCancel} disabled={busy}>
                Cancel
              </button>

              <motion.button
                className="btn-danger"
                onClick={onConfirm}
                disabled={busy}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {busy ? <span className="spinner" /> : <Trash2 size={15} />}
                {busy ? "Deleting…" : "Delete"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function EmployeeList() {
  const { push } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    setLoading(true);
    setError("");

    try {
      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : data.employees ?? []);
    } catch (err) {
      setError(err.message);
      push(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return employees.filter((emp) => {
      const matchSearch =
        !q ||
        emp.user?.name?.toLowerCase().includes(q) ||
        emp.user?.email?.toLowerCase().includes(q) ||
        emp.designation?.toLowerCase().includes(q);

      const matchDept = !deptFilter || emp.department?.departmentName === deptFilter;

      return matchSearch && matchDept;
    });
  }, [employees, search, deptFilter]);

  const departments = useMemo(() => {
    const seen = new Set();

    return employees
      .map((emp) => emp.department?.departmentName)
      .filter((department) => department && !seen.has(department) && seen.add(department));
  }, [employees]);

  const avatarColor = (name = "") => {
    const colors = ["#5b6ef5", "#8b5cf6", "#06b6d4", "#f59e0b", "#22c55e", "#ef4444"];
    return colors[(name.charCodeAt(0) || 0) % colors.length];
  };

  async function handleDelete() {
    if (!toDelete) return;

    setDeleting(true);

    try {
      await deleteEmployee(toDelete.id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== toDelete.id));
      push(`${toDelete.user?.name || "Employee"} has been removed.`, "success");
      setToDelete(null);
    } catch (err) {
      push(err.message, "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", position: "relative" }}>
      <AuthBackground />
      <Navbar />

      <div style={{ paddingTop: 64, position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div>
              <span className="dashboard-badge" style={{ marginBottom: 10 }}>
                <Users size={11} /> Employees
              </span>

              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 4 }}>
                Employee Directory
              </h1>

              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                {loading ? "Loading…" : `${filtered.length} of ${employees.length} employees`}
              </p>
            </div>

            {isAdmin && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link to="/employees/create" style={{ textDecoration: "none" }}>
                  <button className="btn-primary" style={{ width: "auto", padding: "0 20px", height: 44 }}>
                    <Plus size={16} /> Add Employee
                  </button>
                </Link>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            style={{ ...GLASS, padding: "14px 16px", display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}
          >
            <div className="input-wrapper" style={{ flex: "1 1 240px", minWidth: 0 }}>
              <span className="input-icon">
                <Search size={15} />
              </span>

              <input
                type="text"
                className="form-input"
                placeholder="Search by name, email or designation…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ height: 40, paddingLeft: 40 }}
              />

              {search && (
                <button className="input-icon-right" onClick={() => setSearch("")} style={{ right: 10 }}>
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{
                height: 40,
                padding: "0 12px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-input)",
                borderRadius: "var(--radius-md)",
                color: deptFilter ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: 13,
                cursor: "pointer",
                minWidth: 160,
              }}
            >
              <option value="">All Departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            {(search || deptFilter) && (
              <motion.button
                className="btn-ghost"
                onClick={() => {
                  setSearch("");
                  setDeptFilter("");
                }}
                style={{ width: "auto", padding: "0 14px", height: 40, fontSize: 12 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <X size={13} /> Clear
              </motion.button>
            )}
          </motion.div>

          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                ...GLASS,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderColor: "rgba(239,68,68,0.25)",
                marginBottom: 20,
              }}
            >
              <AlertCircle size={18} color="var(--text-error)" />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-error)" }}>
                  Failed to load employees
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{error}</p>
              </div>

              <button
                onClick={fetchEmployees}
                style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-link)", fontWeight: 500, cursor: "pointer" }}
              >
                Retry
              </button>
            </motion.div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ ...GLASS, padding: "56px 24px", textAlign: "center" }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(91,110,245,0.1)",
                  border: "1px solid rgba(91,110,245,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "var(--text-link)",
                }}
              >
                <Users size={24} />
              </div>

              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                {search || deptFilter ? "No employees match your filters" : "No employees yet"}
              </p>

              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24 }}>
                {search || deptFilter ? "Try adjusting your search or filter." : "No employee records available yet."}
              </p>

              {isAdmin && !(search || deptFilter) && (
                <Link to="/employees/create" style={{ textDecoration: "none" }}>
                  <button className="btn-primary" style={{ width: "auto", padding: "0 24px", height: 44, margin: "0 auto" }}>
                    <Plus size={15} /> Add First Employee
                  </button>
                </Link>
              )}
            </motion.div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              {filtered.map((emp) => {
                const id = emp.id;
                const employeeName = emp.user?.name || "Unnamed Employee";
                const employeeEmail = emp.user?.email || "—";
                const deptName = emp.department?.departmentName || "—";
                const skills = emp.employeeSkills?.map((item) => item.skill?.skillName).filter(Boolean) || [];

                return (
                  <motion.div
                    key={id}
                    variants={rowVariants}
                    whileHover={{ y: -2, boxShadow: "var(--glass-shadow-lg)" }}
                    transition={{ duration: 0.2 }}
                    style={{
                      ...GLASS,
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <InitialsAvatar name={employeeName} color={avatarColor(employeeName)} />

                    <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {employeeName}
                      </p>

                      <p style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Mail size={11} /> {employeeEmail}
                      </p>
                    </div>

                    <div style={{ flex: "0 1 140px", minWidth: 0 }}>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Designation</p>
                      <p style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {emp.designation || "—"}
                      </p>
                    </div>

                    <div style={{ flex: "0 1 130px", minWidth: 0 }}>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Department</p>
                      <p style={{ fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                        <Building2 size={11} color="var(--text-muted)" />
                        {deptName}
                      </p>
                    </div>

                    <div style={{ flex: "0 1 120px", minWidth: 0 }}>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Phone</p>
                      <p style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                        <Phone size={11} color="var(--text-muted)" /> {emp.phone || "—"}
                      </p>
                    </div>

                    <div style={{ flex: "0 1 100px", minWidth: 0 }}>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Salary</p>
                      <p style={{ fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, color: "var(--text-success)" }}>
                        <DollarSign size={11} />
                        {emp.salary != null ? Number(emp.salary).toLocaleString() : "—"}
                      </p>
                    </div>

                    <div style={{ flex: "0 1 180px", display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {skills.slice(0, 3).map((skill, i) => (
                        <SkillChip key={i} label={skill} />
                      ))}
                      {skills.length > 3 && <SkillChip label={`+${skills.length - 3}`} />}
                    </div>

                    <div style={{ display: "flex", gap: 6, marginLeft: "auto", flexShrink: 0 }}>
                      <ActionBtn
                        icon={<Eye size={14} />}
                        title="View"
                        onClick={() => navigate(`/employees/${id}`)}
                        color="#5b6ef5"
                      />

                      {isAdmin && (
                        <>
                          <ActionBtn
                            icon={<Pencil size={14} />}
                            title="Edit"
                            onClick={() => navigate(`/employees/edit/${id}`)}
                            color="#8b5cf6"
                          />
                          <ActionBtn
                            icon={<Trash2 size={14} />}
                            title="Delete"
                            onClick={() => setToDelete(emp)}
                            color="#ef4444"
                          />
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {isAdmin && (
        <DeleteModal
          employee={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          busy={deleting}
        />
      )}
    </div>
  );
}

function ActionBtn({ icon, title, onClick, color }) {
  return (
    <motion.button
      onClick={onClick}
      title={title}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.92 }}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: `${color}15`,
        border: `1px solid ${color}25`,
        color,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.18s",
      }}
    >
      {icon}
    </motion.button>
  );
}