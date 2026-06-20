 import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  Upload,
  X,
  AlertCircle,
  Check,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

import {
  getUsers,
  getDepartments,
  getSkills,
  createEmployee,
  updateEmployee,
  getEmployee,
  uploadEmployeeFiles,
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

const SECTION_TITLE = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  marginBottom: 16,
};

const EMPTY = {
  userId: "",
  phone: "",
  address: "",
  designation: "",
  salary: "",
  departmentId: "",
  skillIds: [],
};

function Field({ id, label, icon: Icon, error, children }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className="input-wrapper">
        <span className="input-icon"><Icon size={15} /></span>
        {children}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            className="error-msg"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <AlertCircle size={12} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function SkillSelector({ skills, selected, onChange }) {
  const toggle = (id) => {
    onChange(
      selected.includes(id)
        ? selected.filter((skillId) => skillId !== id)
        : [...selected, id]
    );
  };

  if (!skills.length) {
    return <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No skills available.</p>;
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {skills.map((skill) => {
        const id = skill.id;
        const active = selected.includes(id);

        return (
          <motion.button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "5px 12px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              background: active ? "rgba(91,110,245,0.18)" : "var(--bg-input)",
              border: active ? "1px solid rgba(91,110,245,0.5)" : "1px solid var(--border-input)",
              color: active ? "var(--text-link)" : "var(--text-secondary)",
            }}
          >
            {active && <Check size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />}
            {skill.skillName}
          </motion.button>
        );
      })}
    </div>
  );
}

