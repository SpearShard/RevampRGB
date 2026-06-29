"use client";

import AboutBg from "../components/bgwebglshaders/AboutBg";
import Image from "next/image";

export default function StackedObsidianCanvas() {
  const pillars = [
    {
      idx: "01",
      title: "Material Experiments",
      tag: "CORE_PROP_LAB",
      desc: "Deconstructing physical composite limitations. We systematically stress-test raw structural variables under extreme loading profiles, translating material mass constraints into completely seamless, adaptive geometric envelopes.",
      img: "/icons/material.svg",
      glowColor: "group-hover:border-red-500/30",
      textColor: "text-red-400/80",
      metrics: [
        { label: "STRESS_TOLERANCE", val: "482.4 MPa" },
        { label: "ELASTICITY_INDEX", val: "0.0822/v" },
        { label: "THERMAL_DRIFT", val: "< 0.001%" },
        { label: "MASS_RATIO_EFF", val: "94.21%" }
      ],
      milestones: ["Compound Synthesis", "Stress Validation", "Spatial Form Assembly", "Micro-Structure Cure"]
    },
    {
      idx: "02",
      title: "Computational Design",
      tag: "GEN_MORPH_MATRX",
      desc: "Mapping morphological and landscape optimization systems via custom programmatic loops. High-volume raw data arrays transfer cleanly into robotic micro-fabrication assembly lines, shifting static components into algorithmic variables.",
      img: "/icons/computation.svg",
      glowColor: "group-hover:border-emerald-500/30",
      textColor: "text-emerald-400/80",
      metrics: [
        { label: "COMPUTE_VELOCITY", val: "14.2 TFLOPs" },
        { label: "MESH_OPTIMIZATION", val: "99.84%" },
        { label: "NODE_DENSITY", val: "4.2M vectors" },
        { label: "RENDER_LATENCY", val: "0.004 ms" }
      ],
      milestones: ["Dataset Piping", "Recursive Mesh Evaluation", "Robotic Run Code", "Vector Compile Check"]
    },
    {
      idx: "03",
      title: "Multi-Disciplinary",
      tag: "SPATIAL_CORE_SYS",
      desc: "Fluid systemic outputs completely untethered from rigid architectural or industrial definitions. Development frameworks scale continuously from massive environmental masterplans down to micro-precision components.",
      img: "/icons/natural_intelligence.svg",
      glowColor: "group-hover:border-blue-500/30",
      textColor: "text-blue-400/80",
      metrics: [
        { label: "ROUTING_LATENCY", val: "11.2 ms" },
        { label: "DOMINANT_AXIS", val: "POLYMORPHIC" },
        { label: "CROSS_SCALE_INTEG", val: "SECURE" },
        { label: "SYSTEM_NODE_COUNT", val: "84,102" }
      ],
      milestones: ["Environmental Matrix", "Macro System Layout", "Artifact Milling", "Precision Scaled Output"]
    },
  ];

  return (
    <div className="text-[#d4d4dc] min-h-screen w-screen overflow-x-hidden font-sans antialiased snap-y snap-mandatory scroll-smooth">
      {/* BACKGROUND WEBGL SHADER GENERATOR */}
      <AboutBg />

      <main className="w-full flex flex-col items-stretch relative z-10">
        {pillars.map((item) => (
          <section
            key={item.idx}
            className="group w-screen h-screen flex-shrink-0 snap-start flex flex-col justify-between p-6 md:p-12 lg:p-16 relative overflow-hidden border-b border-white/[0.02]"
          >
           

            {/* MAIN COMPOSITION LAYER */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto relative z-10">
              
              {/* Left text column & quantitative telemetry blocks */}
              <div className="lg:col-span-7 space-y-6 max-w-2xl">
                <div className="space-y-3">
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-extralight tracking-tight text-white uppercase leading-[0.95] transition-transform duration-700 group-hover:translate-x-2">
                    {item.title}
                  </h2>
                  <p className="text-sm md:text-base font-light leading-relaxed text-neutral-400 transition-colors duration-500 group-hover:text-neutral-300">
                    {item.desc}
                  </p>
                </div>

                {/* Micro Technical Parameter Grid */}
                <div className={`grid grid-cols-2 gap-3 p-4 bg-[#07070a]/60 backdrop-blur-md rounded-xl border border-white/[0.03] transition-all duration-500 ${item.glowColor} shadow-2xl`}>
                  {item.metrics.map((m, mIdx) => (
                    <div key={mIdx} className="font-mono text-[10px] border-b border-white/[0.02] pb-1.5 flex flex-col justify-between">
                      <span className="text-neutral-500 tracking-wider text-[9px]">{m.label}</span>
                      <span className="text-neutral-200 font-medium mt-0.5 transition-colors duration-300 group-hover:text-white">{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right animated interactive graphic column */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end select-none pointer-events-none">
                <div className="w-56 h-56 sm:w-72 sm:h-72 md:w-[380px] md:h-[380px] lg:w-[440px] lg:h-[440px] relative transition-all duration-1000 transform group-hover:scale-105 group-hover:rotate-6 opacity-60 group-hover:opacity-100 filter brightness-150 contrast-125 drop-shadow-[0_0_50px_rgba(255,255,255,0.02)]">
                  <Image
                    src={item.img}
                    alt=""
                    fill
                    className="object-contain lg:object-right"
                    priority
                  />
                </div>
              </div>

            </div>

            

          </section>
        ))}
      </main>
    </div>
  );
}