"use client";

import { use, useCallback, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowLeft, ArrowRight, X } from "lucide-react";
import projectsData from "@/app/data/projects.json";
import { projectSlug } from "@/app/utils/projectSlugs";
import ProjectsBackground from "@/app/components/bgwebglshaders/ProjectsBackground";

type Project = {
  title: string;
  subtitle?: string;
  dir: string;
  cover: string;
  images: string[];
  description: string[];
  video?: string;
};

type ProjectCategory = {
  title: string;
  projects: Project[];
};

type PageProps = {
  params: Promise<{ category: string; project: string }>;
};

export default function ProjectPage({ params }: PageProps) {
  const { category: categorySlug, project: selectedProjectSlug } = use(params);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const category = projectsData[
    categorySlug as keyof typeof projectsData
  ] as ProjectCategory | undefined;

  const project = category?.projects?.find(
    (item) => projectSlug(item.dir) === selectedProjectSlug
  );

  // Keep every hook above the notFound branches so route changes remain hook-safe.
  const descriptionItems = project?.description ?? [];
  const metadata: Record<string, string> = {};
  const mainDescription: string[] = [];

  descriptionItems.forEach((item) => {
    const match = item.match(/^\s*([^:]+?)\s*:\s*(.+)$/);
    if (match) {
      metadata[match[1].trim()] = match[2].trim();
    } else {
      mainDescription.push(item);
    }
  });

  const allMediaImages = project?.images ?? [];
  const secondaryImages = allMediaImages.slice(1);
  const imagePairs: string[][] = [];

  for (let index = 0; index < secondaryImages.length; index += 2) {
    imagePairs.push(secondaryImages.slice(index, index + 2));
  }

  const currentProjectIndex = category?.projects.findIndex(
    (item) => item.title === project?.title
  ) ?? -1;
  const previousProject = currentProjectIndex > 0
    ? category?.projects[currentProjectIndex - 1] ?? null
    : null;
  const nextProject = category && currentProjectIndex >= 0
    ? category.projects[currentProjectIndex + 1] ?? null
    : null;

  const showNext = useCallback(() => {
    if (lightboxIndex === null || allMediaImages.length === 0) return;
    setLightboxIndex((current) =>
      current === null ? null : (current + 1) % allMediaImages.length
    );
  }, [lightboxIndex, allMediaImages.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex === null || allMediaImages.length === 0) return;
    setLightboxIndex((current) =>
      current === null
        ? null
        : (current - 1 + allMediaImages.length) % allMediaImages.length
    );
  }, [lightboxIndex, allMediaImages.length]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") showNext();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "Escape") closeLightbox();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, showNext, showPrev, closeLightbox]);

  if (!category || !("projects" in category) || !project) return notFound();

  const plateNumber = String(currentProjectIndex + 1).padStart(2, "0");

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#0b0c0a] px-3 pb-8 pt-3 text-[#e9e5d9] selection:bg-[#d8c9a9] selection:text-[#171713] sm:px-5 sm:pt-5">
      <ProjectsBackground />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(151,139,110,0.13),transparent_52%)]"
      />

      {/* Cover study */}
      <section className="relative mx-auto min-h-[78svh] max-w-[1800px] overflow-hidden border border-[#d8c9a9]/15 bg-[#171914]">
        <Image
          src={project.cover}
          alt={project.title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.72]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090b08]/80 via-[#090b08]/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b08] via-transparent to-black/15" />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(235,228,210,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(235,228,210,0.2)_1px,transparent_1px)] [background-size:84px_84px] mix-blend-soft-light"
        />

        <div className="absolute left-5 top-6 flex items-center gap-3 sm:left-9 sm:top-9">
          <Link
            href="/project"
            className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.23em] text-[#e9e5d9]/65 transition-colors hover:text-white"
          >
            <ArrowLeft size={13} strokeWidth={1.4} />
            Work
          </Link>
          <span className="h-px w-8 bg-[#e9e5d9]/30" />
          <span className="text-[9px] uppercase tracking-[0.23em] text-[#e9e5d9]/50">
            {category.title}
          </span>
        </div>

        <div className="absolute right-5 top-6 text-right font-mono text-[8px] leading-5 tracking-[0.18em] text-[#e9e5d9]/50 sm:right-9 sm:top-9">
          <div>RGB / PROJECT ARCHIVE</div>
          <div>PLATE — {plateNumber}</div>
        </div>

        {/* Pencil-like construction drawing */}
        <svg
          aria-hidden="true"
          viewBox="0 0 480 480"
          className="pointer-events-none absolute bottom-10 right-10 hidden h-[min(42vw,440px)] w-[min(42vw,440px)] text-[#e9e2d2]/40 lg:block"
          fill="none"
        >
          <circle cx="240" cy="240" r="184" stroke="currentColor" strokeWidth=".7" strokeDasharray="2 7" />
          <circle cx="240" cy="240" r="143" stroke="currentColor" strokeWidth=".55" />
          <circle cx="240" cy="240" r="91" stroke="currentColor" strokeWidth=".5" strokeDasharray="5 5" />
          <path d="M240 18V462M18 240H462M83 83L397 397M397 83L83 397" stroke="currentColor" strokeWidth=".55" />
          <path d="M240 56C342 56 424 138 424 240M240 82C327 82 398 153 398 240" stroke="currentColor" strokeWidth="1.1" />
          <path d="M240 240L354 129M240 240L119 326M240 240L306 408" stroke="currentColor" strokeWidth=".75" strokeDasharray="3 5" />
          <path d="M230 240h20m-10-10v20" stroke="currentColor" strokeWidth="1" />
          <circle cx="240" cy="240" r="6" stroke="currentColor" strokeWidth=".8" />
          <text x="240" y="225" fill="currentColor" fontSize="8" textAnchor="middle" letterSpacing="2">RGB / {plateNumber}</text>
          <text x="240" y="454" fill="currentColor" fontSize="7" textAnchor="middle" letterSpacing="2">STUDY / DRAWING FIELD</text>
        </svg>

        <div className="absolute bottom-7 left-5 right-5 sm:bottom-12 sm:left-9 sm:right-9 lg:bottom-16 lg:left-14">
          <div className="mb-5 flex items-center gap-3 text-[9px] uppercase tracking-[0.28em] text-[#e9e5d9]/55">
            <span className="h-px w-8 bg-[#d8c9a9]/80" />
            Selected work
          </div>
          <h1 className="max-w-[1100px] text-[clamp(3.2rem,9.5vw,9.5rem)] font-light uppercase leading-[0.82] tracking-[-0.075em] text-[#f0ede4]">
            {project.title}
          </h1>
          {project.subtitle && (
            <p className="mt-6 max-w-xl text-xs font-light tracking-[0.08em] text-[#e9e5d9]/70 sm:text-sm">
              {project.subtitle}
            </p>
          )}
        </div>

        <div className="absolute bottom-8 right-8 hidden items-center gap-2 font-mono text-[8px] uppercase tracking-[0.2em] text-[#e9e5d9]/45 md:flex">
          <span>Scroll to explore</span>
          <ArrowDownRight size={13} />
        </div>
      </section>

      {/* Project note and credits */}
      <section className="relative mx-auto grid max-w-[1500px] grid-cols-1 gap-10 border-b border-[#d8c9a9]/20 px-2 py-16 sm:px-5 md:py-24 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-3">
          <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#c8bda6]/55">
            Project / {plateNumber}
          </p>
          <div className="mt-4 h-px w-12 bg-[#c8bda6]/50" />
        </div>

        <div className="lg:col-span-6">
          {mainDescription[0] && (
            <p className="max-w-3xl text-lg font-light leading-[1.65] tracking-[-0.02em] text-[#e8e4d9]/85 sm:text-xl md:text-2xl">
              {mainDescription[0]}
            </p>
          )}
        </div>

        <div className="lg:col-span-3">
          {Object.keys(metadata).length > 0 && (
            <dl className="grid grid-cols-1 gap-y-4 border-t border-[#d8c9a9]/20 pt-4">
              {Object.entries(metadata).map(([key, value]) => (
                <div key={key} className="grid grid-cols-[90px_1fr] gap-3">
                  <dt className="font-mono text-[8px] uppercase tracking-[0.17em] text-[#c8bda6]/50">
                    {key}
                  </dt>
                  <dd className="text-[11px] leading-relaxed text-[#e8e4d9]/75">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* Primary visual */}
      <section className="mx-auto max-w-[1800px] py-8 sm:py-12">
        <div className="mb-4 flex items-end justify-between px-1">
          <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#c8bda6]/50">
            01 / Primary view
          </span>
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#c8bda6]/35">
            {project.video ? "Motion" : "Still"}
          </span>
        </div>

        {project.video ? (
          <div className="relative aspect-[16/9] overflow-hidden bg-[#151812] sm:aspect-[21/9]">
            <video autoPlay muted loop playsInline controls className="h-full w-full object-cover">
              <source src={project.video} />
            </video>
            <div className="pointer-events-none absolute inset-0 border border-[#d8c9a9]/15" />
          </div>
        ) : project.images[0] ? (
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="group relative block w-full cursor-zoom-in overflow-hidden bg-[#151812] text-left"
          >
            <div className="relative aspect-[16/9] sm:aspect-[21/9]">
              <Image
                src={project.images[0]}
                alt={`${project.title} — primary view`}
                fill
                priority
                sizes="100vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-[1.015]"
              />
            </div>
            <span className="absolute bottom-4 right-4 font-mono text-[8px] uppercase tracking-[0.2em] text-white/60">
              Open image ↗
            </span>
          </button>
        ) : null}
      </section>

      {/* Asymmetric image studies */}
      {imagePairs.length > 0 && (
        <section className="mx-auto max-w-[1500px] px-1 pb-20 pt-12 sm:px-5 md:pb-28 md:pt-20">
          <div className="mb-8 flex items-end justify-between border-b border-[#d8c9a9]/20 pb-4">
            <div>
              <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#c8bda6]/50">
                02 / Image studies
              </span>
              <h2 className="mt-2 text-2xl font-light tracking-[-0.05em] text-[#ece8de] sm:text-3xl">
                Details
              </h2>
            </div>
            <span className="font-mono text-[9px] text-[#c8bda6]/45">
              {String(project.images.length).padStart(2, "0")} PLATES
            </span>
          </div>

          <div className="space-y-12 md:space-y-20">
            {imagePairs.map((pair, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-1 items-start gap-5 md:grid-cols-12 md:gap-8">
                {pair.map((image, imageIndex) => {
                  const globalIndex = rowIndex * 2 + imageIndex + 1;
                  const wide = pair.length === 1 || (rowIndex + imageIndex) % 2 === 0;
                  const span = pair.length === 1
                    ? "md:col-span-10 md:col-start-2"
                    : wide
                      ? "md:col-span-7"
                      : "md:col-span-5 md:pt-20";

                  return (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setLightboxIndex(globalIndex)}
                      className={`${span} group relative block w-full cursor-zoom-in text-left`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#151812]">
                        <Image
                          src={image}
                          alt={`${project.title} — image ${String(globalIndex + 1).padStart(2, "0")}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 70vw"
                          className="object-cover transition-transform duration-1000 group-hover:scale-[1.025]"
                        />
                        <div className="pointer-events-none absolute inset-0 border border-[#d8c9a9]/10" />
                      </div>
                      <div className="mt-2 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.18em] text-[#c8bda6]/45">
                        <span>Plate {String(globalIndex + 1).padStart(2, "0")}</span>
                        <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          Expand ↗
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Closing image */}
      {project.images.length > 2 && (
        <section className="relative mx-auto h-[36vh] max-w-[1800px] overflow-hidden bg-[#151812] sm:h-[52vh]">
          <Image
            src={project.images[project.images.length - 1]}
            alt={`${project.title} — final view`}
            fill
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090b08]/70 via-transparent to-[#090b08]/25" />
          <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10">
            <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-white/55">
              End
            </span>
            <p className="mt-2 text-3xl font-light uppercase tracking-[-0.06em] text-white sm:text-5xl">
              {project.title}
            </p>
          </div>
        </section>
      )}

      {/* Project navigation */}
      <nav
        aria-label="Project navigation"
        className="mx-auto flex max-w-[1500px] items-center justify-between border-t border-[#d8c9a9]/20 px-1 py-8 sm:px-5 md:py-12"
      >
        {previousProject ? (
          <Link href={`/project/${categorySlug}/${projectSlug(previousProject.dir)}`} className="group max-w-[45%]">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#c8bda6]/45">Previous</span>
            <span className="mt-2 block text-sm font-light text-[#e7e1d3]/70 transition-colors group-hover:text-white sm:text-lg">
              {previousProject.title}
            </span>
          </Link>
        ) : <span />}

        <Link
          href="/project"
          className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#c8bda6]/55 transition-colors hover:text-white"
        >
          All work
        </Link>

        {nextProject ? (
          <Link href={`/project/${categorySlug}/${projectSlug(nextProject.dir)}`} className="group max-w-[45%] text-right">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#c8bda6]/45">Next</span>
            <span className="mt-2 block text-sm font-light text-[#e7e1d3]/70 transition-colors group-hover:text-white sm:text-lg">
              {nextProject.title}
            </span>
          </Link>
        ) : <span />}
      </nav>

      {/* Full-screen image viewer */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={closeLightbox}
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#080907]/[0.97] p-4 backdrop-blur-xl sm:p-7"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
              {project.title} / {String(lightboxIndex + 1).padStart(2, "0")} — {String(allMediaImages.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                closeLightbox();
              }}
              aria-label="Close image viewer"
              className="flex h-10 w-10 items-center justify-center border border-white/15 text-white/80 transition-colors hover:bg-white hover:text-black"
            >
              <X size={17} />
            </button>
          </div>

          <div className="relative mx-auto flex w-full max-w-[1500px] flex-1 items-center justify-center py-5">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPrev();
              }}
              aria-label="Previous image"
              className="absolute left-0 z-10 flex h-10 w-10 items-center justify-center border border-white/15 bg-black/30 text-white/75 hover:bg-white hover:text-black sm:left-3"
            >
              <ArrowLeft size={16} />
            </button>

            <div onClick={(event) => event.stopPropagation()} className="relative h-full max-h-[78vh] w-[calc(100%-5rem)]">
              <Image
                src={allMediaImages[lightboxIndex]}
                alt={`${project.title} — full size image`}
                fill
                priority
                sizes="90vw"
                className="object-contain"
              />
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              aria-label="Next image"
              className="absolute right-0 z-10 flex h-10 w-10 items-center justify-center border border-white/15 bg-black/30 text-white/75 hover:bg-white hover:text-black sm:right-3"
            >
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="text-center font-mono text-[8px] uppercase tracking-[0.2em] text-white/35">
            Arrow keys to navigate · Escape to close
          </div>
        </div>
      )}
    </main>
  );
}
