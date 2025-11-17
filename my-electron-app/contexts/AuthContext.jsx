import React, { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = "http://localhost:5000/api";
axios.defaults.baseURL = API_BASE_URL;

const AuthContext = createContext();

const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_ERROR: "LOGIN_ERROR",
  LOGOUT: "LOGOUT",
  SET_LOADING: "SET_LOADING",
  REGISTER_START: "REGISTER_START",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  REGISTER_ERROR: "REGISTER_ERROR",
  UPDATE_PROFILE: "UPDATE_PROFILE"
};

const initialState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return { ...state, loading: true, error: null };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        loading: false,
        error: null,
        isAuthenticated: true
      };

    case AUTH_ACTIONS.LOGIN_ERROR:
    case AUTH_ACTIONS.REGISTER_ERROR:
      return { ...state, user: null, loading: false, error: action.payload, isAuthenticated: false };

    case AUTH_ACTIONS.LOGOUT:
      return { ...initialState, loading: false };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return { ...state, user: { ...state.user, ...action.payload }, loading: false };

    default:
      return state;
  }
};

const normalizeUser = (rawUser) => {
  if (!rawUser) return null;
  return {
    id: rawUser.id || rawUser._id || null,
    email: rawUser.emailID || rawUser.email || null,
    firstName: rawUser.fName || rawUser.firstName || null,
    lastName: rawUser.lName || rawUser.lastName || null,
    role: rawUser.role || null,
    // spread any other fields if needed
    ...rawUser
  };
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

useEffect(() => {
  const initializeAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return;
    }

    // set default Authorization header
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    try {
      const response = await axios.get("/auth/me");
      const rawUser = response.data?.data?.user;
      const user = normalizeUser(rawUser);
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user } });
    } catch (error) {
      console.error("Failed to fetch user on init:", error.response?.data || error);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  initializeAuth();
}, []);


  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      const response = await axios.post("/auth/login", credentials);
      const { user: rawUser, token } = response.data?.data || {};
      const user = normalizeUser(rawUser);localStorage.setItem("userId", user.id);

      if (!token) throw new Error("No token returned from server");

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user } });
      toast.success("Login successful");
      return { user, token };
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Login failed";
      dispatch({ type: AUTH_ACTIONS.LOGIN_ERROR, payload: message });
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });
      const response = await axios.post("/auth/register", userData);
      const { user: rawUser, token } = response.data?.data || {};
      const user = normalizeUser(rawUser);

      localStorage.setItem("userId", user.id);

      if (!token) throw new Error("No token returned from server");

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS, payload: { user } });
      toast.success("Registration successful");
      return { user, token };
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Registration failed";
      dispatch({ type: AUTH_ACTIONS.REGISTER_ERROR, payload: message });
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success("Logged out successfully");
  };

  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await axios.put("/auth/profile", profileData);
      const rawUser = response.data?.data?.user;
      const user = normalizeUser(rawUser);
      dispatch({ type: AUTH_ACTIONS.UPDATE_PROFILE, payload: user });
      toast.success("Profile updated");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Profile update failed";
      toast.error(message);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw error;
    }
  };

  const hasRole = (role) => state.user?.role === role;
  const canAccess = (roles) => !roles || roles.includes(state.user?.role);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        isAuthenticated: state.isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        hasRole,
        canAccess
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export default AuthContext;
