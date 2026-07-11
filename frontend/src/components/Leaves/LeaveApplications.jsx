import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  User,
} from "lucide-react";

import { getLeaveApplications, updateLeaveStatus } from "../../services/api";
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

function StatusBadge({ status }) {
  const map = {
    Pending: { icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    Approved: { icon: CheckCircle, color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    Rejected: { icon: XCircle, color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  };

  const config = map[status] || map.Pending;
  const Icon = config.icon;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 600,
        background: config.bg,
        color: config.color,
      }}
    >
      <Icon size={13} /> {status}
    </span>
  );
}

export default function LeaveApplications() {
  const { push } = useToast();
  const { user } = useAuth();

  const isApprover = ["admin", "manager", "hr"].includes(user?.role?.toLowerCase());

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setLoading(true);
    setError("");

    try {
      const data = await getLeaveApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      push(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(id, status) {
    setBusyId(id);

    try {
      await updateLeaveStatus(id, {
        status,
        approvedBy: user?.id,
        remarks: `${status} by ${user?.role || "user"}`,
      });

      setApplications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );

      push(`Leave ${status.toLowerCase()} successfully.`, "success");
    } catch (err) {
      push(err.message, "error");
    } finally {
      setBusyId(null);
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
            style={{ marginBottom: 32 }}
          >
            <span className="dashboard-badge" style={{ marginBottom: 10 }}>
              <CalendarDays size={11} /> Leave Management
            </span>

            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
              Leave Applications
            </h1>

            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Review employee leave requests and approval status.
            </p>
          </motion.div>

          {loading && (
            <div style={{ ...GLASS, padding: 40, textAlign: "center" }}>
              <Loader2
                size={26}
                style={{ animation: "spin 0.8s linear infinite", color: "var(--text-link)" }}
              />
            </div>
          )}

          {error && !loading && (
            <div style={{ ...GLASS, padding: 24, display: "flex", gap: 10 }}>
              <AlertCircle size={18} color="var(--text-error)" />
              <p style={{ color: "var(--text-error)", fontSize: 14 }}>{error}</p>
            </div>
          )}

          {!loading && !error && applications.length === 0 && (
            <div style={{ ...GLASS, padding: 40, textAlign: "center" }}>
              <CalendarDays size={30} style={{ color: "var(--text-muted)", marginBottom: 10 }} />
              <p>No leave applications found.</p>
            </div>
          )}

          {!loading && !error && applications.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {applications.map((leave) => {
                const employeeName = leave.employee?.user?.name || "Employee";
                const leaveName = leave.leaveType?.leaveName || "Leave";
                const from = new Date(leave.fromDate).toLocaleDateString();
                const to = new Date(leave.toDate).toLocaleDateString();
                const isPending = leave.status === "Pending";

                return (
                  <motion.div
                    key={leave.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      ...GLASS,
                      padding: "18px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: "rgba(91,110,245,0.14)",
                        color: "var(--text-link)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <User size={18} />
                    </div>

                    <div style={{ flex: "1 1 190px" }}>
                      <p style={{ fontSize: 14, fontWeight: 700 }}>{employeeName}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {leaveName} • {leave.totalDays} day(s)
                      </p>
                    </div>

                    <div style={{ flex: "1 1 180px" }}>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Dates</p>
                      <p style={{ fontSize: 13 }}>
                        {from} to {to}
                      </p>
                    </div>

                    <div style={{ flex: "1 1 180px" }}>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Reason</p>
                      <p style={{ fontSize: 13 }}>{leave.reason || "—"}</p>
                    </div>

                    <StatusBadge status={leave.status} />

                    {isApprover && isPending && (
                      <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                        <button
                          className="btn-primary"
                          disabled={busyId === leave.id}
                          onClick={() => handleStatus(leave.id, "Approved")}
                          style={{ width: "auto", height: 36, padding: "0 14px", fontSize: 12 }}
                        >
                          Approve
                        </button>

                        <button
                          className="btn-danger"
                          disabled={busyId === leave.id}
                          onClick={() => handleStatus(leave.id, "Rejected")}
                          style={{ width: "auto", height: 36, padding: "0 14px", fontSize: 12 }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}