import type { Metadata } from "next";
import { NO_INDEX } from "@/lib/seo";

export const metadata: Metadata = {
  title: "System Check",
  robots: NO_INDEX,
};

export default function CheckLayout({ children }: { children: React.ReactNode }) {
  return children;
}
