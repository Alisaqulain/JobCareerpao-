"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

const faqs = [
  {
    q: "How do I apply for a job on JobCareerPao?",
    a: "Create a free account, complete your profile, browse jobs, and click Apply. Fill the application form and pay the job-specific application fee via Razorpay.",
  },
  {
    q: "Is there a membership or subscription fee?",
    a: "No. JobCareerPao is free to join. You only pay the application fee listed on each job when you apply.",
  },
  {
    q: "How can I track my application status?",
    a: "Log in and visit your Dashboard (Profile). All applied jobs and payment history are listed with real-time status updates.",
  },
  {
    q: "Who posts jobs on this platform?",
    a: "Our admin team posts and verifies all jobs on behalf of companies. Companies do not log in directly — every listing is manually reviewed.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept UPI, credit/debit cards, net banking, and wallets through Razorpay's secure payment gateway.",
  },
];

export function HomeFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-brand-gray dark:bg-slate-900 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Got Questions?"
          title="Frequently Asked Questions"
          description="Everything you need to know about applying on JobCareerPao."
          align="center"
        />
        <div className="mt-10 space-y-3">
          {faqs.map((faq, i) => (
            <div key={faq.q} className="glass-strong overflow-hidden rounded-2xl">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-display text-sm font-semibold text-brand-dark dark:text-white pr-4">
                  {faq.q}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-brand-cyan transition ${open === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 text-sm text-brand-slate">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button href="/faq" variant="outline">View All FAQs</Button>
        </div>
      </div>
    </section>
  );
}
