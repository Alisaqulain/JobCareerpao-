import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about JobCareerPao — applications, payments, and accounts.",
};

const faqSections = [
  {
    title: "Getting Started",
    items: [
      {
        q: "Who can use JobCareerPao?",
        a: "Any job seeker in India looking for verified corporate roles. Create a free account, complete your profile, and start applying.",
      },
      {
        q: "Do companies log in to post jobs?",
        a: "No. Jobs are created and published by our admin team on behalf of partner companies. You only need a candidate account.",
      },
      {
        q: "Is there a membership or subscription plan?",
        a: "No. You pay only the one-time application fee listed on each job when you apply.",
      },
    ],
  },
  {
    title: "Applications & Payments",
    items: [
      {
        q: "What is the application flow?",
        a: "Browse jobs → open a listing → fill the dynamic application form → pay via Razorpay → receive confirmation email → track status in your profile.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We use Razorpay which supports UPI, credit/debit cards, net banking, and popular wallets.",
      },
      {
        q: "Can I apply to the same job twice?",
        a: "No. Each user can submit one paid application per job. Check your profile for existing applications.",
      },
      {
        q: "Are application fees refundable?",
        a: "Application fees are generally non-refundable once submitted. See our Refund Policy for exceptions.",
      },
    ],
  },
  {
    title: "Profile & Resume",
    items: [
      {
        q: "What file formats are accepted for resumes?",
        a: "PDF, DOC, and DOCX up to 5 MB. Resumes are stored securely on Cloudinary — only the URL is saved in your profile.",
      },
      {
        q: "Do I need a complete profile before applying?",
        a: "Yes. You should upload your resume and fill basic details before starting an application.",
      },
    ],
  },
  {
    title: "Account & Support",
    items: [
      {
        q: "How do I reset my password?",
        a: "Use Forgot Password on the login page. We will send an OTP to your registered email.",
      },
      {
        q: "How do I contact support?",
        a: "Email support@jobcareerpao.com or use the Contact page. We respond within 24 hours on business days.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="bg-brand-gray min-h-screen">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-3xl font-bold text-brand-dark sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-brand-slate">
            Everything you need to know about applying on JobCareerPao.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        {faqSections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-bold text-brand-dark">{section.title}</h2>
            <div className="mt-4 space-y-3">
              {section.items.map((item) => (
                <details
                  key={item.q}
                  className="group glass-strong rounded-2xl p-5 open:shadow-soft"
                >
                  <summary className="cursor-pointer list-none font-medium text-brand-dark marker:content-none">
                    <span className="flex items-center justify-between gap-2">
                      {item.q}
                      <span className="text-brand-cyan transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-brand-slate">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <div className="rounded-2xl bg-gradient-to-br from-brand-blue to-brand-cyan p-8 text-center text-white">
          <h2 className="font-display text-xl font-bold">Still have questions?</h2>
          <p className="mt-2 text-sm text-blue-100">Our support team is happy to help.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/contact" variant="orange">
              Contact Support
            </Button>
            <Link
              href="/jobs"
              className="inline-flex items-center rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold hover:bg-white/10"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
