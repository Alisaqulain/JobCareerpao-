import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(min: number, max: number) {
  const fmt = (n: number) => {
    if (!Number.isFinite(n) || n <= 0) return "₹0";
    if (n >= 100000) {
      const lpa = n / 100000;
      return `₹${lpa % 1 === 0 ? lpa.toFixed(0) : lpa.toFixed(1)} LPA`;
    }
    if (n >= 1000) {
      const k = n / 1000;
      return `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
    }
    return `₹${n.toLocaleString("en-IN")}`;
  };

  if ((!min || min <= 0) && (!max || max <= 0)) {
    return "Salary not disclosed";
  }

  return `${fmt(min)} - ${fmt(max)}`;
}