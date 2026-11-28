import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(_request: NextRequest) {
  const token = (await cookies()).get("rgb-cms-access")?.value;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  try {
    const response = await fetch(
      `${url}/rest/v1/projects?select=id,title,category,category_title,published,year,client&order=category.asc,sort_order.asc,title.asc`,
      { headers: { apikey: key, Authorization: `Bearer ${token}` }, cache: "no-store" },
    );
    const data = await response.json().catch(() => []);
    if (!response.ok) return NextResponse.json({ error: data.message || "Could not load projects." }, { status: response.status });
    return NextResponse.json({ projects: data });
  } catch {
    return NextResponse.json({ error: "Could not connect to the project database." }, { status: 502 });
  }
}
