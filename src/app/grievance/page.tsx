import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, P, Ul } from "@/components/legal/LegalDocument";
import { buildPageMetadata } from "@/lib/seo";
import { LEGAL_ADDRESS, LEGAL_EMAIL, LEGAL_HOURS, LEGAL_NAME, LEGAL_PHONE } from "@/lib/legal";

export const metadata: Metadata = buildPageMetadata({
  title: "Grievance Redressal — Payments, Data & Accounts",
  description:
    "How to raise a grievance with JobCareerPao about an application fee, personal data, a listing, or your account, and when you can expect a response.",
  path: "/grievance",
});

export default function GrievancePage() {
  return (
    <LegalDocument
      kicker="Grievance"
      title="Grievance redressal"
      currentPath="/grievance"
      summary="If a payment, an application, or the handling of your personal data has gone wrong, write to the grievance contact below. We acknowledge complaints within 24 hours on business days and aim to close them within 15 days."
      sections={[
        {
          id: "officer",
          heading: "Who to contact",
          body: (
            <>
              <P>Grievance Officer, {LEGAL_NAME}</P>
              <Ul
                items={[
                  <>Email: <a className="font-semibold text-brand-blue" href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a></>,
                  <>Phone: {LEGAL_PHONE}</>,
                  <>Address: {LEGAL_ADDRESS}</>,
                  <>Hours: {LEGAL_HOURS}</>,
                ]}
              />
              <P>
                You can also start from the{" "}
                <Link className="font-semibold text-brand-blue" href="/contact">Contact page</Link>.
                Use the email above if the matter is about personal data, a fee, or a legal right,
                and put “Grievance” in the subject.
              </P>
            </>
          ),
        },
        {
          id: "include",
          heading: "What to include",
          body: (
            <Ul
              items={[
                "Your name, registered email, and phone number.",
                "Application number and Razorpay payment id, if the complaint is about a fee.",
                "What happened, and the date.",
                "What you want us to do: a correction, a deletion, a refund review, or an explanation.",
                "Any receipt or screenshot that shows the problem.",
              ]}
            />
          ),
        },
        {
          id: "timelines",
          heading: "What we do next",
          body: (
            <Ul
              items={[
                "We acknowledge the grievance within 24 hours on business days.",
                "We aim to resolve it within 15 days. If we need the bank or Razorpay to trace a payment, we will tell you, and that outside step can take longer.",
                "We will write the outcome to your registered email, including the reason if we cannot do what you asked.",
                "Refund decisions follow the Refund Policy. Data requests follow the Privacy Policy.",
              ]}
            />
          ),
        },
        {
          id: "topics",
          heading: "Complaints we handle here",
          body: (
            <Ul
              items={[
                "A fee was taken and the application was not created.",
                "A duplicate charge.",
                "You cannot access, correct, or delete your data.",
                "Your application was shared beyond the job you applied for.",
                "A listing or receipt is being misused.",
                "Your account was suspended and you want a review.",
              ]}
            />
          ),
        },
        {
          id: "after",
          heading: "If you are still not satisfied",
          body: (
            <P>
              You may approach the consumer forum or the authority available to you under Indian law,
              including the data protection routes under the Digital Personal Data Protection Act,
              2023 when they apply. Please use this process first so we have a chance to fix the
              issue. Courts at Bengaluru, Karnataka have jurisdiction for disputes under the{" "}
              <Link className="font-semibold text-brand-blue" href="/terms">Terms of Service</Link>,
              without taking away a forum the law itself gives you.
            </P>
          ),
        },
      ]}
    />
  );
}
