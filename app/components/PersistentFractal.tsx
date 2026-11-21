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
  const isFractalRoute = pathname === '/' || pathname === '/project';
  const isProjectPage = pathname === '/project';
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

  if (!isFractalRoute) return null;

  return (
    <div
      ref={wrapperRef}
      className={`fixed inset-0 z-[5] mix-blend-screen opacity-95 will-change-transform ${
        isProjectPage ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <SDFAnimation centered={isProjectPage} projects={projects} />
    </div>
  );
}
