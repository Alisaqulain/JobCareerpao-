import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jobcareerpao.com"),
  title: {
    default: "JobCareerPao — Find Your Dream Job. Build Your Future.",
    template: "%s | JobCareerPao",
  },
  description:
    "Connect with India's fastest-growing companies and discover thousands of verified job opportunities across every industry. Unlock Your Potential with JobCareerPao.",
  keywords: [
    "jobs",
    "careers",
    "job portal India",
    "hiring",
    "recruitment",
    "JobCareerPao",
    "IT jobs",
    "fresher jobs",
  ],
  authors: [{ name: "JobCareerPao" }],
  creator: "JobCareerPao",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://jobcareerpao.com",
    siteName: "JobCareerPao",
    title: "JobCareerPao — Find Your Dream Job. Build Your Future.",
    description:
      "Connect with India's fastest-growing companies and discover thousands of verified job opportunities.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "JobCareerPao — Unlock Your Potential",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JobCareerPao — Find Your Dream Job",
    description: "Discover verified jobs across India. Unlock Your Potential.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B4F8A",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "JobCareerPao",
  url: "https://jobcareerpao.com",
  logo: "https://jobcareerpao.com/logo.png",
  description:
    "India's premium job portal connecting candidates with verified companies.",
  sameAs: [
    "https://linkedin.com/company/jobcareerpao",
    "https://twitter.com/jobcareerpao",
    "https://instagram.com/jobcareerpao",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@jobcareerpao.com",
    availableLanguage: ["English", "Hindi"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-950 text-brand-dark dark:text-slate-100 font-sans transition-colors">
        <Providers>
          <LoadingScreen />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}