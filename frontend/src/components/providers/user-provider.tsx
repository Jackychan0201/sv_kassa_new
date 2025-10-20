"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type User = {
  shopId: string;
  name: string;
  email: string;
  role: string;
  timer?: string | null;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setTimer: (timer: string | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

type UserProviderProps = {
  children: ReactNode;
  user?: User | null;
};

export function UserProvider({ children, user: initialUser }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);

  const setName = (name: string) => setUser(prev => (prev ? { ...prev, name } : prev));
  const setEmail = (email: string) => setUser(prev => (prev ? { ...prev, email } : prev));
  const setTimer = (timer: string | null) => setUser(prev => (prev ? { ...prev, timer } : prev));

  return (
    <UserContext.Provider value={{ user, setUser, setName, setEmail, setTimer }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
