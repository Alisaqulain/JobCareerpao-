import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import ContactPageContent from "./ContactPageContent";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact JobCareerPao — Job Application & Payment Support",
  description:
    "Contact JobCareerPao for help with job applications, payments, account issues, and refunds. Email support@jobcareerpao.com — we respond within 24 hours.",
  path: "/contact",
  keywords: [
    "JobCareerPao contact",
    "job portal support",
    "application help",
    "payment support India",
    "customer care jobcareerpao",
  ],
});

export default function ContactPage() {
  return <ContactPageContent />;
}
