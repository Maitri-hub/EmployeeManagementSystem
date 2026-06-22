import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
  Search,
} from "lucide-react";

import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../../services/api";

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

const PILL_COLORS = [
  { bg: "rgba(91,110,245,0.12)", border: "rgba(91,110,245,0.25)", text: "#818cf8" },
  { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)", text: "#a78bfa" },
  { bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.25)", text: "#22d3ee" },
  { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", text: "#fbbf24" },
  { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)", text: "#34d399" },
  { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", text: "#f87171" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.07 } },
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

function DeleteModal({ skill, onConfirm, onCancel, busy }) {
  const skillName = skill?.skillName || "Skill";

  return (
    <AnimatePresence>
      {skill && (
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

            <h2 className="modal-title">Delete Skill?</h2>

            <p className="modal-body">
              Remove{" "}
              <strong style={{ color: "var(--text-primary)" }}>{skillName}</strong>{" "}
              from the skills master?
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
      <div style={{ width: 80, height: 26, borderRadius: 99, background: "var(--border-input)" }} />
      <div style={{ flex: 1, height: 13, borderRadius: 6, background: "var(--border-input)", maxWidth: 160 }} />
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--border-input)" }} />
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--border-input)" }} />
    </motion.div>
  );
}

export default function SkillsMaster() {
  const { push } = useToast();

  const [skills, setSkills] = useState([]);
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
    fetchSkills();
  }, []);

  async function fetchSkills() {
    setLoading(true);
    setError("");

    try {
      const data = await getSkills();
      setSkills(Array.isArray(data) ? data : data.skills ?? []);
    } catch (err) {
      setError(err.message);
      push(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const filtered = skills.filter((skill) =>
    !search || skill.skillName?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd(e) {
    e.preventDefault();

    const skillName = addName.trim();

    if (!skillName) {
      setAddErr("Skill name is required.");
      return;
    }

    if (
      skills.some((skill) => skill.skillName?.toLowerCase() === skillName.toLowerCase())
    ) {
      setAddErr("This skill already exists.");
      return;
    }

    setAddBusy(true);

    try {
      const newSkill = await createSkill({ skillName });
      setSkills((prev) => [...prev, newSkill]);
      setAddName("");
      setAddErr("");
      push(`Skill "${skillName}" added.`, "success");
    } catch (err) {
      push(err.message, "error");
    } finally {
      setAddBusy(false);
    }
  }

  function startEdit(skill) {
    setEditRow(skill);
    setEditName(skill.skillName || "");
  }

  function cancelEdit() {
    setEditRow(null);
    setEditName("");
  }

  async function handleEdit(e) {
    e?.preventDefault();

    const skillName = editName.trim();
    const id = editRow.id;

    if (!skillName) {
      push("Name cannot be empty.", "error");
      return;
    }

    setEditBusy(true);

    try {
      const updated = await updateSkill(id, { skillName });
      setSkills((prev) => prev.map((skill) => (skill.id === id ? updated : skill)));
      push(`Renamed to "${skillName}".`, "success");
      cancelEdit();
    } catch (err) {
      push(err.message, "error");
    } finally {
      setEditBusy(false);
    }
  }

  async function handleDelete() {
    const id = toDelete.id;
    const name = toDelete.skillName;

    setDelBusy(true);

    try {
      await deleteSkill(id);
      setSkills((prev) => prev.filter((skill) => skill.id !== id));
      push(`"${name}" removed.`, "success");
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
              <Zap size={11} /> Master Data
            </span>

            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 4 }}>
              Skills
            </h1>

            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              {loading ? "Loading…" : `${skills.length} skills in master`}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06 }}
            style={{ ...GLASS, padding: "22px 24px", marginBottom: 20 }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>
              Add New Skill
            </p>

            <form onSubmit={handleAdd} noValidate>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <Zap size={15} />
                    </span>

                    <input
                      type="text"
                      className={`form-input${addErr ? " error" : ""}`}
                      placeholder="e.g. React.js, Project Management, Python…"
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
                      <Plus size={15} /> Add Skill
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

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
                  placeholder="Search skills…"
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
                <button onClick={fetchSkills} style={{ marginLeft: "auto", color: "var(--text-link)" }}>
                  Retry
                </button>
              </div>
            )}

            {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && !error && filtered.length === 0 && (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <Zap size={26} style={{ color: "#22d3ee", marginBottom: 10 }} />
                <p style={{ fontSize: 15, fontWeight: 600 }}>
                  {search ? "No skills match your search" : "No skills yet"}
                </p>
              </div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <AnimatePresence>
                  {filtered.map((skill, idx) => {
                    const isEditing = editRow?.id === skill.id;
                    const pill = PILL_COLORS[idx % PILL_COLORS.length];

                    return (
                      <motion.div
                        key={skill.id}
                        variants={rowVariants}
                        layout
                        exit="exit"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "13px 20px",
                          borderBottom: idx < filtered.length - 1 ? "1px solid var(--border-card)" : "none",
                          minHeight: 56,
                        }}
                      >
                        {!isEditing && (
                          <span
                            style={{
                              flexShrink: 0,
                              padding: "4px 12px",
                              borderRadius: 99,
                              fontSize: 12,
                              fontWeight: 600,
                              background: pill.bg,
                              border: `1px solid ${pill.border}`,
                              color: pill.text,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {skill.skillName}
                          </span>
                        )}

                        {isEditing ? (
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
                            <span style={{ flex: 1, fontSize: 12, color: "var(--text-muted)" }}>
                              #{String(idx + 1).padStart(3, "0")}
                            </span>

                            <div style={{ display: "flex", gap: 6 }}>
                              <IconBtn
                                icon={<Pencil size={14} />}
                                title="Edit"
                                onClick={() => startEdit(skill)}
                                color="#8b5cf6"
                              />

                              <IconBtn
                                icon={<Trash2 size={14} />}
                                title="Delete"
                                onClick={() => setToDelete(skill)}
                                color="#ef4444"
                              />
                            </div>
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}

            {!loading && skills.length > 0 && (
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
                <span>Showing {filtered.length} of {skills.length}</span>
                <span>Skills Master</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <DeleteModal
        skill={toDelete}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        busy={delBusy}
      />
    </div>
  );
}