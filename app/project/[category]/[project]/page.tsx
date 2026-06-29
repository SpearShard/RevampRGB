"use client";

import { useState, useEffect, useCallback, use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import projectsData from "@/app/data/projects.json";
import { projectSlug } from "@/app/utils/projectSlugs";
import ProjectsBackground from "@/app/components/bgwebglshaders/ProjectsBackground";

type ProjectCategory = {
  title: string;
  projects: {
    title: string;
    subtitle?: string;
    dir: string;
    cover: string;
    images: string[];
    description: string[];
    video?: string;
  }[];
};

type PageProps = {
  params: Promise<{
    category: string;
    project: string;
  }>;
};

export default function ProjectPage({ params }: PageProps) {
  // Safely unwrap the async route parameters using React.use()
  const { category: categorySlug, project: selectedProjectSlug } = use(params);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Locate current portfolio manifest matches
  const category = projectsData[
    categorySlug as keyof typeof projectsData
  ] as ProjectCategory | undefined;

  if (!category || !("projects" in category)) return notFound();

  const project = category.projects.find(
    (p) => projectSlug(p.dir) === selectedProjectSlug
  );

  if (!project) return notFound();

  // Parse narrative and data parameters out of descriptions array
  const metadata: Record<string, string> = {};
  const mainDescription: string[] = [];

  project.description.forEach((item) => {
    if (item.includes(" : ")) {
      const [key, value] = item.split(" : ");
      metadata[key] = value;
    } else {
      mainDescription.push(item);
    }
  });

  // Group all media assets for chronological indexing inside the lightbox slider
  const allMediaImages = project.images;

  // Chunking remaining images into pairs to significantly compress vertical scrolling space
  const secondaryImages = project.images.slice(1);
  const imagePairs: string[][] = [];
  for (let i = 0; i < secondaryImages.length; i += 2) {
    imagePairs.push(secondaryImages.slice(i, i + 2));
  }

  // Navigation loop controllers for arrow interactions
  const showNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev < allMediaImages.length - 1 ? prev + 1 : 0));
  }, [lightboxIndex, allMediaImages.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : allMediaImages.length - 1));
  }, [lightboxIndex, allMediaImages.length]);

  const closeLightbox = () => setLightboxIndex(null);

  // Monitor physical hardware keyboard events
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "Escape") closeLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  return (
    <main className="text-[#e2e4eb] min-h-screen selection:bg-white selection:text-black antialiased font-sans px-3  py-4 relative">
      <ProjectsBackground />
      
      {/* 01. COMPACT LAYERED HERO CONTAINER */}
      <section className="relative w-full h-screen flex flex-col justify-between p-6 md:p-10 lg:p-12 bg-[#101116] rounded-[20px]  overflow-hidden shadow-2xl border border-white/[0.03]">
        <div className="absolute inset-0 z-0 overflow-hidden ">
          <Image
            src={project.cover}
            alt={project.title}
            fill
            priority
            className="object-cover scale-100 brightness-[0.45] contrast-[1.02] transition-transform duration-[2s] hover:scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0b0c10]" />
        </div>

        

        <div className="relative z-10 mt-auto max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase leading-[1.05] text-white">
            {project.title}
          </h1>
          {project.subtitle && (
            <p className="mt-3 text-xs font-light text-white/50 max-w-sm leading-relaxed font-mono tracking-wide">
              {project.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* 02. MINIMALIST OVERVIEW & MICRO METADATA PANEL */}
      <section className="max-w-[1500px] mx-auto px-4 md:px-8 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 bg-[#121318]/90 backdrop-blur-md border border-white/[0.06] rounded-[28px] p-5 space-y-5 lg:sticky lg:top-8 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/40 block">01 / Specifications</span>
            
          </div>

          {Object.keys(metadata).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5 font-mono">
              {Object.entries(metadata).map(([key, value]) => (
                <div key={key} className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.07] rounded-xl px-3.5 py-2 flex items-center justify-between gap-4 transition-colors duration-200">
                  <span className="text-[9px] uppercase tracking-wider text-white/40">{key}</span>
                  <span className="text-[11px] text-white/80 font-light truncate max-w-[65%]">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-8 lg:pt-1 lg:pl-4">
          <span className="font-mono text-[9px] tracking-[0.3em] text-white/30 block mb-3">
            [ Summary Narrative ]
          </span>
          <p className="text-base md:text-lg font-light leading-relaxed text-white/80 tracking-wide max-w-2xl">
            {mainDescription[0]}
          </p>
        </div>
      </section>

      {/* 03. COMPACT SHOWREEL / MAIN IMAGE CAPTURE WINDOW */}
      <section className="w-full max-w-[1500px] mx-auto px-2 md:px-4 mb-14 md:mb-20">
        {project.video ? (
          <div className="w-full aspect-[21/9] relative rounded-[28px] overflow-hidden bg-black/40 border border-white/10 shadow-2xl">
            <video autoPlay muted loop controls playsInline className="w-full h-full object-cover opacity-90">
              <source src={project.video} />
            </video>
          </div>
        ) : (
          project.images[0] && (
            <div 
              onClick={() => setLightboxIndex(0)}
              className="relative h-[50vh] w-full rounded-[28px] overflow-hidden border border-white/10 shadow-2xl cursor-zoom-in group bg-[#121318]"
            >
              <Image
                src={project.images[0]}
                alt="Primary dynamic module core capture"
                fill
                sizes="92vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.015]"
              />
            </div>
          )
        )}
      </section>

      {/* 04. DENSE MULTI-COLUMN CONDENSED MATRIX */}
      <section className="max-w-[1500px] mx-auto px-4 md:px-8 pb-16 md:pb-28">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10 lg:mb-14 items-baseline border-b border-white/[0.06] pb-4">
          <div className="lg:col-span-4">
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/30">02 / System Index</span>
          </div>
          <div className="lg:col-span-8">
            <h3 className="text-lg md:text-xl font-medium tracking-tight uppercase mb-1.5 text-white/90">
              {project.subtitle || project.title}
            </h3>
            {mainDescription[1] && (
              <p className="text-[11px] font-mono text-white/40 leading-relaxed max-w-lg">
                {mainDescription[1]}
              </p>
            )}
          </div>
        </div>

        {/* Compressed Side-by-Side Image Matrix Grid */}
        <div className="space-y-5 md:space-y-6">
          {imagePairs.map((pair, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
              {pair.map((img, imgIndex) => {
                const globalIndex = rowIndex * 2 + imgIndex + 1;
                const behaviorFlag = (rowIndex + imgIndex) % 2 === 0;
                const colSpanClass = pair.length === 1 
                  ? "md:col-span-12" 
                  : behaviorFlag ? "md:col-span-7" : "md:col-span-5";

                return (
                  <div key={imgIndex} className={`${colSpanClass} space-y-1.5`}>
                    <div 
                      onClick={() => setLightboxIndex(globalIndex)}
                      className="relative overflow-hidden bg-[#121318] rounded-[24px] border border-white/[0.05] shadow-md group aspect-[4/3] md:aspect-auto cursor-zoom-in"
                    >
                      <Image
                        src={img}
                        alt={`${project.title} dynamic layout reference`}
                        width={1100}
                        height={800}
                        className="w-full h-full object-cover transform duration-[0.8s] ease-out group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="flex justify-between items-center font-mono text-[8px] tracking-widest text-white/20 uppercase px-1.5">
                      <span>REF_PLATE // 0{globalIndex}</span>
                      <span>READY STATE</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* 05. SCALE-OPTIMIZED FINALE BACKPANEL CONTAINER */}
      {project.images.length > 2 && (
        <section className="relative w-full h-[55vh] flex flex-col justify-between p-6 md:p-8 overflow-hidden rounded-[40px] md:rounded-[52px] shadow-2xl border border-white/[0.04]">
          <div className="absolute inset-0 z-0 rounded-[40px] md:rounded-[52px] overflow-hidden">
            <Image
              src={project.images[project.images.length - 1]}
              alt="Terminal presentation back panel asset"
              fill
              sizes="92vw"
              className="object-cover brightness-[0.22] contrast-[1.05]"
            />
          </div>

          <div className="w-full flex justify-between items-center font-mono text-[9px] tracking-[0.3em] uppercase text-white/30 z-10">
            <span>[ Execution Cycle Concluded ]</span>
            <span>EOF Verified</span>
          </div>

          <div className="z-10 max-w-md">
            <h4 className="text-lg md:text-xl tracking-tight uppercase font-medium text-white/70 mb-1.5">
              {project.title}
            </h4>
            <p className="text-[10px] font-mono text-white/20 leading-relaxed max-w-xs">
              Layout arrays structurally checked and outputted securely to active instance client frames.
            </p>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 06. LIGHTBOX INTERACTIVE SLIDER MODAL                      */}
      {/* ========================================================= */}
      {lightboxIndex !== null && (
        <div 
          onClick={closeLightbox}
          className="fixed inset-0 z-[100] flex flex-col justify-between p-4 md:p-6 bg-black/95 backdrop-blur-xl transition-all duration-300 select-none animate-[fadeIn_0.15s_ease-out]"
        >
          {/* Top Control Bar Panel */}
          <div className="w-full flex justify-between items-center font-mono text-[9px] tracking-widest text-white/40 z-10">
            <span>VIEWPORT SYSTEM // FRAME {lightboxIndex + 1} OF {allMediaImages.length}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white hover:text-black hover:border-white transition-all duration-300 uppercase tracking-[0.15em] text-[9px]"
            >
              Exit [Esc]
            </button>
          </div>

          {/* Central Main Image Content Box Layout */}
          <div className="relative flex-1 w-full max-w-4xl mx-auto my-2 flex items-center justify-center">
            {/* Arrow Nav: Previous item pointer */}
            <button 
  onClick={(e) => { e.stopPropagation(); showPrev(); }}
  className="absolute left-4 lg:-left-20 p-0 text-white/40 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] active:scale-95 hover:scale-105 rounded-full border border-white/[0.08] hover:border-white/20 w-12 h-12 flex items-center justify-center transition-all duration-300 ease-out z-20 backdrop-blur-md group shadow-xl"
  aria-label="Load previous media component"
>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    stroke="currentColor" 
    className="w-5 h-5 transform transition-transform duration-300 group-hover:-translate-x-0.5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
</button>

            {/* Main Picture Frame Rendering Shell */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="relative w-full h-full max-h-[70vh] aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-[20px] border border-white/10"
            >
              <Image
                src={allMediaImages[lightboxIndex]}
                alt="Active high resolution component document item"
                fill
                priority
                className="object-contain"
              />
            </div>

            {/* Arrow Nav: Next item pointer */}
           <button 
  onClick={(e) => { e.stopPropagation(); showNext(); }}
  className="absolute right-4 lg:-right-20 p-0 text-white/40 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] active:scale-95 hover:scale-105 rounded-full border border-white/[0.08] hover:border-white/20 w-12 h-12 flex items-center justify-center transition-all duration-300 ease-out z-20 backdrop-blur-md group shadow-xl"
  aria-label="Load next media component"
>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    stroke="currentColor" 
    className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-0.5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
</button>
          </div>

          {/* Bottom Panel Micro Step Nav Index Dots Loop */}
          <div className="w-full flex flex-col items-center gap-3 z-10">
            <div className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.05]" onClick={(e) => e.stopPropagation()}>
              {allMediaImages.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setLightboxIndex(dotIdx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    dotIdx === lightboxIndex ? "bg-white scale-125" : "bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Jump directly to visual asset item frame element ${dotIdx + 1}`}
                />
              ))}
            </div>
            <div className="font-mono text-[8px] text-white/20 tracking-[0.3em] uppercase">
              Swipe/pointer tap or strike physical hardware keyboard arrows to cycle assets
            </div>
          </div>
        </div>
      )}

    </main>
  );
}