import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("rgb-cms-access", "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set("rgb-cms-role", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
