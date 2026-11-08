import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest, queryClient, setAccessToken } from "@/lib/query-client";

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  avatarUrl: string | null;
}
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone?: string,
    role?: string,
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const key = "primemechanic-session-v1";
async function persist(token: string | null) {
  if (Platform.OS === "web") return;
  if (token) await SecureStore.setItemAsync(key, token);
  else await SecureStore.deleteItemAsync(key);
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [needsOnboarding, setOnboarding] = useState(false);
  async function checkProfile(current: User) {
    if (current.role !== "mechanic") {
      setOnboarding(false);
      return;
    }
    try {
      const response = await apiRequest(
        "GET",
        `/api/users/${current.id}/mechanic-profile`,
      );
      const profile = await response.json();
      setOnboarding(!profile.onboardingSubmittedAt);
    } catch {
      setOnboarding(true);
    }
  }
  useEffect(() => {
    let disposed = false;
    (async () => {
      try {
        await AsyncStorage.removeItem("@primemechanic_auth");
        const token =
          Platform.OS === "web" ? null : await SecureStore.getItemAsync(key);
        if (!token) return;
        setAccessToken(token);
        const response = await apiRequest("GET", "/api/auth/me");
        const data = await response.json();
        if (!disposed) {
          setUser(data.user);
          await checkProfile(data.user);
        }
      } catch {
        setAccessToken(null);
        await persist(null);
      } finally {
        if (!disposed) setLoading(false);
      }
    })();
    return () => {
      disposed = true;
    };
  }, []);
  async function enter(endpoint: string, input: unknown) {
    const response = await apiRequest("POST", endpoint, input);
    const data = await response.json();
    setAccessToken(data.token);
    await persist(data.token);
    await queryClient.cancelQueries();
    queryClient.clear();
    await checkProfile(data.user);
    setUser(data.user);
  }
  async function signOut() {
    try {
      await apiRequest("POST", "/api/auth/signout");
    } finally {
      setAccessToken(null);
      await persist(null);
      await queryClient.cancelQueries();
      queryClient.clear();
      setUser(null);
      setOnboarding(false);
    }
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        needsOnboarding,
        signUp: (email, password, name, phone, role) =>
          enter("/api/auth/signup", {
            email,
            password,
            name,
            phone: phone || null,
            role: role || "customer",
          }),
        signIn: (email, password) =>
          enter("/api/auth/signin", { email, password }),
        signOut,
        completeOnboarding: () => setOnboarding(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider required");
  return value;
}
