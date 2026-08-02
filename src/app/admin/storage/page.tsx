import { redirect } from "next/navigation";

export default function AdminStorageRedirectPage() {
  redirect("/admin/archive-manager");
}
