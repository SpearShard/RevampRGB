"use client";

import { FormEvent, useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to sign in.");
      window.location.assign("/admin/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_0.85fr]">
      <section className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[390px]">
          <a href="/" className="text-3xl font-bold tracking-[-0.08em]">RGB<span className="text-[#df7956]">.</span></a>
          <p className="mt-16 text-[11px] uppercase tracking-[0.24em] text-[#858d80]">Private workspace</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em]">Welcome back.</h1>
          <p className="mt-3 text-sm text-[#858d80]">Sign in to manage RGB projects.</p>
          <form onSubmit={submit} className="mt-10 space-y-5">
            <label className="block text-xs text-[#c1c7bc]">Email address
              <input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-lg border border-[#343b34] bg-[#191c19] px-4 text-sm outline-none focus:border-[#df7956]" placeholder="you@example.com" />
            </label>
            <label className="block text-xs text-[#c1c7bc]">Password
              <input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 h-12 w-full rounded-lg border border-[#343b34] bg-[#191c19] px-4 text-sm outline-none focus:border-[#df7956]" placeholder="Enter your password" />
            </label>
            {error && <p role="alert" className="text-sm text-[#ec8178]">{error}</p>}
            <button disabled={busy} className="flex h-12 w-full items-center justify-between rounded-lg bg-[#df7956] px-5 text-sm font-semibold text-[#17120f] disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}<span>↗</span></button>
          </form>
          <a href="/" className="mt-8 inline-block text-xs text-[#858d80] hover:text-white">← Back to RGB Design</a>
        </div>
      </section>
      <aside className="hidden flex-col justify-between border-l border-[#343b34] bg-[#151815] p-12 lg:flex">
        <span className="text-[10px] tracking-[0.25em] text-[#858d80]">RGB DESIGN / CMS</span>
        <p className="text-7xl font-medium leading-[0.95] tracking-[-0.07em]">Ideas become<br/><i className="font-normal text-[#df7956]">spaces.</i></p>
        <span className="text-xs text-[#858d80]">Project management</span>
      </aside>
    </main>
  );
}
