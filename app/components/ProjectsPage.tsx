"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import projectsData from "../data/projects.json";
import { projectSlug } from "../utils/projectSlugs";

type ProjectItem = { title: string; dir: string; cover: string };
type Category = { title: string; projects: ProjectItem[] };

const RGB = ["#ff2433", "#1ff261", "#0056e6"];

export default function ProjectsPage() {
  const router = useRouter();
  const [indexOpen, setIndexOpen] = useState(true);
  const [openMobileCategory, setOpenMobileCategory] = useState<string | null>(null);
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const categories = useMemo(() => Object.entries(projectsData as unknown as Record<string, Category>).filter(([, value]) => Array.isArray(value.projects)), []);

  const entries = useMemo(() => {
    let sequence = 0;
    return categories.flatMap(([slug, category]) =>
      category.projects.map((project) => ({
        ...project,
        category: category.title,
        categorySlug: slug,
        href: `/project/${slug}/${projectSlug(project.dir)}`,
        color: RGB[sequence++ % RGB.length],
      }))
    );
  }, [categories]);

  useEffect(() => {
    const onFractalHover = (event: Event) => {
      const href = (event as CustomEvent<{ href?: string }>).detail?.href ?? null;
      setActiveHref(href);
    };
    const onFractalClear = () => setActiveHref(null);
    window.addEventListener("rgb:fractal-hover", onFractalHover);
    window.addEventListener("rgb:fractal-clear", onFractalClear);
    return () => {
      window.removeEventListener("rgb:fractal-hover", onFractalHover);
      window.removeEventListener("rgb:fractal-clear", onFractalClear);
    };
  }, []);

  const hoverProject = (href: string | null) => {
    setActiveHref(href);
    window.dispatchEvent(new CustomEvent(href ? "rgb:index-hover" : "rgb:index-clear", { detail: { href } }));
  };

  const openProject = (href: string) => {
    window.dispatchEvent(new CustomEvent("rgb:enter-detail", { detail: { href } }));
    router.push(href);
  };

  return (
    <main className="pointer-events-none relative z-10 flex h-[100svh] min-h-[560px] w-full overflow-hidden bg-transparent text-white">
      <aside data-works-index className={`pointer-events-auto absolute left-3 top-28 bottom-24 z-20 hidden w-[min(340px,calc(100vw-24px))] flex-col overflow-hidden rounded-[22px] border border-white/[0.11] bg-[#090a0e]/65 shadow-[0_24px_90px_rgba(0,0,0,.45)] backdrop-blur-xl transition-transform duration-500 sm:left-7 sm:top-24 sm:bottom-28 sm:flex sm:rounded-[28px] ${indexOpen ? "translate-x-0" : "-translate-x-[calc(100%+40px)]"}`}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/40">RGB / Archive</p>
            <h1 className="mt-1 text-lg font-light tracking-tight">Works Index</h1>
          </div>
          <span className="font-mono text-[9px] text-white/35">{String(entries.length).padStart(2, "0")} WORKS</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:thin]">
          {categories.map(([slug, category], categoryIndex) => (
            <section key={slug} className="mb-6 last:mb-1">
              <div className="mb-2 flex items-center gap-2 px-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: RGB[categoryIndex % RGB.length] }} />
                <h2 className="text-[10px] font-medium uppercase tracking-[0.17em] text-white/70">{category.title}</h2>
              </div>
              <div className="space-y-0.5">
                {category.projects.map((project) => {
                  const href = `/project/${slug}/${projectSlug(project.dir)}`;
                  const active = activeHref === href;
                  const accent = entries.find((entry) => entry.href === href)?.color ?? RGB[0];
                  return (
                    <button key={project.dir} type="button" onMouseEnter={() => hoverProject(href)} onMouseLeave={() => hoverProject(null)} onFocus={() => hoverProject(href)} onBlur={() => hoverProject(null)} onClick={() => openProject(href)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${active ? "bg-white/[0.09]" : "hover:bg-white/[0.045]"}`}>
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                      <span className={`min-w-0 flex-1 truncate text-[12px] ${active ? "text-white" : "text-white/55 group-hover:text-white/85"}`}>{project.title}</span>
                      <span className="text-[10px] text-white/25">↗</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        <div className="border-t border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.2em] text-white/30">Select a study to explore</div>
      </aside>

      <button data-works-index type="button" className="pointer-events-auto absolute left-3 top-[5.25rem] z-30 hidden rounded-full border border-white/15 bg-[#090a0e]/80 px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-white/75 backdrop-blur-xl transition hover:bg-white hover:text-black sm:left-7 sm:block" onClick={() => setIndexOpen((open) => !open)}>
        {indexOpen ? "Hide Index" : "Works Index"}
      </button>

      <div data-works-index className="pointer-events-auto fixed bottom-[5.25rem] left-3 right-3 z-40 sm:hidden">
        {openMobileCategory && (
          <div className="mb-2 max-h-[34svh] overflow-y-auto rounded-2xl border border-white/10 bg-[#090a0e]/95 p-2 shadow-2xl backdrop-blur-2xl">
            {categories.filter(([slug]) => slug === openMobileCategory).map(([slug, category]) => (
              <div key={slug}>
                <div className="flex items-center justify-between border-b border-white/[0.08] px-3 py-2">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/45">{category.title}</span>
                  <button type="button" aria-label="Collapse project group" onClick={() => setOpenMobileCategory(null)} className="px-2 text-sm text-white/50">−</button>
                </div>
                <div className="py-1">
                  {category.projects.map((project) => {
                    const href = `/project/${slug}/${projectSlug(project.dir)}`;
                    const active = activeHref === href;
                    return (
                      <button key={project.dir} type="button" onClick={() => openProject(href)} className={`flex w-full items-center rounded-lg px-3 py-3 text-left text-[12px] transition-colors ${active ? "bg-white/[0.09] text-white" : "text-white/65 active:bg-white/[0.06]"}`}>
                        <span className="min-w-0 flex-1 truncate">{project.title}</span>
                        <span className="text-[10px] text-white/25">↗</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-full border border-white/15 bg-[#090a0e]/90 p-1.5 shadow-2xl backdrop-blur-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map(([slug, category]) => {
            const expanded = openMobileCategory === slug;
            return (
              <button key={slug} type="button" aria-expanded={expanded} onClick={() => setOpenMobileCategory(expanded ? null : slug)} className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2.5 text-[9px] font-medium uppercase tracking-[0.12em] transition-colors ${expanded ? "bg-white text-black" : "text-white/65 active:bg-white/10"}`}>
                <span>{category.title}</span>
                <span className={`text-[11px] ${expanded ? "text-black/55" : "text-white/35"}`}>{expanded ? "−" : "+"}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-24 right-3 z-10 max-w-[42vw] text-right sm:bottom-28 sm:right-10">
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/35">Selected Works</p>
        <p className="mt-1 text-[10px] text-white/45 sm:text-xs">Hover a shard or choose a title</p>
      </div>

      {activeHref && (() => {
        const active = entries.find((entry) => entry.href === activeHref);
        if (!active) return null;
        return (
          <div className="pointer-events-none absolute bottom-36 right-3 z-20 hidden w-52 overflow-hidden rounded-2xl border border-white/15 bg-[#090a0e]/85 shadow-2xl backdrop-blur-xl sm:right-6 sm:w-64 md:block">
            <div className="relative aspect-[16/10]">
              <Image src={active.cover} alt={active.title} fill sizes="256px" className="object-cover" />
            </div>
            <div className="p-3">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">{active.category}</p>
              <p className="mt-1 text-sm text-white">{active.title}</p>
            </div>
          </div>
        );
      })()}
    </main>
  );
}
