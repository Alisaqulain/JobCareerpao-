"use client";

import { useEffect, useState } from "react";
import { AdminChart, StatCard } from "@/components/admin/AdminChart";
import { api } from "@/hooks/useApi";
import type { DashboardStats } from "@/types";
import { toast } from "sonner";

const EMPTY_STATS: DashboardStats = {
  totalJobs: 0,
  activeJobs: 0,
  inactiveJobs: 0,
  totalUsers: 0,
  totalApplications: 0,
  activeApplications: 0,
  todayApplications: 0,
  revenue: 0,
  pendingApplications: 0,
  selectedApplications: 0,
  rejectedApplications: 0,
  archivedApplications: 0,
  totalCompanies: 0,
  totalBlogs: 0,
  publishedBlogs: 0,
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [charts, setCharts] = useState<{
    applications: Array<{ label: string; value: number }>;
    revenue: Array<{ label: string; value: number }>;
    users: Array<{ label: string; value: number }>;
    jobs: Array<{ label: string; value: number }>;
    statusBreakdown: Array<{ label: string; value: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<DashboardStats>("/api/admin/dashboard"),
      api<typeof charts>("/api/admin/dashboard?type=charts"),
    ])
      .then(([statsRes, chartsRes]) => {
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        } else if (statsRes.message) {
          toast.error(statsRes.message);
        }
        if (chartsRes.success && chartsRes.data) {
          setCharts(chartsRes.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand-dark">Dashboard</h1>
      <p className="text-sm text-brand-slate">
        Overview — jobs, applicants, payments, and users
      </p>

      {loading ? (
        <p className="mt-8 text-brand-slate">Loading stats...</p>
      ) : (
        <>
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
        </>
      )}
    </>
  );
}
