"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { AuthShell, AuthInput, AuthLink } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/jobs";
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signOut({ redirect: false });

      const result = await signIn("user-credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      toast.success("Welcome back!");
      window.location.href = redirect;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Candidate Login"
      subtitle="Welcome back — continue your career journey."
      footer={
        <>
          New here? <AuthLink href="/auth/signup">Create an account</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          required
          placeholder="you@email.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <AuthInput
          label="Password"
          type="password"
          required
          placeholder="Your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div className="flex justify-end">
          <AuthLink href="/auth/forgot-password">Forgot password?</AuthLink>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </Button>
      </form>
    </AuthShell>
  );
}
