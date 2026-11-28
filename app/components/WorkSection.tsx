"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import projectsData from "@/app/data/projects.json";
import { projectSlug } from "@/app/utils/projectSlugs";

type WorkCategory = {
  id: string;
  slug: string;
  title: string;
  image: string;
  thumbImage: string;
  projectCount: number;
  href: string;
};

// Google Drive's export=view URLs are unreliable as embedded image sources.
// Use its thumbnail endpoint so the representative covers load consistently.
const getDisplayImage = (url: string, size = "w1600") => {
  const driveFileId = url.match(/[?&]id=([^&]+)/)?.[1];
  return driveFileId
    ? `https://drive.google.com/thumbnail?id=${driveFileId}&sz=${size}`
    : url;
};

// One representative sub-project cover per category. The carousel itself
// stays category-based; it does not expand into individual sub-project cards.
const projects = Object.entries(projectsData)
  .map(([slug, rawCategory], index) => {
    const category = rawCategory as {
      title: string;
      projects?: { cover?: string }[];
    };
    const representativeProject = category.projects?.find((project) => project.cover);

    if (!category.title || !representativeProject?.cover) return null;

    return {
      id: String(index + 1).padStart(2, "0"),
      slug,
      title: category.title,
      image: getDisplayImage(representativeProject.cover, "w1600"),
      thumbImage: getDisplayImage(representativeProject.cover, "w600"),
      projectCount: category.projects?.length ?? 0,
      href: "/project",
    };
  })
  .filter((category): category is WorkCategory => category !== null);

