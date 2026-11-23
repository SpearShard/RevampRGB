"use client";

import { use, useCallback, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowLeft, ArrowRight, X } from "lucide-react";
import projectsData from "@/app/data/projects.json";
import { projectSlug } from "@/app/utils/projectSlugs";

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
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowGallery(true), 920);
    return () => window.clearTimeout(timer);
  }, [selectedProjectSlug]);

  const category = projectsData[
    categorySlug as keyof typeof projectsData
  ] as ProjectCategory | undefined;

  const project = category?.projects?.find(
    (item) => projectSlug(item.dir) === selectedProjectSlug
  );

  useEffect(() => {
    if (!project) return;
    window.dispatchEvent(new CustomEvent("rgb:enter-detail", {
      detail: { href: `/project/${categorySlug}/${selectedProjectSlug}` },
    }));
  }, [categorySlug, selectedProjectSlug, project]);


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
  const mediaCount = project?.images?.length ?? 0;
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

  const showNext = () => {
    if (lightboxIndex === null || mediaCount === 0) return;
    setLightboxIndex((current) =>
      current === null ? null : (current + 1) % mediaCount
    );
  };

  const showPrev = () => {
    if (lightboxIndex === null || mediaCount === 0) return;
    setLightboxIndex((current) =>
      current === null
        ? null
        : (current - 1 + mediaCount) % mediaCount
    );
  };

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
    <main className="relative isolate min-h-screen overflow-hidden bg-transparent px-3 pb-8 pt-20 text-[#e9e5d9] selection:bg-[#d8c9a9] selection:text-[#171713] sm:px-6 sm:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(151,139,110,0.13),transparent_52%)]"
      />

      {/* Cover study */}
      <section className="relative mx-auto min-h-[64svh] max-w-[1680px] sm:min-h-[76svh] overflow-hidden rounded-[32px] border border-white/10 bg-[#090a0e]/65 shadow-[0_30px_120px_rgba(0,0,0,.38)] sm:rounded-[44px]">
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

        <div className="absolute left-5 top-5 flex items-center gap-3 sm:left-9 sm:top-8">
          <Link
            href="/project"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-[#e9e5d9]/75 backdrop-blur-md transition-colors hover:bg-white hover:text-black"
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

        {/* Minimal RGB study mark */}
        <svg aria-hidden="true" viewBox="0 0 420 420" className="pointer-events-none absolute bottom-8 right-8 hidden h-[min(38vw,390px)] w-[min(38vw,390px)] opacity-75 lg:block" fill="none">
          <circle cx="210" cy="210" r="154" stroke="rgba(235,228,210,.22)" strokeWidth=".8" strokeDasharray="2 9" />
          <circle cx="210" cy="210" r="106" stroke="rgba(235,228,210,.16)" strokeWidth=".7" />
          <path d="M210 28V392M28 210H392" stroke="rgba(235,228,210,.12)" strokeWidth=".7" />
          <path d="M210 210L115 105M210 210L333 150M210 210L265 345" stroke="rgba(235,228,210,.28)" strokeWidth=".8" />
          <circle cx="115" cy="105" r="5" fill="#ff2433" />
          <circle cx="333" cy="150" r="5" fill="#1ff261" />
          <circle cx="265" cy="345" r="5" fill="#0056e6" />
          <circle cx="210" cy="210" r="3" fill="#e9e5d9" />
          <text x="210" y="405" fill="rgba(235,228,210,.45)" fontSize="8" textAnchor="middle" letterSpacing="3">FORM / MATERIAL / SYSTEM</text>
        </svg>

        <div className="absolute bottom-6 left-4 right-4 sm:bottom-12 sm:left-9 sm:right-9 lg:bottom-16 lg:left-14">
          <div className="mb-5 flex items-center gap-3 text-[9px] uppercase tracking-[0.28em] text-[#e9e5d9]/55">
            <span className="h-px w-8 bg-[#d8c9a9]/80" />
            Selected work
          </div>
          <h1 className="max-w-[1100px] text-[clamp(2.65rem,13vw,9.5rem)] sm:text-[clamp(3.2rem,9.5vw,9.5rem)] font-light uppercase leading-[0.82] tracking-[-0.075em] text-[#f0ede4]">
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
      <section className="relative mx-auto mt-4 grid max-w-[1500px] grid-cols-1 gap-6 sm:mt-8 sm:gap-8 rounded-[24px] border border-white/10 bg-[#090a0e]/70 px-4 py-7 sm:rounded-[32px] sm:px-10 sm:py-14 shadow-[0_20px_70px_rgba(0,0,0,.2)] sm:px-10 sm:py-14 md:mt-8 lg:grid-cols-12 lg:gap-16">
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
            <dl className="grid grid-cols-1 gap-y-4 rounded-2xl border border-white/10 bg-black/20 p-5">
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
      {showGallery && <section className="mx-auto mt-8 max-w-[1680px] rounded-[32px] border border-white/10 bg-[#090a0e]/65 p-4 sm:rounded-[40px] sm:p-7">
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
      </section>}

      {/* Asymmetric image studies */}
      {showGallery && imagePairs.length > 0 && (
        <section className="mx-auto mt-8 max-w-[1500px] rounded-[32px] border border-white/10 bg-[#090a0e]/65 px-5 pb-16 pt-10 sm:rounded-[40px] sm:px-10 md:pb-24 md:pt-16">
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
        <section className="relative mx-auto mt-8 h-[36vh] max-w-[1680px] overflow-hidden rounded-[36px] border border-white/10 bg-[#151812] sm:h-[52vh]">
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
        className="mx-auto mt-8 flex max-w-[1500px] items-center justify-between rounded-[22px] border border-white/10 bg-[#090a0e]/75 px-4 py-4 sm:rounded-full sm:px-8 sm:py-6"
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
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#050609]/[0.97] p-4 backdrop-blur-md sm:p-7"
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
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:bg-white hover:text-black"
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
              className="absolute left-0 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/75 hover:bg-white hover:text-black sm:left-3"
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
              className="absolute right-0 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/75 hover:bg-white hover:text-black sm:right-3"
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
