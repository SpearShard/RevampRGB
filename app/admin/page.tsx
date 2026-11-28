import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLogin from "./ui/AdminLogin";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("rgb-cms-access")?.value;
  if (token) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const response = await fetch(`${url}/auth/v1/user`, {
        headers: { apikey: key, Authorization: `Bearer ${token}` },
        cache: "no-store",
      }).catch(() => null);
      if (response?.ok) redirect("/admin/projects");
    }
  }
  return <AdminLogin />;
}
