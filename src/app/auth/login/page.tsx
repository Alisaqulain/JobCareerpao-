import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import { NO_INDEX } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Candidate Login",
  robots: NO_INDEX,
};

export default function CandidateLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
