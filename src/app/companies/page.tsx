import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import CompaniesPageContent from "./CompaniesPageContent";

export const metadata: Metadata = buildPageMetadata({
  title: "Top Hiring Companies in India — IT, Hospital & Corporate Jobs",
  description:
    "Explore verified hiring companies on JobCareerPao — IT firms, hospitals, startups & enterprises across India. View open positions and apply online today.",
  path: "/companies",
  keywords: [
    "hiring companies India",
    "top companies hiring",
    "IT companies jobs",
    "hospital companies hiring",
    "employers India",
    "company job listings",
    "JobCareerPao companies",
  ],
});

export default function CompaniesPage() {
  return <CompaniesPageContent />;
}
