import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { LEGAL_ADDRESS, LEGAL_EMAIL, LEGAL_UPDATED } from "@/lib/legal";

export const metadata: Metadata = buildPageMetadata({
  title: "Legal — Terms, Fees, Privacy, Refunds & Data",
  description:
    "JobCareerPao legal centre: why application fees are charged, where candidate data is stored, how it is used, terms of service, refunds, cookies, and grievance redressal.",
  path: "/legal",
});

const documents = [
  {
    href: "/terms",
    title: "Terms of Service",
    text: "The full rules for using JobCareerPao: accounts, job listings, payments, acceptable use, liability, and Indian law.",
  },
  {
    href: "/fees",
    title: "Why we charge",
    text: "What the application fee pays for, what it does not buy, and how the amount is shown before you pay.",
  },
  {
    href: "/privacy",
    title: "Privacy, storage & use",
    text: "What we collect, where it is stored, who can see an application, how long we keep it, and how to ask for deletion.",
  },
  {
    href: "/refund",
    title: "Refund Policy",
    text: "When an application fee can be refunded, when it cannot, and how to send a request.",
  },
  {
    href: "/cookies",
    title: "Cookies",
    text: "The sign-in cookie we set, the draft saved in your browser, and cookies used by Razorpay at checkout.",
  },
  {
    href: "/disclaimer",
    title: "Disclaimer",
    text: "JobCareerPao is not the employer. A paid application is not a job offer, and listings can change.",
  },
  {
    href: "/grievance",
    title: "Grievance redressal",
    text: "How to raise a complaint about your account, a payment, a listing, or your personal data.",
  },
];

export default function LegalHubPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-brand-gray">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">Legal</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-brand-dark sm:text-4xl">
            Legal terms
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-slate sm:text-base">
            Creating an account is free. When you apply for a job, you pay a one-time application
            processing fee. These pages explain why that fee exists, where your details and resume
            are stored, how we use them, and the rules that apply to every page of this website.
          </p>
          <p className="mt-4 text-xs text-brand-slate">Last updated: {LEGAL_UPDATED}</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {documents.map((doc) => (
            <Link
              key={doc.href}
              href={doc.href}
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-brand-cyan hover:shadow-soft"
            >
              <h2 className="font-display text-lg font-semibold text-brand-dark">{doc.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-slate">{doc.text}</p>
              <p className="mt-4 text-sm font-semibold text-brand-blue">Read policy</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-brand-gray p-6 text-sm leading-relaxed text-brand-slate">
          <h2 className="font-display text-lg font-semibold text-brand-dark">In short</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Joining JobCareerPao is free. There is no membership or subscription.</li>
            <li>
              The fee on a job is a processing charge for that application. It is shown before you pay.
              It does not buy a job or an interview.
            </li>
            <li>
              Account, application, and payment records are stored in our cloud database. Resumes and
              photos are stored in cloud file storage. Card and UPI details are handled by Razorpay,
              not saved on our servers.
            </li>
            <li>
              We use your application to submit it for the job you chose, to send you updates, and to
              support your account. We do not sell personal data.
            </li>
          </ul>
          <p className="mt-4">
            Email <a className="font-semibold text-brand-blue" href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>.
            Office: {LEGAL_ADDRESS}.
          </p>
        </div>
      </div>
    </div>
  );
}
