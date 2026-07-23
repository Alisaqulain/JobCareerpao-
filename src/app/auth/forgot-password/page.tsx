"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, AuthInput, AuthLink } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { api } from "@/hooks/useApi";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api("/api/auth/otp/send", {
        method: "POST",
        json: { email, purpose: "reset" },
      });
      if (!res.success) throw new Error(res.message);
      toast.success("OTP sent");
      router.push(`/auth/otp?email=${encodeURIComponent(email)}&reset=1`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="Enter your email and we'll send a verification OTP."
      footer={
        <>
          Remembered it? <AuthLink href="/auth/login">Back to Login</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </Button>
      </form>
    </AuthShell>
  );
}