function FileDropZone({ files, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const MAX = 5;

  const addFiles = (incoming) => {
    const merged = [...files];

    for (const file of incoming) {
      if (merged.length >= MAX) break;
      if (!merged.find((existing) => existing.name === file.name && existing.size === file.size)) {
        merged.push(file);
      }
    }

    onChange(merged);
  };

  const removeFile = (index) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(Array.from(e.dataTransfer.files));
        }}
        onClick={() => files.length < MAX && inputRef.current?.click()}
        style={{
          border: "1.5px dashed var(--border-input)",
          borderRadius: "var(--radius-md)",
          padding: "28px 16px",
          textAlign: "center",
          cursor: files.length < MAX ? "pointer" : "not-allowed",
          background: dragging ? "rgba(91,110,245,0.06)" : "var(--bg-input)",
          marginBottom: 12,
        }}
      >
        <Upload size={22} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />

        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          {files.length < MAX ? "Drag & drop files here, or browse" : `Maximum ${MAX} files reached`}
        </p>

        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          Photos, Aadhaar, Resume, Certificates — max {MAX} files
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          style={{ display: "none" }}
          onChange={(e) => addFiles(Array.from(e.target.files))}
        />
      </motion.div>

      <AnimatePresence>
        {files.map((file, index) => (
          <motion.div
            key={`${file.name}-${index}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-input)",
              border: "1px solid var(--border-input)",
              marginBottom: 6,
            }}
          >
            <span style={{ color: "var(--text-link)" }}>
              {file.type.startsWith("image/") ? <ImageIcon size={14} /> : <FileText size={14} />}
            </span>

            <span style={{ flex: 1, fontSize: 12, color: "var(--text-secondary)" }}>
              {file.name}
            </span>

            <button
              type="button"
              onClick={() => removeFile(index)}
              style={{ color: "var(--text-error)", cursor: "pointer" }}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { push } = useToast();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [skills, setSkills] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  useEffect(() => {
    async function init() {
      try {
        const [usersData, departmentsData, skillsData] = await Promise.all([
          getUsers(),
          getDepartments(),
          getSkills(),
        ]);

        setUsers(Array.isArray(usersData) ? usersData : []);
        setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
        setSkills(Array.isArray(skillsData) ? skillsData : []);

        if (isEdit) {
          const employee = await getEmployee(id);

          setForm({
            userId: employee.userId || employee.user?.id || "",
            phone: employee.phone || "",
            address: employee.address || "",
            designation: employee.designation || "",
            salary: employee.salary != null ? String(employee.salary) : "",
            departmentId: employee.departmentId || employee.department?.id || "",
            skillIds: employee.employeeSkills?.map((item) => item.skillId || item.skill?.id) || [],
          });
        }
      } catch (error) {
        push(error.message, "error");
      } finally {
        setFetching(false);
      }
    }

    init();
  }, [id, isEdit, push]);

  function validate() {
    const e = {};

    if (!form.userId) e.userId = "Please select a user";
    if (!form.departmentId) e.departmentId = "Please select a department";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.designation.trim()) e.designation = "Designation is required";
    if (!form.salary) e.salary = "Salary is required";
    else if (isNaN(Number(form.salary)) || Number(form.salary) <= 0) {
      e.salary = "Enter a valid salary";
    }

    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userId: Number(form.userId),
        departmentId: Number(form.departmentId),
        phone: form.phone,
        address: form.address,
        designation: form.designation,
        salary: Number(form.salary),
        skillIds: form.skillIds,
      };

      let savedId;

      if (isEdit) {
        const updated = await updateEmployee(id, payload);
        savedId = updated.id;
        push("Employee updated successfully!", "success");
      } else {
        const created = await createEmployee(payload);
        savedId = created.id;
        push("Employee created successfully!", "success");
      }

      if (files.length && savedId) {
  try {
   uploadEmployeeFiles(savedId, files)
  .then(() => {
    push(`${files.length} file(s) uploaded.`, "success");
  })
  .catch((uploadError) => {
    push(`Employee saved, but file upload failed: ${uploadError.message}`, "error");
  });
  } catch (uploadError) {
    push(`Employee saved, but file upload failed: ${uploadError.message}`, "error");
  }
}

      navigate("/employees");
    } catch (error) {
      push(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-page)", position: "relative" }}>
        <AuthBackground />
        <Navbar />
        <div style={{ paddingTop: 64, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
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
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 32 }}
          >
            <Link to="/employees" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)", marginBottom: 14, fontWeight: 500 }}>
              <ArrowLeft size={14} /> Back to Employees
            </Link>

            <span className="dashboard-badge" style={{ marginBottom: 10, display: "flex", width: "fit-content" }}>
              <User size={11} /> {isEdit ? "Edit Employee" : "New Employee"}
            </span>

            <h1 style={{ fontSize: 26, fontWeight: 700 }}>
              {isEdit ? "Edit Employee Profile" : "Create New Employee"}
            </h1>
          </motion.div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ ...GLASS, padding: "24px 28px" }}>
                <p style={SECTION_TITLE}>Employee Information</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                  <div className="form-group">
                    <label className="form-label">Select User *</label>
                    <select
                      className={`form-input${errors.userId ? " error" : ""}`}
                      value={form.userId}
                      onChange={set("userId")}
                      disabled={isEdit}
                    >
                      <option value="">Select user...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                    {errors.userId && <p className="error-msg"><AlertCircle size={12} /> {errors.userId}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select
                      className={`form-input${errors.departmentId ? " error" : ""}`}
                      value={form.departmentId}
                      onChange={set("departmentId")}
                    >
                      <option value="">Select department...</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.departmentName}
                        </option>
                      ))}
                    </select>
                    {errors.departmentId && <p className="error-msg"><AlertCircle size={12} /> {errors.departmentId}</p>}
                  </div>

                  <Field id="phone" label="Phone Number *" icon={Phone} error={errors.phone}>
                    <input id="phone" className={`form-input${errors.phone ? " error" : ""}`} value={form.phone} onChange={set("phone")} />
                  </Field>

                  <Field id="salary" label="Salary *" icon={DollarSign} error={errors.salary}>
                    <input id="salary" type="number" className={`form-input${errors.salary ? " error" : ""}`} value={form.salary} onChange={set("salary")} />
                  </Field>

                  <Field id="designation" label="Designation *" icon={Briefcase} error={errors.designation}>
                    <input id="designation" className={`form-input${errors.designation ? " error" : ""}`} value={form.designation} onChange={set("designation")} />
                  </Field>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <Field id="address" label="Address" icon={MapPin} error={errors.address}>
                      <input id="address" className="form-input" value={form.address} onChange={set("address")} />
                    </Field>
                  </div>
                </div>
              </div>

              <div style={{ ...GLASS, padding: "24px 28px" }}>
                <p style={SECTION_TITLE}>Skills ({form.skillIds.length} selected)</p>
                <SkillSelector
                  skills={skills}
                  selected={form.skillIds}
                  onChange={(ids) => setForm((prev) => ({ ...prev, skillIds: ids }))}
                />
              </div>

              <div style={{ ...GLASS, padding: "24px 28px" }}>
                <p style={SECTION_TITLE}>Documents & Photos ({files.length}/5)</p>
                <FileDropZone files={files} onChange={setFiles} />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <Link to="/employees" style={{ textDecoration: "none" }}>
                  <button type="button" className="btn-ghost" style={{ width: "auto", padding: "0 24px", height: 46 }}>
                    Cancel
                  </button>
                </Link>

                <button type="submit" className="btn-primary" disabled={loading} style={{ width: "auto", padding: "0 28px", height: 46 }}>
                  {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Employee"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}