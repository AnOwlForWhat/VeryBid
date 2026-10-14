"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  authApi,
  LoginRequest,
  RegisterRequest,
  UserProfile,
} from "@/services/authApi";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("vb_access_token");
    if (savedToken) {
      setToken(savedToken);
      authApi
        .getProfile()
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
          }
        })
        .catch(() => {
          localStorage.removeItem("vb_access_token");
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    const res = await authApi.login(credentials);
    if (res.success && res.data) {
      const accessToken = res.data.accessToken;
      localStorage.setItem("vb_access_token", accessToken);
      setToken(accessToken);
      // Fetch user profile
      const profileRes = await authApi.getProfile();
      if (profileRes.success) {
        setUser(profileRes.data);
      }
    } else {
      throw new Error(res.message || "Login failed");
    }
  };

  const register = async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    if (res.success && res.data) {
      const accessToken = res.data.accessToken;
      localStorage.setItem("vb_access_token", accessToken);
      setToken(accessToken);
      const profileRes = await authApi.getProfile();
      if (profileRes.success) {
        setUser(profileRes.data);
      }
    } else {
      throw new Error(res.message || "Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("vb_access_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
