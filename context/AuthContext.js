import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";
import Router from "next/router";
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("crm_auth") || "null");
      if (s?.user) setUser(s.user);
    } catch (e) {}
    setLoading(false);
  }, []);
  useEffect(() => {
    if (user)
      localStorage.setItem(
        "crm_auth",
        JSON.stringify({
          user,
          accessToken: localStorage.getItem("crm_access"),
        })
      );
    else localStorage.removeItem("crm_auth");
  }, [user]);
  const login = async (email, password) => {
    const r = await api.post("/auth/login", { email, password });
    if (r.data.refreshToken)
      localStorage.setItem("crm_refresh", r.data.refreshToken);
    localStorage.setItem("crm_access", r.data.accessToken);
    setUser(r.data.user);
    return r.data;
  };
  const registerUser = async (userData) => {
    const r = await api.post("/auth/register", userData);
    return r.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {
        refreshToken: localStorage.getItem("crm_refresh"),
      });
    } catch (e) {}
    localStorage.removeItem("crm_refresh");
    localStorage.removeItem("crm_access");
    setUser(null);
    Router.push("/login");
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, registerUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
