import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, P, Ul } from "@/components/legal/LegalDocument";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Why We Charge an Application Fee",
  description:
    "Why JobCareerPao charges a one-time job application fee, what the fee pays for, what it does not guarantee, and how GST and Razorpay checkout work.",
  path: "/fees",
});

export default function FeesPage() {
  return (
    <LegalDocument
      kicker="Application fees"
      title="Why we take money to apply"
      currentPath="/fees"
      summary="Joining is free. The amount on a job is a one-time processing fee for that application. It is not a membership, and it is not a payment for a job."
      sections={[
        {
          id: "free-to-join",
          heading: "What is free",
          body: (
            <Ul
              items={[
                "Creating a candidate account.",
                "Browsing jobs and company pages.",
                "Reading the blog and contacting support.",
                "Tracking applications you have already submitted.",
              ]}
            />
          ),
        },
        {
          id: "what-the-fee-is",
          heading: "What the fee is",
          body: (
            <>
              <P>
                Each job can have its own application fee. You pay it once, for that job, when you
                submit the application. There is no monthly plan and no charge to keep the account open.
              </P>
              <P>
                The fee is a platform charge for processing the application. It is how the portal is
                paid for the work of taking applications on behalf of the employers whose roles we list.
              </P>
            </>
          ),
        },
        {
          id: "what-it-pays-for",
          heading: "What the fee pays for",
          body: (
            <Ul
              items={[
                "Receiving your application form and checking that the required fields are present.",
                "Storing your resume, photo, and answers securely so they are not lost after you close the browser.",
                "Creating an application number and a payment receipt you can open from your profile.",
                "Sending the confirmation email to your registered address.",
                "Making the application available to our hiring team for the company named on that job.",
                "Keeping the payment record needed for support, refunds, and accounting.",
                "Running the website, support desk, and payment checkout.",
              ]}
            />
          ),
        },
        {
          id: "what-it-does-not-buy",
          heading: "What the fee does not buy",
          body: (
            <Ul
              items={[
                "It does not guarantee a job, an interview call, a shortlist, or a joining date.",
                "It does not mean the employer has already selected you.",
                "It is not a government examination fee and not a fee charged inside a government portal.",
                "It is not a subscription. You are not billed again for the same application.",
                "It does not buy resume writing, interview coaching, or any add-on. We do not sell those as part of this fee.",
              ]}
            />
          ),
        },
        {
          id: "when-you-see-it",
          heading: "When you see the amount",
          body: (
            <>
              <P>
                The fee is shown on the job page before you start. It is shown again on the
                application form, on the review page, and on the secure checkout page. You pay only
                after you choose to continue. If GST applies, it appears as its own line in the fee
                breakdown. We do not add a hidden charge after you click pay.
              </P>
              <P>
                The total is in Indian Rupees. Checkout is handled by Razorpay, which supports UPI,
                cards, net banking, and wallets. Razorpay’s payment screen is the only place your
                card or UPI PIN is entered.
              </P>
            </>
          ),
        },
        {
          id: "who-sets-it",
          heading: "Who decides the amount",
          body: (
            <P>
              The fee is set on the job by our admin team when the listing is published. Different
              jobs can have different fees. If a listing has no payable fee configured, checkout
              cannot be completed for that job. The figure on the job page at the time you pay is
              the figure that applies to that application.
            </P>
          ),
        },
        {
          id: "after-you-pay",
          heading: "What happens after you pay",
          body: (
            <P>
              When Razorpay confirms the payment, we mark the application paid and email you. You
              can see the status under your profile. From that point the fee has been used to process
              the application. A later rejection, or a decision not to call you, is not a failed
              payment and is not by itself a reason for a refund. The cases where money is returned
              are listed in the{" "}
              <Link className="font-semibold text-brand-blue" href="/refund">Refund Policy</Link>.
            </P>
          ),
        },
        {
          id: "your-agreement",
          heading: "Your agreement when you pay",
          body: (
            <P>
              By paying, you confirm that you have read this page, the{" "}
              <Link className="font-semibold text-brand-blue" href="/terms">Terms of Service</Link>,
              and the Refund Policy, that the details in the application are yours and are true, and
              that you understand the fee is for processing only. The same confirmation is collected
              when you create an account.
            </P>
          ),
        },
      ]}
    />
  );
}
