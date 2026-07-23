"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, AuthInput } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { api } from "@/hooks/useApi";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api("/api/auth/admin/login", {
        method: "POST",
        json: form,
      });
      if (!res.success) throw new Error(res.message);
      toast.success("Welcome back, Admin!");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Admin Login" subtitle="Secure access to the admin dashboard.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Admin Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <AuthInput
          label="Password"
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Signing in..." : "Login to Admin"}
        </Button>
      </form>
    </AuthShell>
  );
}
