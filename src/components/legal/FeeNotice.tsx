import Link from "next/link";

export function FeeNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-brand-slate dark:text-slate-400 ${className}`}>
      This is a one-time application processing fee. It covers receiving, storing, and forwarding
      your application. Paying it does not guarantee a job, an interview, or selection.{" "}
      <Link href="/fees" className="font-semibold text-brand-blue hover:underline">
        Why we charge
      </Link>
      {" · "}
      <Link href="/refund" className="font-semibold text-brand-blue hover:underline">
        Refunds
      </Link>
      {" · "}
      <Link href="/terms" className="font-semibold text-brand-blue hover:underline">
        Terms
      </Link>
    </p>
  );
}
