import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WalletCards, Loader2, AlertCircle, User, CalendarDays } from "lucide-react";

import { getLeaveBalances } from "../../services/api";
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

export default function LeaveBalances() {
  const { push } = useToast();

  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBalances() {
      try {
        const data = await getLeaveBalances();
        setBalances(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        push(err.message, "error");
      } finally {
        setLoading(false);
      }
    }

    fetchBalances();
  }, [push]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", position: "relative" }}>
      <AuthBackground />
      <Navbar />

      <div style={{ paddingTop: 64, position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
            <span className="dashboard-badge" style={{ marginBottom: 10 }}>
              <WalletCards size={11} /> Leave Reports
            </span>

            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
              Leave Balance Report
            </h1>

            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Employee wise available leave balance.
            </p>
          </motion.div>

          {loading && (
            <div style={{ ...GLASS, padding: 40, textAlign: "center" }}>
              <Loader2 size={26} style={{ animation: "spin 0.8s linear infinite", color: "var(--text-link)" }} />
            </div>
          )}

          {error && !loading && (
            <div style={{ ...GLASS, padding: 24, display: "flex", gap: 10 }}>
              <AlertCircle size={18} color="var(--text-error)" />
              <p style={{ color: "var(--text-error)", fontSize: 14 }}>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {balances.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ ...GLASS, padding: "18px 20px" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "rgba(91,110,245,0.14)",
                        color: "var(--text-link)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <User size={17} />
                    </div>

                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700 }}>
                        {item.employee?.user?.name || "Employee"}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {item.employee?.designation || "—"}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                      <CalendarDays size={14} /> {item.leaveType?.leaveName}
                    </span>

                    <span
                      style={{
                        padding: "5px 12px",
                        borderRadius: 99,
                        background: "rgba(34,197,94,0.12)",
                        color: "#22c55e",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {item.availableDays} days
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}