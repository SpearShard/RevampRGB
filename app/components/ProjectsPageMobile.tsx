"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import projectsData from "../data/projects.json";
import { projectSlug } from "../utils/projectSlugs";

type ProjectItem = { title: string; dir: string; cover: string };
type Category = { title: string; projects: ProjectItem[] };

const RGB = ["#ff2433", "#1ff261", "#0056e6"];

export default function ProjectsPage() {
  const router = useRouter();
  const [indexOpen, setIndexOpen] = useState(true);
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [showMobileHint, setShowMobileHint] = useState(true);

  const rulerRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const categoryTitleRef = useRef<HTMLDivElement>(null);
  const projectTitleRef = useRef<HTMLDivElement>(null);

  const isProgrammaticScrollRef = useRef(false);
  const isTouchingRulerRef = useRef(false);
  const snapTweenRef = useRef<gsap.core.Tween | null>(null);
  const scrollIdleTimerRef = useRef<number | null>(null);
  const mobileIndexRef = useRef(0);

  useEffect(() => {
    mobileIndexRef.current = mobileIndex;
  }, [mobileIndex]);

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

  const categoryGroups = useMemo(() => {
    let cursor = 0;
    return categories.map(([slug, category]) => {
      const startIndex = cursor;
      const items = entries.slice(startIndex, startIndex + category.projects.length);
      cursor += category.projects.length;
      return {
        slug,
        title: category.title,
        startIndex,
        endIndex: startIndex + items.length - 1,
        items,
      };
    });
  }, [categories, entries]);

  const [displayedCategory, setDisplayedCategory] = useState<string>(
    () => entries[0]?.category ?? ""
  );
  const prevCategoryRef = useRef<string>(entries[0]?.category ?? "");

  const [displayedTitle, setDisplayedTitle] = useState<string>(
    () => entries[0]?.title ?? ""
  );
  const prevTitleRef = useRef<string>(entries[0]?.title ?? "");

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

  const getTargetScrollLeft = useCallback((idx: number) => {
    const el = rulerRef.current;
    const tick = tickRefs.current[idx];
    if (!el || !tick) return 0;
    return tick.offsetLeft + tick.offsetWidth / 2 - el.clientWidth / 2;
  }, []);

  const springSnapTo = useCallback(
    (idx: number) => {
      const el = rulerRef.current;
      if (!el) return;
      const targetLeft = getTargetScrollLeft(idx);

      snapTweenRef.current?.kill();
      isProgrammaticScrollRef.current = true;

      snapTweenRef.current = gsap.to(el, {
        scrollLeft: targetLeft,
        duration: 0.56,
        ease: "elastic.out(1, 0.72)",
        onComplete: () => {
          isProgrammaticScrollRef.current = false;
          snapTweenRef.current = null;
        },
        onInterrupt: () => {
          isProgrammaticScrollRef.current = false;
        },
      });
    },
    [getTargetScrollLeft]
  );

  // Center the initial tick on mount
  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth >= 640 || !entries[0]) return;
    hoverProject(entries[0].href);
    const frame = requestAnimationFrame(() => {
      const el = rulerRef.current;
      if (el) {
        isProgrammaticScrollRef.current = true;
        el.scrollLeft = getTargetScrollLeft(0);
        requestAnimationFrame(() => {
          isProgrammaticScrollRef.current = false;
        });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [entries, hoverProject, getTargetScrollLeft]);

  useEffect(() => {
    const showHint = () => setShowMobileHint(true);
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
      if (idx !== -1 && idx !== mobileIndexRef.current) {
        setMobileIndex(idx);
        springSnapTo(idx);
      }
    };
    const onFractalClear = () => setActiveHref(null);
    window.addEventListener("rgb:fractal-hover", onFractalHover);
    window.addEventListener("rgb:fractal-clear", onFractalClear);
    return () => {
      window.removeEventListener("rgb:fractal-hover", onFractalHover);
      window.removeEventListener("rgb:fractal-clear", onFractalClear);
    };
  }, [entries, springSnapTo]);

  useEffect(() => {
    return () => {
      snapTweenRef.current?.kill();
      if (scrollIdleTimerRef.current !== null) {
        window.clearTimeout(scrollIdleTimerRef.current);
      }
    };
  }, []);

  const findClosestIndex = useCallback(() => {
    const el = rulerRef.current;
    if (!el || entries.length === 0) return 0;
    const center = el.scrollLeft + el.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < entries.length; i++) {
      const tick = tickRefs.current[i];
      if (!tick) continue;
      const tickCenter = tick.offsetLeft + tick.offsetWidth / 2;
      const dist = Math.abs(tickCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    return bestIdx;
  }, [entries.length]);

  const handleRulerScroll = () => {
    if (isProgrammaticScrollRef.current || entries.length === 0) return;

    const closest = findClosestIndex();
    if (closest !== mobileIndexRef.current) {
      setMobileIndex(closest);
      const target = entries[closest];
      if (target) {
        hoverProject(target.href);
      }
    }

    if (scrollIdleTimerRef.current !== null) {
      window.clearTimeout(scrollIdleTimerRef.current);
    }
    if (!isTouchingRulerRef.current) {
      scrollIdleTimerRef.current = window.setTimeout(() => {
        springSnapTo(findClosestIndex());
      }, 95);
    }
  };

  const handleRulerTouchStart = () => {
    isTouchingRulerRef.current = true;
    isProgrammaticScrollRef.current = false;
    snapTweenRef.current?.kill();
    if (scrollIdleTimerRef.current !== null) {
      window.clearTimeout(scrollIdleTimerRef.current);
    }
  };

  const handleRulerTouchEnd = () => {
    isTouchingRulerRef.current = false;
    if (scrollIdleTimerRef.current !== null) {
      window.clearTimeout(scrollIdleTimerRef.current);
    }
    scrollIdleTimerRef.current = window.setTimeout(() => {
      if (!isTouchingRulerRef.current) {
        springSnapTo(findClosestIndex());
      }
    }, 95);
  };

  const scrollToProject = (idx: number) => {
    const target = entries[idx];
    if (!target) return;
    setMobileIndex(idx);
    hoverProject(target.href);
    springSnapTo(idx);
  };

  const featuredEntry = entries.find((entry) => entry.href === activeHref) ?? entries[0];
  const mobileActiveEntry = entries[mobileIndex] ?? entries[0];
  const activeCategoryTitle = mobileActiveEntry?.category ?? "";
  const activeProjectTitle = mobileActiveEntry?.title ?? "";

  // Blurry reveal transition for Category Title
  useEffect(() => {
    if (!activeCategoryTitle || activeCategoryTitle === prevCategoryRef.current) return;
    prevCategoryRef.current = activeCategoryTitle;

    const el = categoryTitleRef.current;
    if (!el) {
      const frame = requestAnimationFrame(() => setDisplayedCategory(activeCategoryTitle));
      return () => cancelAnimationFrame(frame);
    }

    gsap.killTweensOf(el);
    gsap.to(el, {
      opacity: 0,
      filter: "blur(6px)",
      y: -4,
      duration: 0.14,
      ease: "power2.in",
      onComplete: () => {
        setDisplayedCategory(activeCategoryTitle);
        requestAnimationFrame(() => {
          if (categoryTitleRef.current) {
            gsap.fromTo(
              categoryTitleRef.current,
              { opacity: 0, filter: "blur(8px)", y: 5 },
              { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.28, ease: "power3.out" }
            );
          }
        });
      },
    });
  }, [activeCategoryTitle]);

  // Blurry reveal transition for Sub-Project Title
  useEffect(() => {
    if (!activeProjectTitle || activeProjectTitle === prevTitleRef.current) return;
    prevTitleRef.current = activeProjectTitle;

    const el = projectTitleRef.current;
    if (!el) {
      const frame = requestAnimationFrame(() => setDisplayedTitle(activeProjectTitle));
      return () => cancelAnimationFrame(frame);
    }

    gsap.killTweensOf(el);
    gsap.to(el, {
      opacity: 0,
      filter: "blur(6px)",
      y: -4,
      duration: 0.12,
      ease: "power2.in",
      onComplete: () => {
        setDisplayedTitle(activeProjectTitle);
        requestAnimationFrame(() => {
          if (projectTitleRef.current) {
            gsap.fromTo(
              projectTitleRef.current,
              { opacity: 0, filter: "blur(8px)", y: 5 },
              { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.26, ease: "power3.out" }
            );
          }
        });
      },
    });
  }, [activeProjectTitle]);

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
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/[0.08] px-4 py-1.5 text-[11px] font-medium tracking-tight text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl backdrop-saturate-150"
        >
          <span>Slide the scale to explore · Tap preview to open</span>
        </button>
      </div>

      <aside
        className={`pointer-events-auto fixed bottom-6 left-4 top-28 z-20 hidden w-64 flex-col rounded-2xl border border-white/10 bg-[#090a0e]/85 backdrop-blur-xl transition-all duration-500 sm:left-7 sm:flex ${
          indexOpen ? "translate-x-0 opacity-100" : "-translate-x-[120%] opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">Works Index</span>
          <span className="font-mono text-[10px] text-white/30">
            {String(entries.length).padStart(2, "0")}
          </span>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          {categories.map(([slug, category]) => (
            <section key={slug}>
              <div className="mb-2 flex items-center gap-2 px-2">
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <h2 className="text-[11px] font-medium uppercase tracking-[0.17em] text-white/70">
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
