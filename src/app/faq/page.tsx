import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata, faqPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "FAQ — Job Applications, Payments & Account Help",
  description:
    "Answers to common questions about JobCareerPao — how to apply for jobs, payment methods, profile setup, refunds, and account support.",
  path: "/faq",
  keywords: [
    "JobCareerPao FAQ",
    "how to apply for jobs online",
    "job application payment help",
    "Razorpay job fee",
    "job portal help India",
  ],
});

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
        q: "Why do you charge money to apply?",
        a: "The fee is a one-time processing charge for that application. It pays for receiving your form, storing your resume and answers, creating an application number, and placing the application with our hiring team for that employer. It does not guarantee a job or an interview. The amount is shown before you pay. Read Why we charge for the full explanation.",
      },
      {
        q: "Are application fees refundable?",
        a: "A fee is refunded if payment was taken but the application was not created, if you were charged twice, or if we withdrew the job before review and you ask within 7 days. It is not refunded only because you were not selected. See the Refund Policy.",
      },
    ],
  },
  {
    title: "Profile & Resume",
    items: [
      {
        q: "What file formats are accepted for resumes?",
        a: "PDF, DOC, and DOCX up to 5 MB. The file is stored in cloud file storage. Your account record keeps the link to that file.",
      },
      {
        q: "Where do you store my data, and how do you use it?",
        a: "Account, application, and payment references are stored in our cloud database (MongoDB Atlas). Resumes and photos are stored with Cloudinary. Card and UPI details are handled by Razorpay and are not saved on our servers. We use your details to run your account, process the job you applied for, send confirmation, and support you. We share an application with our hiring team and the employer for that job. We do not sell personal data. The Privacy Policy has the full account.",
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
      {
        q: "Where are the legal terms?",
        a: "The Legal page links to the Terms of Service, why we charge, privacy and data storage, refunds, cookies, the disclaimer, and grievance redressal. Creating an account includes agreeing to those terms.",
      },
    ],
  },
];

const allFaqItems = faqSections.flatMap((section) =>
  section.items.map((item) => ({ question: item.q, answer: item.a }))
);

export default function FaqPage() {
  return (
    <div className="bg-brand-gray min-h-screen">
      <JsonLd data={faqPageJsonLd(allFaqItems)} />
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

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-xl font-bold text-brand-dark">Legal documents</h2>
          <p className="mt-2 text-sm text-brand-slate">
            Fees, data storage, refunds, and the full terms are written out on these pages.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["/legal", "All policies"],
              ["/fees", "Why we charge"],
              ["/privacy", "Privacy & data"],
              ["/terms", "Terms"],
              ["/refund", "Refunds"],
              ["/grievance", "Grievance"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-brand-blue hover:bg-slate-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

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
