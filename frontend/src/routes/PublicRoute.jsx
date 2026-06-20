import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) return null;

  if (user) {
    const redirectPath = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}