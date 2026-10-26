import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, P, Ul } from "@/components/legal/LegalDocument";
import { buildPageMetadata } from "@/lib/seo";
import { LEGAL_EMAIL, LEGAL_NAME, LEGAL_SITE } from "@/lib/legal";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service — Accounts, Fees, Data & Use",
  description:
    "JobCareerPao terms of service: eligibility, accounts, why application fees are charged, payments, data use, acceptable use, refunds, liability, and governing law in India.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      currentPath="/terms"
      summary="These terms are the agreement between you and JobCareerPao for using this website, creating an account, applying for jobs, and paying an application fee."
      sections={[
        {
          id: "agreement",
          heading: "Agreement",
          body: (
            <>
              <P>
                These Terms of Service apply to {LEGAL_SITE} and the JobCareerPao job application
                service (the “platform”). By creating an account, browsing jobs, submitting an
                application, or paying a fee, you agree to these terms, the{" "}
                <Link className="font-semibold text-brand-blue" href="/privacy">Privacy Policy</Link>,
                the <Link className="font-semibold text-brand-blue" href="/fees">application fee terms</Link>,
                and the <Link className="font-semibold text-brand-blue" href="/refund">Refund Policy</Link>.
              </P>
              <P>
                If you do not agree, do not create an account or pay an application fee. You can
                still read public job listings.
              </P>
            </>
          ),
        },
        {
          id: "who-we-are",
          heading: "Who we are",
          body: (
            <>
              <P>
                {LEGAL_NAME} operates an online job portal for candidates in India. Our team publishes
                job listings for partner employers. Employers do not log in to post jobs themselves.
                We receive your application, store it, and make it available to our hiring operations
                team for the employer named on that job.
              </P>
              <P>
                We are a facilitator. We are not the employer, unless a particular listing expressly
                says the role is with {LEGAL_NAME}. A payment to us is not a payment to the employer,
                and it is not an offer of employment.
              </P>
            </>
          ),
        },
        {
          id: "eligibility",
          heading: "Who may use the platform",
          body: (
            <Ul
              items={[
                "You must be at least 18 years old and able to enter a contract under Indian law.",
                "You must apply only for yourself, using your own identity, phone number, and email.",
                "You must give information that is true, current, and complete.",
                "The platform is meant for genuine job seekers. It is not for bulk scraping, resale of listings, or automated applications.",
              ]}
            />
          ),
        },
        {
          id: "accounts",
          heading: "Accounts",
          body: (
            <>
              <P>
                Creating an account is free. You register with your name, email, phone number, and a
                password. We send a one-time password to your email to confirm it. You are responsible
                for keeping your password private and for activity under your account.
              </P>
              <P>
                Tell us promptly at {LEGAL_EMAIL} if you believe someone else has used your account.
                We may suspend an account that is used for fraud, false applications, abuse of staff,
                or a breach of these terms.
              </P>
            </>
          ),
        },
        {
          id: "listings",
          heading: "Job listings",
          body: (
            <>
              <P>
                Listings are prepared by our admin team from information provided for hiring. Title,
                company, location, salary range, qualification, last date, and fee can change or be
                withdrawn. A listing is an invitation to apply through this platform. It is not a
                promise that a vacancy is still open, that you meet the criteria, or that you will be
                contacted.
              </P>
              <P>
                You may submit one paid application per job per account. A second payment for the same
                job is not required and, if it happens because of a technical duplicate, is refundable
                under the Refund Policy.
              </P>
            </>
          ),
        },
        {
          id: "fees",
          heading: "Why an application fee is charged",
          body: (
            <>
              <P>
                There is no membership. When a job shows an application fee, that fee is the charge
                for us to process that one application. It pays for the work of receiving your form,
                storing your resume and answers, creating an application number, sending confirmation,
                keeping a payment record, and placing the application with our team for the employer
                on that listing.
              </P>
              <P>
                The fee does not purchase a job, an interview, a shortlist, or a reply from the
                employer. Selection is a separate hiring decision. The amount, including GST if it
                applies, is shown on the job, on the review screen, and again at checkout before you
                pay. Full detail is on the{" "}
                <Link className="font-semibold text-brand-blue" href="/fees">Why we charge</Link> page,
                which is part of these terms.
              </P>
            </>
          ),
        },
        {
          id: "payments",
          heading: "Payments",
          body: (
            <>
              <P>
                Fees are charged in Indian Rupees through Razorpay. You can pay by the methods
                Razorpay offers at checkout, such as UPI, cards, net banking, and wallets. Razorpay
                collects the payment instrument details. We store the order reference, payment
                reference, amount, tax line if any, status, and receipt. We do not store your card
                number, CVV, or UPI PIN.
              </P>
              <P>
                A payment is complete only when Razorpay confirms it and we mark the application as
                paid. If money is taken and the application is not created because of a failure on
                our side, you are entitled to a refund as described in the Refund Policy. You must
                use a payment method you are authorised to use.
              </P>
            </>
          ),
        },
        {
          id: "no-guarantee",
          heading: "No guarantee of employment",
          body: (
            <P>
              Paying the fee and receiving an application number means we have accepted your
              application for processing. It does not mean you are selected, shortlisted, or called
              for an interview. Employers may reject an application, change a role, or close hiring
              without further notice. We do not guarantee response time from an employer.
            </P>
          ),
        },
        {
          id: "your-content",
          heading: "Information you submit",
          body: (
            <>
              <P>
                You are responsible for your profile, resume, photograph, education, experience, and
                form answers. Do not upload someone else’s resume, forged certificates, or content you
                have no right to share. Do not include passwords, Aadhaar numbers, or bank details in
                a resume or form unless a specific field on that application asks for an identifier
                the employer needs, and even then share only what that field requires.
              </P>
              <P>
                You give us permission to store that material and to use it for the application you
                submitted, as described in the Privacy Policy. We may reject an application that
                contains false or unlawful content. If we have already done the processing work, the
                fee is generally not refunded.
              </P>
            </>
          ),
        },
        {
          id: "data",
          heading: "Where data is stored and how it is used",
          body: (
            <P>
              Account records, applications, and payment references are stored in our cloud database.
              Resumes and photos are stored in cloud file storage. How long we keep each kind of
              data, who can see it, and how to request access or deletion is set out in the{" "}
              <Link className="font-semibold text-brand-blue" href="/privacy">Privacy Policy</Link>.
              That policy is part of these terms.
            </P>
          ),
        },
        {
          id: "acceptable-use",
          heading: "Acceptable use",
          body: (
            <Ul
              items={[
                "Do not create fake accounts or apply in another person’s name.",
                "Do not probe, scrape, overload, or attempt to break the website, payment flow, or other people’s data.",
                "Do not upload malware, or content that is defamatory, obscene, or unlawful.",
                "Do not misuse support channels, including by sending threats or repeated false refund claims.",
                "Do not present a JobCareerPao application receipt as a government appointment letter or job offer.",
              ]}
            />
          ),
        },
        {
          id: "intellectual-property",
          heading: "Intellectual property",
          body: (
            <P>
              The JobCareerPao name, logo, website design, and our own text belong to us or our
              licensors. You may not copy the site or brand for your own job portal. You keep
              ownership of your resume and application content. Job descriptions are provided for
              applying on this platform, not for republishing as your own listings.
            </P>
          ),
        },
        {
          id: "emails",
          heading: "Emails and messages",
          body: (
            <P>
              We email you one-time passwords, application and payment confirmations, and replies to
              support requests. Those messages are part of the service. Newsletter mail is sent only
              if you subscribe, and you may ask us to stop. We may also contact you about a change to
              these terms or about a security issue on your account.
            </P>
          ),
        },
        {
          id: "suspension",
          heading: "Suspension and closing an account",
          body: (
            <P>
              You may ask us to close your account. We may suspend or close an account that breaches
              these terms, creates risk for other users, or is required to be closed by law. Closing
              an account does not automatically refund a fee for an application we have already
              processed. Payment records may be kept for tax and accounting even after the account
              is closed. See the Privacy Policy for retention.
            </P>
          ),
        },
        {
          id: "refunds",
          heading: "Refunds",
          body: (
            <P>
              Application fees are charged for processing, so they are not refunded merely because
              you changed your mind, were not shortlisted, or were rejected after a valid application
              was received. Refunds are available in the cases listed in the{" "}
              <Link className="font-semibold text-brand-blue" href="/refund">Refund Policy</Link>,
              including a payment taken without an application being created, and a duplicate charge.
            </P>
          ),
        },
        {
          id: "third-parties",
          heading: "Third-party services",
          body: (
            <P>
              Payments are processed by Razorpay. Files are stored with our cloud file provider.
              Email is sent through our email providers. Their own terms apply to the part of the
              service they perform. We are not responsible for an outage or policy of those
              providers, but we remain responsible for operating our own platform with reasonable care.
            </P>
          ),
        },
        {
          id: "disclaimer",
          heading: "Disclaimer",
          body: (
            <P>
              The platform is provided on an “as available” basis. We work to keep listings and the
              payment flow accurate, but we do not warrant that every listing, salary, or deadline is
              error-free, or that the site will be uninterrupted. The{" "}
              <Link className="font-semibold text-brand-blue" href="/disclaimer">Disclaimer</Link>{" "}
              explains this further and forms part of these terms.
            </P>
          ),
        },
        {
          id: "liability",
          heading: "Limitation of liability",
          body: (
            <>
              <P>
                To the extent Indian law allows, {LEGAL_NAME} is not liable for hiring decisions made
                by an employer, for a job that is withdrawn, or for loss of income you hoped to earn.
                Our responsibility for a paid application is to process that application and the
                related payment with reasonable care.
              </P>
              <P>
                If we are found liable in connection with a particular application, our liability is
                limited to the application fee you paid for that application. This limit does not
                apply to liability that cannot be limited under Indian law, including liability for
                fraud or wilful misconduct, or a right you have as a consumer that cannot be waived.
              </P>
            </>
          ),
        },
        {
          id: "indemnity",
          heading: "Your responsibility for your content",
          body: (
            <P>
              If you submit false information, infringe someone else’s rights, or misuse the platform,
              you will be responsible for the claims and reasonable costs that result, including
              claims from an employer or from another person affected by that content.
            </P>
          ),
        },
        {
          id: "law",
          heading: "Governing law and disputes",
          body: (
            <>
              <P>
                These terms are governed by the laws of India, including the Information Technology
                Act, 2000 and the Digital Personal Data Protection Act, 2023, where they apply. Courts
                at Bengaluru, Karnataka have jurisdiction, subject to any right you have to approach a
                consumer forum or another forum that the law allows.
              </P>
              <P>
                Please write to us first through the{" "}
                <Link className="font-semibold text-brand-blue" href="/grievance">grievance process</Link>.
                We will acknowledge a complaint within 24 hours on business days and aim to resolve it
                within 15 days.
              </P>
            </>
          ),
        },
        {
          id: "changes",
          heading: "Changes, severability, and the whole agreement",
          body: (
            <>
              <P>
                We may update these terms when the product, the fee rules, or the law changes. The
                date at the top of this page will change. If you continue to use the platform after
                an update, the updated terms apply to new applications. A fee already paid stays
                governed by the terms shown at the time you paid.
              </P>
              <P>
                If one clause is held invalid, the rest remain in force. These terms, together with
                the Privacy Policy, fee terms, Refund Policy, Cookie notice, and Disclaimer, are the
                whole agreement for use of the platform. They replace earlier website summaries of
                the same subjects.
              </P>
            </>
          ),
        },
        {
          id: "contact",
          heading: "Contact",
          body: (
            <P>
              Legal and support questions: {LEGAL_EMAIL}, or the{" "}
              <Link className="font-semibold text-brand-blue" href="/contact">Contact page</Link>.
              For a complaint about data or a payment, use the grievance page so we can track it.
            </P>
          ),
        },
      ]}
    />
  );
}
