import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, P, Ul } from "@/components/legal/LegalDocument";
import { buildPageMetadata } from "@/lib/seo";
import { LEGAL_EMAIL } from "@/lib/legal";

export const metadata: Metadata = buildPageMetadata({
  title: "Refund Policy — Application Fees",
  description:
    "JobCareerPao refund policy for job application fees: when a fee is refunded, when it is not, and how to request a refund with your payment reference.",
  path: "/refund",
});

export default function RefundPage() {
  return (
    <LegalDocument
      kicker="Refunds"
      title="Refund Policy"
      currentPath="/refund"
      summary="The application fee pays for processing your application. It is refunded when we take the money but do not deliver that processing, and it is not refunded only because the hiring result was not what you hoped."
      sections={[
        {
          id: "nature",
          heading: "What you paid for",
          body: (
            <P>
              The fee is a one-time charge to receive, store, and forward one application, as
              explained on the{" "}
              <Link className="font-semibold text-brand-blue" href="/fees">Why we charge</Link> page.
              Once that work is done, the fee has been used. It was never a deposit against a job offer.
            </P>
          ),
        },
        {
          id: "eligible",
          heading: "When we refund",
          body: (
            <Ul
              items={[
                "Razorpay captured the payment, but our system did not create the application because of a fault on our side.",
                "You were charged twice for the same application. The duplicate is refunded.",
                "We withdrew the job before your application was reviewed, and you ask for a refund within 7 days of the payment.",
                "We made a billing error and the amount taken was higher than the fee shown at checkout. The extra is refunded.",
              ]}
            />
          ),
        },
        {
          id: "not-eligible",
          heading: "When we do not refund",
          body: (
            <Ul
              items={[
                "You changed your mind after a valid application was submitted and paid.",
                "The employer did not shortlist you, did not call you, or rejected the application.",
                "The information you submitted was false, incomplete by your choice, or not yours, and we have already processed it.",
                "You paid from a payment method you were not allowed to use, and the bank later disputes it. That case is handled with Razorpay and your bank, and may also lead to account suspension.",
                "The hiring timeline was longer than you expected. We do not promise a call within a fixed number of days.",
              ]}
            />
          ),
        },
        {
          id: "how",
          heading: "How to ask",
          body: (
            <>
              <P>
                Email {LEGAL_EMAIL} from your registered email, or choose “Refund request” on the{" "}
                <Link className="font-semibold text-brand-blue" href="/contact">Contact page</Link>.
                Include:
              </P>
              <Ul
                items={[
                  "Your registered name and phone number.",
                  "The application number, if one was issued.",
                  "The Razorpay payment id or the receipt number from your profile.",
                  "The job title and the date you paid.",
                  "What went wrong, in a few lines.",
                ]}
              />
              <P>
                We acknowledge the request within 24 hours on business days. If the refund is
                approved, we send it back through Razorpay to the original payment method within
                5 to 7 business days. Your bank or UPI app can take further time to show the credit.
                We do not refund to a different person’s account.
              </P>
            </>
          ),
        },
        {
          id: "status",
          heading: "What you will see",
          body: (
            <P>
              An approved refund is marked on the payment in your profile. The application status
              will show that the payment was refunded. If we decline the request, we will say which
              rule on this page we relied on.
            </P>
          ),
        },
        {
          id: "chargeback",
          heading: "Bank disputes",
          body: (
            <P>
              If you raise a chargeback with your bank, tell us at the same time so we can match the
              payment. A chargeback on a fee for an application we actually processed may be
              contested with the application record and this policy. Misuse of chargebacks can lead
              to account closure.
            </P>
          ),
        },
      ]}
    />
  );
}