export default function WorksPage() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [mobileActive, setMobileActive] = useState(0);
  const [displayedCatTitle, setDisplayedCatTitle] = useState(() => projects[0]?.title ?? "");
  const prevCatTitleRef = useRef(projects[0]?.title ?? "");
  const inlineDockRef = useRef<HTMLDivElement>(null);
  const inlineRulerRef = useRef<HTMLDivElement>(null);
  const inlineTickRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inlineTitleRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const isInlineProgScrollRef = useRef(false);
  const isInlineTouchingRef = useRef(false);
  const inlineSnapTweenRef = useRef<gsap.core.Tween | null>(null);
  const inlineIdleTimerRef = useRef<number | null>(null);
  const mobileActiveRef = useRef(0);

  useEffect(() => {
    mobileActiveRef.current = mobileActive;
  }, [mobileActive]);

  const getInlineTargetScrollLeft = (idx: number) => {
    const el = inlineRulerRef.current;
    const tick = inlineTickRefs.current[idx];
    if (!el || !tick) return 0;
    return tick.offsetLeft + tick.offsetWidth / 2 - el.clientWidth / 2;
  };

  const inlineSpringSnapTo = (idx: number) => {
    const el = inlineRulerRef.current;
    if (!el) return;
    inlineSnapTweenRef.current?.kill();
    isInlineProgScrollRef.current = true;
    inlineSnapTweenRef.current = gsap.to(el, {
      scrollLeft: getInlineTargetScrollLeft(idx),
      duration: 0.54,
      ease: "elastic.out(1, 0.72)",
      onComplete: () => {
        isInlineProgScrollRef.current = false;
        inlineSnapTweenRef.current = null;
      },
      onInterrupt: () => {
        isInlineProgScrollRef.current = false;
      },
    });
  };

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth >= 768) return;
    const frame = requestAnimationFrame(() => {
      const el = inlineRulerRef.current;
      if (el) {
        isInlineProgScrollRef.current = true;
        el.scrollLeft = getInlineTargetScrollLeft(0);
        requestAnimationFrame(() => {
          isInlineProgScrollRef.current = false;
        });
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      inlineSnapTweenRef.current?.kill();
      if (inlineIdleTimerRef.current !== null) window.clearTimeout(inlineIdleTimerRef.current);
    };
  }, []);

  const activeMobileTitle = projects[mobileActive]?.title ?? "";
  useEffect(() => {
    if (!activeMobileTitle || activeMobileTitle === prevCatTitleRef.current) return;
    prevCatTitleRef.current = activeMobileTitle;
    const el = inlineTitleRef.current;
    if (!el) {
      const f = requestAnimationFrame(() => setDisplayedCatTitle(activeMobileTitle));
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
        setDisplayedCatTitle(activeMobileTitle);
        requestAnimationFrame(() => {
          if (inlineTitleRef.current) {
            gsap.fromTo(
              inlineTitleRef.current,
              { opacity: 0, filter: "blur(8px)", y: 5 },
              { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.25, ease: "power3.out" }
            );
          }
        });
      },
    });
  }, [activeMobileTitle]);

  const findClosestInlineIndex = () => {
    const el = inlineRulerRef.current;
    if (!el || projects.length === 0) return 0;
    const center = el.scrollLeft + el.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < projects.length; i++) {
      const tick = inlineTickRefs.current[i];
      if (!tick) continue;
      const dist = Math.abs(tick.offsetLeft + tick.offsetWidth / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    return bestIdx;
  };

  const selectMobileCard = (idx: number, snap = true) => {
    const clamped = Math.max(0, Math.min(projects.length - 1, idx));
    setMobileActive(clamped);
    if (snap) inlineSpringSnapTo(clamped);
  };

  const openCategoryInProjects = (slug: string) => {
    const fromRectTop = inlineDockRef.current?.getBoundingClientRect().top;
    window.dispatchEvent(new CustomEvent("rgb:project-jump-category", { detail: { categorySlug: slug } }));
    window.dispatchEvent(new CustomEvent("rgb:enter-project", { detail: { fromRectTop } }));
    router.push("/project");
  };
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const mainCardRef = useRef<HTMLDivElement | null>(null);
  const leftCardRef = useRef<HTMLDivElement | null>(null);
  const rightCardRef = useRef<HTMLDivElement | null>(null);

  const selectDesktopSlide = (nextIdx: number) => {
    if (nextIdx === active) return;
    const direction = nextIdx > active ? 1 : -1;
    setActive(nextIdx);
    requestAnimationFrame(() => {
      gsap.fromTo(
        [leftCardRef.current, rightCardRef.current],
        { x: direction * 26, opacity: 0.16 },
        { x: 0, opacity: 0.35, duration: 0.75, ease: "power3.out", overwrite: "auto" }
      );
      gsap.fromTo(
        ".desktop-work-title",
        { y: 14, opacity: 0, filter: "blur(6px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.55, ease: "power3.out", overwrite: "auto" }
      );
    });
  };

  useEffect(() => {
    if (!isDesktop) return;
    gsap.fromTo(
      mainCardRef.current,
      { opacity: 0, y: 24, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "expo.out" }
    );
  }, [isDesktop]);
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-[#050505] md:bg-transparent text-white">
      <section className="relative z-10 w-full px-6 md:px-10">
        {/* Hero */}
        <div className="mb-10">
          <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-white/30">
            Selected Works
          </p>

          <h1 className="text-[4rem] font-[450] tracking-[-0.08em] text-white md:text-[6rem]">
            Works
          </h1>
        </div>

        {/* Mobile single-frame push-slide Works box + inline Liquid Glass scale */}
        <div className="flex flex-col items-center gap-4 pb-6 md:hidden">
          <div
            onTouchStart={(e) => {
              touchStartXRef.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (touchStartXRef.current === null) return;
              const dx = (e.changedTouches[0]?.clientX ?? touchStartXRef.current) - touchStartXRef.current;
              touchStartXRef.current = null;
              if (Math.abs(dx) > 36) {
                selectMobileCard(mobileActive + (dx < 0 ? 1 : -1));
              }
            }}
            className="relative w-full max-w-[330px] overflow-hidden rounded-[26px] border border-white/15 bg-[#111] shadow-[0_24px_60px_rgba(0,0,0,0.85)]"
          >
            <div
              className="flex w-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              style={{ transform: `translate3d(-${mobileActive * 100}%, 0, 0)` }}
            >
              {projects.map((cat, idx) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => openCategoryInProjects(cat.slug)}
                  className="relative flex h-[300px] w-full shrink-0 flex-col justify-between overflow-hidden p-5 text-left active:opacity-95"
                >
                  <img
                    src={cat.image}
                    alt={cat.title}
                    loading={Math.abs(idx - mobileActive) <= 1 ? "eager" : "lazy"}
                    className="absolute inset-0 h-full w-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/15" />
                  <div className="relative z-10 flex w-full items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.22em] text-white/65">
                      {cat.id} / {String(projects.length).padStart(2, "0")}
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
                      {String(cat.projectCount).padStart(2, "0")} studies
                    </span>
                  </div>
                  <div className="relative z-10 flex w-full items-end justify-between gap-2">
                    <span className="text-[1.75rem] font-light leading-[0.98] tracking-[-0.05em] text-white">
                      {cat.title}
                    </span>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 bg-black/30 text-white">
                      <ArrowUpRight size={15} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Inline Borderless Liquid Glass Scale (morphs into /project dock on tap) */}
          <div
            ref={inlineDockRef}
            className="relative w-full max-w-[330px] overflow-hidden rounded-[22px] bg-white/[0.08] pb-3 pt-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl backdrop-saturate-150"
          >
            <div className="flex items-center justify-between gap-3 px-4">
              <span className="font-mono text-[9.5px] font-medium uppercase tracking-[0.2em] text-white/65">
                Selected Works
              </span>
              <span className="w-10 shrink-0 text-right font-mono text-[10px] tabular-nums text-white/55">
                {String(mobileActive + 1).padStart(2, "0")}/{String(projects.length).padStart(2, "0")}
              </span>
            </div>
            <div
              ref={inlineTitleRef}
              className="mt-0.5 min-w-0 truncate px-4 pb-2 text-[13px] font-medium tracking-tight text-white will-change-[transform,opacity,filter]"
            >
              {displayedCatTitle}
            </div>
            <div className="pt-1">
              <div
                ref={inlineRulerRef}
                onScroll={() => {
                  if (isInlineProgScrollRef.current) return;
                  const closest = findClosestInlineIndex();
                  if (closest !== mobileActiveRef.current) setMobileActive(closest);
                  if (inlineIdleTimerRef.current !== null) window.clearTimeout(inlineIdleTimerRef.current);
                  if (!isInlineTouchingRef.current) {
                    inlineIdleTimerRef.current = window.setTimeout(() => {
                      inlineSpringSnapTo(findClosestInlineIndex());
                    }, 95);
                  }
                }}
                onTouchStart={() => {
                  isInlineTouchingRef.current = true;
                  isInlineProgScrollRef.current = false;
                  inlineSnapTweenRef.current?.kill();
                  if (inlineIdleTimerRef.current !== null) window.clearTimeout(inlineIdleTimerRef.current);
                }}
                onTouchEnd={() => {
                  isInlineTouchingRef.current = false;
                  if (inlineIdleTimerRef.current !== null) window.clearTimeout(inlineIdleTimerRef.current);
                  inlineIdleTimerRef.current = window.setTimeout(() => {
                    if (!isInlineTouchingRef.current) inlineSpringSnapTo(findClosestInlineIndex());
                  }, 95);
                }}
                className="flex h-11 items-end overflow-x-auto px-[50%] [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <div className="flex shrink-0 items-end rounded-[12px] bg-white/[0.08] px-2 py-1 ring-1 ring-inset ring-white/35 shadow-[0_0_14px_rgba(255,255,255,0.12)]">
                  {projects.map((cat, idx) => {
                    const isActiveTick = idx === mobileActive;
                    return (
                      <button
                        key={cat.slug}
                        ref={(el) => {
                          inlineTickRefs.current[idx] = el;
                        }}
                        type="button"
                        onClick={() => selectMobileCard(idx)}
                        aria-label={`Select ${cat.title}`}
                        className="flex h-9 w-[52px] shrink-0 items-end justify-between px-1.5 focus:outline-none"
                      >
                        <span className="h-2 w-px bg-white/20" />
                        <span className="h-3 w-px bg-white/30" />
                        <span
                          className={`rounded-full transition-all duration-200 ${
                            isActiveTick
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
              </div>
            </div>
          </div>
        </div>
        {/* Desktop slider remains unchanged */}
        {isDesktop && (
        <div className="hidden md:block">
        {/* Slider */}
        <div className="relative flex items-center justify-center">
          {/* LEFT RGB AURA */}
          <div className="pointer-events-none absolute left-[8%] top-1/2 z-20 hidden -translate-y-1/2 lg:block">
            <div className="h-[240px] w-[240px] rounded-full bg-red-500/20 blur-[120px]" />

            <div className="absolute left-10 top-10 h-[180px] w-[180px] rounded-full bg-green-500/20 blur-[100px]" />

            <div className="absolute left-20 top-0 h-[200px] w-[200px] rounded-full bg-blue-500/20 blur-[120px]" />
          </div>

          {/* RIGHT RGB AURA */}
          <div className="pointer-events-none absolute right-[8%] top-1/2 z-20 hidden -translate-y-1/2 lg:block">
            <div className="h-[240px] w-[240px] rounded-full bg-blue-500/20 blur-[120px]" />

            <div className="absolute left-0 top-10 h-[180px] w-[180px] rounded-full bg-red-500/20 blur-[100px]" />

            <div className="absolute left-10 top-0 h-[200px] w-[200px] rounded-full bg-green-500/20 blur-[120px]" />
          </div>

          {/* LEFT BLUR CARD */}
          <div
            ref={leftCardRef}
            className="absolute left-[3%] hidden h-[320px] w-[220px] overflow-hidden rounded-[28px] opacity-35 blur-md lg:block"
          >
            <img
              src={
                projects[(active - 1 + projects.length) % projects.length].thumbImage
              }
              className="h-full w-full object-cover"
            />
          </div>

          {/* RIGHT BLUR CARD */}
          <div
            ref={rightCardRef}
            className="absolute right-[3%] hidden h-[320px] w-[220px] overflow-hidden rounded-[28px] opacity-35 blur-md lg:block"
          >
            <img
              src={projects[(active + 1) % projects.length].thumbImage}
              className="h-full w-full object-cover"
            />
          </div>

          {/* MAIN PROJECT CARD (Smooth GPU Push-Slide) */}
          <div
            ref={mainCardRef}
            className="group relative h-[460px] w-full max-w-[820px] overflow-hidden rounded-[36px] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.75)]"
          >
            <div
              className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              style={{ transform: `translate3d(-${active * 100}%, 0, 0)` }}
            >
              {projects.map((proj, idx) => (
                <div key={proj.slug} className="relative h-full w-full shrink-0 overflow-hidden">
                  <img
                    src={proj.image}
                    alt={proj.title}
                    loading={Math.abs(idx - active) <= 1 ? "eager" : "lazy"}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-0 bg-black/35" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/85" />

            <Link
              href={projects[active].href}
              onClick={() => {
                window.dispatchEvent(new CustomEvent("rgb:project-jump-category", { detail: { categorySlug: projects[active].slug } }));
                window.dispatchEvent(new CustomEvent("rgb:enter-project"));
              }}
              aria-label={`Explore ${projects[active].title}`}
              className="absolute inset-0 z-10"
            />

            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:p-8">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
                  {projects[active].id} / {String(projects.length).padStart(2, "0")}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/55">
                  {projects[active].projectCount} PROJECTS
                </span>
              </div>

              <div className="desktop-work-title will-change-[transform,opacity,filter]">
                <h2 className="max-w-[560px] text-[2.8rem] font-[450] leading-[0.92] tracking-[-0.07em] text-white md:text-[4rem]">
                  {projects[active].title}
                </h2>

                <div className="mt-6 flex items-center gap-3">
                  <div className="h-[1px] w-12 bg-white/50 transition-all duration-300 group-hover:w-16 group-hover:bg-white" />
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/65 transition-colors group-hover:text-white">
                    Explore category ↗
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Hover Scale (replaces prev/next arrows) */}
        <div className="mt-8 flex justify-center">
          <div className="flex flex-col items-center gap-2 rounded-[20px] bg-white/[0.06] px-5 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.65)] backdrop-blur-xl backdrop-saturate-150">
            <div className="flex w-full items-center justify-between gap-6 px-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
                {projects[active].title}
              </span>
              <span className="font-mono text-[10px] tabular-nums text-white/45">
                {projects[active].id}/{String(projects.length).padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-end rounded-[12px] bg-white/[0.05] px-2.5 py-1.5 ring-1 ring-inset ring-white/20">
              {projects.map((proj, idx) => {
                const dist = Math.abs(idx - active);
                const isTickActive = dist === 0;
                const isNeighbor = dist === 1;
                return (
                  <button
                    key={proj.slug}
                    type="button"
                    onMouseEnter={() => selectDesktopSlide(idx)}
                    onFocus={() => selectDesktopSlide(idx)}
                    onClick={() => selectDesktopSlide(idx)}
                    aria-label={`Preview ${proj.title}`}
                    className="group/tick flex h-9 w-[64px] items-end justify-between px-2 focus:outline-none cursor-pointer"
                  >
                    <span className="h-2 w-px bg-white/20" />
                    <span className="h-3 w-px bg-white/30" />
                    <span
                      className={`rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isTickActive
                          ? "h-7 w-[2.5px] bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                          : isNeighbor
                            ? "h-5 w-[1.5px] bg-white/60"
                            : "h-3.5 w-[1.5px] bg-white/35 group-hover/tick:bg-white/65"
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
        )}
      </section>
    </main>
  );
}
