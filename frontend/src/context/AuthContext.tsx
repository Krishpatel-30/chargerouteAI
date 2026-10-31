"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, LoginCredentials, RegisterData, GoogleAuthData } from "@/lib/types";
import { api } from "@/lib/api";
import {
  isFirebaseConfigured,
  signInWithGoogleFirebase,
  signInWithEmailFirebase,
  signUpWithEmailFirebase,
  sendPasswordResetFirebase as sendFirebasePasswordReset,
  logoutFirebase,
} from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isFirebaseEnabled: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  loginWithGoogle: (data: GoogleAuthData) => Promise<User>;
  loginWithFirebaseGoogle: () => Promise<User>;
  loginWithFirebaseEmail: (email: string, pass: string) => Promise<User>;
  registerWithFirebaseEmail: (email: string, pass: string, fullName?: string) => Promise<User>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("voltplan_token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await api.getMe();
      setUser(currentUser);
    } catch (err) {
      console.warn("Failed to restore authentication session:", err);
      localStorage.removeItem("voltplan_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (data: GoogleAuthData): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.loginWithGoogle(data);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithFirebaseGoogle = async (): Promise<User> => {
    setIsLoading(true);
    try {
      const { idToken, user: fbUser } = await signInWithGoogleFirebase();
      const res = await api.loginWithFirebase({
        id_token: idToken,
        email: fbUser.email || "",
        full_name: fbUser.displayName || undefined,
        firebase_uid: fbUser.uid,
        avatar_url: fbUser.photoURL || undefined,
      });
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithFirebaseEmail = async (email: string, pass: string): Promise<User> => {
    setIsLoading(true);
    try {
      const { idToken, user: fbUser } = await signInWithEmailFirebase(email, pass);
      const res = await api.loginWithFirebase({
        id_token: idToken,
        email: fbUser.email || email,
        full_name: fbUser.displayName || undefined,
        firebase_uid: fbUser.uid,
      });
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithFirebaseEmail = async (email: string, pass: string, fullName?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const { idToken, user: fbUser } = await signUpWithEmailFirebase(email, pass, fullName);
      const res = await api.loginWithFirebase({
        id_token: idToken,
        email: fbUser.email || email,
        full_name: fullName || fbUser.displayName || undefined,
        firebase_uid: fbUser.uid,
      });
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    if (isFirebaseConfigured()) {
      await sendFirebasePasswordReset(email);
    } else {
      await api.forgotPassword(email);
    }
  };

  const logout = async () => {
    try {
      await logoutFirebase();
    } catch (e) {
      // Ignore
    }
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isFirebaseEnabled: isFirebaseConfigured(),
        login,
        register,
        loginWithGoogle,
        loginWithFirebaseGoogle,
        loginWithFirebaseEmail,
        registerWithFirebaseEmail,
        sendPasswordResetEmail,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

