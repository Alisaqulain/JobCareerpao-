"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.replace("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-gray">
        <p className="text-brand-slate">Loading admin panel...</p>
      </div>
    );
  }

  if (status !== "authenticated" || session?.user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-gray">
        <p className="text-brand-slate">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="p-6 pt-16 lg:pt-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
