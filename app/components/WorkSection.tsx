"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
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
  const mobileSectionRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    const el = mobileSectionRef.current;
    if (!el || typeof window === "undefined" || window.innerWidth >= 768) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = Boolean(entries[0]?.isIntersecting);
        window.dispatchEvent(new CustomEvent("rgb:works-inview", { detail: { active: visible } }));
      },
      { threshold: 0.28 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.dispatchEvent(new CustomEvent("rgb:works-inview", { detail: { active: false } }));
    };
  }, []);

  useEffect(() => {
    const onWorksSelect = (e: Event) => {
      const idx = (e as CustomEvent<{ index?: number }>).detail?.index;
      if (typeof idx === "number") {
        setMobileActive(Math.max(0, Math.min(projects.length - 1, idx)));
      }
    };
    window.addEventListener("rgb:works-select", onWorksSelect);
    return () => window.removeEventListener("rgb:works-select", onWorksSelect);
  }, []);

  const setMobileCard = (idx: number) => {
    const clamped = Math.max(0, Math.min(projects.length - 1, idx));
    setMobileActive(clamped);
    window.dispatchEvent(new CustomEvent("rgb:works-card-change", { detail: { index: clamped } }));
  };

  const openCategoryInProjects = (slug: string) => {
    window.dispatchEvent(new CustomEvent("rgb:works-inview", { detail: { active: false } }));
    window.dispatchEvent(new CustomEvent("rgb:project-jump-category", { detail: { categorySlug: slug } }));
    window.dispatchEvent(new CustomEvent("rgb:enter-project"));
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

  const animateSlide = (direction: "next" | "prev") => {
    const tl = gsap.timeline();

    gsap.set(mainCardRef.current, {
      scale: 0.92,
      opacity: 0,
      x: direction === "next" ? 120 : -120,
      rotate: direction === "next" ? 3 : -3,
    });

    gsap.set(leftCardRef.current, {
      x: direction === "next" ? -40 : 40,
    });

    gsap.set(rightCardRef.current, {
      x: direction === "next" ? 40 : -40,
    });

    tl.to(
      mainCardRef.current,
      {
        x: 0,
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 1.2,
        ease: "expo.out",
      },
      0
    )
      .to(
        [leftCardRef.current, rightCardRef.current],
        {
          x: 0,
          duration: 1,
          ease: "expo.out",
        },
        0
      )
      .fromTo(
        ".title",
        {
          y: 30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power4.out",
        },
        0.2
      );
  };

  useEffect(() => {
    if (!isDesktop) return;
    animateSlide("next");
  }, [isDesktop]);

  const nextSlide = () => {
    setActive((prev) => (prev + 1) % projects.length);

    requestAnimationFrame(() => {
      animateSlide("next");
    });
  };

  const prevSlide = () => {
    setActive((prev) => (prev - 1 + projects.length) % projects.length);

    requestAnimationFrame(() => {
      animateSlide("prev");
    });
  };

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

        {/* Mobile horizontal perspective carousel (centered sharp card + blurred scaled side cards) */}
        <div
          ref={mobileSectionRef}
          onTouchStart={(e) => {
            touchStartXRef.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchStartXRef.current === null) return;
            const dx = (e.changedTouches[0]?.clientX ?? touchStartXRef.current) - touchStartXRef.current;
            touchStartXRef.current = null;
            if (Math.abs(dx) > 36) {
              setMobileCard(mobileActive + (dx < 0 ? 1 : -1));
            }
          }}
          className="relative -mx-6 flex h-[390px] items-center justify-center overflow-hidden pb-16 md:hidden"
        >
          {projects.map((cat, index) => {
            const offset = index - mobileActive;
            const absOffset = Math.abs(offset);
            const isFocused = offset === 0;
            const isNeighbor = absOffset === 1;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  if (isFocused) {
                    openCategoryInProjects(cat.slug);
                  } else {
                    setMobileCard(index);
                  }
                }}
                style={{
                  transform: `translate3d(${offset * 68}%, 0, 0) scale(${isFocused ? 1 : isNeighbor ? 0.84 : 0.72})`,
                }}
                className={`absolute flex h-[310px] w-[72vw] max-w-[276px] flex-col justify-between overflow-hidden rounded-[26px] border p-5 text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                  isFocused
                    ? "z-20 border-white/20 bg-[#111] opacity-100 blur-0 shadow-[0_24px_60px_rgba(0,0,0,0.85)]"
                    : isNeighbor
                      ? "z-10 border-white/10 bg-[#111] opacity-40 blur-[4px]"
                      : "pointer-events-none z-0 border-white/5 bg-[#111] opacity-0 blur-[6px]"
                }`}
              >
                <img
                  src={isFocused ? cat.image : cat.thumbImage}
                  alt={cat.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/15" />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.22em] text-white/65">
                    {cat.id} / {String(projects.length).padStart(2, "0")}
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
                    {String(cat.projectCount).padStart(2, "0")} studies
                  </span>
                </div>
                <div className="relative z-10 flex items-end justify-between gap-2">
                  <span className="text-[1.75rem] font-light leading-[0.98] tracking-[-0.05em] text-white">
                    {cat.title}
                  </span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 bg-black/30 text-white">
                    <ArrowUpRight size={15} />
                  </span>
                </div>
              </button>
            );
          })}
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

          {/* MAIN PROJECT CARD */}
          <div
            ref={mainCardRef}
            className="group relative h-[460px] w-full max-w-[820px] overflow-hidden rounded-[36px] border border-white/10"
          >
            <img
              src={projects[active].image}
              alt={projects[active].title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />

            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/85" />

            <Link
              href={projects[active].href}
              aria-label={`Explore ${projects[active].title}`}
              className="absolute inset-0 z-10"
            />

            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:p-8">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/55">
                  {projects[active].id} / {String(projects.length).padStart(2, "0")}
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/55">
                  {projects[active].projectCount} PROJECTS
                </span>
              </div>

              <div>
                <h2 className="title max-w-[560px] text-[2.8rem] font-[450] leading-[0.92] tracking-[-0.07em] text-white md:text-[4rem]">
                  {projects[active].title}
                </h2>

                <div className="mt-6 flex items-center gap-3">
                  <div className="h-[1px] w-12 bg-white/50" />
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/65">
                    Explore category ↗
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={prevSlide}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 transition-all duration-300 hover:border-white/20"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={nextSlide}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 transition-all duration-300 hover:border-white/20"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        </div>
        )}
      </section>
    </main>
  );
}
