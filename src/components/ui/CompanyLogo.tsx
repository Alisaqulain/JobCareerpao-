"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CompanyLogoProps {
  name: string;
  logoUrl?: string;
  fallback: string;
  color: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { box: "h-10 w-10", text: "text-xs", pad: "p-1" },
  md: { box: "h-12 w-12", text: "text-sm", pad: "p-1.5" },
  lg: { box: "h-14 w-14", text: "text-base", pad: "p-2" },
  xl: { box: "h-16 w-16", text: "text-xl", pad: "p-2" },
};

export function CompanyLogo({
  name,
  logoUrl,
  fallback,
  color,
  size = "md",
  className,
}: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);
  const s = sizeMap[size];

  if (!logoUrl || failed) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-soft",
          s.box,
          s.text,
          className
        )}
        style={{ background: color }}
        title={name}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-soft",
        s.box,
        className
      )}
      title={name}
    >
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        fill
        className={cn("object-contain", s.pad)}
        onError={() => setFailed(true)}
        sizes="64px"
      />
    </div>
  );
}
