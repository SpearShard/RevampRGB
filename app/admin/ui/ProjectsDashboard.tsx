"use client";

import { useEffect, useState } from "react";

type Project = { id: number; title: string; category: string; category_title?: string; published: boolean; year?: number; client?: string };

export default function ProjectsDashboard({ email, role }: { email: string; role: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/projects", { cache: "no-store" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load projects.");
        if (active) setProjects(data.projects || []);
      })
      .catch(err => { if (active) setError(err.message || "Could not load projects."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin");
  }

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="flex flex-col border-b border-[#343b34] bg-[#151815] p-6 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <a href="/" className="text-3xl font-bold tracking-[-0.08em]">RGB<span className="text-[#df7956]">.</span></a>
        <p className="mt-12 text-[10px] uppercase tracking-[0.2em] text-[#858d80]">Workspace</p>
        <div className="mt-4 rounded-lg border border-[#444b41] bg-[#222720] px-3 py-3 text-sm">Projects <span className="float-right text-[#858d80]">{projects.length}</span></div>
        <div className="mt-auto hidden border-t border-[#343b34] pt-5 lg:block">
          <p className="truncate text-xs text-[#c1c7bc]">{email}</p><p className="mt-1 text-[10px] uppercase text-[#858d80]">{role}</p>
          <button onClick={logout} className="mt-4 text-xs text-[#858d80] hover:text-white">Sign out ↗</button>
        </div>
      </aside>
      <section className="mx-auto w-full max-w-[1500px] px-6 py-10 md:px-12">
        <div className="flex items-end justify-between gap-4 border-b border-[#343b34] pb-5">
          <div><p className="text-[10px] uppercase tracking-[0.2em] text-[#858d80]">RGB Design / CMS</p><h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em]">Projects</h1><p className="mt-2 text-sm text-[#858d80]">Manage the projects in your portfolio.</p></div>
          <button onClick={logout} className="text-xs text-[#858d80] hover:text-white lg:hidden">Sign out</button>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-px border border-[#343b34] bg-[#343b34] sm:grid-cols-3">
          <div className="bg-[#151815] p-5"><strong className="block text-3xl">{projects.length}</strong><span className="mt-2 block text-xs text-[#858d80]">Total projects</span></div>
          <div className="bg-[#151815] p-5"><strong className="block text-3xl">{projects.filter(p=>p.published).length}</strong><span className="mt-2 block text-xs text-[#858d80]">Published</span></div>
          <div className="col-span-2 bg-[#151815] p-5 sm:col-span-1"><strong className="block text-3xl">{projects.filter(p=>!p.published).length}</strong><span className="mt-2 block text-xs text-[#858d80]">Drafts</span></div>
        </div>
        {error && <p role="alert" className="mt-6 text-sm text-[#ec8178]">{error}</p>}
        <div className="mt-10 flex items-center justify-between"><h2 className="text-xl font-medium">Project library</h2><span className="text-xs text-[#858d80]">{projects.length} entries</span></div>
        {loading ? <p className="mt-8 text-sm text-[#858d80]">Loading projects…</p> : projects.length ? (
          <div className="mt-4 divide-y divide-[#343b34] border-y border-[#343b34]">
            {projects.map(project=><article key={project.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><h3 className="font-medium">{project.title}</h3><p className="mt-1 text-xs text-[#858d80]">{project.category_title || project.category}{project.year ? ` · ${project.year}` : ""}{project.client ? ` · ${project.client}` : ""}</p></div><span className={`text-[10px] uppercase tracking-[0.15em] ${project.published ? "text-[#a7c49a]" : "text-[#dfaa79]"}`}>{project.published ? "Published" : "Draft"}</span></article>)}
          </div>
        ) : <p className="mt-6 text-sm text-[#858d80]">No projects found in the connected Supabase database.</p>}
        <p className="mt-10 max-w-2xl text-xs leading-6 text-[#858d80]">This is the first migration slice: secure sign-in and a read-only project overview. Project editing, ImageKit workflows, activity history, and live collaboration are next; this dashboard does not yet publish changes to the public website.</p>
      </section>
    </main>
  );
}
