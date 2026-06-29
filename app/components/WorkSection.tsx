"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";

const projects = [
  {
    id: "01",
    title: "Computational Design",
    image:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "02",
    title: "Material Experiments",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "03",
    title: "Furniture Design",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "04",
    title: "Installation Design",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "05",
    title: "Interiors",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "06",
    title: "Competitions",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop",
  },
];

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
    <main className="relative flex min-h-screen items-center overflow-hidden bg-[#050505] text-white">
      {/* Noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      />

      {/* Soft Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
      />

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

          {/* MAIN CARD */}
          <div
            ref={mainCardRef}
            className="relative h-[460px] w-full max-w-[820px] overflow-hidden rounded-[36px] border border-white/10"
          >
            {/* Image */}
            <img
              src={projects[active].image}
              alt={projects[active].title}
              className="h-full w-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/45" />

            {/* Shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />

            {/* Bottom Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">
                  {projects[active].id}
                </span>
              </div>

              <div>
                <h2 className="title max-w-[560px] text-[2.8rem] font-[450] leading-[0.92] tracking-[-0.07em] text-white md:text-[4rem]">
                  {projects[active].title}
                </h2>

                <div className="mt-6 flex items-center gap-3">
                  <div className="h-[1px] w-12 bg-white/15" />

                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                    View Project
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