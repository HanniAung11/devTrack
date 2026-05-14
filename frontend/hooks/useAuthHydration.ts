"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

/** Waits until Zustand persist has rehydrated from localStorage (avoids false "logged out" on first paint). */

export function useAuthHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useAuthStore.persist;
    if (persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  return hydrated;
}
