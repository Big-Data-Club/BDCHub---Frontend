"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from "react";
import { User, UserLogin } from "@/types";
import { USER_STORAGE_KEY } from "@/constants";
import { parseStoredUser } from "@/utils/auth/userProfileStorage";
import { useSession } from "next-auth/react";

interface UserContextType {
  user: User | UserLogin | null;
  setUser: Dispatch<SetStateAction<User | UserLogin | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, status } = useSession();
  const owner =
    status === "authenticated" && session?.user.id != null
      ? String(session.user.id)
      : null;
  const [user, setUser] = useState<User | UserLogin | null>(null);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!owner) {
      setUser(null);
      setRestored(true);
      return;
    }
    try {
      const stored = parseStoredUser(localStorage.getItem(USER_STORAGE_KEY));
      if (stored && String(stored.id) === owner) {
        setUser((current) =>
          current && String(current.id) === owner
            ? { ...stored, ...current }
            : current,
        );
      }
    } catch {
      /* Storage can be unavailable; the session still works in memory. */
    }
    setRestored(true);
  }, [status, owner]);

  useEffect(() => {
    if (!restored || status === "loading") return;
    try {
      if (owner && user && String(user.id) === owner)
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(parseStoredUser(JSON.stringify(user))),
        );
      else if (!owner) localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      /* Do not make browser storage a dependency of authentication. */
    }
  }, [user, restored, status, owner]);

  const currentUser = owner && user && String(user.id) === owner ? user : null;
  const value = useMemo(() => ({ user: currentUser, setUser }), [currentUser]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
