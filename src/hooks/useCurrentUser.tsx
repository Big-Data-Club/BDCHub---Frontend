"use client";

import { useUser } from "@/store/UserContext";

export function useCurrentUser() {
  const { user, setUser } = useUser();

  const clearUser = () => setUser(null);

  return {
    user,
    loading: false,
    saveUser: setUser,
    clearUser,
    userId: user?.id ?? 1,
  };
}