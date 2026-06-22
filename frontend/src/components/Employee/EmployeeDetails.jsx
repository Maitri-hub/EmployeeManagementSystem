import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  Zap,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

import { getEmployee } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../Layout/Navbar";
import AuthBackground from "../UI/AuthBackground";

const API_URL = "https://employeemanagementsystem-lplz.onrender.com";

const GLASS = {
  background: "var(--bg-card)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "var(--glass-border)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--glass-shadow)",
};

const SECTION_TITLE = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  marginBottom: 16,
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

function InfoRow({ icon: Icon, label, value, color = "#5b6ef5" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "11px 0",
        borderBottom: "1px solid var(--border-card)",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: `${color}18`,
          border: `1px solid ${color}28`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <Icon size={14} />
      </div>

      <div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>
          {label}
        </p>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function UploadedFileCard({ file, index }) {
  const imageUrl = file.imageUrl || "";
  const fileUrl = imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  const fileName = imageUrl.split("/").pop() || `file-${index + 1}`;
  const lower = fileName.toLowerCase();
  const isImage = lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg");

  return (
    <div
      style={{
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-card)",
        background: "var(--bg-input)",
        padding: 12,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: "rgba(91,110,245,0.12)",
          border: "1px solid rgba(91,110,245,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-link)",
          flexShrink: 0,
        }}
      >
        {isImage ? <ImageIcon size={17} /> : <FileText size={17} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-primary)",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {fileName}
        </p>

        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
          Saved file record
        </p>
      </div>

      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          fontSize: 12,
          color: "var(--text-link)",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Open
      </a>
    </div>
  );
}

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const { user } = useAuth();

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEmployee() {
      setLoading(true);

      try {
        const data = await getEmployee(id);
        setEmployee(data.employee ?? data);
      } catch (err) {
        setError(err.message);
        push(err.message, "error");
      } finally {
        setLoading(false);
      }
    }

    fetchEmployee();
  }, [id, push]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-page)", position: "relative" }}>
        <AuthBackground />
        <Navbar />

        <div
          style={{
            paddingTop: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
          }}
        >
          <Loader2
            size={28}
            style={{ animation: "spin 0.8s linear infinite", color: "var(--text-link)" }}
          />
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-page)", position: "relative" }}>
        <AuthBackground />
        <Navbar />

        <div
          style={{
            paddingTop: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ ...GLASS, padding: 36, textAlign: "center", maxWidth: 400 }}>
            <AlertCircle
              size={32}
              style={{ color: "var(--text-error)", margin: "0 auto 12px" }}
            />

            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
              Failed to load employee
            </p>

            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20 }}>
              {error}
            </p>

            <button
              className="btn-ghost"
              style={{ width: "auto", padding: "0 20px", height: 40, margin: "0 auto" }}
              onClick={() => navigate("/employees")}
            >
              <ArrowLeft size={14} /> Back to list
            </button>
          </div>
        </div>
      </div>
    );
  }

  const employeeName = employee.user?.name || "Unnamed Employee";
  const employeeEmail = employee.user?.email || "—";
  const departmentName = employee.department?.departmentName || "—";
  const skills =
    employee.employeeSkills?.map((item) => item.skill?.skillName).filter(Boolean) || [];
  const images = employee.images || [];

  const initials = employeeName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = ["#5b6ef5", "#8b5cf6", "#06b6d4", "#f59e0b", "#22c55e"];
  const avatarColor = colors[(employeeName.charCodeAt(0) || 0) % colors.length];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", position: "relative" }}>
      <AuthBackground />
      <Navbar />

      <div style={{ paddingTop: 64, position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div>
              <Link
                to="/employees"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  marginBottom: 10,
                  fontWeight: 500,
                }}
              >
                <ArrowLeft size={14} /> Back to Employees
              </Link>

              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" }}>
                Employee Profile
              </h1>
            </div>

            {isAdmin && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link to={`/employees/edit/${id}`} style={{ textDecoration: "none" }}>
                  <button
                    className="btn-primary"
                    style={{ width: "auto", padding: "0 20px", height: 44 }}
                  >
                    <Pencil size={15} /> Edit Profile
                  </button>
                </Link>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: "grid",
              gridTemplateColumns: "300px 1fr",
              gap: 20,
              alignItems: "start",
            }}
          >
            <motion.div
              variants={itemVariants}
              style={{ ...GLASS, padding: "28px 22px", textAlign: "center" }}
            >
              <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}bb)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 30,
                    fontWeight: 800,
                    color: "#fff",
                    boxShadow: `0 0 0 4px var(--bg-card), 0 0 0 6px ${avatarColor}30`,
                    margin: "0 auto",
                  }}
                >
                  {initials}
                </div>
              </div>

              <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
                {employeeName}
              </p>

              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}>
                {employeeEmail}
              </p>

              <span className="dropdown-role">
                <Briefcase size={10} /> {employee.designation || "Employee"}
              </span>

              <div style={{ height: 1, background: "var(--border-card)", margin: "20px 0" }} />

              <div style={{ textAlign: "left" }}>
                <InfoRow icon={Building2} label="Department" value={departmentName} color="#5b6ef5" />
                <InfoRow icon={Mail} label="Email" value={employeeEmail} color="#f59e0b" />
                <InfoRow icon={Phone} label="Phone" value={employee.phone} color="#8b5cf6" />
                <InfoRow icon={MapPin} label="Address" value={employee.address} color="#06b6d4" />
                <InfoRow
                  icon={DollarSign}
                  label="Salary"
                  value={employee.salary != null ? `₹${Number(employee.salary).toLocaleString()}` : "—"}
                  color="#22c55e"
                />
              </div>
            </motion.div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <motion.div variants={itemVariants} style={{ ...GLASS, padding: 24 }}>
                <p style={SECTION_TITLE}>
                  <Zap size={12} style={{ display: "inline", marginRight: 5 }} />
                  Skills ({skills.length})
                </p>

                {skills.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    No skills assigned.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {skills.map((skill, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          padding: "5px 14px",
                          borderRadius: 99,
                          fontSize: 12,
                          fontWeight: 500,
                          background: "rgba(91,110,245,0.12)",
                          border: "1px solid rgba(91,110,245,0.22)",
                          color: "var(--text-link)",
                        }}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div variants={itemVariants} style={{ ...GLASS, padding: 24 }}>
                <p style={SECTION_TITLE}>
                  <ImageIcon size={12} style={{ display: "inline", marginRight: 5 }} />
                  Documents & Photos ({images.length})
                </p>

                {images.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
                    <ImageIcon size={28} style={{ margin: "0 auto 8px" }} />
                    <p style={{ fontSize: 13 }}>No files uploaded yet.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {images.map((img, i) => (
                      <UploadedFileCard key={img.id || i} file={img} index={i} />
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}