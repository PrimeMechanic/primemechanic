import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

type UserRole = "customer" | "mechanic";

interface UserContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [role, setRole] = useState<UserRole>("customer");
  const { user } = useAuth();
  useEffect(() => {
    setRole(user?.role === "mechanic" ? "mechanic" : "customer");
  }, [user?.id, user?.role]);

  const toggleRole = () => {
    setRole((prev) => (prev === "customer" ? "mechanic" : "customer"));
  };

  return (
    <UserContext.Provider value={{ role, setRole, toggleRole }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
