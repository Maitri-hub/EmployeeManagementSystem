import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser as setReduxUser, logoutUser } from "../redux/authSlice";

const AuthContext = createContext(null);

const AUTH_API_URL = "http://localhost:5000/api/auth";
const USER_API_URL = "http://localhost:5000/api/user";

function buildUser(userData) {
  const name = userData?.name || "Employee";

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return {
    id: userData?.id,
    name,
    email: userData?.email,
    role: userData?.role || "Employee",
    initials,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    const loadUserProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await fetch(`${USER_API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");

          setUser(null);
          dispatch(logoutUser());
          return;
        }

        const loggedInUser = buildUser(data.user);

        localStorage.setItem("user", JSON.stringify(loggedInUser));

        setUser(loggedInUser);
        dispatch(setReduxUser(loggedInUser));
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        setUser(null);
        dispatch(logoutUser());
      } finally {
        setAuthLoading(false);
      }
    };

    loadUserProfile();
  }, [dispatch]);

  const signup = async (name, email, password) => {
    const response = await fetch(`${AUTH_API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Signup failed");
    }

    return data;
  };

  const login = async (email, password) => {
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    const loggedInUser = buildUser(data.user);

    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    setUser(loggedInUser);
    dispatch(setReduxUser(loggedInUser));

    return data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await fetch(`${AUTH_API_URL}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.log(error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setUser(null);
    dispatch(logoutUser());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);