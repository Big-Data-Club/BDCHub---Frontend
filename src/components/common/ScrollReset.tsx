"use client";

import { useEffect } from "react";

/**
 * Ensures the page scrolls to top on initial mount.
 * Useful for landing pages where browser scroll restoration or URL hashes
 * might lead the user to a sub-section on refresh when they expect the Hero section.
 */
export default function ScrollReset() {
  useEffect(() => {
    // 1. Force scroll to top on mount
    window.scrollTo(0, 0);

    // 2. Clear hash to prevent accidental jumps on refresh if the user 
    // was previously on an anchored section.
    if (window.location.hash) {
      // Use replaceState to not mess up the back button history
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return null;
}
