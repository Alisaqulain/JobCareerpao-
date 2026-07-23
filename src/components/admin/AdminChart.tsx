"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ["#0B4F8A", "#2DB6D6", "#F7941D", "#64748B"];

interface ChartProps {
  data: Array<{ label: string; value: number }>;
  title: string;
  type?: "bar" | "line" | "pie";
}

export function AdminChart({ data, title, type = "bar" }: ChartProps) {
  return (
    <div className="glass-strong rounded-2xl p-6">
      <h3 className="mb-4 font-display text-sm font-semibold text-brand-dark">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === "pie" ? (
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0B4F8A" strokeWidth={2} />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#2DB6D6" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  accent = "blue",
}: {
  label: string;
  value: string | number;
  accent?: "blue" | "cyan" | "orange" | "slate";
}) {
  const colors = {
    blue: "border-brand-blue/20 bg-brand-blue/5 text-brand-blue",
    cyan: "border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan",
    orange: "border-brand-orange/20 bg-brand-orange/5 text-brand-orange",
    slate: "border-slate-200 bg-slate-50 text-brand-slate",
  };

  return (
    <div className={cn("rounded-2xl border p-5", colors[accent])}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
