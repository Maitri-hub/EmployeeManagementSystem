import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarPlus, Loader2, AlertCircle } from "lucide-react";

import { getEmployees, getLeaveTypes, createLeaveApplication } from "../../services/api";
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

export default function ApplyLeave() {
  const { push } = useToast();

  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    employeeId: "",
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  useEffect(() => {
    async function init() {
      try {
        const [empData, typeData] = await Promise.all([getEmployees(), getLeaveTypes()]);
        setEmployees(Array.isArray(empData) ? empData : []);
        setLeaveTypes(Array.isArray(typeData) ? typeData : []);
      } catch (err) {
        push(err.message, "error");
      } finally {
        setFetching(false);
      }
    }

    init();
  }, [push]);

  function set(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function calculateDays() {
    if (!form.fromDate || !form.toDate) return 0;

    const from = new Date(form.fromDate);
    const to = new Date(form.toDate);
    const diff = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;

    return diff > 0 ? diff : 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const totalDays = calculateDays();

    if (!form.employeeId || !form.leaveTypeId || !form.fromDate || !form.toDate || !form.reason.trim()) {
      push("Please fill all leave application fields.", "error");
      return;
    }

    if (totalDays <= 0) {
      push("To date must be after or same as from date.", "error");
      return;
    }

    setLoading(true);

    try {
      await createLeaveApplication({
        employeeId: Number(form.employeeId),
        leaveTypeId: Number(form.leaveTypeId),
        fromDate: form.fromDate,
        toDate: form.toDate,
        totalDays,
        reason: form.reason,
      });

      push("Leave application submitted successfully.", "success");

      setForm({
        employeeId: "",
        leaveTypeId: "",
        fromDate: "",
        toDate: "",
        reason: "",
      });
    } catch (err) {
      push(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-page)", position: "relative" }}>
        <AuthBackground />
        <Navbar />
        <div style={{ paddingTop: 64, minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={28} style={{ animation: "spin 0.8s linear infinite", color: "var(--text-link)" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", position: "relative" }}>
      <AuthBackground />
      <Navbar />

      <div style={{ paddingTop: 64, position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
            <span className="dashboard-badge" style={{ marginBottom: 10 }}>
              <CalendarPlus size={11} /> Leave Workflow
            </span>

            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Apply Leave</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Submit a leave request for approval.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} style={{ ...GLASS, padding: "26px 28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Employee</label>
                <select className="form-input" value={form.employeeId} onChange={set("employeeId")}>
                  <option value="">Select employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.user?.name} - {emp.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Leave Type</label>
                <select className="form-input" value={form.leaveTypeId} onChange={set("leaveTypeId")}>
                  <option value="">Select leave type...</option>
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.leaveName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">From Date</label>
                <input type="date" className="form-input" value={form.fromDate} onChange={set("fromDate")} />
              </div>

              <div className="form-group">
                <label className="form-label">To Date</label>
                <input type="date" className="form-input" value={form.toDate} onChange={set("toDate")} />
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Reason</label>
                <textarea
                  className="form-input"
                  value={form.reason}
                  onChange={set("reason")}
                  rows={4}
                  placeholder="Enter reason for leave..."
                  style={{ height: "auto", paddingTop: 12 }}
                />
              </div>
            </div>

            <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Total Days: <strong>{calculateDays()}</strong>
              </span>

              <button className="btn-primary" disabled={loading} style={{ width: "auto", padding: "0 24px", height: 44 }}>
                {loading ? "Submitting..." : "Submit Leave"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}