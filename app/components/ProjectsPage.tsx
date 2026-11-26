"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import projectsData from "../data/projects.json";
import { projectSlug } from "../utils/projectSlugs";

type ProjectItem = { title: string; dir: string; cover: string };
type Category = { title: string; projects: ProjectItem[] };

const RGB = ["#ff2433", "#1ff261", "#0056e6"];
const RULER_STEP = 52;

export default function ProjectsPage() {
  const router = useRouter();
  const [indexOpen, setIndexOpen] = useState(true);
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [showMobileHint, setShowMobileHint] = useState(true);
  const rulerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const isTouchingRulerRef = useRef(false);

  const categories = useMemo(
    () =>
      Object.entries(projectsData as unknown as Record<string, Category>).filter(([, value]) =>
        Array.isArray(value.projects)
      ),
    []
  );

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

  const hoverProject = useCallback((href: string | null) => {
    setActiveHref(href);
    window.dispatchEvent(
      new CustomEvent(href ? "rgb:index-hover" : "rgb:index-clear", { detail: { href } })
    );
  }, []);

  const openProject = useCallback(
    (href: string) => {
      window.dispatchEvent(new CustomEvent("rgb:enter-detail", { detail: { href } }));
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640 && entries[0]) {
      hoverProject(entries[0].href);
    }
  }, [entries, hoverProject]);

  useEffect(() => {
    const showHint = () => {
      setShowMobileHint(true);
    };
    window.addEventListener("rgb:enter-project", showHint);
    return () => window.removeEventListener("rgb:enter-project", showHint);
  }, []);

  useEffect(() => {
    if (!showMobileHint) return;
    const timer = window.setTimeout(() => setShowMobileHint(false), 5500);
    return () => window.clearTimeout(timer);
  }, [showMobileHint]);

  useEffect(() => {
    const onFractalHover = (event: Event) => {
      const href = (event as CustomEvent<{ href?: string }>).detail?.href ?? null;
      setActiveHref(href);

      if (!href || isTouchingRulerRef.current) return;
      const idx = entries.findIndex((entry) => entry.href === href);
      if (idx !== -1 && idx !== mobileIndex) {
        setMobileIndex(idx);
        if (rulerRef.current) {
          isProgrammaticScrollRef.current = true;
          rulerRef.current.scrollTo({ left: idx * RULER_STEP, behavior: "smooth" });
          window.setTimeout(() => {
            isProgrammaticScrollRef.current = false;
          }, 360);
        }
      }
    };
    const onFractalClear = () => setActiveHref(null);
    window.addEventListener("rgb:fractal-hover", onFractalHover);
    window.addEventListener("rgb:fractal-clear", onFractalClear);
    return () => {
      window.removeEventListener("rgb:fractal-hover", onFractalHover);
      window.removeEventListener("rgb:fractal-clear", onFractalClear);
    };
  }, [entries, mobileIndex]);

  const handleRulerScroll = () => {
    const el = rulerRef.current;
    if (!el || isProgrammaticScrollRef.current || entries.length === 0) return;

    const rawIndex = Math.round(el.scrollLeft / RULER_STEP);
    const clampedIndex = Math.max(0, Math.min(entries.length - 1, rawIndex));

    if (clampedIndex !== mobileIndex) {
      setMobileIndex(clampedIndex);
      const target = entries[clampedIndex];
      if (target) {
        hoverProject(target.href);
      }
    }
  };

  const scrollToProject = (idx: number) => {
    const target = entries[idx];
    if (!target) return;
    setMobileIndex(idx);
    hoverProject(target.href);
    if (rulerRef.current) {
      isProgrammaticScrollRef.current = true;
      rulerRef.current.scrollTo({ left: idx * RULER_STEP, behavior: "smooth" });
      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 360);
    }
  };

  const featuredEntry = entries.find((entry) => entry.href === activeHref) ?? entries[0];
  const mobileActiveEntry = entries[mobileIndex] ?? entries[0];

  return (
    <main className="pointer-events-none relative z-10 flex h-[100svh] min-h-[560px] w-full overflow-hidden bg-transparent text-white">
      <section
        aria-label="Works introduction"
        className="pointer-events-none absolute right-4 top-24 z-10 hidden w-[min(330px,calc(100vw-2rem))] text-right sm:right-10 sm:top-24 sm:block sm:w-[min(420px,38vw)]"
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/45">
          RGB / Selected works / 2020—26
        </p>
        <h1 className="mt-3 text-[2.15rem] font-light leading-[0.94] tracking-[-0.075em] text-white sm:text-5xl md:text-6xl">
          Ideas made <span className="text-white/45">tangible.</span>
        </h1>
        <p className="ml-auto mt-3 max-w-[290px] text-[11px] leading-relaxed text-white/50 sm:text-xs">
          A collection of spatial experiments, material studies and built work — shaped by
          curiosity, craft and computation.
        </p>
        <div className="mt-5 flex items-center justify-end gap-4 border-t border-white/15 pt-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
            {String(categories.length).padStart(2, "0")} disciplines
          </span>
          <span className="h-1 w-1 rounded-full bg-white/35" />
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
            {String(entries.length).padStart(2, "0")} projects
          </span>
        </div>
      </section>

      {/* Mobile Top-Middle Pill Hint */}
      <div
        className={`pointer-events-none fixed left-1/2 top-16 z-30 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 transition-all duration-500 sm:hidden ${
          showMobileHint ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => setShowMobileHint(false)}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/[0.2] bg-white/[0.08] px-4 py-1.5 text-[11px] font-medium tracking-tight text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl backdrop-saturate-150"
        >
          <span>Slide the scale to explore · Tap preview to open</span>
        </button>
      </div>

      {/* Mobile-only Liquid Glass Scale + Top-Middle Sliding Image Protrusion */}
      {mobileActiveEntry && (
        <section
          aria-label="Mobile project scale"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden"
        >
          <div className="relative flex w-full max-w-[356px] flex-col items-center">
            {/* Subtle Auroric RGB Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-4 -bottom-2 h-28 rounded-full bg-gradient-to-r from-[#ff2433]/18 via-[#1ff261]/12 to-[#0056e6]/18 blur-2xl"
            />

            {/* Top-Middle Protruding Sliding Image Frame (Liquid Glass) */}
            <button
              type="button"
              onClick={() => openProject(mobileActiveEntry.href)}
              aria-label={`Open ${mobileActiveEntry.title}`}
              className="pointer-events-auto group relative z-10 -mb-px w-[168px] overflow-hidden rounded-t-[20px] border border-b-0 border-white/[0.22] bg-white/[0.07] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.32),0_-14px_38px_rgba(0,0,0,0.5)] backdrop-blur-xl backdrop-saturate-150 transition-transform duration-150 active:scale-[0.98]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[13px] bg-black/40">
                <div
                  className="flex h-full w-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                  style={{ transform: `translate3d(-${mobileIndex * 100}%, 0, 0)` }}
                >
                  {entries.map((entry, idx) => (
                    <div key={entry.href} className="relative h-full w-full shrink-0">
                      <Image
                        src={entry.cover}
                        alt={entry.title}
                        fill
                        sizes="168px"
                        loading={Math.abs(idx - mobileIndex) <= 1 ? "eager" : "lazy"}
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/[0.08]" />
              </div>
            </button>

            {/* Bottom Liquid Glass Scale Dock */}
            <div className="pointer-events-auto relative w-full overflow-hidden rounded-[22px] border border-white/[0.22] bg-white/[0.07] pb-3 pt-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(255,255,255,0.08),0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl backdrop-saturate-150">
              {/* Specular Glass Sheen */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.12] via-white/[0.02] to-transparent"
              />

              {/* Minimalist Readout */}
              <div className="relative flex h-7 items-center justify-between gap-3 px-4 pb-1">
                <p className="min-w-0 truncate text-[13px] font-medium tracking-tight text-white">
                  {mobileActiveEntry.title}
                </p>
                <span className="w-10 shrink-0 text-right font-mono text-[10px] tabular-nums text-white/55">
                  {String(mobileIndex + 1).padStart(2, "0")}/{String(entries.length).padStart(2, "0")}
                </span>
              </div>

              {/* Minimal Vertical-Line Ruler */}
              <div className="relative pt-1">
                {/* Center Hairline Needle */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-20 -translate-x-1/2"
                >
                  <span className="block h-7 w-[1.5px] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
                </div>

                {/* Scrollable Tick Track (no snap-mandatory bounce) */}
                <div
                  ref={rulerRef}
                  onScroll={handleRulerScroll}
                  onTouchStart={() => {
                    isTouchingRulerRef.current = true;
                  }}
                  onTouchEnd={() => {
                    isTouchingRulerRef.current = false;
                  }}
                  className="flex h-8 items-end overflow-x-auto px-[calc(50%-26px)] [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {entries.map((entry, idx) => {
                    const isActive = idx === mobileIndex;
                    return (
                      <button
                        key={entry.href}
                        type="button"
                        onClick={() => scrollToProject(idx)}
                        aria-label={`Select ${entry.title}`}
                        className="flex h-8 w-[52px] shrink-0 items-end justify-between px-1 focus:outline-none"
                      >
                        <span className="h-2 w-px bg-white/20" />
                        <span className="h-3 w-px bg-white/30" />
                        <span
                          className={`w-[1.5px] rounded-full transition-all duration-150 ${
                            isActive ? "h-6 bg-white" : "h-4 bg-white/45"
                          }`}
                        />
                        <span className="h-3 w-px bg-white/30" />
                        <span className="h-2 w-px bg-white/20" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <aside
        data-works-index
        className={`pointer-events-auto absolute left-3 top-28 bottom-24 z-20 hidden w-[min(340px,calc(100vw-24px))] flex-col overflow-hidden rounded-[22px] border border-white/[0.11] bg-[#090a0e]/65 shadow-[0_24px_90px_rgba(0,0,0,.45)] backdrop-blur-xl transition-transform duration-500 sm:left-7 sm:top-24 sm:bottom-28 sm:flex sm:rounded-[28px] ${
          indexOpen ? "translate-x-0" : "-translate-x-[calc(100%+40px)]"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/40">
              RGB / Archive
            </p>
            <h1 className="mt-1 text-lg font-light tracking-tight">Works Index</h1>
          </div>
          <span className="font-mono text-[9px] text-white/35">
            {String(entries.length).padStart(2, "0")} WORKS
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:thin]">
          {categories.map(([slug, category], categoryIndex) => (
            <section key={slug} className="mb-6 last:mb-1">
              <div className="mb-2 flex items-center gap-2 px-1">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: RGB[categoryIndex % RGB.length] }}
                />
                <h2 className="text-[10px] font-medium uppercase tracking-[0.17em] text-white/70">
                  {category.title}
                </h2>
              </div>
              <div className="space-y-0.5">
                {category.projects.map((project) => {
                  const href = `/project/${slug}/${projectSlug(project.dir)}`;
                  const active = activeHref === href;
                  const accent = entries.find((entry) => entry.href === href)?.color ?? RGB[0];
                  return (
                    <button
                      key={project.dir}
                      type="button"
                      onMouseEnter={() => hoverProject(href)}
                      onMouseLeave={() => hoverProject(null)}
                      onFocus={() => hoverProject(href)}
                      onBlur={() => hoverProject(null)}
                      onClick={() => openProject(href)}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        active ? "bg-white/[0.09]" : "hover:bg-white/[0.045]"
                      }`}
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: accent }}
                      />
                      <span
                        className={`min-w-0 flex-1 truncate text-[12px] ${
                          active ? "text-white" : "text-white/55 group-hover:text-white/85"
                        }`}
                      >
                        {project.title}
                      </span>
                      <span className="text-[10px] text-white/25">↗</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        <div className="border-t border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.2em] text-white/30">
          Select a study to explore
        </div>
      </aside>

      <button
        data-works-index
        type="button"
        className="pointer-events-auto absolute left-3 top-[5.25rem] z-30 hidden rounded-full border border-white/15 bg-[#090a0e]/80 px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-white/75 backdrop-blur-xl transition hover:bg-white hover:text-black sm:left-7 sm:block"
        onClick={() => setIndexOpen((open) => !open)}
      >
        {indexOpen ? "Hide Index" : "Works Index"}
      </button>

      {featuredEntry && (
        <div className="pointer-events-none absolute bottom-28 right-4 z-20 hidden w-56 overflow-hidden rounded-2xl border border-white/15 bg-[#090a0e]/85 shadow-2xl backdrop-blur-xl sm:right-8 sm:block md:w-64">
          <div className="relative aspect-[16/10]">
            <Image
              src={featuredEntry.cover}
              alt={featuredEntry.title}
              fill
              sizes="256px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/70">
              Featured study
            </span>
          </div>
          <div className="p-3">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
              {featuredEntry.category}
            </p>
            <p className="mt-1 text-sm text-white">{featuredEntry.title}</p>
          </div>
        </div>
      )}
    </main>
  );
}
