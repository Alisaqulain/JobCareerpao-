import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, P, Ul } from "@/components/legal/LegalDocument";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Cookie Notice — Sign-in, Drafts & Checkout",
  description:
    "How JobCareerPao uses cookies and browser storage: the sign-in session, the application draft on your device, and Razorpay checkout cookies.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <LegalDocument
      kicker="Cookies"
      title="Cookies and browser storage"
      currentPath="/cookies"
      summary="JobCareerPao uses a sign-in cookie to keep you logged in, and your browser can hold an unfinished application until you submit it. We do not use advertising cookies."
      sections={[
        {
          id: "session",
          heading: "Sign-in cookie",
          body: (
            <P>
              When you log in, the site sets a session cookie so you stay signed in while you apply
              and while you open your profile. The cookie identifies the session. It does not contain
              your resume or your card details. If you log out, that session ends. This cookie is
              strictly necessary for the account to work.
            </P>
          ),
        },
        {
          id: "draft",
          heading: "Application draft on your device",
          body: (
            <P>
              While you fill an application, the answers can be saved in your browser’s session
              storage under a key used only by this site. That copy stays on your device for the
              browsing session so a refresh does not wipe the form. It is cleared when the
              application is submitted. It is not sent to advertisers. Anyone who uses the same
              browser profile on a shared computer could see that draft until the session ends, so
              do not apply from a shared device you do not trust.
            </P>
          ),
        },
        {
          id: "razorpay",
          heading: "Razorpay at checkout",
          body: (
            <P>
              The payment window is provided by Razorpay. Razorpay may set its own cookies to run
              checkout, prevent fraud, and remember the payment attempt. Those cookies are governed
              by Razorpay. We receive the payment result, not your card number or UPI PIN. See the{" "}
              <Link className="font-semibold text-brand-blue" href="/privacy">Privacy Policy</Link>{" "}
              for what we store after a successful payment.
            </P>
          ),
        },
        {
          id: "not-used",
          heading: "What we do not set",
          body: (
            <Ul
              items={[
                "We do not run Google Analytics, advertising pixels, or social trackers on this site.",
                "We do not sell cookie data.",
                "Newsletter signup is an email you submit. It is not a tracking cookie.",
              ]}
            />
          ),
        },
        {
          id: "control",
          heading: "How to control them",
          body: (
            <P>
              You can block cookies in your browser. If you block the sign-in cookie, you will not
              be able to stay logged in or pay for an application. Clearing site data also removes
              an unfinished draft. Blocking Razorpay’s cookies can stop checkout from opening.
            </P>
          ),
        },
      ]}
    />
  );
}
