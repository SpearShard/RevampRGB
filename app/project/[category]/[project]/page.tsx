"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, Sparkles, X } from "lucide-react";
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

const RGB_SIGNATURES = [
  { label: "rgb(255, 36, 51)", hex: "#ff2433", soft: "rgba(255, 36, 51, 0.14)" },
  { label: "rgb(31, 242, 97)", hex: "#1ff261", soft: "rgba(31, 242, 97, 0.14)" },
  { label: "rgb(0, 86, 230)", hex: "#0056e6", soft: "rgba(0, 86, 230, 0.16)" },
];

export default function ProjectPage({ params }: PageProps) {
  const router = useRouter();
  const { category: categorySlug, project: selectedProjectSlug } = use(params);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [contentReady, setContentReady] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const pageRef = useRef<HTMLElement>(null);

  const category = projectsData[
    categorySlug as keyof typeof projectsData
  ] as ProjectCategory | undefined;

  const project = category?.projects?.find(
    (item) => projectSlug(item.dir) === selectedProjectSlug
  );

  // Compute global shard index so the color signature matches the exact 3D shard from /project
  let globalShardIndex = 0;
  let runningIdx = 0;
  for (const [catKey, catVal] of Object.entries(projectsData)) {
    const cat = catVal as Partial<ProjectCategory>;
    if (!Array.isArray(cat.projects)) continue;
    for (const item of cat.projects) {
      if (catKey === categorySlug && projectSlug(item.dir) === selectedProjectSlug) {
        globalShardIndex = runningIdx;
      }
      runningIdx += 1;
    }
  }
  const accent = RGB_SIGNATURES[globalShardIndex % RGB_SIGNATURES.length];

  const descriptionItems = project?.description ?? [];
  const metadata: Record<string, string> = {};
  const mainDescription: string[] = [];

  descriptionItems.forEach((item) => {
    const match = item.match(/^\s*([^:]+?)\s*[-:]\s*(.+)$/);
    if (match && match[1].trim().length <= 32) {
      metadata[match[1].trim()] = match[2].trim();
    } else {
      mainDescription.push(item);
    }
  });

  const allMediaImages = project?.images ?? [];
  const galleryImages = project?.video ? allMediaImages : allMediaImages.slice(1);
  const imageRows: string[][] = [];
  for (let i = 0; i < galleryImages.length; i += 2) {
    imageRows.push(galleryImages.slice(i, i + 2));
  }

  const currentProjectIndex =
    category?.projects.findIndex((item) => item.title === project?.title) ?? -1;
  const previousProject =
    currentProjectIndex > 0 ? category?.projects[currentProjectIndex - 1] ?? null : null;
  const nextProject =
    category && currentProjectIndex >= 0
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

  const markImageLoaded = useCallback((key: string) => {
    setLoadedImages((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  // Wait until the 3D fractal shard settles into its detail position (~920ms) before mounting images & content
  useEffect(() => {
    setContentReady(false);
    setLoadedImages({});
    const timer = setTimeout(() => {
      setContentReady(true);
    }, 920);
    return () => clearTimeout(timer);
  }, [categorySlug, selectedProjectSlug]);

  useEffect(() => {
    if (!contentReady || !pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".detail-reveal",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.07,
          ease: "power3.out",
          clearProps: "transform",
        }
      );
    }, pageRef);
    return () => ctx.revert();
  }, [contentReady]);

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

  const chapterNumber = String(currentProjectIndex + 1).padStart(2, "0");

  const handleBackToProjects = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("rgb:enter-project"));
    setTimeout(() => {
      router.push("/project");
    }, 240);
  };

  if (!contentReady) {
    return (
      <main
        className="relative isolate min-h-screen w-full overflow-x-hidden bg-transparent px-4 pb-24 pt-24 text-[#f4f4f6] font-sans sm:px-8 sm:pt-28 lg:px-14"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background: `radial-gradient(circle at 76% 32%, ${accent.soft}, transparent 54%)`,
          }}
        />
      </main>
    );
  }

  return (
    <main
      ref={pageRef}
      className="relative isolate min-h-screen w-full overflow-x-hidden bg-transparent px-4 pb-24 pt-24 text-[#f4f4f6] font-sans selection:bg-white selection:text-[#070709] sm:px-8 sm:pt-28 lg:px-14"
    >
      {/* Ambient radial tint harmonized with the persistent background fractal shard */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: `radial-gradient(circle at 76% 32%, ${accent.soft}, transparent 54%)`,
        }}
      />

      {/* Top Floating Pill Navigation */}
      <div className="detail-reveal mx-auto mb-6 flex max-w-[1640px] flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-[#0b0b0f]/85 px-2 py-1.5 backdrop-blur-md">
          <Link
            href="/project"
            onClick={handleBackToProjects}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white transition-colors duration-300 hover:bg-white hover:text-[#08080a]"
          >
            <ArrowLeft size={14} strokeWidth={1.75} />
            <span>All Works</span>
          </Link>
          <span className="px-3 text-xs font-normal tracking-wide text-white/65">
            {category.title}
          </span>
        </div>

        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-[#0b0b0f]/80 px-4 py-2 text-xs text-white/70 backdrop-blur-md">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: accent.hex, boxShadow: `0 0 12px ${accent.hex}` }}
          />
          <span className="tracking-wide">{accent.label}</span>
          <span className="text-white/25">·</span>
          <span className="text-white/50">Work {chapterNumber}</span>
        </div>
      </div>

      {/* Curved Sculptural Hero Stage */}
      <section className="detail-reveal relative mx-auto min-h-[72svh] max-w-[1640px] overflow-hidden rounded-[32px] border border-white/12 bg-[#0c0c10] shadow-[0_32px_90px_rgba(0,0,0,0.65)] sm:min-h-[78svh] sm:rounded-[44px]">
        <Image
          src={project.cover}
          alt={project.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 85vw"
          className="object-cover opacity-[0.76] transition-transform duration-1000 ease-out hover:scale-[1.02] will-change-transform"
        />

        {/* Soft curved atmospheric gradients leaving upper-right open so the persistent 3D shard shines through */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/35 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#07070a]/80 via-[#07070a]/20 to-transparent" />

        {/* Subtle organic curved contour lines */}
        <svg
          aria-hidden="true"
          viewBox="0 0 600 600"
          className="pointer-events-none absolute -right-16 -top-16 hidden h-[460px] w-[460px] text-white/15 lg:block"
          fill="none"
        >
          <circle cx="300" cy="300" r="240" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="300" cy="300" r="175" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 8" />
          <path d="M120 300C120 200.589 200.589 120 300 120" stroke={accent.hex} strokeWidth="1.4" strokeOpacity="0.65" />
        </svg>

        {/* Bottom Editorial Title & Subtitle Overlay */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end gap-6 p-6 sm:p-10 lg:flex-row lg:items-end lg:justify-between lg:p-14">
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-black/65 px-3.5 py-1.5 text-xs text-white/80">
              <Sparkles size={12} style={{ color: accent.hex }} />
              <span>{category.title}</span>
            </div>

            <h1 className="text-[clamp(2.6rem,7.2vw,6.8rem)] font-semibold leading-[0.94] tracking-[-0.04em] text-white">
              {project.title}
            </h1>

            {project.subtitle && (
              <p className="max-w-2xl font-serif text-lg italic text-white/80 sm:text-2xl">
                {project.subtitle}
              </p>
            )}
          </div>

          <a
            href="#project-story"
            className="group inline-flex items-center gap-3 self-start rounded-full border border-white/15 bg-black/60 px-5 py-3 text-xs font-medium text-white transition-colors duration-300 hover:bg-white hover:text-[#08080a] lg:self-end"
          >
            <span>Explore Story</span>
            <ArrowDownRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
            />
          </a>
        </div>
      </section>

      {/* Curved Bento Story & Credits Section (Deep translucent obsidian without heavy per-frame GPU blur) */}
      <section
        id="project-story"
        className="detail-reveal mx-auto mt-8 grid max-w-[1640px] grid-cols-1 gap-6 lg:mt-12 lg:grid-cols-12"
      >
        {/* Main Narrative Pill Card */}
        <div className="rounded-[32px] border border-white/10 bg-[#0b0b10]/85 p-7 sm:p-10 lg:col-span-8 lg:rounded-[38px] lg:p-12">
          <div className="mb-6 flex items-center gap-3">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: accent.hex }}
            />
            <span className="text-xs font-medium tracking-wide text-white/55">
              Design Narrative
            </span>
          </div>

          <div className="space-y-6">
            {mainDescription.map((paragraph, idx) => (
              <p
                key={idx}
                className={
                  idx === 0
                    ? "text-lg font-light leading-[1.7] tracking-[-0.015em] text-white/90 sm:text-xl md:text-2xl"
                    : "text-base font-light leading-relaxed text-white/65"
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Credits & Details Curved Card */}
        <div className="flex flex-col justify-between rounded-[32px] border border-white/10 bg-[#0b0b10]/85 p-7 sm:p-10 lg:col-span-4 lg:rounded-[38px] lg:p-10">
          <div>
            <span className="text-xs font-medium tracking-wide text-white/55">
              Project Credits
            </span>

            {Object.keys(metadata).length > 0 ? (
              <div className="mt-6 space-y-3">
                {Object.entries(metadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5 transition-colors duration-300 hover:border-white/15"
                  >
                    <p className="text-[11px] font-medium text-white/45">{key}</p>
                    <p className="mt-1 text-sm font-normal leading-snug text-white/90">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5">
                  <p className="text-[11px] font-medium text-white/45">Discipline</p>
                  <p className="mt-1 text-sm text-white/90">{category.title}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5">
                  <p className="text-[11px] font-medium text-white/45">Studio</p>
                  <p className="mt-1 text-sm text-white/90">RGB Design Studio</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white/70">
            <span>Gallery Collection</span>
            <span className="font-medium text-white">
              {allMediaImages.length} {allMediaImages.length === 1 ? "Frame" : "Frames"}
            </span>
          </div>
        </div>
      </section>

      {/* Featured Motion or Primary Study Frame */}
      {(project.video || project.images[0]) && (
        <section className="detail-reveal mx-auto mt-10 max-w-[1640px] lg:mt-14">
          {project.video ? (
            <div className="relative aspect-[16/9] overflow-hidden rounded-[32px] border border-white/12 bg-[#0d0d12] shadow-2xl sm:aspect-[21/9] sm:rounded-[42px]">
              <video autoPlay muted loop playsInline controls className="h-full w-full object-cover">
                <source src={project.video} />
              </video>
            </div>
          ) : project.images[0] ? (
            <button
              type="button"
              onClick={() => setLightboxIndex(0)}
              className="group relative block w-full cursor-zoom-in overflow-hidden rounded-[32px] border border-white/12 bg-[#0d0d12] text-left shadow-2xl sm:rounded-[42px]"
            >
              <div className="relative aspect-[16/9] sm:aspect-[21/9]">
                <Image
                  src={project.images[0]}
                  alt={`${project.title} featured view`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 85vw"
                  onLoad={() => markImageLoaded("featured-0")}
                  className={`object-cover transition-[transform,opacity] duration-700 ease-out group-hover:scale-[1.025] ${
                    loadedImages["featured-0"] ? "opacity-100" : "opacity-0"
                  }`}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>

              <span className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/75 px-4 py-2 text-xs font-medium text-white transition-transform duration-300 group-hover:scale-105">
                <span>View Fullscreen</span>
                <ArrowUpRight size={14} />
              </span>
            </button>
          ) : null}
        </section>
      )}

      {/* Curved Asymmetric Visual Gallery */}
      {imageRows.length > 0 && (
        <section className="detail-reveal mx-auto mt-12 max-w-[1640px] lg:mt-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 px-2">
            <div>
              <p className="text-xs font-medium text-white/50">Visual Studies</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                Spatial &amp; Material Details
              </h2>
            </div>
            <span className="rounded-full border border-white/10 bg-[#0b0b10]/80 px-4 py-1.5 text-xs text-white/65">
              Click any frame to enlarge
            </span>
          </div>

          <div className="space-y-6 sm:space-y-10">
            {imageRows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-1 items-start gap-6 md:grid-cols-12 md:gap-8"
              >
                {row.map((image, imageIndex) => {
                  const globalIndex = (project.video ? 0 : 1) + rowIndex * 2 + imageIndex;
                  const imgKey = `study-${globalIndex}`;
                  const isWide = row.length === 1 || (rowIndex + imageIndex) % 2 === 0;
                  const spanClass =
                    row.length === 1
                      ? "md:col-span-10 md:col-start-2"
                      : isWide
                        ? "md:col-span-7"
                        : "md:col-span-5 md:mt-14";

                  return (
                    <button
                      key={`${image}-${globalIndex}`}
                      type="button"
                      onClick={() => setLightboxIndex(globalIndex)}
                      className={`${spanClass} group relative block w-full cursor-zoom-in text-left`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0d12] shadow-xl transition-colors duration-500 group-hover:border-white/25 sm:rounded-[36px]">
                        <Image
                          src={image}
                          alt={`${project.title} study ${globalIndex + 1}`}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, 55vw"
                          onLoad={() => markImageLoaded(imgKey)}
                          className={`object-cover transition-[transform,opacity] duration-700 ease-out group-hover:scale-[1.035] ${
                            loadedImages[imgKey] ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <span className="rounded-full bg-black/75 px-3.5 py-1 text-xs text-white/90">
                            Study {String(globalIndex + 1).padStart(2, "0")}
                          </span>
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#08080a] shadow-lg">
                            <ArrowUpRight size={15} />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Curved Next / Previous Project Switcher */}
      <nav
        aria-label="Project navigation"
        className="detail-reveal mx-auto mt-16 grid max-w-[1640px] grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-24"
      >
        {previousProject ? (
          <Link
            href={`/project/${categorySlug}/${projectSlug(previousProject.dir)}`}
            className="group flex items-center justify-between rounded-[28px] border border-white/10 bg-[#0c0c11]/85 p-6 transition-colors duration-500 hover:border-white/25 hover:bg-white/[0.06] sm:rounded-[34px] sm:p-8"
          >
            <div>
              <span className="text-xs text-white/45">Previous Project</span>
              <p className="mt-1.5 text-lg font-medium text-white/90 transition-colors group-hover:text-white sm:text-2xl">
                {previousProject.title}
              </p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-transform duration-300 group-hover:-translate-x-1">
              <ArrowLeft size={16} />
            </span>
          </Link>
        ) : (
          <Link
            href="/project"
            onClick={handleBackToProjects}
            className="group flex items-center justify-between rounded-[28px] border border-white/10 bg-[#0c0c11]/85 p-6 transition-colors duration-500 hover:border-white/25 hover:bg-white/[0.06] sm:rounded-[34px] sm:p-8"
          >
            <div>
              <span className="text-xs text-white/45">Return</span>
              <p className="mt-1.5 text-lg font-medium text-white/90 transition-colors group-hover:text-white sm:text-2xl">
                Explore All Projects
              </p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-transform duration-300 group-hover:-translate-x-1">
              <ArrowLeft size={16} />
            </span>
          </Link>
        )}

        {nextProject ? (
          <Link
            href={`/project/${categorySlug}/${projectSlug(nextProject.dir)}`}
            className="group flex items-center justify-between rounded-[28px] border border-white/10 bg-[#0c0c11]/85 p-6 transition-colors duration-500 hover:border-white/25 hover:bg-white/[0.06] sm:rounded-[34px] sm:p-8"
          >
            <div>
              <span className="text-xs text-white/45">Next Project</span>
              <p className="mt-1.5 text-lg font-medium text-white/90 transition-colors group-hover:text-white sm:text-2xl">
                {nextProject.title}
              </p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-transform duration-300 group-hover:translate-x-1">
              <ArrowUpRight size={16} />
            </span>
          </Link>
        ) : (
          <Link
            href="/contact"
            className="group flex items-center justify-between rounded-[28px] border border-white/10 bg-[#0c0c11]/85 p-6 transition-colors duration-500 hover:border-white/25 hover:bg-white/[0.06] sm:rounded-[34px] sm:p-8"
          >
            <div>
              <span className="text-xs text-white/45">Collaborate</span>
              <p className="mt-1.5 text-lg font-medium text-white/90 transition-colors group-hover:text-white sm:text-2xl">
                Start a Conversation
              </p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-transform duration-300 group-hover:translate-x-1">
              <ArrowUpRight size={16} />
            </span>
          </Link>
        )}
      </nav>

      {/* Curved Fullscreen Lightbox */}
      {lightboxIndex !== null && allMediaImages[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/88 p-4 backdrop-blur-xl sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[84vh] w-full max-w-[1560px] flex-col justify-between overflow-hidden rounded-[32px] border border-white/15 bg-[#0a0a0e] p-4 shadow-2xl sm:rounded-[40px] sm:p-6"
          >
            <div className="relative z-10 flex items-center justify-between">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/75">
                {project.title} · {lightboxIndex + 1} / {allMediaImages.length}
              </span>
              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Close gallery"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white hover:text-[#08080a]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative my-4 flex-1 overflow-hidden rounded-[24px]">
              <Image
                src={allMediaImages[lightboxIndex]}
                alt={`${project.title} frame ${lightboxIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {allMediaImages.length > 1 && (
              <div className="relative z-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={showPrev}
                  className="cursor-pointer rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-white hover:text-[#08080a]"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  className="cursor-pointer rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-white hover:text-[#08080a]"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
