"use client";

import { useAuthStore } from "@/lib/store/auth.store";
import { useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Initialize auth on mount
  const initAuth = useAuthStore((state) => state.initAuth);
  
  useEffect(() => {
    // Initialize auth store
    initAuth();
  }, [initAuth]);

  return <>{children}</>;
}
