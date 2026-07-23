import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-brand-gray">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h1 className="font-display text-3xl font-bold text-brand-dark">Terms of Service</h1>
          <p className="mt-2 text-sm text-brand-slate">Last updated: July 22, 2026</p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        {[
          {
            h: "Acceptance",
            b: "By creating an account on JobCareerPao, you agree to these terms and our Privacy Policy.",
          },
          {
            h: "Accounts",
            b: "You are responsible for maintaining accurate profile information and securing your login credentials.",
          },
          {
            h: "Application Fees",
            b: "Each job may require a one-time application fee. Fees are shown before you apply and are processed securely at checkout.",
          },
          {
            h: "Acceptable Use",
            b: "Do not post false information or spam applications. Violations may result in account suspension.",
          },
        ].map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-xl font-semibold text-brand-dark">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-slate-600">{s.b}</p>
          </section>
        ))}
      </div>
    </div>
  );
}