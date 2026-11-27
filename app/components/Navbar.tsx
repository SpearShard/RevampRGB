'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';

interface NavLink {
  label: string;
  href: string;
  code: string;
}

const LINKS: NavLink[] = [
  { label: 'Home', href: '/', code: '01' },
  { label: 'About', href: '/about', code: '02' },
  { label: 'Contact', href: '/contact', code: '03' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dockRef = useRef<HTMLDivElement>(null);
  const logoShellRef = useRef<HTMLElement>(null);
  const dockShellRef = useRef<HTMLDivElement>(null);
  const enterShellRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<SVGFETurbulenceElement>(null);
  const enterBtnRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuOpenRef = useRef(false);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const enterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNavigatingRef = useRef(false);

  const mouse = useRef({ x: 0, y: 0, velocityX: 0, velocityY: 0, prevX: 0, prevY: 0 });

  const isDetailRoute = pathname.startsWith('/project/') && pathname !== '/project';
  const isExperienceRoute =
    pathname === '/' ||
    pathname === '/project' ||
    pathname === '/contact' ||
    pathname === '/about' ||
    isDetailRoute;

  const handleEnterAction = useCallback(() => {
    if (isNavigatingRef.current) return;

    if (enterBtnRef.current) {
      gsap.to(enterBtnRef.current, {
        scale: 0.88,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    }

    if (pathname === '/project') return;

    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }

    isNavigatingRef.current = true;

    if (isExperienceRoute) {
      window.dispatchEvent(new CustomEvent('rgb:enter-project'));
      enterTimeoutRef.current = setTimeout(() => {
        router.push('/project');
        enterTimeoutRef.current = null;
      }, 450);
    } else {
      router.push('/project');
    }
  }, [isExperienceRoute, pathname, router]);

  useEffect(() => {
    mobileMenuOpenRef.current = false;
    if (mobileMenuRef.current) gsap.set(mobileMenuRef.current, { display: 'none', autoAlpha: 0 });
    isNavigatingRef.current = false;
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    gsap.fromTo(
      [logoShellRef.current, dockShellRef.current, enterShellRef.current],
      { scale: 0.15, y: 80, autoAlpha: 0 },
      { scale: 1, y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out' }
    );
    return () => {
      gsap.killTweensOf([logoShellRef.current, dockShellRef.current, enterShellRef.current]);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
      handleEnterAction();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleEnterAction]);

  useEffect(() => () => {
    if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mouse.current.velocityX = e.clientX - mouse.current.prevX;
    mouse.current.velocityY = e.clientY - mouse.current.prevY;
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
    mouse.current.prevX = e.clientX;
    mouse.current.prevY = e.clientY;

    if (filterRef.current) {
      const speed = Math.hypot(mouse.current.velocityX, mouse.current.velocityY);
      const baseFreq = Math.min(0.09, 0.015 + speed * 0.0012);
      gsap.to(filterRef.current, {
        attr: { baseFrequency: `${baseFreq} ${baseFreq}` },
        duration: 0.25,
        ease: 'power1.out',
        overwrite: 'auto',
      });
    }

    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (auraRef.current) {
      gsap.to(auraRef.current, {
        x: x - 100,
        y: y - 100,
        opacity: 0.9,
        scale: 1,
        duration: 0.35,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseLeave = () => {
    if (auraRef.current) {
      gsap.to(auraRef.current, { opacity: 0, scale: 0.4, duration: 0.4, ease: 'power2.inOut' });
    }
  };

  const handleLinkMouseMove = (e: React.MouseEvent<HTMLElement>, target: HTMLElement | null) => {
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;

    gsap.to(target, {
      x: relX * 0.35,
      y: relY * 0.35,
      skewX: mouse.current.velocityX * 0.3,
      duration: 0.25,
      ease: 'power2.out',
    });
  };

  const handleLinkMouseLeave = (target: HTMLElement | null) => {
    if (!target) return;
    gsap.to(target, { x: 0, y: 0, skewX: 0, duration: 0.7, ease: 'elastic.out(1.2, 0.3)' });
  };

  const handleEnterButtonMouseEnter = () => {
    if (!enterBtnRef.current) return;
    gsap.killTweensOf(enterBtnRef.current);
    gsap.timeline()
      .to(enterBtnRef.current, { scaleX: 1.15, scaleY: 0.88, duration: 0.15, ease: 'power2.out' })
      .to(enterBtnRef.current, { scaleX: 1, scaleY: 1, duration: 0.8, ease: 'elastic.out(1.4, 0.3)' });
  };

  const handleEnterButtonMouseLeave = () => {
    if (!enterBtnRef.current) return;
    gsap.to(enterBtnRef.current, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1.2, 0.4)' });
  };

  const navigateExperienceLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isExperienceRoute) return;
    if (href !== '/' && href !== '/contact' && href !== '/about') return;
    if (pathname === href) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    const eventName =
      href === '/'
        ? 'rgb:leave-project'
        : href === '/contact'
          ? 'rgb:enter-contact'
          : 'rgb:enter-about';

    window.dispatchEvent(new CustomEvent(eventName));
    enterTimeoutRef.current = setTimeout(() => {
      router.push(href);
      enterTimeoutRef.current = null;
    }, 300);
  };

  const toggleMobileMenu = () => {
    const menu = mobileMenuRef.current;
    if (!menu) return;
    const opening = !mobileMenuOpenRef.current;
    mobileMenuOpenRef.current = opening;
    const iconLines = menu.parentElement?.querySelectorAll('button span span');
    if (iconLines && iconLines.length === 2) {
      gsap.to(iconLines[0], { y: opening ? 3.25 : 0, rotation: opening ? 45 : 0, duration: 0.25, ease: 'power2.out' });
      gsap.to(iconLines[1], { y: opening ? -3.25 : 0, rotation: opening ? -45 : 0, duration: 0.25, ease: 'power2.out' });
    }
    if (opening) {
      gsap.killTweensOf(menu);
      gsap.set(menu, { display: 'block' });
      gsap.fromTo(menu,
        { autoAlpha: 0, scale: 0.82, y: -10, transformOrigin: 'top right', clipPath: 'inset(0 0 100% 100% round 28px)' },
        { autoAlpha: 1, scale: 1, y: 0, clipPath: 'inset(0 0 0% 0% round 24px)', duration: 0.48, ease: 'elastic.out(1, 0.72)' }
      );
    } else {
      gsap.killTweensOf(menu);
      gsap.to(menu, {
        autoAlpha: 0, scale: 0.86, y: -8,
        clipPath: 'inset(0 0 100% 100% round 28px)',
        duration: 0.24, ease: 'power2.in',
        onComplete: () => gsap.set(menu, { display: 'none' }),
      });
    }
  };

  const closeMobileMenu = () => {
    if (mobileMenuOpenRef.current) toggleMobileMenu();
  };

  const navigateMobileProject = () => {
    closeMobileMenu();
    if (pathname === '/project' || isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    if (isExperienceRoute) {
      window.dispatchEvent(new CustomEvent('rgb:enter-project'));
      enterTimeoutRef.current = setTimeout(() => {
        router.push('/project');
        enterTimeoutRef.current = null;
      }, 450);
    } else router.push('/project');
  };

  const isoPathD = `M 38 6 
    C 38 2.6, 40.6 0, 44 0 
    L 84 0 
    C 88.4 0, 92 3.6, 92 8 
    L 92 102 
    C 92 106.4, 88.4 110, 84 110 
    L 8 110 
    C 3.6 110, 0 106.4, 0 102 
    L 0 56 
    C 0 51.6, 3.6 48, 8 48 
    L 30 48 
    C 34.4 48, 38 44.4, 38 40 
    Z`;

  return (
    <>
      {/* SVG Refraction Filter */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id="rgb-aura-displacement">
            <feTurbulence
              ref={filterRef}
              type="fractalNoise"
              baseFrequency="0.02 0.02"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="35"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Top Left Logo */}
      <header ref={logoShellRef} className="fixed top-6 left-6 sm:top-8 sm:left-8 max-md:!top-5 max-md:!left-5 z-50 select-none">
        <Link
          href="/"
          onClick={(e) => navigateExperienceLink(e, '/')}
          className="relative w-20 h-7 sm:w-24 sm:h-8 flex items-center pointer-events-auto transition-transform hover:scale-105 duration-300"
        >
          <Image src="/logo.svg" alt="Logo" fill priority className="object-contain object-left filter brightness-0 invert" />
        </Link>
      </header>


      {/* Mobile Dynamic-Island Navigation */}
      <div className="md:hidden fixed top-4 right-4 z-[70]">
        <button type="button" onClick={toggleMobileMenu} aria-label="Toggle navigation menu" aria-expanded={mobileMenuOpenRef.current}
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-[#09090d]/85 text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <span className="flex w-[18px] flex-col gap-[5px]">
            <span className="h-[1.5px] w-full rounded-full bg-white transition-transform duration-300" />
            <span className="h-[1.5px] w-full rounded-full bg-white transition-transform duration-300" />
          </span>
        </button>
        <div ref={mobileMenuRef} style={{ display: 'none', opacity: 0, visibility: 'hidden', clipPath: 'inset(0 0 100% 100% round 28px)' }}
          className="absolute right-0 top-0 w-[min(78vw,270px)] overflow-hidden rounded-[24px] border border-white/15 bg-[#09090d]/95 p-3 pt-[58px] shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-3xl">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {[
              { label: 'Home', href: '/', code: '01' },
              { label: 'Projects', href: '/project', code: '02' },
              { label: 'About', href: '/about', code: '03' },
              { label: 'Contact', href: '/contact', code: '04' },
            ].map((link) => {
              const active = pathname === link.href || (link.href === '/project' && isDetailRoute);
              return (
                <Link key={link.label} href={link.href}
                  onClick={(e) => {
                    if (link.href === '/project') { e.preventDefault(); navigateMobileProject(); }
                    else { navigateExperienceLink(e, link.href); closeMobileMenu(); }
                  }}
                  className={`flex items-center justify-between rounded-[15px] px-4 py-3.5 transition-colors duration-200 ${active ? 'bg-white/[0.12] text-white' : 'text-white/65 hover:bg-white/[0.07] hover:text-white'}`}>
                  <span className="text-[12px] font-medium uppercase tracking-[0.18em]">{link.label}</span>
                  <span className="font-mono text-[9px] tracking-widest text-white/35">{link.code}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-2 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <p className="px-4 pt-3 text-[8px] font-mono tracking-[0.22em] text-white/30">RGB / NAVIGATION</p>
        </div>
      </div>

      {/* Bottom Notch Navigation */}
      <div
        ref={dockShellRef}
        className="hidden md:block fixed bottom-0 left-1/2 -translate-x-1/2 z-50 select-none max-w-[96vw]"
      >
        <div className="pointer-events-none absolute -inset-x-8 -top-8 h-20 rounded-full bg-gradient-to-r from-red-500/30 via-emerald-500/30 to-blue-500/30 opacity-40 blur-2xl" />
        <div
          ref={dockRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="group/notch relative flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-5 pt-3 pb-[max(0.7rem,env(safe-area-inset-bottom))] bg-[#08080c]/95 backdrop-blur-3xl rounded-t-[26px] sm:rounded-t-[30px] border border-b-0 border-white/[0.16] shadow-[0_-12px_45px_rgba(0,0,0,0.38)] overflow-hidden transition-[padding,background-color] duration-300 ease-out hover:bg-[#0b0b10]/[0.98] hover:pt-4"
        >
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          <div
            ref={auraRef}
            className="absolute top-0 left-0 w-52 h-52 rounded-full pointer-events-none opacity-0 scale-50 z-0 mix-blend-screen"
            style={{
              filter: 'url(#rgb-aura-displacement)',
              background: 'radial-gradient(circle, rgba(239,68,68,0.5) 0%, rgba(16,185,129,0.4) 40%, rgba(37,99,235,0.4) 70%, transparent 100%)',
            }}
          />
          <nav aria-label="Main navigation" className="relative z-10 flex items-center gap-0.5 sm:gap-1">
            {LINKS.map((link, idx) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  ref={(el) => { linksRef.current[idx] = el; }}
                  href={link.href}
                  onClick={(e) => navigateExperienceLink(e, link.href)}
                  onMouseMove={(e) => handleLinkMouseMove(e, linksRef.current[idx])}
                  onMouseLeave={() => handleLinkMouseLeave(linksRef.current[idx])}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative flex items-baseline gap-1.5 sm:gap-2 py-2 px-3.5 sm:py-2.5 sm:px-6 rounded-xl transition-colors duration-300 no-underline cursor-pointer ${
                    isActive ? 'bg-white/[0.11]' : 'hover:bg-white/[0.065]'
                  }`}
                >
                  <span className={`text-[9px] sm:text-[10px] font-mono transition-colors ${isActive ? 'text-white/75' : 'text-neutral-500 group-hover:text-white/75'}`}>
                    {link.code}
                  </span>
                  <span className={`text-[11px] sm:text-xs font-sans uppercase tracking-wider sm:tracking-widest font-medium transition-colors ${isActive ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}>
                    {link.label}
                  </span>
                  {isActive && <span className="absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-white/75" />}
                </Link>
              );
            })}
          </nav>
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-1/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      {/* ISO Enter Button - Starts Pure White, Dissipates to Dark on Hover */}
      <div ref={enterShellRef} className="hidden md:block fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 select-none">
        <button
          ref={enterBtnRef}
          onClick={handleEnterAction}
          onMouseEnter={handleEnterButtonMouseEnter}
          onMouseLeave={handleEnterButtonMouseLeave}
          aria-label="Enter action"
          className="relative cursor-pointer group focus:outline-none origin-center"
        >
          <div className="relative w-[80px] h-[95px] sm:w-[92px] sm:h-[110px] filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)]">
            <svg viewBox="0 0 92 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
              <defs>
                <clipPath id="btnClip" clipPathUnits="userSpaceOnUse">
                  <path d={isoPathD} />
                </clipPath>
              </defs>

              <path d={isoPathD} className="fill-[#08080c]/90" />

              <g clipPath="url(#btnClip)">
                <rect
                  x="0"
                  y="0"
                  width="92"
                  height="110"
                  fill="#ffffff"
                  className="opacity-100 group-hover:opacity-0 transition-opacity duration-500 ease-out"
                />
              </g>

              <path
                d={isoPathD}
                className="stroke-black/20 group-hover:stroke-white/40 transition-colors duration-300"
                strokeWidth="1.5"
              />
            </svg>

            <div className="absolute bottom-2.5 left-2.5 sm:bottom-3.5 sm:left-3.5 flex items-center gap-1.5 pointer-events-none z-10">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-black group-hover:text-white transition-colors duration-500"
              >
                <path d="M20 4v9a2 2 0 0 1-2 2H5" />
                <path d="M9 18l-4-4 4-4" />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-mono tracking-wider font-bold text-black group-hover:text-white transition-colors duration-500">
                Enter
              </span>
            </div>
          </div>
        </button>
      </div>
    </>
  );
}
