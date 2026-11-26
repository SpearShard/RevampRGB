"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

const pillars = [
  { number: "01", title: "Material Experiments", text: "We explore the character of materials, testing their limits and discovering new ways to shape spaces, objects, and experiences.", icon: "/icons/material.svg", color: "#ff2433" },
  { number: "02", title: "Computational Design", text: "We use computational thinking and custom digital workflows to turn complex inputs into clear, purposeful forms.", icon: "/icons/computation.svg", color: "#1ff261" },
  { number: "03", title: "Multi-disciplinary", text: "We move across scales and disciplines, bringing architecture, design, technology, and craft into one connected process.", icon: "/icons/natural_intelligence.svg", color: "#0056e6" },
];

const SCALE_STEP = 92;

export default function AboutPageSection() {
  const root = useRef<HTMLElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const [mobileIndex, setMobileIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".about-reveal", { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: "power3.out" });
    }, root);
    return () => ctx.revert();
  }, []);

  const selectPillar = useCallback((idx: number, scrollScale = true) => {
    const clamped = Math.max(0, Math.min(pillars.length - 1, idx));
    setMobileIndex(clamped);
    window.dispatchEvent(new CustomEvent("rgb:about-select", { detail: { index: clamped } }));
    if (scrollScale && rulerRef.current) {
      isProgrammaticScrollRef.current = true;
      rulerRef.current.scrollTo({ left: clamped * SCALE_STEP, behavior: "smooth" });
      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 360);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      window.dispatchEvent(new CustomEvent("rgb:about-select", { detail: { index: 0 } }));
    }
  }, []);

  const handleScaleScroll = () => {
    const el = rulerRef.current;
    if (!el || isProgrammaticScrollRef.current) return;
    const nearest = Math.max(0, Math.min(pillars.length - 1, Math.round(el.scrollLeft / SCALE_STEP)));
    if (nearest !== mobileIndex) {
      setMobileIndex(nearest);
      window.dispatchEvent(new CustomEvent("rgb:about-select", { detail: { index: nearest } }));
    }
  };

  const activePillar = pillars[mobileIndex] ?? pillars[0];

  return (
    <>
      {/* Mobile-only Sliding Cards Over Intact Fractal (edges peek out on all 4 sides) + Lower Liquid Glass Scale Dock */}
      <main className="pointer-events-none relative z-10 flex h-[100svh] min-h-[560px] w-full flex-col justify-between overflow-hidden bg-transparent text-white sm:hidden">
        <header className="relative z-20 px-5 pt-20">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
            About RGB
          </p>
          <h1 className="mt-1.5 text-2xl font-medium tracking-tight text-white">
            Curiosity first.
          </h1>
        </header>

        {/* Centered Sliding Card Window (fractal pokes out on all 4 sides behind it) */}
        <div className="pointer-events-none relative z-20 flex flex-1 items-center justify-center px-6">
          <div className="pointer-events-auto w-[268px] overflow-hidden rounded-[24px] border border-white/[0.18] bg-[#0c0d13]/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_24px_56px_rgba(0,0,0,0.85)] backdrop-blur-[32px] backdrop-saturate-150">
            <div
              className="flex w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              style={{ transform: `translate3d(-${mobileIndex * 100}%, 0, 0)` }}
            >
              {pillars.map((pillar) => (
                <article key={pillar.number} className="w-full shrink-0 p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-white/55">
                      {pillar.number} / 03
                    </span>
                    <div className="relative h-12 w-12 shrink-0">
                      <Image
                        src={pillar.icon}
                        alt=""
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain opacity-95"
                      />
                    </div>
                  </div>
                  <h2 className="mt-4 text-lg font-medium tracking-tight text-white">
                    {pillar.title}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-white/65">
                    {pillar.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Lower Liquid Glass Scale Dock */}
        <section
          aria-label="About pillars scale"
          className="pointer-events-none relative z-20 flex flex-col items-center px-4 pb-4"
        >
          <div className="relative flex w-full max-w-[356px] flex-col items-center">
            {/* Subtle Auroric RGB Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-4 -bottom-2 h-24 rounded-full bg-gradient-to-r from-[#ff2433]/18 via-[#1ff261]/12 to-[#0056e6]/18 blur-2xl"
            />

            <div className="pointer-events-auto relative w-full overflow-hidden rounded-[22px] border border-white/[0.22] bg-white/[0.07] pb-3 pt-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(255,255,255,0.08),0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-[40px] backdrop-saturate-150">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.12] via-white/[0.02] to-transparent"
              />

              <div className="relative flex h-7 items-center justify-between gap-3 px-4 pb-1">
                <p className="min-w-0 truncate text-[13px] font-medium tracking-tight text-white">
                  {activePillar.title}
                </p>
                <span className="w-10 shrink-0 text-right font-mono text-[10px] tabular-nums text-white/55">
                  {activePillar.number}/03
                </span>
              </div>

              <div className="relative pt-1">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-20 -translate-x-1/2"
                >
                  <span className="block h-7 w-[1.5px] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
                </div>

                <div
                  ref={rulerRef}
                  onScroll={handleScaleScroll}
                  className="flex h-8 items-end overflow-x-auto px-[calc(50%-46px)] [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {pillars.map((pillar, idx) => {
                    const isActive = idx === mobileIndex;
                    return (
                      <button
                        key={pillar.number}
                        type="button"
                        onClick={() => selectPillar(idx)}
                        aria-label={`Select ${pillar.title}`}
                        className="flex h-8 w-[92px] shrink-0 items-end justify-between px-2 focus:outline-none"
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
      </main>

      {/* Desktop About Page (unchanged) */}
      <main ref={root} className="relative hidden min-h-screen w-full overflow-hidden bg-transparent px-4 pb-28 pt-24 text-white sm:block sm:px-12 sm:pb-32 sm:pt-32 lg:px-20">
        <div className="mx-auto max-w-[1440px]">
          <header className="mb-12 max-w-5xl sm:mb-24">
            <p className="about-reveal mb-7 font-mono text-[10px] uppercase tracking-[0.32em] text-white/35">About RGB / Design practice</p>
            <h1 className="about-reveal text-[clamp(2.65rem,11.5vw,8.5rem)] sm:text-[clamp(3.3rem,9vw,8.5rem)] font-light leading-[0.9] tracking-[-0.08em]">Curiosity is our<br/><span className="text-white/40">starting point.</span></h1>
            <p className="about-reveal mt-6 max-w-2xl text-sm leading-7 sm:mt-9 sm:text-base sm:leading-8 text-white/55 sm:text-lg">RGB is a multidisciplinary design practice exploring the intersection of material, computation, and spatial thinking. We bring different ways of seeing together to make thoughtful work.</p>
          </header>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.number} className="about-reveal group relative min-h-[300px] overflow-hidden rounded-[24px] sm:min-h-[390px] sm:rounded-[32px] border border-white/10 bg-[#090a0e]/65 p-5 backdrop-blur-md sm:p-9">
                <div className="absolute right-0 top-0 h-48 w-48 rounded-full opacity-[0.08] blur-3xl transition-opacity group-hover:opacity-20" style={{ backgroundColor: pillar.color }} />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[10px] tracking-[0.25em] text-white/35">{pillar.number} / 03</span>
                    <div className="relative h-14 w-14 opacity-65 transition-opacity group-hover:opacity-100"><Image src={pillar.icon} alt="" fill className="object-contain" /></div>
                  </div>
                  <div className="mt-auto">
                    <span className="mb-5 block h-px w-10" style={{ backgroundColor: pillar.color }} />
                    <h2 className="text-2xl font-light tracking-tight sm:text-3xl">{pillar.title}</h2>
                    <p className="mt-5 max-w-sm text-sm leading-7 text-white/45">{pillar.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
