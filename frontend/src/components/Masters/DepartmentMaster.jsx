import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
  Search,
  Lock,
} from "lucide-react";

import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../services/api";

import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
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
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, x: 14, transition: { duration: 0.22 } },
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

function IconBtn({ icon, title, onClick, color, disabled }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={!disabled ? { scale: 1.13 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        background: `${color}15`,
        border: `1px solid ${color}25`,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {icon}
    </motion.button>
  );
}

function DeleteModal({ dept, onConfirm, onCancel, busy }) {
  const deptName = dept?.departmentName || "Department";

  return (
    <AnimatePresence>
      {dept && (
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

            <h2 className="modal-title">Delete Department?</h2>

            <p className="modal-body">
              Are you sure you want to delete{" "}
              <strong style={{ color: "var(--text-primary)" }}>{deptName}</strong>?
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

function SkeletonRow() {
  return (
    <motion.div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 20px",
        borderBottom: "1px solid var(--border-card)",
      }}
      animate={{ opacity: [0.45, 0.75, 0.45] }}
      transition={{ duration: 1.6, repeat: Infinity }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--border-input)" }} />
      <div style={{ flex: 1, height: 13, borderRadius: 6, background: "var(--border-input)", maxWidth: 200 }} />
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--border-input)" }} />
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--border-input)" }} />
    </motion.div>
  );
}

export default function DepartmentMaster() {
  const { push } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [addName, setAddName] = useState("");
  const [addErr, setAddErr] = useState("");
  const [addBusy, setAddBusy] = useState(false);

  const [editRow, setEditRow] = useState(null);
  const [editName, setEditName] = useState("");
  const [editBusy, setEditBusy] = useState(false);

  const [toDelete, setToDelete] = useState(null);
  const [delBusy, setDelBusy] = useState(false);

  useEffect(() => {
    fetchDepts();
  }, []);

  async function fetchDepts() {
    setLoading(true);
    setError("");

    try {
      const data = await getDepartments();
      setDepartments(Array.isArray(data) ? data : data.departments ?? []);
    } catch (err) {
      setError(err.message);
      push(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const filtered = departments.filter((dept) =>
    !search || dept.departmentName?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd(e) {
    e.preventDefault();
    if (!isAdmin) return;

    const departmentName = addName.trim();

    if (!departmentName) {
      setAddErr("Department name is required.");
      return;
    }

    if (
      departments.some(
        (dept) => dept.departmentName?.toLowerCase() === departmentName.toLowerCase()
      )
    ) {
      setAddErr("A department with this name already exists.");
      return;
    }

    setAddBusy(true);

    try {
      const newDept = await createDepartment({ departmentName });
      setDepartments((prev) => [...prev, newDept]);
      setAddName("");
      setAddErr("");
      push(`Department "${departmentName}" created.`, "success");
    } catch (err) {
      push(err.message, "error");
    } finally {
      setAddBusy(false);
    }
  }

  function startEdit(dept) {
    if (!isAdmin) return;
    setEditRow(dept);
    setEditName(dept.departmentName || "");
  }

  function cancelEdit() {
    setEditRow(null);
    setEditName("");
  }

  async function handleEdit(e) {
    e.preventDefault();
    if (!isAdmin) return;

    const departmentName = editName.trim();
    const id = editRow.id;

    if (!departmentName) {
      push("Name cannot be empty.", "error");
      return;
    }

    setEditBusy(true);

    try {
      const updated = await updateDepartment(id, { departmentName });
      setDepartments((prev) =>
        prev.map((dept) => (dept.id === id ? updated : dept))
      );
      push(`Renamed to "${departmentName}".`, "success");
      cancelEdit();
    } catch (err) {
      push(err.message, "error");
    } finally {
      setEditBusy(false);
    }
  }

  async function handleDelete() {
    if (!isAdmin || !toDelete) return;

    const id = toDelete.id;
    const name = toDelete.departmentName;

    setDelBusy(true);

    try {
      await deleteDepartment(id);
      setDepartments((prev) => prev.filter((dept) => dept.id !== id));
      push(`"${name}" deleted.`, "success");
      setToDelete(null);
    } catch (err) {
      push(err.message, "error");
    } finally {
      setDelBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", position: "relative" }}>
      <AuthBackground />
      <Navbar />

      <div style={{ paddingTop: 64, position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "40px 24px" }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: 32 }}
          >
            <span className="dashboard-badge" style={{ marginBottom: 10 }}>
              <Building2 size={11} /> Master Data
            </span>

            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 4 }}>
              Departments
            </h1>

            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              {loading ? "Loading…" : `${departments.length} departments total`}
            </p>
          </motion.div>

          {!isAdmin && (
            <div style={{ ...GLASS, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <Lock size={15} style={{ color: "var(--text-muted)" }} />
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                View-only access. Only admin can add, edit, or delete departments.
              </p>
            </div>
          )}

          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.06 }}
              style={{ ...GLASS, padding: "22px 24px", marginBottom: 20 }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>
                Add New Department
              </p>

              <form onSubmit={handleAdd} noValidate>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <Building2 size={15} />
                      </span>

                      <input
                        type="text"
                        className={`form-input${addErr ? " error" : ""}`}
                        placeholder="e.g. Engineering, Marketing, Finance…"
                        value={addName}
                        onChange={(e) => {
                          setAddName(e.target.value);
                          setAddErr("");
                        }}
                        disabled={addBusy}
                        style={{ height: 44 }}
                      />
                    </div>

                    {addErr && (
                      <p className="error-msg">
                        <AlertCircle size={12} /> {addErr}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={addBusy}
                    style={{ width: "auto", padding: "0 20px", height: 44 }}
                  >
                    {addBusy ? "Adding…" : (
                      <>
                        <Plus size={15} /> Add Department
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            style={{ ...GLASS, overflow: "hidden" }}
          >
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-card)" }}>
              <div className="input-wrapper">
                <span className="input-icon">
                  <Search size={14} />
                </span>

                <input
                  type="text"
                  className="form-input"
                  placeholder="Search departments…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ height: 38, fontSize: 13 }}
                />

                {search && (
                  <button className="input-icon-right" onClick={() => setSearch("")} style={{ right: 10 }}>
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {error && !loading && (
              <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 10 }}>
                <AlertCircle size={16} color="var(--text-error)" />
                <p style={{ fontSize: 13, color: "var(--text-error)" }}>{error}</p>
                <button onClick={fetchDepts} style={{ marginLeft: "auto", color: "var(--text-link)" }}>
                  Retry
                </button>
              </div>
            )}

            {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && !error && filtered.length === 0 && (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <Building2 size={26} style={{ color: "var(--text-link)", marginBottom: 10 }} />
                <p style={{ fontSize: 15, fontWeight: 600 }}>
                  {search ? "No departments match your search" : "No departments yet"}
                </p>
              </div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <AnimatePresence>
                  {filtered.map((dept, idx) => {
                    const isEditing = editRow?.id === dept.id;

                    return (
                      <motion.div
                        key={dept.id}
                        variants={rowVariants}
                        layout
                        exit="exit"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "13px 20px",
                          borderBottom: idx < filtered.length - 1 ? "1px solid var(--border-card)" : "none",
                          minHeight: 58,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "rgba(91,110,245,0.12)",
                            border: "1px solid rgba(91,110,245,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--text-link)",
                          }}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </div>

                        {isAdmin && isEditing ? (
                          <form
                            onSubmit={handleEdit}
                            style={{ flex: 1, display: "flex", gap: 8, alignItems: "center" }}
                          >
                            <input
                              autoFocus
                              type="text"
                              className="form-input"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              disabled={editBusy}
                              style={{ height: 36, flex: 1, fontSize: 13 }}
                            />

                            <IconBtn
                              icon={editBusy ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> : <Check size={14} />}
                              title="Save"
                              onClick={handleEdit}
                              color="#22c55e"
                              disabled={editBusy}
                            />

                            <IconBtn
                              icon={<X size={14} />}
                              title="Cancel"
                              onClick={cancelEdit}
                              color="var(--text-muted)"
                              disabled={editBusy}
                            />
                          </form>
                        ) : (
                          <>
                            <p style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
                              {dept.departmentName}
                            </p>

                            {isAdmin && (
                              <div style={{ display: "flex", gap: 6 }}>
                                <IconBtn
                                  icon={<Pencil size={14} />}
                                  title="Edit"
                                  onClick={() => startEdit(dept)}
                                  color="#8b5cf6"
                                />

                                <IconBtn
                                  icon={<Trash2 size={14} />}
                                  title="Delete"
                                  onClick={() => setToDelete(dept)}
                                  color="#ef4444"
                                />
                              </div>
                            )}
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}

            {!loading && departments.length > 0 && (
              <div
                style={{
                  padding: "10px 20px",
                  borderTop: "1px solid var(--border-card)",
                  fontSize: 12,
                  color: "var(--text-muted)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Showing {filtered.length} of {departments.length}</span>
                <span>Departments Master</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {isAdmin && (
        <DeleteModal
          dept={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          busy={delBusy}
        />
      )}
    </div>
  );
}