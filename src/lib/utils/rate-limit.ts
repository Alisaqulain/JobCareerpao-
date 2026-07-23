const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  store.set(key, entry);
  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

export function getOtpRateLimitKey(email: string, ip: string) {
  return `otp:${email.toLowerCase()}:${ip}`;
}

export function getOtpRateLimitConfig() {
  return {
    max: Number(process.env.OTP_RATE_LIMIT_MAX || 5),
    windowMs: Number(process.env.OTP_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  };
}
