import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, P, Ul } from "@/components/legal/LegalDocument";
import { buildPageMetadata } from "@/lib/seo";
import { LEGAL_EMAIL, LEGAL_NAME } from "@/lib/legal";
import {
  EXPIRED_JOB_RETENTION_DAYS,
  OTP_EXPIRY_MINUTES,
  REJECTED_APPLICATION_RETENTION_DAYS,
} from "@/lib/constants";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy — What We Store, Where, and Why",
  description:
    "JobCareerPao privacy policy: personal data we collect, where resumes and applications are stored, how we use and share them, retention, and your rights in India.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalDocument
      kicker="Privacy"
      title="Privacy, storage, and use of data"
      currentPath="/privacy"
      summary="This policy explains what JobCareerPao collects when you create an account or apply for a job, where that data is stored, who can see it, and how you can ask us to correct or delete it."
      sections={[
        {
          id: "scope",
          heading: "Who this covers",
          body: (
            <P>
              This policy applies to candidates and visitors of {LEGAL_NAME}. It covers the account,
              the application form, payments, support messages, and the newsletter. It is written to
              meet our duties under the Digital Personal Data Protection Act, 2023 and the
              Information Technology Act, 2000, where those laws apply to this website.
            </P>
          ),
        },
        {
          id: "collect",
          heading: "What we collect",
          body: (
            <>
              <P>You give us this information directly:</P>
              <Ul
                items={[
                  "Account: name, email, phone number, and password.",
                  "Profile: address, location, bio, languages, skills, education, experience, certificates, and profile photo.",
                  "Application: the form answers for that job, cover letter if you add one, resume, and applicant photo if the form asks for it.",
                  "A snapshot of your profile at the time you apply, so the application stays complete even if you later edit your profile.",
                  "Support and contact form: your name, email, phone, subject, and message.",
                  "Newsletter: the email address you type, only if you subscribe.",
                ]}
              />
              <P>We create this information while operating the service:</P>
              <Ul
                items={[
                  "Application number, job title, company name, status, and dates.",
                  "Payment reference: Razorpay order id, payment id, amount, GST line if any, status, and receipt number. Not your card number, CVV, or UPI PIN.",
                  "One-time password records, which expire in about " + OTP_EXPIRY_MINUTES + " minutes.",
                  "Last login time, and technical logs needed to keep the site secure and to fix errors.",
                ]}
              />
            </>
          ),
        },
        {
          id: "where",
          heading: "Where we store it",
          body: (
            <>
              <P>Different kinds of data live in different systems. We do not keep everything in one file on a personal laptop.</P>
              <Ul
                items={[
                  "Account, profile, applications, payment records, job listings, and one-time passwords are stored in a cloud database operated by MongoDB Atlas.",
                  "Resumes, profile photos, and applicant photos are stored as files with Cloudinary, our cloud file host. The database keeps the file link, not the file itself.",
                  "Card, UPI, and net-banking details are entered on Razorpay’s checkout. Razorpay stores and processes those payment instruments. Our database stores only the payment reference and the amount.",
                  "Emails, including one-time passwords and application confirmations, are sent through our email providers. A copy of a support message may sit in our support inbox so we can reply.",
                  "While you are filling an application, a draft can sit in your browser’s session storage on your own device until you finish or close the tab. That draft is not our server copy.",
                  "Your password is stored only as a cryptographic hash. We cannot read your password back.",
                ]}
              />
              <P>
                These providers process data for us so the website can run. We do not sell the
                database or the resume files.
              </P>
            </>
          ),
        },
        {
          id: "use",
          heading: "How we use it",
          body: (
            <Ul
              items={[
                "To create your account and confirm your email with a one-time password.",
                "To show you jobs and to accept the application you choose to submit.",
                "To take the application fee, issue a receipt, and show payment history in your profile.",
                "To email you the application confirmation and later status updates we send.",
                "To let our admin and hiring team open the application for the company named on that job.",
                "To answer a support, refund, or grievance request.",
                "To prevent duplicate applications, fraud, and misuse of the payment flow.",
                "To send newsletter mail only when you have subscribed.",
                "To keep accounting records of fees we have received.",
              ]}
            />
          ),
        },
        {
          id: "share",
          heading: "Who we share it with",
          body: (
            <>
              <P>We share an application only as far as it needs to go:</P>
              <Ul
                items={[
                  "Our admin and hiring staff, so they can review and forward the application for that job.",
                  "The employer associated with that listing, to the extent needed for them to consider you. We do not send your application to unrelated companies.",
                  "Razorpay, to complete the payment you start.",
                  "Cloudinary, to store the resume and images you upload.",
                  "Our email providers, to deliver mail you triggered or asked for.",
                  "A professional adviser, auditor, or authority when the law requires it, or to establish or defend a legal claim.",
                  "A buyer of this business, if the platform is transferred, in which case we will continue to protect the data under this policy or tell you of a material change.",
                ]}
              />
              <P>We do not sell personal data. We do not share your resume with advertisers.</P>
            </>
          ),
        },
        {
          id: "purpose-limit",
          heading: "What we do not use it for",
          body: (
            <Ul
              items={[
                "We do not use your application to sign you up for paid products you did not request.",
                "We do not use your resume to apply you to other jobs unless you submit those applications yourself.",
                "We do not take a copy of your card or UPI PIN for our own use.",
                "We do not run third-party advertising cookies on this site.",
              ]}
            />
          ),
        },
        {
          id: "retention",
          heading: "How long we keep it",
          body: (
            <>
              <Ul
                items={[
                  "Account data is kept while the account is open.",
                  "An application and its resume are kept while the application is active, and afterwards so you and our team can still see the record.",
                  "Rejected applications may be removed after about " +
                    REJECTED_APPLICATION_RETENTION_DAYS +
                    " days, including the stored resume, unless we need the record for a dispute.",
                  "Expired job listing records may be removed after about " +
                    EXPIRED_JOB_RETENTION_DAYS +
                    " days.",
                  "One-time passwords expire in about " + OTP_EXPIRY_MINUTES + " minutes.",
                  "Payment and tax records are kept for as long as Indian accounting and tax rules require, even if you delete your account.",
                  "A browser draft disappears when the session ends or when the application is submitted. It is not a permanent archive.",
                ]}
              />
              <P>
                When a resume is deleted from an application, we also delete the file from cloud
                storage, not only the link.
              </P>
            </>
          ),
        },
        {
          id: "security",
          heading: "How we protect it",
          body: (
            <P>
              The site is served over HTTPS. Passwords are hashed. Admin tools are behind a separate
              login. Payment checkout is handed to Razorpay. Access to applications is limited to
              authorised staff. No online service can promise that a breach is impossible. If a
              breach creates a real risk to you, we will tell you and the authority the law requires
              us to inform.
            </P>
          ),
        },
        {
          id: "rights",
          heading: "Your choices and rights",
          body: (
            <>
              <P>You may ask us to:</P>
              <Ul
                items={[
                  "Show you the personal data we hold about you.",
                  "Correct your name, phone, email, or profile. You can also edit most profile fields yourself after login.",
                  "Delete your account and application content, except records we must keep for tax, fraud prevention, or an open dispute.",
                  "Stop newsletter email.",
                  "Withdraw consent for a new use. Withdrawal does not undo an application and payment that have already been completed.",
                  "Raise a grievance about how data was handled. Use the grievance page.",
                ]}
              />
              <P>
                Email {LEGAL_EMAIL} from your registered address, or use the{" "}
                <Link className="font-semibold text-brand-blue" href="/grievance">grievance page</Link>.
                We may ask you to confirm that you own the account before we release or delete data.
              </P>
            </>
          ),
        },
        {
          id: "children",
          heading: "Children",
          body: (
            <P>
              The platform is for people who are 18 or older. We do not knowingly create accounts for
              children. If you believe a minor has registered, email us and we will delete that account.
            </P>
          ),
        },
        {
          id: "cookies",
          heading: "Cookies and the browser draft",
          body: (
            <P>
              Sign-in uses a session cookie. The in-progress application can be stored in session
              storage on your device. Razorpay may set cookies on its own checkout. Details are in
              the <Link className="font-semibold text-brand-blue" href="/cookies">Cookie notice</Link>.
            </P>
          ),
        },
        {
          id: "changes",
          heading: "Changes to this policy",
          body: (
            <P>
              If we change what we collect, where we store it, or who we share it with, we will
              update this page and the date at the top. Continued use after the change applies to
              new applications. A material change to how we use an existing application will be
              explained by email or on this page before we rely on it.
            </P>
          ),
        },
      ]}
    />
  );
}
