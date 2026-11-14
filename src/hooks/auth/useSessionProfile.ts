"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/store/UserContext";
import { userService } from "@/services/auth/userService";
import { clearAccessTokenCache } from "@/services/auth/authToken";
import { logout } from "@/services/auth/logout";

/** Session owns identity; profile requests may only enrich that same identity. */
export function useSessionProfile() {
  const { data: session, status } = useSession();
  const { setUser } = useUser();
  const identity = useRef<string | null>(null);
  const loaded = useRef<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.error === "RefreshAccessTokenError") {
      void logout();
      return;
    }
    const member = session?.user;
    const id = member?.id;
    const owner = status === "authenticated" && id != null ? String(id) : null;
    if (identity.current !== owner) {
      const previous = identity.current;
      identity.current = owner;
      loaded.current = null;
      // Initial session hydration may already have role requests in flight.
      // Only a known identity transition invalidates those requests.
      if (previous !== null) clearAccessTokenCache();
    }
    if (!owner || !member || id == null) {
      setUser(null);
      return;
    }
    setUser((previous) => ({
      ...(previous && String(previous.id) === owner ? previous : {}),
      id,
      name: member.name || "",
      email: member.email || "",
      role: member.role || "",
      profilePicture:
        member.profilePicture ||
        member.image ||
        (previous && String(previous.id) === owner
          ? previous.profilePicture
          : undefined),
    }));
    let active = true;
    let pending: AbortController | null = null;
    const load = async () => {
      if (pending || loaded.current === owner) return;
      const controller = new AbortController();
      pending = controller;
      try {
        const profile = await userService.getById(id, {
          signal: controller.signal,
        });
        if (
          !active ||
          controller.signal.aborted ||
          identity.current !== owner ||
          String(profile.id) !== owner
        )
          return;
        loaded.current = owner;
        setUser({
          ...profile,
          profilePicture:
            profile.profilePicture ||
            member.profilePicture ||
            member.image ||
            undefined,
        });
      } catch {
        /* Keep session metadata; retry profile enrichment on focus or reconnect. */
      } finally {
        if (pending === controller) pending = null;
      }
    };
    void load();
    window.addEventListener("focus", load);
    window.addEventListener("online", load);
    return () => {
      active = false;
      pending?.abort();
      window.removeEventListener("focus", load);
      window.removeEventListener("online", load);
    };
  }, [session, status, setUser]);
}
