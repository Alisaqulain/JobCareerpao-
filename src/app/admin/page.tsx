"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminChart, StatCard } from "@/components/admin/AdminChart";
import { api } from "@/hooks/useApi";
import type { DashboardStats } from "@/types";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<{
    applications: Array<{ label: string; value: number }>;
    revenue: Array<{ label: string; value: number }>;
    users: Array<{ label: string; value: number }>;
    jobs: Array<{ label: string; value: number }>;
    statusBreakdown: Array<{ label: string; value: number }>;
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.replace("/");
      return;
    }
    if (status === "authenticated") {
      Promise.all([
        api<DashboardStats>("/api/admin/dashboard"),
        api<typeof charts>("/api/admin/dashboard?type=charts"),
      ]).then(([statsRes, chartsRes]) => {
        if (statsRes.data) setStats(statsRes.data);
        if (chartsRes.data) setCharts(chartsRes.data);
      });
    }
  }, [status, session, router]);

  if (status === "loading" || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-gray">
        <p className="text-brand-slate">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="p-6 pt-16 lg:pt-6 lg:p-8">
          <h1 className="font-display text-2xl font-bold text-brand-dark">Dashboard</h1>
          <p className="text-sm text-brand-slate">Overview of your job portal</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Jobs" value={stats.totalJobs} />
            <StatCard label="Active Jobs" value={stats.activeJobs} accent="cyan" />
            <StatCard label="Total Users" value={stats.totalUsers} accent="orange" />
            <StatCard label="Revenue (₹)" value={stats.revenue.toLocaleString("en-IN")} />
            <StatCard label="Total Applications" value={stats.totalApplications} />
            <StatCard label="Today's Applications" value={stats.todayApplications} accent="cyan" />
            <StatCard label="Pending" value={stats.pendingApplications} accent="slate" />
            <StatCard label="Selected" value={stats.selectedApplications} accent="cyan" />
            <StatCard label="Companies" value={stats.totalCompanies} accent="orange" />
            <StatCard label="Published Blogs" value={stats.publishedBlogs} />
          </div>

          {charts && (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <AdminChart data={charts.applications} title="Applications (6 months)" />
              <AdminChart data={charts.revenue} title="Revenue (6 months)" type="line" />
              <AdminChart data={charts.users} title="New Users" />
              <AdminChart data={charts.statusBreakdown} title="Application Status" type="pie" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
