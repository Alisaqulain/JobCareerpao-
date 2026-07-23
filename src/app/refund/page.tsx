import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-brand-gray">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h1 className="font-display text-3xl font-bold text-brand-dark">Refund Policy</h1>
          <p className="mt-2 text-sm text-brand-slate">Last updated: July 22, 2026</p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        {[
          {
            h: "Eligibility",
            b: "Refund requests for application fees may be submitted within 7 days if your application was not processed. Contact support with your payment reference.",
          },
          {
            h: "Process",
            b: "Email support@jobcareerpao.com with your registered email and payment reference. Approved refunds are processed within 5–7 business days.",
          },
          {
            h: "Non-refundable",
            b: "Consumed interview assistance sessions and promotional add-ons are generally non-refundable once delivered.",
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