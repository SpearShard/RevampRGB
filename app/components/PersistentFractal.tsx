'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import SDFAnimation from './SDFAnimation';
import projectsData from '../data/projects.json';
import { projectSlug } from '../utils/projectSlugs';

export type FractalMode = 'home' | 'project' | 'contact' | 'about' | 'detail';

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

const FRACTAL_ROUTES = new Set(['/', '/project', '/contact', '/about']);

function isProjectDetailRoute(path: string) {
  return path.startsWith('/project/') && path !== '/project';
}

function resolveFractalMode(path: string): FractalMode {
  if (isProjectDetailRoute(path)) return 'detail';
  if (path === '/project') return 'project';
  if (path === '/contact') return 'contact';
  if (path === '/about') return 'about';
  return 'home';
}

export default function PersistentFractal() {
  const pathname = usePathname();
  const isDetailRoute = isProjectDetailRoute(pathname);
  const isFractalRoute = FRACTAL_ROUTES.has(pathname) || isDetailRoute;
  const [overrideMode, setOverrideMode] = useState<FractalMode | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setOverrideMode(null));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    const onEnterProject = () => setOverrideMode('project');
    const onLeaveProject = () => setOverrideMode('home');
    const onEnterContact = () => setOverrideMode('contact');
    const onEnterAbout = () => setOverrideMode('about');
    const onEnterDetail = () => setOverrideMode('detail');

    window.addEventListener('rgb:enter-project', onEnterProject);
    window.addEventListener('rgb:leave-project', onLeaveProject);
    window.addEventListener('rgb:enter-contact', onEnterContact);
    window.addEventListener('rgb:enter-about', onEnterAbout);
    window.addEventListener('rgb:enter-detail', onEnterDetail);

    return () => {
      window.removeEventListener('rgb:enter-project', onEnterProject);
      window.removeEventListener('rgb:leave-project', onLeaveProject);
      window.removeEventListener('rgb:enter-contact', onEnterContact);
      window.removeEventListener('rgb:enter-about', onEnterAbout);
      window.removeEventListener('rgb:enter-detail', onEnterDetail);
    };
  }, []);

  const mode: FractalMode = overrideMode ?? resolveFractalMode(pathname);
  const isProjectMode = mode === 'project';
  const isHomeMode = mode === 'home';

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

    if (!isHomeMode) {
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
  }, [isHomeMode]);

  if (!isFractalRoute) return null;

  return (
    <div
      ref={wrapperRef}
      className={`fixed inset-0 mix-blend-screen will-change-transform transition-[opacity,z-index] duration-500 ${
        isProjectMode
          ? 'z-[6] pointer-events-auto opacity-95'
          : mode === 'contact' || mode === 'about'
            ? 'z-[5] pointer-events-none opacity-80'
            : mode === 'detail'
              ? 'z-[5] pointer-events-none opacity-85'
              : 'z-[5] pointer-events-none opacity-95'
      }`}
    >
      <SDFAnimation mode={mode} projects={projects} activeHref={isDetailRoute ? pathname : null} />
    </div>
  );
}
