import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, P, Ul } from "@/components/legal/LegalDocument";
import { buildPageMetadata } from "@/lib/seo";
import { LEGAL_NAME } from "@/lib/legal";

export const metadata: Metadata = buildPageMetadata({
  title: "Disclaimer — Jobs, Fees & No Employment Guarantee",
  description:
    "JobCareerPao disclaimer: we are not the employer, a paid application is not a job offer, and listings, salaries, and outcomes can change.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <LegalDocument
      kicker="Disclaimer"
      title="Disclaimer"
      currentPath="/disclaimer"
      summary="Read this with the Terms of Service. It states the limits of what a listing and an application fee mean."
      sections={[
        {
          id: "not-employer",
          heading: "We are not the employer",
          body: (
            <P>
              {LEGAL_NAME} publishes listings and processes applications for roles at other
              organisations. Unless a listing clearly says the employer is {LEGAL_NAME}, your
              employer would be the company named on the job, and only if that company later hires
              you. We do not set their salary, notice period, or final selection.
            </P>
          ),
        },
        {
          id: "not-an-offer",
          heading: "A payment is not an offer",
          body: (
            <P>
              An application number, a receipt, or a “paid” status means the application was
              received. It is not an appointment letter, a selection letter, or an offer. Do not
              resign from a current job, pay a third party, or share further money with anyone who
              claims this receipt is enough to join. Hiring, if it happens, comes from the employer
              through their own process.
            </P>
          ),
        },
        {
          id: "listings",
          heading: "Listings can change",
          body: (
            <P>
              Salary bands, locations, qualifications, vacancy counts, and last dates come from the
              information used to publish the job. They can be updated or the job can be closed. We
              correct mistakes we learn about. We do not warrant that every figure on a listing stays
              unchanged after you apply.
            </P>
          ),
        },
        {
          id: "outcomes",
          heading: "Outcomes differ",
          body: (
            <P>
              Stories, counts, and ratings on the website describe the service. They are not a
              promise that you will be hired, or hired at a particular salary, or hired within a
              particular time. Your result depends on your profile and on the employer’s decision.
            </P>
          ),
        },
        {
          id: "third-parties",
          heading: "Other websites and payment screens",
          body: (
            <Ul
              items={[
                "Links to employers, social networks, or other sites leave this policy behind. Read their terms before you rely on them.",
                "The Razorpay window is operated by Razorpay. Enter payment details only inside that official checkout, opened from our pay button.",
                "We will not ask you to pay an extra “security deposit” or “registration” over WhatsApp, UPI to a personal number, or a link that is not on this website.",
              ]}
            />
          ),
        },
        {
          id: "advice",
          heading: "No professional advice",
          body: (
            <P>
              Articles on the blog are general career information. They are not legal, financial, or
              immigration advice. The fee and data rules that bind your use of the site are the{" "}
              <Link className="font-semibold text-brand-blue" href="/terms">Terms</Link>, the{" "}
              <Link className="font-semibold text-brand-blue" href="/fees">fee terms</Link>, and the{" "}
              <Link className="font-semibold text-brand-blue" href="/privacy">Privacy Policy</Link>.
            </P>
          ),
        },
      ]}
    />
  );
}
