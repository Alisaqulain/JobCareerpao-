import { Suspense } from "react";
import type { Metadata } from "next";
import SignupForm from "./SignupForm";
import { NO_INDEX } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Candidate Signup",
  description: "Create your JobCareerPao candidate account and start applying to verified jobs.",
  robots: NO_INDEX,
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}