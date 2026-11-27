'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import SDFAnimation from './SDFAnimation';
import projectsData from '../data/projects.json';
import { projectSlug } from '../utils/projectSlugs';

export interface FractalProjectItem {
  title: string;
  categoryTitle: string;
  cover: string;
  href: string;
}

export type FractalMode = 'home' | 'project' | 'contact' | 'about' | 'detail';

type RawProject = {
  title: string;
  dir: string;
  cover: string;
};

type RawCategory = {
  title: string;
  projects: RawProject[];
};

export default function PersistentFractal() {
  const pathname = usePathname();
  const isDetailRoute = pathname.startsWith('/project/') && pathname !== '/project';

  const mode: FractalMode | null =
    pathname === '/'
      ? 'home'
      : pathname === '/project'
        ? 'project'
        : pathname === '/contact'
          ? 'contact'
          : pathname === '/about'
            ? 'about'
            : isDetailRoute
              ? 'detail'
              : null;

  const isProjectPage = mode === 'project';
  const wrapperRef = useRef<HTMLDivElement>(null);

  const projects = useMemo<FractalProjectItem[]>(() => {
    const items: FractalProjectItem[] = [];
    for (const [categorySlug, value] of Object.entries(projectsData)) {
      const category = value as Partial<RawCategory>;
      if (!Array.isArray(category.projects) || typeof category.title !== 'string') continue;
      for (const proj of category.projects) {
        if (!proj?.title || !proj?.dir || !proj?.cover) continue;
        items.push({
          title: proj.title,
          categoryTitle: category.title,
          cover: proj.cover,
          href: `/project/${categorySlug}/${projectSlug(proj.dir)}`,
        });
      }
    }
    return items;
  }, []);

  const selectedChunkIndex = isDetailRoute
    ? projects.findIndex((item) => item.href === pathname)
    : null;

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    if (pathname !== '/') {
      el.style.transform = 'translate3d(0, 0, 0)';
      return;
    }

    const syncScroll = () => {
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translate3d(0, ${-window.scrollY}px, 0)`;
      }
    };

    syncScroll();
    window.addEventListener('scroll', syncScroll, { passive: true });
    return () => window.removeEventListener('scroll', syncScroll);
  }, [pathname]);

  if (!mode) return null;

  return (
    <div
      ref={wrapperRef}
      className={`fixed inset-0 z-[5] mix-blend-screen will-change-transform transition-opacity duration-700 ${
        mode === 'contact'
          ? 'opacity-65'
          : mode === 'about'
            ? 'opacity-75'
            : mode === 'detail'
              ? 'opacity-80'
              : 'opacity-95'
      } ${isProjectPage ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      <SDFAnimation mode={mode} centered={isProjectPage} projects={projects} selectedChunkIndex={selectedChunkIndex !== null && selectedChunkIndex >= 0 ? selectedChunkIndex : null} />
    </div>
  );
}
