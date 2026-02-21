import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl, apiRequest } from "@/lib/query-client";

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  avatarUrl: string | null;
  stripeCustomerId: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  signUp: (email: string, password: string, name: string, phone?: string, role?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "@primemechanic_auth";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const checkMechanicProfile = async (userData: User) => {
    if (userData.role !== "mechanic") {
      setNeedsOnboarding(false);
      return;
    }
    try {
      const response = await fetch(
        new URL(`/api/users/${userData.id}/mechanic-profile`, getApiUrl()).href,
        { credentials: "include" }
      );
      if (response.status === 404) {
        setNeedsOnboarding(true);
      } else {
        setNeedsOnboarding(false);
      }
    } catch {
      setNeedsOnboarding(false);
    }
  };

  const loadStoredAuth = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const userData = JSON.parse(stored);
        setUser(userData);
        await checkMechanicProfile(userData);
      }
    } catch (error) {
      console.error("Failed to load auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, phone?: string, role?: string) => {
    const response = await apiRequest("POST", "/api/auth/signup", {
      email,
      password,
      name,
      phone: phone || null,
      role: role || "customer",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to sign up");
    }

    setUser(data.user);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));

    if ((role || "customer") === "mechanic") {
      setNeedsOnboarding(true);
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/signin", {
      email,
      password,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to sign in");
    }

    setUser(data.user);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
    await checkMechanicProfile(data.user);
  };

  const signOut = async () => {
    setUser(null);
    setNeedsOnboarding(false);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const completeOnboarding = () => {
    setNeedsOnboarding(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        needsOnboarding,
        signUp,
        signIn,
        signOut,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
