'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
const RgbAuraBackground = dynamic(() => import('./bgwebglshaders/RgbAuraBackground'), { ssr: false });

interface NavLink {
  label: string;
  href: string;
  code: string;
}

const LINKS: NavLink[] = [
  { label: 'Home', href: '/', code: '01' },
  { label: 'Projects', href: '/project', code: '02' },
  { label: 'About', href: '/about', code: '03' },
  { label: 'Contact', href: '/contact', code: '04' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const logoShellRef = useRef<HTMLElement>(null);
  const dockShellRef = useRef<HTMLDivElement>(null);
  const enterShellRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<SVGFETurbulenceElement>(null);
  const enterBtnRef = useRef<HTMLButtonElement>(null);
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

  const navigateTo = useCallback(
    (href: string) => {
      setMobileMenuOpen(false);
      if (pathname === href) return;
      const eventName =
        href === '/'
          ? 'rgb:leave-project'
          : href === '/project'
            ? 'rgb:enter-project'
            : href === '/about'
              ? 'rgb:enter-about'
              : 'rgb:enter-contact';
      window.dispatchEvent(new CustomEvent(eventName));
      router.push(href);
    },
    [pathname, router]
  );

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
    setMobileMenuOpen(false);
    isNavigatingRef.current = false;
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!isDesktop || !dockRef.current) return;
    gsap.fromTo(logoShellRef.current, { y: -24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' });
    gsap.fromTo(dockShellRef.current, { y: -48, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.85, delay: 0.08, ease: 'power3.out' });
    gsap.fromTo(enterShellRef.current, { scale: 0.25, y: 40, autoAlpha: 0 }, { scale: 1, y: 0, autoAlpha: 1, duration: 0.85, delay: 0.14, ease: 'power3.out' });
    return () => {
      gsap.killTweensOf([logoShellRef.current, dockShellRef.current, enterShellRef.current]);
    };
  }, [isDesktop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (window.innerWidth < 768 || e.key !== 'Enter' || e.repeat) return;
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
      <header ref={logoShellRef} className="fixed top-4 left-4 sm:top-8 sm:left-8 z-50 select-none">
        <Link
          href="/"
          onClick={(e) => {
            if (!isDesktop) {
              if (pathname === '/') return;
              e.preventDefault();
              navigateTo('/');
              return;
            }
            navigateExperienceLink(e, '/');
          }}
          className="relative w-20 h-7 sm:w-24 sm:h-8 flex items-center pointer-events-auto transition-transform hover:scale-105 duration-300"
        >
          <Image src="/logo.svg" alt="Logo" fill priority className="object-contain object-left" />
        </Link>
      </header>

      {/* Mobile Top-Right Expanding Hamburger Menu */}
      <div ref={mobileMenuRef} className="fixed top-2.5 right-4 z-50 select-none sm:hidden">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-2 rounded-[26px] bg-gradient-to-br from-[#ff2433]/20 via-[#1ff261]/12 to-[#0056e6]/22 blur-xl transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-50'
          }`}
        />

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className={`relative ml-auto flex h-10 w-10 items-center justify-center rounded-[13px] border border-white/[0.22] bg-white/[0.07] backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.65)] transition-all duration-300 active:scale-95 ${
            mobileMenuOpen ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'
          }`}
        >
          <span className="flex flex-col items-end gap-[5px]">
            <span className="h-[1.5px] w-4 rounded-full bg-white/90" />
            <span className="h-[1.5px] w-3 rounded-full bg-white/70" />
            <span className="h-[1.5px] w-4 rounded-full bg-white/90" />
          </span>
        </button>

        <div
          className={`origin-top-right overflow-hidden rounded-[20px] border border-white/[0.22] bg-white/[0.07] backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(255,255,255,0.08),0_20px_50px_rgba(0,0,0,0.7)] transition-all duration-300 ease-out ${
            mobileMenuOpen
              ? 'pointer-events-auto -mt-10 w-[212px] scale-100 opacity-100'
              : 'pointer-events-none -mt-10 w-[212px] scale-75 opacity-0'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
              Menu
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-white/70 transition-colors active:bg-white/15"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-0.5 p-2">
            {LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href === '/project' && isDetailRoute);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(link.href);
                  }}
                  className={`flex items-center justify-between rounded-[13px] px-3.5 py-2.5 transition-all duration-200 no-underline ${
                    isActive
                      ? 'bg-white/[0.1] text-white'
                      : 'text-white/65 active:bg-white/[0.07] hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <span className="text-xs font-medium uppercase tracking-[0.14em]">
                    {link.label}
                  </span>
                  <span className="font-mono text-[10px] text-white/30">{link.code}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop Top-Center Notch Navbar with WebGL Aurora Background */}
      {isDesktop && (
        <div
          ref={dockShellRef}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-50 hidden sm:flex items-start select-none"
        >
          {/* Left Top-Edge Concave Fillet */}
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className="pointer-events-none shrink-0"
          >
            <path d="M 0 0 L 16 0 L 16 16 A 16 16 0 0 0 0 0 Z" fill="#050507" />
            <path d="M 0 0 A 16 16 0 0 1 16 16" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          </svg>

          <div
            ref={dockRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative flex items-center gap-1 rounded-b-[22px] border-x border-b border-white/[0.14] bg-[#050507] px-3 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.85)] overflow-hidden"
          >
            {/* Contained WebGL RGB Aurora Background */}
            <RgbAuraBackground contained />

            <div
              ref={auraRef}
              className="pointer-events-none absolute w-[200px] h-[200px] rounded-full opacity-0"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,0,60,0.35) 0%, rgba(0,255,102,0.22) 45%, rgba(0,102,255,0.28) 80%, transparent 100%)',
                filter: 'url(#rgb-aura-displacement) blur(18px)',
              }}
            />

            <nav className="relative z-10 flex items-center gap-1">
              {LINKS.map((link, idx) => {
                const isActive = pathname === link.href || (link.href === '/project' && isDetailRoute);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    ref={(el) => {
                      linksRef.current[idx] = el;
                    }}
                    onClick={(e) => {
                      if (link.href === '/project') {
                        e.preventDefault();
                        handleEnterAction();
                      } else {
                        navigateExperienceLink(e, link.href);
                      }
                    }}
                    onMouseMove={(e) => handleLinkMouseMove(e, linksRef.current[idx])}
                    onMouseLeave={() => handleLinkMouseLeave(linksRef.current[idx])}
                    className={`group relative flex items-center gap-2 rounded-full px-4 py-1.5 transition-colors duration-300 no-underline cursor-pointer ${
                      isActive ? 'bg-white/10' : 'hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className={`text-[10px] font-mono transition-colors ${isActive ? 'text-cyan-400' : 'text-neutral-500 group-hover:text-cyan-400'}`}>
                      {link.code}
                    </span>
                    <span className={`text-xs font-medium uppercase tracking-[0.15em] transition-colors ${isActive ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}>
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Top-Edge Concave Fillet */}
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className="pointer-events-none shrink-0"
          >
            <path d="M 0 0 L 16 0 A 16 16 0 0 0 0 16 Z" fill="#050507" />
            <path d="M 16 0 A 16 16 0 0 0 0 16" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          </svg>
        </div>
      )}
      {/* ISO Enter Button */}
      {isDesktop && (
        <div ref={enterShellRef} className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 hidden sm:block select-none">
          <button
            ref={enterBtnRef}
            onClick={handleEnterAction}
            onMouseEnter={handleEnterButtonMouseEnter}
            onMouseLeave={handleEnterButtonMouseLeave}
            aria-label="Enter action"
            className="relative cursor-pointer group focus:outline-none origin-center"
          >
            <div className="relative w-[58px] h-[69px] sm:w-[92px] sm:h-[110px] filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)]">
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
                  width="15"
                  height="15"
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
      )}
    </>
  );
}
