import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-brand-gray dark:bg-slate-950 px-4 text-center">
      <p className="font-display text-8xl font-extrabold text-brand-blue/20">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-brand-dark dark:text-white">Page not found</h1>
      <p className="mt-2 max-w-md text-brand-slate">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/">
          <Home className="h-4 w-4" /> Go Home
        </Button>
        <Button href="/jobs" variant="outline">
          <Search className="h-4 w-4" /> Browse Jobs
        </Button>
      </div>
    </div>
  );
}
