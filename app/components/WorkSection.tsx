"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import projectsData from "../data/projects.json";
import { ChevronLeft, ChevronRight } from "lucide-react";

type WorkCategory = {
  id: string;
  title: string;
  image: string;
  projectCount: number;
  href: string;
};

// Google Drive's export=view URLs are unreliable as embedded image sources.
// Use its thumbnail endpoint so the representative covers load consistently.
const getDisplayImage = (url: string) => {
  const driveFileId = url.match(/[?&]id=([^&]+)/)?.[1];
  return driveFileId
    ? `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1600`
    : url;
};

// One representative sub-project cover per category. The carousel itself
// stays category-based; it does not expand into individual sub-project cards.
const projects = Object.entries(projectsData)
  .map(([, rawCategory], index) => {
    const category = rawCategory as {
      title: string;
      projects?: { cover?: string }[];
    };
    const representativeProject = category.projects?.find((project) => project.cover);

    if (!category.title || !representativeProject?.cover) return null;

    return {
      id: String(index + 1).padStart(2, "0"),
      title: category.title,
      image: getDisplayImage(representativeProject.cover),
      projectCount: category.projects?.length ?? 0,
      href: "/project",
    };
  })
  .filter((category): category is WorkCategory => category !== null);

export default function WorksPage() {
  const [active, setActive] = useState(0);

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
    animateSlide("next");
  }, []);

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
    <main className="relative flex min-h-screen items-center overflow-hidden bg-transparent text-white">
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
                projects[
                  (active - 1 + projects.length) % projects.length
                ].image
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
              src={projects[(active + 1) % projects.length].image}
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
      </section>
    </main>
  );
}