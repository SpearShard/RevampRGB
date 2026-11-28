"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import projectsData from "../data/projects.json";
import { projectSlug } from "../utils/projectSlugs";

type ProjectItem = { title: string; dir: string; cover: string };
type Category = { title: string; projects: ProjectItem[] };

const STUDIO_EMAIL = "hello@rgbstudio.com";

const ABOUT_PILLARS = [
  { number: "01", title: "Material Experiments", category: "Pillar 01 / 03" },
  { number: "02", title: "Computational Design", category: "Pillar 02 / 03" },
  { number: "03", title: "Multi-disciplinary", category: "Pillar 03 / 03" },
] as const;

const CONTACT_CHANNELS = [
  { label: "Email", subtitle: STUDIO_EMAIL, href: `mailto:${STUDIO_EMAIL}`, external: false, category: "Direct Mail" },
  { label: "Instagram", subtitle: "@rgbdesign", href: "https://instagram.com", external: true, category: "Journal" },
  { label: "YouTube", subtitle: "RGB Design Studio", href: "https://youtube.com", external: true, category: "Motion & Film" },
] as const;

type DockMode = "project" | "about" | "contact" | "hidden";

function resolveDockMode(path: string): DockMode {
  if (path === "/project") return "project";
  if (path === "/about") return "about";
  if (path === "/contact") return "contact";
  return "hidden";
}

