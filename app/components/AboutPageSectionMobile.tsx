"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const pillars = [
  { number: "01", title: "Material Experiments", text: "We explore the character of materials, testing their limits and discovering new ways to shape spaces, objects, and experiences.", icon: "/icons/material.svg", color: "#ff2433" },
  { number: "02", title: "Computational Design", text: "We use computational thinking and custom digital workflows to turn complex inputs into clear, purposeful forms.", icon: "/icons/computation.svg", color: "#1ff261" },
  { number: "03", title: "Multi-disciplinary", text: "We move across scales and disciplines, bringing architecture, design, technology, and craft into one connected process.", icon: "/icons/natural_intelligence.svg", color: "#0056e6" },
];

export default function AboutPageSection() {
  const [mobileIndex, setMobileIndex] = useState(0);

  useEffect(() => {
    const onAboutSelect = (event: Event) => {
      const idx = (event as CustomEvent<{ index?: number }>).detail?.index;
      if (typeof idx === "number") {
        setMobileIndex(Math.max(0, Math.min(pillars.length - 1, idx)));
      }
    };
    window.addEventListener("rgb:about-select", onAboutSelect);
    return () => window.removeEventListener("rgb:about-select", onAboutSelect);
  }, []);

  return (
    <main className="pointer-events-none relative z-10 flex h-[100svh] min-h-[560px] w-full flex-col justify-between overflow-hidden bg-transparent pb-36 text-white sm:hidden">
      <header className="relative z-20 px-5 pt-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
          About RGB
        </p>
        <h1 className="mt-1.5 text-2xl font-medium tracking-tight text-white">
          Curiosity first.
        </h1>
      </header>

      {/* Centered Sliding Card Window (Tri-Axis Gyroscope fractal orbits around it) */}
      <div className="pointer-events-none relative z-20 flex flex-1 items-center justify-center px-6">
        <div className="pointer-events-auto w-[268px] overflow-hidden rounded-[24px] bg-[#0c0d13]/85 shadow-[0_24px_56px_rgba(0,0,0,0.8)] backdrop-blur-xl backdrop-saturate-150">
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
    </main>
  );
}
