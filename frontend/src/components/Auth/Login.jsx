import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthBackground from "../UI/AuthBackground";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    await login(email, password);

    const redirectPath = location.state?.from?.pathname || "/dashboard";
    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="auth-page">
      <AuthBackground />

      <div className="glass-card">
        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subheading">
          Sign in to continue your Employee Portal
        </p>

        <div className="form-group">
          <input
            className="form-input"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <div className="input-wrapper">
            <input
              className="form-input"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="input-icon-right"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="form-row-space">
          <label className="checkbox-row">
            <input type="checkbox" />
            Remember me
          </label>

          <Link to="/forgot-password" className="forgot-link">
            Forgot password?
          </Link>
        </div>

        <button className="btn-primary" onClick={handleLogin}>
          Login
        </button>

        <p className="auth-footer">
          Don’t have an account? <Link to="/signup">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;