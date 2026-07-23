"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell, AuthInput, AuthDivider, AuthLink } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { api } from "@/hooks/useApi";
import { toast } from "sonner";

export default function CandidateSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "";
  const job = searchParams.get("job") || "";
  const redirect = job
    ? `/jobs/${job}/apply`
    : redirectParam.startsWith("/")
      ? redirectParam
      : "/jobs";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api("/api/auth/otp/send", {
        method: "POST",
        json: {
          email: form.email,
          purpose: "signup",
          name: form.name,
          phone: form.phone,
          password: form.password,
        },
      });
      if (!res.success) throw new Error(res.message);

      toast.success("OTP sent to your email");
      const params = new URLSearchParams();
      params.set("email", form.email);
      params.set("name", form.name);
      params.set("phone", form.phone);
      params.set("redirect", redirect);
      if (job) params.set("job", job);
      router.push(`/auth/otp?${params.toString()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create Candidate Account"
      subtitle="Join JobCareerPao and unlock verified opportunities."
      footer={
        <>
          Already have an account? <AuthLink href="/auth/login">Login</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Full Name"
          required
          placeholder="Priya Sharma"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <AuthInput
          label="Email"
          type="email"
          required
          placeholder="you@email.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <AuthInput
          label="Phone"
          type="tel"
          required
          placeholder="+91 98765 43210"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <AuthInput
          label="Password"
          type="password"
          required
          placeholder="Min. 8 characters"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <label className="flex items-start gap-2 text-xs text-brand-slate">
          <input type="checkbox" required className="mt-0.5 rounded border-slate-300" />
          I agree to the{" "}
          <AuthLink href="/terms">Terms</AuthLink> and{" "}
          <AuthLink href="/privacy">Privacy Policy</AuthLink>
        </label>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Sending OTP..." : "Create Account"}
        </Button>
      </form>
      <AuthDivider />
      <Button href="/auth/login" variant="outline" className="w-full">
        Sign in instead
      </Button>
    </AuthShell>
  );
}
