import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="July 22, 2026"
      sections={[
        {
          heading: "Information We Collect",
          body: "We collect account details, profile information, application history, and usage data needed to operate JobCareerPao and improve our services.",
        },
        {
          heading: "How We Use Data",
          body: "Your data helps us match you with opportunities, process applications and fees, and keep the platform secure.",
        },
        {
          heading: "Sharing",
          body: "We share your application details with the company for the job you apply to. We never sell personal data.",
        },
        {
          heading: "Your Rights",
          body: "You may access, update, or delete your account data by contacting support@jobcareerpao.com.",
        },
      ]}
    />
  );
}

function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-brand-gray">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h1 className="font-display text-3xl font-bold text-brand-dark">{title}</h1>
          <p className="mt-2 text-sm text-brand-slate">Last updated: {updated}</p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-xl font-semibold text-brand-dark">{s.heading}</h2>
            <p className="mt-2 leading-relaxed text-slate-600">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}