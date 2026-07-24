"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell, AuthLink, AuthInput } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { api } from "@/hooks/useApi";
import { toast } from "sonner";

export default function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";
  const phone = searchParams.get("phone") || "";
  const redirectParam = searchParams.get("redirect") || "";
  const job = searchParams.get("job") || "";
  const redirect = redirectParam.startsWith("/")
    ? redirectParam
    : job
      ? `/jobs/${job}/apply`
      : "/jobs";
  const isReset = searchParams.get("reset") === "1";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError("");
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const resendOtp = async () => {
    try {
      const res = await api("/api/auth/otp/send", {
        method: "POST",
        json: { email, purpose: isReset ? "reset" : "signup" },
      });
      if (!res.success) throw new Error(res.message);
      toast.success("OTP resent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend OTP");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length < 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      if (isReset) {
        const res = await api("/api/auth/reset-password", {
          method: "POST",
          json: { email, otp: otp.join(""), password: newPassword },
        });
        if (!res.success) throw new Error(res.message);
        toast.success("Password reset successful");
        router.push("/auth/login");
        return;
      }

      const res = await api("/api/auth/otp/verify", {
        method: "POST",
        json: {
          email,
          otp: otp.join(""),
          purpose: isReset ? "reset" : "signup",
          name,
          phone,
        },
      });

      if (!res.success) throw new Error(res.message);

      toast.success("Verified successfully!");
      window.location.href = redirect;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="OTP Verification"
      subtitle={`Enter the 6-digit code sent to ${email || "your email"}`}
      footer={
        <>
          Didn&apos;t receive it?{" "}
          <button type="button" className="font-semibold text-brand-cyan hover:text-brand-blue" onClick={resendOtp}>
            Resend OTP
          </button>
          <br />
          <span className="mt-2 inline-block">
            <AuthLink href="/auth/signup">Change email</AuthLink>
          </span>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2 sm:gap-3">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-12 w-10 rounded-xl border border-slate-200 bg-white text-center font-display text-lg font-bold text-brand-blue sm:h-14 sm:w-12"
            />
          ))}
        </div>
        {error && <p className="text-center text-sm text-red-500">{error}</p>}
        {isReset && (
          <AuthInput
            label="New Password"
            type="password"
            required
            placeholder="Min. 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        )}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Verifying..." : "Verify & Continue"}
        </Button>
      </form>
    </AuthShell>
  );
}
