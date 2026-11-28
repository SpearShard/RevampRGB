import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProjectsDashboard from "../ui/ProjectsDashboard";

export default async function AdminProjectsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("rgb-cms-access")?.value;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) redirect("/admin");

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);
  if (!response?.ok) redirect("/admin");

  const user = await response.json();
  const roleResponse = await fetch(
    `${url}/rest/v1/cms_admins?select=email,role&user_id=eq.${encodeURIComponent(user.id)}&limit=1`,
    { headers: { apikey: key, Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  const roles = roleResponse.ok ? await roleResponse.json() : [];
  if (!roles.length) redirect("/admin");

  return <ProjectsDashboard email={user.email || roles[0].email || "CMS user"} role={roles[0].role} />;
}