export default function MobileDock() {
  const pathname = usePathname();
  const router = useRouter();
  const [overrideMode, setOverrideMode] = useState<DockMode | null>(null);
  const dockShellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOverrideMode(null));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    const toProject = (e: Event) => {
      setOverrideMode("project");
      const fromTop = (e as CustomEvent<{ fromRectTop?: number }>).detail?.fromRectTop;
      if (typeof fromTop === "number" && dockShellRef.current) {
        requestAnimationFrame(() => {
          const el = dockShellRef.current;
          if (!el) return;
          const targetTop = el.getBoundingClientRect().top;
          const deltaY = fromTop - targetTop;
          gsap.fromTo(
            el,
            { y: deltaY, scale: 0.96 },
            { y: 0, scale: 1, duration: 0.62, ease: "power3.out", clearProps: "transform" }
          );
        });
      }
    };
    const toAbout = () => setOverrideMode("about");
    const toContact = () => setOverrideMode("contact");
    const toHidden = () => setOverrideMode("hidden");

    window.addEventListener("rgb:enter-project", toProject);
    window.addEventListener("rgb:enter-about", toAbout);
    window.addEventListener("rgb:enter-contact", toContact);
    window.addEventListener("rgb:leave-project", toHidden);
    window.addEventListener("rgb:enter-detail", toHidden);
    return () => {
      window.removeEventListener("rgb:enter-project", toProject);
      window.removeEventListener("rgb:enter-about", toAbout);
      window.removeEventListener("rgb:enter-contact", toContact);
      window.removeEventListener("rgb:leave-project", toHidden);
      window.removeEventListener("rgb:enter-detail", toHidden);
    };
  }, []);

  const mode: DockMode = overrideMode ?? resolveDockMode(pathname);

  const [projectIndex, setProjectIndex] = useState(0);
  const [aboutIndex, setAboutIndex] = useState(0);
  const [contactIndex, setContactIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const rulerRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const categoryTitleRef = useRef<HTMLDivElement>(null);
  const itemTitleRef = useRef<HTMLDivElement>(null);

  const isProgrammaticScrollRef = useRef(false);
  const isTouchingRulerRef = useRef(false);
  const snapTweenRef = useRef<gsap.core.Tween | null>(null);
  const scrollIdleTimerRef = useRef<number | null>(null);

  const categories = useMemo(
    () =>
      Object.entries(projectsData as unknown as Record<string, Category>).filter(([, value]) =>
        Array.isArray(value.projects)
      ),
    []
  );

  const entries = useMemo(
    () =>
      categories.flatMap(([slug, category]) =>
        category.projects.map((project) => ({
          ...project,
          category: category.title,
          categorySlug: slug,
          href: `/project/${slug}/${projectSlug(project.dir)}`,
        }))
      ),
    [categories]
  );

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

  const activeIndex =
    mode === "project" ? projectIndex : mode === "about" ? aboutIndex : contactIndex;
  const totalCount =
    mode === "project" ? entries.length : mode === "about" ? ABOUT_PILLARS.length : CONTACT_CHANNELS.length;

  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const activeCategoryText =
    mode === "project"
      ? entries[projectIndex]?.category ?? ""
      : mode === "about"
        ? ABOUT_PILLARS[aboutIndex]?.category ?? ""
        : CONTACT_CHANNELS[contactIndex]?.category ?? "";

  const activeItemText =
    mode === "project"
      ? entries[projectIndex]?.title ?? ""
      : mode === "about"
        ? ABOUT_PILLARS[aboutIndex]?.title ?? ""
        : CONTACT_CHANNELS[contactIndex]?.label ?? "";

  const [displayedCategory, setDisplayedCategory] = useState(activeCategoryText);
  const prevCategoryRef = useRef(activeCategoryText);

  const [displayedTitle, setDisplayedTitle] = useState(activeItemText);
  const prevTitleRef = useRef(activeItemText);

  // Blurry reveal for top-left category/eyebrow title
  useEffect(() => {
    if (!activeCategoryText || activeCategoryText === prevCategoryRef.current) return;
    prevCategoryRef.current = activeCategoryText;
    const el = categoryTitleRef.current;
    if (!el) {
      const f = requestAnimationFrame(() => setDisplayedCategory(activeCategoryText));
      return () => cancelAnimationFrame(f);
    }
    gsap.killTweensOf(el);
    gsap.to(el, {
      opacity: 0,
      filter: "blur(6px)",
      y: -4,
      duration: 0.13,
      ease: "power2.in",
      onComplete: () => {
        setDisplayedCategory(activeCategoryText);
        requestAnimationFrame(() => {
          if (categoryTitleRef.current) {
            gsap.fromTo(
              categoryTitleRef.current,
              { opacity: 0, filter: "blur(8px)", y: 5 },
              { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.26, ease: "power3.out" }
            );
          }
        });
      },
    });
  }, [activeCategoryText]);

  // Blurry reveal for sub-project / pillar / channel title
  useEffect(() => {
    if (!activeItemText || activeItemText === prevTitleRef.current) return;
    prevTitleRef.current = activeItemText;
    const el = itemTitleRef.current;
    if (!el) {
      const f = requestAnimationFrame(() => setDisplayedTitle(activeItemText));
      return () => cancelAnimationFrame(f);
    }
    gsap.killTweensOf(el);
    gsap.to(el, {
      opacity: 0,
      filter: "blur(6px)",
      y: -4,
      duration: 0.12,
      ease: "power2.in",
      onComplete: () => {
        setDisplayedTitle(activeItemText);
        requestAnimationFrame(() => {
          if (itemTitleRef.current) {
            gsap.fromTo(
              itemTitleRef.current,
              { opacity: 0, filter: "blur(8px)", y: 5 },
              { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.25, ease: "power3.out" }
            );
          }
        });
      },
    });
  }, [activeItemText]);

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
        duration: 0.34,
        ease: "power3.out",
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

  const emitSelection = useCallback(
    (idx: number, targetMode: DockMode) => {
      if (targetMode === "project") {
        const entry = entries[idx];
        if (entry) {
          window.dispatchEvent(new CustomEvent("rgb:index-hover", { detail: { href: entry.href } }));
        }
      } else if (targetMode === "about") {
        window.dispatchEvent(new CustomEvent("rgb:about-select", { detail: { index: idx } }));
      } else if (targetMode === "contact") {
        window.dispatchEvent(new CustomEvent("rgb:contact-select", { detail: { index: idx } }));
      }
    },
    [entries]
  );

  // Sync ruler position and emit selection when mode changes
  useEffect(() => {
    if (mode === "hidden" || typeof window === "undefined" || window.innerWidth >= 640) return;
    const idx = mode === "project" ? projectIndex : mode === "about" ? aboutIndex : contactIndex;
    emitSelection(idx, mode);
    const frame = requestAnimationFrame(() => {
      const el = rulerRef.current;
      if (el) {
        isProgrammaticScrollRef.current = true;
        el.scrollLeft = getTargetScrollLeft(idx);
        requestAnimationFrame(() => {
          isProgrammaticScrollRef.current = false;
        });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [mode]);

  // Listen to fractal tap/hover and category jumps from Works
  useEffect(() => {
    const onFractalHover = (event: Event) => {
      if (mode !== "project" || isTouchingRulerRef.current) return;
      const href = (event as CustomEvent<{ href?: string }>).detail?.href ?? null;
      if (!href) return;
      const idx = entries.findIndex((e) => e.href === href);
      if (idx !== -1 && idx !== activeIndexRef.current) {
        setProjectIndex(idx);
        springSnapTo(idx);
      }
    };

    const onJumpCategory = (event: Event) => {
      const slug = (event as CustomEvent<{ categorySlug?: string }>).detail?.categorySlug;
      if (!slug) return;
      const group = categoryGroups.find((g) => g.slug === slug);
      if (group) {
        setProjectIndex(group.startIndex);
      }
    };

    window.addEventListener("rgb:fractal-hover", onFractalHover);
    window.addEventListener("rgb:project-jump-category", onJumpCategory);
    return () => {
      window.removeEventListener("rgb:fractal-hover", onFractalHover);
      window.removeEventListener("rgb:project-jump-category", onJumpCategory);
    };
  }, [mode, entries, categoryGroups, springSnapTo]);

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
    if (!el || totalCount === 0) return 0;
    const center = el.scrollLeft + el.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < totalCount; i++) {
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
  }, [totalCount]);

  const setModeIndex = useCallback(
    (idx: number) => {
      if (mode === "project") setProjectIndex(idx);
      else if (mode === "about") setAboutIndex(idx);
      else if (mode === "contact") setContactIndex(idx);
      emitSelection(idx, mode);
    },
    [mode, emitSelection]
  );

  const handleRulerScroll = () => {
    if (isProgrammaticScrollRef.current || mode === "hidden") return;
    const closest = findClosestIndex();
    if (closest !== activeIndexRef.current) {
      setModeIndex(closest);
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

  const selectTick = (idx: number) => {
    setModeIndex(idx);
    springSnapTo(idx);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(STUDIO_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${STUDIO_EMAIL}`;
    }
  };

  const openProject = (href: string) => {
    window.dispatchEvent(new CustomEvent("rgb:enter-detail", { detail: { href } }));
    router.push(href);
  };

  const isVisible = mode !== "hidden";
  const hasProtrusion = mode === "project" || mode === "contact";
  const activeProjectEntry = entries[projectIndex] ?? entries[0];

  return (
    <section
      aria-label="Mobile navigation dock"
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-opacity duration-300 sm:hidden ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        ref={dockShellRef}
        className="relative flex w-full max-w-[356px] flex-col items-center drop-shadow-[0_18px_40px_rgba(0,0,0,0.65)]"
      >
        {/* Subtle Auroric RGB Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-4 -bottom-2 h-28 rounded-full bg-gradient-to-r from-[#ff2433]/18 via-[#1ff261]/12 to-[#0056e6]/18 blur-2xl"
        />

        {/* Morphing Top-Middle Protruding Tab (Projects preview <-> Contact card <-> Collapsed on About) */}
        <div
          className={`relative z-20 flex items-end justify-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            hasProtrusion ? "max-h-[140px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* Left Concave Fillet */}
          <div
            aria-hidden="true"
            className="pointer-events-none h-[14px] w-[14px] shrink-0 bg-white/[0.08] backdrop-blur-xl backdrop-saturate-150 [mask-image:radial-gradient(circle_at_0_0,transparent_13.5px,black_14px)]"
          />

          <div
            className={`relative overflow-hidden rounded-t-[20px] backdrop-blur-xl backdrop-saturate-150 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              mode === "contact" ? "w-[228px] p-1.5 pb-1 bg-[#0c0d13]/85" : "w-[168px] p-1.5 pb-1 bg-white/[0.08]"
            }`}
          >
            {mode === "project" && activeProjectEntry && (
              <button
                type="button"
                onClick={() => openProject(activeProjectEntry.href)}
                aria-label={`Open ${activeProjectEntry.title}`}
                className="pointer-events-auto block w-full overflow-hidden rounded-[13px] bg-black/40 transition-transform duration-150 active:scale-[0.98]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <div
                    className="flex h-full w-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                    style={{ transform: `translate3d(-${projectIndex * 100}%, 0, 0)` }}
                  >
                    {entries.map((entry, idx) => (
                      <div key={entry.href} className="relative h-full w-full shrink-0">
                        <Image
                          src={entry.cover}
                          alt={entry.title}
                          fill
                          sizes="168px"
                          loading={Math.abs(idx - projectIndex) <= 1 ? "eager" : "lazy"}
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/[0.08]" />
                </div>
              </button>
            )}

            {mode === "contact" && (
              <div className="pointer-events-auto w-full overflow-hidden rounded-[13px]">
                <div
                  className="flex w-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                  style={{ transform: `translate3d(-${contactIndex * 100}%, 0, 0)` }}
                >
                  {CONTACT_CHANNELS.map((channel, idx) => (
                    <div key={channel.label} className="w-full shrink-0 px-2.5 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-white">
                          {idx === 0 && <Mail className="h-3.5 w-3.5 text-white/80" />}
                          {idx === 1 && (
                            <svg className="h-3.5 w-3.5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                            </svg>
                          )}
                          {idx === 2 && (
                            <svg className="h-3.5 w-3.5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                              <path d="m10 15 5-3-5-3z" />
                            </svg>
                          )}
                          <span>{channel.label}</span>
                        </span>
                        {idx === 0 && (
                          <button
                            type="button"
                            onClick={handleCopyEmail}
                            aria-label="Copy email address"
                            className="flex h-6 items-center gap-1 rounded-full bg-white/[0.12] px-2 text-[10px] font-medium text-white/90 active:bg-white/25"
                          >
                            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            <span>{copied ? "Copied" : "Copy"}</span>
                          </button>
                        )}
                      </div>
                      <a
                        href={channel.href}
                        target={channel.external ? "_blank" : undefined}
                        rel={channel.external ? "noreferrer" : undefined}
                        className="mt-1.5 flex items-center justify-between rounded-[10px] bg-white/[0.08] px-2.5 py-1.5 text-[11.5px] text-white/90 transition-colors active:bg-white/[0.16]"
                      >
                        <span className="truncate font-medium">{channel.subtitle}</span>
                        <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 shrink-0 text-white/60" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Concave Fillet */}
          <div
            aria-hidden="true"
            className="pointer-events-none h-[14px] w-[14px] shrink-0 bg-white/[0.08] backdrop-blur-xl backdrop-saturate-150 [mask-image:radial-gradient(circle_at_100%_0,transparent_13.5px,black_14px)]"
          />
        </div>

        {/* Bottom Borderless Liquid Glass Scale Dock (persistent across /project, /about, /contact) */}
        <div className={`pointer-events-auto relative w-full overflow-hidden rounded-[22px] pb-3 pt-2.5 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300 ${mode === "about" || mode === "contact" ? "bg-[#0c0d13]/85" : "bg-white/[0.08]"}`}>
          {/* Top-Left Category/Context Title (Blurry Reveal) + Counter */}
          <div className="relative flex items-center justify-between gap-3 px-4">
            <div
              ref={categoryTitleRef}
              className="min-w-0 truncate font-mono text-[9.5px] font-medium uppercase tracking-[0.2em] text-white/65 will-change-[transform,opacity,filter]"
            >
              {displayedCategory}
            </div>
            <span className="w-10 shrink-0 text-right font-mono text-[10px] tabular-nums text-white/55">
              {String(activeIndex + 1).padStart(2, "0")}/{String(totalCount).padStart(2, "0")}
            </span>
          </div>

          {/* Sub-Project / Pillar / Channel Title (Blurry Reveal) */}
          <div
            ref={itemTitleRef}
            className="relative mt-0.5 min-w-0 truncate px-4 pb-2 text-[13px] font-medium tracking-tight text-white will-change-[transform,opacity,filter]"
          >
            {displayedTitle}
          </div>

          {/* Morphing Ruler Track */}
          <div className="relative pt-1">
            <div
              ref={rulerRef}
              onScroll={handleRulerScroll}
              onTouchStart={handleRulerTouchStart}
              onTouchEnd={handleRulerTouchEnd}
              onTouchCancel={handleRulerTouchEnd}
              className="flex h-11 items-end gap-2.5 overflow-x-auto px-[50%] [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {mode === "project" &&
                categoryGroups.map((group) => {
                  const isGroupActive =
                    projectIndex >= group.startIndex && projectIndex <= group.endIndex;
                  return (
                    <div
                      key={group.slug}
                      className={`flex shrink-0 items-end rounded-[12px] px-2 py-1 transition-all duration-300 ${
                        isGroupActive
                          ? "bg-white/[0.08] ring-1 ring-inset ring-white/40 shadow-[0_0_14px_rgba(255,255,255,0.14)]"
                          : "bg-white/[0.02] ring-1 ring-inset ring-white/[0.12]"
                      }`}
                    >
                      {group.items.map((entry, localIdx) => {
                        const idx = group.startIndex + localIdx;
                        const isActive = idx === projectIndex;
                        return (
                          <button
                            key={entry.href}
                            ref={(el) => {
                              tickRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => selectTick(idx)}
                            aria-label={`Select ${entry.title}`}
                            className="flex h-9 w-[52px] shrink-0 items-end justify-between px-1.5 focus:outline-none"
                          >
                            <span className="h-2 w-px bg-white/20" />
                            <span className="h-3 w-px bg-white/30" />
                            <span
                              className={`rounded-full transition-all duration-200 ${
                                isActive
                                  ? "h-7 w-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.65)]"
                                  : "h-3.5 w-[1.5px] bg-white/40"
                              }`}
                            />
                            <span className="h-3 w-px bg-white/30" />
                            <span className="h-2 w-px bg-white/20" />
                          </button>
                        );
                      })}
                    </div>
                  );
                })}

              {mode === "about" && (
                <div className="flex shrink-0 items-end rounded-[12px] bg-white/[0.08] px-2 py-1 ring-1 ring-inset ring-white/35 shadow-[0_0_14px_rgba(255,255,255,0.12)]">
                  {ABOUT_PILLARS.map((pillar, idx) => {
                    const isActive = idx === aboutIndex;
                    return (
                      <button
                        key={pillar.number}
                        ref={(el) => {
                          tickRefs.current[idx] = el;
                        }}
                        type="button"
                        onClick={() => selectTick(idx)}
                        aria-label={`Select ${pillar.title}`}
                        className="flex h-9 w-[82px] shrink-0 items-end justify-between px-2 focus:outline-none"
                      >
                        <span className="h-2 w-px bg-white/20" />
                        <span className="h-3 w-px bg-white/30" />
                        <span
                          className={`rounded-full transition-all duration-200 ${
                            isActive
                              ? "h-7 w-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.65)]"
                              : "h-3.5 w-[1.5px] bg-white/40"
                          }`}
                        />
                        <span className="h-3 w-px bg-white/30" />
                        <span className="h-2 w-px bg-white/20" />
                      </button>
                    );
                  })}
                </div>
              )}

              {mode === "contact" && (
                <div className="flex shrink-0 items-end rounded-[12px] bg-white/[0.08] px-2 py-1 ring-1 ring-inset ring-white/35 shadow-[0_0_14px_rgba(255,255,255,0.12)]">
                  {CONTACT_CHANNELS.map((channel, idx) => {
                    const isActive = idx === contactIndex;
                    return (
                      <button
                        key={channel.label}
                        ref={(el) => {
                          tickRefs.current[idx] = el;
                        }}
                        type="button"
                        onClick={() => selectTick(idx)}
                        aria-label={`Select ${channel.label}`}
                        className="flex h-9 w-[82px] shrink-0 items-end justify-between px-2 focus:outline-none"
                      >
                        <span className="h-2 w-px bg-white/20" />
                        <span className="h-3 w-px bg-white/30" />
                        <span
                          className={`rounded-full transition-all duration-200 ${
                            isActive
                              ? "h-7 w-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.65)]"
                              : "h-3.5 w-[1.5px] bg-white/40"
                          }`}
                        />
                        <span className="h-3 w-px bg-white/30" />
                        <span className="h-2 w-px bg-white/20" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
