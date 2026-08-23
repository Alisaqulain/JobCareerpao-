import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

export const SITE_NAME = "JobCareerPao";
export const SITE_TAGLINE = "Find Your Dream Job. Build Your Future.";
export const DEFAULT_DESCRIPTION =
  "JobCareerPao is India's trusted job portal — browse verified IT, hospital, fresher & remote jobs, apply online with secure Razorpay payment, and track applications in one place.";

export const SEO_KEYWORDS = [
  "jobs in India",
  "job portal India",
  "online job apply",
  "JobCareerPao",
  "jobcareerpao.in",
  "IT jobs India",
  "fresher jobs",
  "remote jobs India",
  "work from home jobs",
  "hospital jobs India",
  "nursing jobs",
  "software developer jobs",
  "private jobs India",
  "career opportunities India",
  "job search India",
  "hiring companies India",
  "apply for jobs online",
  "recruitment portal India",
  "job vacancies 2026",
  "latest jobs India",
  "government private jobs",
  "entry level jobs",
  "experienced jobs India",
  "job application portal",
  "verified job listings",
];

export const NO_INDEX: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export function absoluteUrl(path = "") {
  const base = getSiteUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(input.path);
  const image = input.ogImage || absoluteUrl("/logo.png");

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords || SEO_KEYWORDS,
    alternates: { canonical: url },
    openGraph: {
      type: input.type || "website",
      locale: "en_IN",
      url,
      siteName: SITE_NAME,
      title: input.title,
      description: input.description,
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
    robots: input.noIndex ? NO_INDEX : { index: true, follow: true },
  };
}

export function organizationJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url,
    logo: absoluteUrl("/logo.png"),
    description: DEFAULT_DESCRIPTION,
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
}

export function websiteJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/jobs?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function jobPostingJsonLd(job: {
  title: string;
  description: string;
  company: string;
  location: string;
  employmentType?: string;
  datePosted?: string;
  validThrough?: string;
  url: string;
  baseSalary?: { min: number; max: number; currency?: string };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: "IN",
      },
    },
    employmentType: job.employmentType || "FULL_TIME",
    datePosted: job.datePosted || new Date().toISOString(),
    validThrough: job.validThrough,
    url: job.url,
    ...(job.baseSalary
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: job.baseSalary.currency || "INR",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.baseSalary.min,
              maxValue: job.baseSalary.max,
              unitText: "MONTH",
            },
          },
        }
      : {}),
  };
}

export function blogPostingJsonLd(post: {
  title: string;
  description: string;
  url: string;
  author: string;
  datePublished: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") },
    },
    datePublished: post.datePublished,
    mainEntityOfPage: post.url,
    image: post.image || absoluteUrl("/logo.png"),
  };
}

export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function itemListJsonLd(items: { name: string; url: string }[], listName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}
