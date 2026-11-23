"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const pillars = [
  { number: "01", title: "Material Experiments", text: "We explore the character of materials, testing their limits and discovering new ways to shape spaces, objects, and experiences.", icon: "/icons/material.svg", color: "#ff2433" },
  { number: "02", title: "Computational Design", text: "We use computational thinking and custom digital workflows to turn complex inputs into clear, purposeful forms.", icon: "/icons/computation.svg", color: "#1ff261" },
  { number: "03", title: "Multi-disciplinary", text: "We move across scales and disciplines, bringing architecture, design, technology, and craft into one connected process.", icon: "/icons/natural_intelligence.svg", color: "#0056e6" },
];

export default function AboutPageSection() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".about-reveal", { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: "power3.out" });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={root} className="relative min-h-screen w-full overflow-hidden bg-transparent px-4 pb-28 pt-24 text-white sm:px-12 sm:pb-32 sm:pt-32 lg:px-20">
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
  );
}
