"use client";

import { useState } from "react";

interface ApiOptions extends RequestInit {
  json?: unknown;
}

export async function api<T = unknown>(
  url: string,
  options: ApiOptions = {}
): Promise<{ success: boolean; data?: T; message?: string; pagination?: unknown }> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  let body = options.body;
  if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  }

  const res = await fetch(url, { ...options, headers, body, credentials: "include" });
  const contentType = res.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return res.json();
  }

  if (!res.ok) {
    throw new Error(`Request failed: ${res.statusText}`);
  }

  return { success: true, data: (await res.blob()) as unknown as T };
}

export function useApiState<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = async (fn: () => Promise<{ success: boolean; data?: T; message?: string }>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (!result.success) {
        throw new Error(result.message || "Request failed");
      }
      setData(result.data ?? null);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, data, execute, setData, setError };
}

export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
