"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import projectsData from "../data/projects.json";
import { projectSlug } from "../utils/projectSlugs";
import RgbAuraBackground from "./bgwebglshaders/RgbAuraBackground";

type RawProject = {
  title: string;
  subtitle?: string;
  dir: string;
  cover: string;
};

type RawCategory = {
  title: string;
  projects: RawProject[];
};

type IndexedSubProject = {
  chunkIndex: number;
  title: string;
  subtitle?: string;
  href: string;
};

type IndexedCategory = {
  slug: string;
  title: string;
  items: IndexedSubProject[];
};

export default function ProjectsPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mobileScaleRef = useRef<HTMLDivElement>(null);
  const mobileScrollRafRef = useRef<number | null>(null);
  const [indexOpen, setIndexOpen] = useState(true);
  const [activeChunkIndex, setActiveChunkIndex] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("rgb:project-index-toggle", { detail: { open: true } }));
  }, []);

  const categories = useMemo<IndexedCategory[]>(() => {
    const result: IndexedCategory[] = [];
    let globalIdx = 0;

    for (const [categorySlug, rawVal] of Object.entries(projectsData)) {
      const category = rawVal as Partial<RawCategory>;
      if (!Array.isArray(category.projects) || typeof category.title !== "string") continue;

      const items: IndexedSubProject[] = [];
      for (const proj of category.projects) {
        if (!proj?.title || !proj?.dir || !proj?.cover) continue;
        items.push({
          chunkIndex: globalIdx,
          title: proj.title,
          subtitle: proj.subtitle,
          href: `/project/${categorySlug}/${projectSlug(proj.dir)}`,
        });
        globalIdx += 1;
      }

      if (items.length > 0) {
        result.push({
          slug: categorySlug,
          title: category.title,
          items,
        });
      }
    }

    return result;
  }, []);

  const allItems = useMemo(() => categories.flatMap((category) =>
    category.items.map((item) => ({ ...item, categorySlug: category.slug, categoryTitle: category.title }))
  ), [categories]);

  useEffect(() => {
    const track = mobileScaleRef.current;
    if (!track) return;
    const updateFromScroll = () => {
      if (mobileScrollRafRef.current !== null) cancelAnimationFrame(mobileScrollRafRef.current);
      mobileScrollRafRef.current = requestAnimationFrame(() => {
        const center = track.getBoundingClientRect().left + track.clientWidth / 2;
        const ticks = Array.from(track.querySelectorAll<HTMLElement>("[data-mobile-tick]"));
        let closest: HTMLElement | null = null;
        let distance = Infinity;
        for (const tick of ticks) {
          const rect = tick.getBoundingClientRect();
          const d = Math.abs(rect.left + rect.width / 2 - center);
          if (d < distance) { distance = d; closest = tick; }
        }
        const index = closest ? Number(closest.dataset.mobileTick) : NaN;
        if (Number.isFinite(index)) {
          setActiveChunkIndex(index);
          const owner = categories.find((cat) => cat.items.some((item) => item.chunkIndex === index));
          if (owner) setExpandedCategory(owner.slug);
          window.dispatchEvent(new CustomEvent("rgb:index-hover", { detail: { chunkIndex: index } }));
        }
      });
    };
    track.addEventListener("scroll", updateFromScroll, { passive: true });
    updateFromScroll();
    return () => {
      track.removeEventListener("scroll", updateFromScroll);
      if (mobileScrollRafRef.current !== null) cancelAnimationFrame(mobileScrollRafRef.current);
    };
  }, [categories]);

  useEffect(() => {
    if (activeChunkIndex === null || !mobileScaleRef.current) return;
    const track = mobileScaleRef.current;
    const tick = track.querySelector<HTMLElement>('[data-mobile-tick="' + activeChunkIndex + '"]');
    if (tick) {
      const target = tick.offsetLeft - track.clientWidth / 2 + tick.clientWidth / 2;
      if (Math.abs(track.scrollLeft - target) > 36) track.scrollTo({ left: target, behavior: "smooth" });
    }
  }, [activeChunkIndex]);
  // Keep the currently highlighted project visible even when its category is
  // near the bottom of the scrollable directory.
  useEffect(() => {
    if (activeChunkIndex === null || !indexOpen) return;
    const frame = window.requestAnimationFrame(() => {
      const activeItem = document.querySelector(
        `[data-project-index="${activeChunkIndex}"]`
      );
      activeItem?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeChunkIndex, expandedCategory, indexOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Listen to 3D fractal shard hover events so the index highlights in two-way sync
  useEffect(() => {
    const handleFractalHover = (e: Event) => {
      const idx = (e as CustomEvent<{ chunkIndex: number | null }>).detail?.chunkIndex ?? null;
      setActiveChunkIndex(idx);
      if (idx !== null) {
        const ownerCat = categories.find((cat) =>
          cat.items.some((item) => item.chunkIndex === idx)
        );
        if (ownerCat) setExpandedCategory(ownerCat.slug);
      }
    };

    window.addEventListener("rgb:fractal-hover", handleFractalHover);
    return () => window.removeEventListener("rgb:fractal-hover", handleFractalHover);
  }, [categories]);

  const handleItemHover = (chunkIndex: number | null) => {
    setActiveChunkIndex(chunkIndex);
    window.dispatchEvent(
      new CustomEvent("rgb:index-hover", { detail: { chunkIndex } })
    );
  };

  const handleItemClick = (chunkIndex: number) => {
    window.dispatchEvent(
      new CustomEvent("rgb:index-select", { detail: { chunkIndex } })
    );
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-transparent text-white select-none pointer-events-none">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ backgroundColor: "transparent", zIndex: -1 }}
      />

      {/* Closed-state reveal tab */}
      {!indexOpen && (
        <button
          type="button"
          onClick={() => {
            setIndexOpen(true);
            window.dispatchEvent(new CustomEvent("rgb:project-index-toggle", { detail: { open: true } }));
          }}
          aria-label="Show project directory"
          className="pointer-events-auto fixed left-0 top-1/2 z-[70] -translate-y-1/2 !cursor-pointer rounded-r-xl border border-l-0 border-white/15 bg-[#0b0b10]/90 px-3 py-5 text-white/75 shadow-xl backdrop-blur-xl transition-colors hover:text-white cursor-pointer"
        >
          <span aria-hidden="true">›</span>
        </button>
      )}

      {/* Mobile project ruler — hidden on desktop */}
      <section className="md:hidden pointer-events-auto fixed inset-x-0 bottom-0 z-[75] px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-5 bg-gradient-to-t from-[#050507] via-[#050507]/95 to-transparent">
        <div className="mx-auto max-w-[560px] rounded-[22px] border border-white/[0.13] bg-[#09090d]/90 px-4 pt-3 pb-3 shadow-[0_-12px_45px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[8px] font-mono uppercase tracking-[0.24em] text-white/35">Selected project</p>
              <p className="mt-1 truncate text-[12px] font-medium tracking-wide text-white">{allItems.find((item) => item.chunkIndex === activeChunkIndex)?.title ?? "Explore projects"}</p>
            </div>
            <p className="shrink-0 text-right text-[8px] font-mono uppercase tracking-[0.18em] text-white/40">{allItems.find((item) => item.chunkIndex === activeChunkIndex)?.categoryTitle ?? "Categories"}</p>
          </div>
          <div ref={mobileScaleRef} className="relative flex items-center gap-0 px-[calc(50%-18px)] overflow-x-auto scrollbar-none snap-x snap-mandatory overscroll-x-contain touch-pan-x">
            {allItems.map((item, index) => {
              const selected = activeChunkIndex === item.chunkIndex;
              const previous = allItems[index - 1];
              const startsCategory = !previous || previous.categorySlug !== item.categorySlug;
              return (
                <button key={item.href} type="button" data-mobile-tick={item.chunkIndex} aria-label={item.categoryTitle + ": " + item.title}
                  onClick={() => {
                    setActiveChunkIndex(item.chunkIndex);
                    setExpandedCategory(item.categorySlug);
                    window.dispatchEvent(new CustomEvent("rgb:index-hover", { detail: { chunkIndex: item.chunkIndex } }));
                    const track = mobileScaleRef.current;
                    const node = track?.querySelector<HTMLElement>('[data-mobile-tick="' + item.chunkIndex + '"]');
                    if (track && node) track.scrollTo({ left: node.offsetLeft - track.clientWidth / 2 + node.clientWidth / 2, behavior: "smooth" });
                  }}
                  className="relative flex h-10 w-9 shrink-0 snap-center flex-col items-center justify-center">
                  {startsCategory && <span className="absolute -top-0.5 h-[3px] w-3 rounded-full bg-white/40" /> }
                  <span className={"w-px rounded-full transition-all duration-300 " + (selected ? "h-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.65)]" : startsCategory ? "h-5 bg-white/45" : "h-3 bg-white/20")} />
                  {selected && <span className="absolute bottom-0 h-1 w-1 rounded-full bg-white" /> }
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between text-[7px] font-mono uppercase tracking-[0.2em] text-white/25">
            <span>Swipe to explore</span>
            <span>{String(Math.max(0, allItems.findIndex((item) => item.chunkIndex === activeChunkIndex) + 1)).padStart(2, "0")} / {String(allItems.length).padStart(2, "0")}</span>
          </div>
        </div>
      </section>
      {/* Expandable Works Index */}
      <aside
        id="projects-directory"
        aria-label="Project directory"
        onMouseLeave={() => handleItemHover(null)}
        onPointerDown={(e) => e.stopPropagation()}
        className={`pointer-events-auto fixed left-0 top-1/2 z-[70] max-md:hidden !cursor-default h-fit max-h-[calc(100vh-2rem)] w-[min(88vw,340px)] sm:w-[340px] -translate-y-1/2 flex flex-col rounded-r-[28px] border border-l-0 border-white/[0.16] bg-[#08080c]/90 shadow-[0_24px_60px_rgba(0,0,0,0.65)] overflow-y-auto scrollbar-none transition-[transform,opacity] duration-300 ease-out cursor-default ${indexOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"}`}
        aria-hidden={!indexOpen}
        style={{ cursor: "default", pointerEvents: indexOpen ? "auto" : "none", isolation: "isolate" }}
      >
        <div className="absolute inset-0 z-0 pointer-events-none"><RgbAuraBackground contained /></div>
        <div className="relative z-10 flex items-center justify-between px-4 sm:px-5 pt-4 pb-1">
          <button type="button" onClick={() => { window.dispatchEvent(new CustomEvent("rgb:leave-project")); router.push("/"); }} className="pointer-events-auto !cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-white/70 transition-colors hover:bg-white/15 hover:text-white">
            <span aria-hidden="true">←</span><span>Back</span>
          </button>
        </div>
        <div className="relative z-10 flex items-center justify-between border-b border-white/[0.07] px-2 pb-4 pt-3 mx-4 sm:mx-5">
          <div className="flex items-center gap-2"><button type="button" onClick={() => { setIndexOpen(false); window.dispatchEvent(new CustomEvent("rgb:project-index-toggle", { detail: { open: false } })); }} aria-label="Hide project directory" className="pointer-events-auto !cursor-pointer grid h-7 w-7 place-items-center rounded-lg text-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white">‹</button><span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55">Project directory</span></div>
          <span className="text-[10px] font-mono text-white/30">{String(categories.length).padStart(2, "0")} categories</span>
        </div>

        <div className="relative z-10 space-y-1 px-4 sm:px-5 pb-1">
          {categories.map((cat, catIdx) => {
            const isExpanded = expandedCategory === cat.slug;
            const isCatHighlighted =
              isExpanded || cat.items.some((it) => it.chunkIndex === activeChunkIndex);

            return (
              <div key={cat.slug} className="border-b border-white/[0.07] pb-2 last:border-b-0">
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() =>
                    setExpandedCategory((prev) => (prev === cat.slug ? null : cat.slug))
                  }
                  className="pointer-events-auto !cursor-pointer group w-full flex items-center justify-between gap-3 rounded-xl px-2.5 py-3 text-left transition-colors hover:bg-white/[0.075]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="text-[10px] font-mono text-white/25">{String(catIdx + 1).padStart(2, "0")}</span>
                    <span className={`text-xs font-medium tracking-wide transition-colors ${isCatHighlighted ? "text-white" : "text-white/65 group-hover:text-white"}`}>
                      {cat.title}
                    </span>
                  </span>
                  <span className={`text-white/40 text-sm transition-transform duration-300 ${isExpanded ? "rotate-45" : ""}`} aria-hidden="true">+</span>
                </button>

                <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <ul className="space-y-1 pb-2 pl-9 pr-1">
                      {cat.items.map((item) => {
                        const isSelected = activeChunkIndex === item.chunkIndex;
                        return (
                          <li key={item.href}>
                            <button
                              type="button"
                              data-project-index={item.chunkIndex}
                              onMouseEnter={() => handleItemHover(item.chunkIndex)}
                              onFocus={() => handleItemHover(item.chunkIndex)}
                              onBlur={() => handleItemHover(null)}
                              onClick={() => handleItemClick(item.chunkIndex)}
                              className={`pointer-events-auto !cursor-pointer group/item w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors duration-200 ${isSelected ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/[0.05] hover:text-white"}`}
                            >
                              <span className="text-xs font-normal truncate">{item.title}</span>
                              <span className={`text-[10px] shrink-0 transition-opacity duration-200 ${isSelected ? "opacity-90 text-white" : "opacity-0 group-hover/item:opacity-60"}`}>↗</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </main>
  );
}
