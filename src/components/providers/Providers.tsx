"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </SessionProvider>
  );
}
