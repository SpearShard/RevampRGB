import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: "CMS is not configured. Add the Supabase URL and anon key." }, { status: 503 });

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

  try {
    const authResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const session = await authResponse.json().catch(() => ({}));
    if (!authResponse.ok || !session.access_token || !session.user?.id) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    const roleResponse = await fetch(
      `${url}/rest/v1/cms_admins?select=role&user_id=eq.${encodeURIComponent(session.user.id)}&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${session.access_token}` }, cache: "no-store" },
    );
    if (!roleResponse.ok) return NextResponse.json({ error: "Could not verify CMS access. Please try again." }, { status: 503 });
    const roles = await roleResponse.json();
    if (!roles?.length) return NextResponse.json({ error: "This account has not been granted RGB CMS access." }, { status: 403 });

    const response = NextResponse.json({ ok: true, role: roles[0].role });
    response.cookies.set("rgb-cms-access", session.access_token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", path: "/", maxAge: Math.min(Number(session.expires_in) || 3600, 3600),
    });
    response.cookies.set("rgb-cms-role", roles[0].role, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", path: "/", maxAge: Math.min(Number(session.expires_in) || 3600, 3600),
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Could not connect to the authentication service." }, { status: 502 });
  }
}
