"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { AuthShell, AuthInput } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [form, setForm] = useState({
    email: "admin@jobcareerpao.com",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signOut({ redirect: false });

      const result = await signIn("admin-credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid admin email or password");
      }

      toast.success("Welcome back, Admin!");
      window.location.href = "/admin";
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
