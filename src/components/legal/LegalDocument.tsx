import Link from "next/link";
import { LEGAL_ADDRESS, LEGAL_EMAIL, LEGAL_NAME, LEGAL_PAGES, LEGAL_UPDATED } from "@/lib/legal";

export type LegalSection = {
  id: string;
  heading: string;
  body: React.ReactNode;
};

export function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

export function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalDocument({
  kicker,
  title,
  summary,
  currentPath,
  sections,
}: {
  kicker?: string;
  title: string;
  summary: string;
  currentPath: string;
  sections: LegalSection[];
}) {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-brand-gray">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">
            {kicker || "Legal"}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-brand-dark sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-slate sm:text-base">{summary}</p>
          <p className="mt-4 text-xs text-brand-slate">Last updated: {LEGAL_UPDATED}</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <nav aria-label="Legal policies" className="flex flex-wrap gap-2">
          {LEGAL_PAGES.map((page) => {
            const active = page.href === currentPath;
            return (
              <Link
                key={page.href}
                href={page.href}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-brand-blue text-white"
                    : "bg-slate-100 text-brand-slate hover:bg-slate-200 hover:text-brand-dark"
                }`}
              >
                {page.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-slate">On this page</p>
              <ol className="mt-3 space-y-2">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-sm text-brand-slate transition hover:text-brand-blue"
                    >
                      {index + 1}. {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <article className="space-y-10 lg:col-span-8">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="font-display text-xl font-semibold text-brand-dark">
                  {index + 1}. {section.heading}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                  {section.body}
                </div>
              </section>
            ))}

            <section className="rounded-2xl bg-brand-gray p-5 text-sm leading-relaxed text-brand-slate">
              <p>
                Questions about these terms, a payment, or your data: email{" "}
                <a className="font-semibold text-brand-blue" href={`mailto:${LEGAL_EMAIL}`}>
                  {LEGAL_EMAIL}
                </a>{" "}
                or use the <Link className="font-semibold text-brand-blue" href="/contact">Contact page</Link>.
                Office: {LEGAL_ADDRESS}.
              </p>
              <p className="mt-3 text-xs">
                These pages explain how {LEGAL_NAME} operates the website. They are written for candidates
                using the service. They are not a private legal opinion for any other business.
              </p>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
