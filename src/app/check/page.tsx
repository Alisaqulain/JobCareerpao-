"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  Database,
  CreditCard,
  Mail,
  Cloud,
  Shield,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { HealthReport, HealthCheckItem, HealthStatus } from "@/lib/services/health.service";

const statusIcon: Record<HealthStatus, typeof CheckCircle2> = {
  ok: CheckCircle2,
  warn: AlertTriangle,
  error: XCircle,
};

const statusColor: Record<HealthStatus, string> = {
  ok: "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  warn: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
  error: "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
};

function CheckRow({ item }: { item: HealthCheckItem }) {
  const Icon = statusIcon[item.status];
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${statusColor[item.status]}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-brand-dark dark:text-white">{item.name}</p>
          <span className="rounded-md bg-white/60 dark:bg-black/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            {item.status}
          </span>
          <span className="text-[10px] uppercase text-brand-slate">{item.category}</span>
        </div>
        <p className="mt-1 text-sm opacity-90">{item.message}</p>
        {item.detail && (
          <p className="mt-1 truncate font-mono text-xs opacity-70">{item.detail}</p>
        )}
      </div>
    </div>
  );
}

export default function CheckPage() {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/check?live=true");
      const json = await res.json();
      if (json.data) {
        setReport(json.data);
      } else {
        setError(json.message || "Check failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  const envChecks = report?.checks.filter((c) => c.category === "env") ?? [];
  const serviceChecks = report?.checks.filter((c) => c.category === "service") ?? [];

  return (
    <div className="min-h-screen bg-brand-gray dark:bg-slate-950 py-10">
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-brand-dark dark:text-white">
              Environment Check
            </h1>
            <p className="mt-1 text-sm text-brand-slate">
              Verify all environment variables and third-party services are working.
            </p>
          </div>
          <Button onClick={runCheck} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Checking..." : "Re-run Checks"}
          </Button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {report && (
          <>
            <div
              className={`mt-6 rounded-2xl border p-6 ${
                report.ok
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
              }`}
            >
              <div className="flex items-center gap-3">
                {report.ok ? (
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-600" />
                )}
                <div>
                  <p className="font-display text-xl font-bold dark:text-white">
                    {report.ok ? "All systems operational" : "Issues detected"}
                  </p>
                  <p className="text-sm text-brand-slate">
                    {report.summary.ok} OK · {report.summary.warn} warnings · {report.summary.error} errors
                  </p>
                  <p className="mt-1 text-xs text-brand-slate">
                    Last checked: {new Date(report.checkedAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {[
                { icon: Database, label: "MongoDB", id: "mongodb" },
                { icon: Cloud, label: "Cloudinary", id: "cloudinary" },
                { icon: CreditCard, label: "Razorpay", id: "razorpay" },
                { icon: Mail, label: "Gmail OTP", id: "gmail" },
                { icon: Mail, label: "Resend", id: "resend" },
              ].map(({ icon: Icon, label, id }) => {
                const check = report.checks.find((c) => c.id === id);
                const st = check?.status ?? "error";
                return (
                  <div
                    key={id}
                    className={`rounded-xl border p-4 text-center ${statusColor[st]}`}
                  >
                    <Icon className="mx-auto h-6 w-6" />
                    <p className="mt-2 text-sm font-semibold">{label}</p>
                    <p className="text-xs capitalize">{check?.message ?? "Not checked"}</p>
                  </div>
                );
              })}
            </div>

            <section className="mt-10">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold dark:text-white">
                <Shield className="h-5 w-5 text-brand-blue" />
                Environment Variables
              </h2>
              <div className="mt-4 space-y-2">
                {envChecks.map((item) => (
                  <CheckRow key={item.id} item={item} />
                ))}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold dark:text-white">
                <Server className="h-5 w-5 text-brand-cyan" />
                Live Service Tests
              </h2>
              <div className="mt-4 space-y-2">
                {serviceChecks.map((item) => (
                  <CheckRow key={item.id} item={item} />
                ))}
              </div>
            </section>

            <div className="mt-10 flex flex-wrap gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-sm">
              <p className="w-full text-brand-slate">
                JSON API:{" "}
                <Link href="/api/check" className="font-mono text-brand-blue hover:underline">
                  /api/check
                </Link>
                {" · "}
                <Link href="/api/check?live=false" className="font-mono text-brand-blue hover:underline">
                  /api/check?live=false
                </Link>
                <span className="inline-flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                </span>
              </p>
              <Button href="/" variant="ghost" size="sm">← Home</Button>
              <Button href="/admin/login" variant="outline" size="sm">Admin Login</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
