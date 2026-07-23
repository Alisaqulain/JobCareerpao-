import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isLoginPage = false;

  if (!session?.user && !isLoginPage) {
    // Allow login page through separate route group
  }

  return <>{children}</>;
}
