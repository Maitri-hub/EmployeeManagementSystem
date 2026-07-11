import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

import { getLeaveApplications } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
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

function StatusBadge({ status }) {
  const map = {
    Pending: { icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    Approved: { icon: CheckCircle, color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    Rejected: { icon: XCircle, color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  };

  const config = map[status] || map.Pending;
  const Icon = config.icon;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "4px 10px",
      borderRadius: 99,
      fontSize: 12,
      fontWeight: 600,
      background: config.bg,
      color: config.color,
    }}>
      <Icon size={13} /> {status}
    </span>
  );
}

export default function MyLeaves() {
  const { user } = useAuth();
  const { push } = useToast();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaves() {
      try {
        const data = await getLeaveApplications();

        const myLeaves = data.filter(
          (leave) => leave.employee?.user?.id === user?.id
        );

        setLeaves(myLeaves);
      } catch (err) {
        push(err.message, "error");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaves();
  }, [user, push]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", position: "relative" }}>
      <AuthBackground />
      <Navbar />

      <div style={{ paddingTop: 64, position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
            <span className="dashboard-badge" style={{ marginBottom: 10 }}>
              <CalendarDays size={11} /> My Leave History
            </span>

            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
              My Leaves
            </h1>

            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              View your own leave requests and approval status.
            </p>
          </motion.div>

          {loading && (
            <div style={{ ...GLASS, padding: 40, textAlign: "center" }}>
              <Loader2 size={26} style={{ animation: "spin 0.8s linear infinite", color: "var(--text-link)" }} />
            </div>
          )}

          {!loading && leaves.length === 0 && (
            <div style={{ ...GLASS, padding: 40, textAlign: "center" }}>
              <p>No leave history found for your account.</p>
            </div>
          )}

          {!loading && leaves.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {leaves.map((leave) => (
                <div key={leave.id} style={{ ...GLASS, padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700 }}>
                        {leave.leaveType?.leaveName}
                      </p>
                      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {new Date(leave.fromDate).toLocaleDateString()} to{" "}
                        {new Date(leave.toDate).toLocaleDateString()} • {leave.totalDays} day(s)
                      </p>
                      <p style={{ fontSize: 13, marginTop: 8 }}>
                        Reason: {leave.reason || "—"}
                      </p>
                    </div>

                    <StatusBadge status={leave.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}