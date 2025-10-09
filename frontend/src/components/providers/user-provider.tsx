"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type User = {
  shopId: string;
  name: string;
  email: string;
  role: string;
  timer?: string | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setTimer: (timer: string | null) => void;
};

export function UserProvider({ children, user: initialUser }: { children: ReactNode; user?: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);

  const setName = (name: string) => user && setUser({ ...user, name });
  const setEmail = (email: string) => user && setUser({ ...user, email });
  const setTimer = (timer: string | null) => user && setUser({ ...user, timer });

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
