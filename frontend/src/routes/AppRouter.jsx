import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Login from "../components/Auth/Login";
import Signup from "../components/Auth/Signup";
import ForgotPassword from "../components/Auth/ForgotPassword";

import Dashboard from "../components/Layout/Dashboard";
import Profile from "../components/Layout/Profile";
import Settings from "../components/Layout/Settings";

import EmployeeList from "../components/Employee/EmployeeList";
import CreateEmployee from "../components/Employee/CreateEmployee";
import EditEmployee from "../components/Employee/EditEmployee";
import EmployeeDetails from "../components/Employee/EmployeeDetails";

import DepartmentMaster from "../components/Masters/DepartmentMaster";
import SkillsMaster from "../components/Masters/SkillsMaster";

import LeaveApplications from "../components/Leaves/LeaveApplications";
import LeaveBalances from "../components/Leaves/LeaveBalances";
import ApplyLeave from "../components/Leaves/ApplyLeave";
import MyLeaves from "../components/Leaves/MyLeaves";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import RoleRoute from "./RoleRoute";

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    style={{ width: "100%" }}
  >
    {children}
  </motion.div>
);

function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        background: "var(--bg-page)",
        color: "var(--text-primary)",
      }}
    >
      <h1 style={{ fontSize: 64, fontWeight: 800, letterSpacing: "-2px", opacity: 0.2 }}>
        404
      </h1>
      <p style={{ color: "var(--text-secondary)" }}>Page not found</p>
      <a href="/login" style={{ color: "var(--text-link)", fontSize: 14, fontWeight: 500 }}>
        ← Back to login
      </a>
    </div>
  );
}

const approverRoles = ["admin", "manager", "hr"];
const adminOnly = ["admin"];
const employeeRoles = ["employee", "user"];

export default function AppRouter() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<PublicRoute><PageTransition><Login /></PageTransition></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><PageTransition><Signup /></PageTransition></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><PageTransition><ForgotPassword /></PageTransition></PublicRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />

        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={adminOnly}>
                <PageTransition><EmployeeList /></PageTransition>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees/create"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={adminOnly}>
                <PageTransition><CreateEmployee /></PageTransition>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route path="/employees/:id" element={<ProtectedRoute><PageTransition><EmployeeDetails /></PageTransition></ProtectedRoute>} />

        <Route
          path="/employees/edit/:id"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={adminOnly}>
                <PageTransition><EditEmployee /></PageTransition>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees/:id/edit"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={adminOnly}>
                <PageTransition><EditEmployee /></PageTransition>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={adminOnly}>
                <PageTransition><DepartmentMaster /></PageTransition>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/skills"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={adminOnly}>
                <PageTransition><SkillsMaster /></PageTransition>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaves"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={approverRoles}>
                <PageTransition><LeaveApplications /></PageTransition>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaves/balances"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={approverRoles}>
                <PageTransition><LeaveBalances /></PageTransition>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaves/apply"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={employeeRoles}>
                <PageTransition><ApplyLeave /></PageTransition>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-leaves"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={employeeRoles}>
                <PageTransition><MyLeaves /></PageTransition>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute>} />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}