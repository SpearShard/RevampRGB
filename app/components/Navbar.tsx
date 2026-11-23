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
  const auraRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<SVGFETurbulenceElement>(null);
  const enterBtnRef = useRef<HTMLButtonElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const mouse = useRef({ x: 0, y: 0, velocityX: 0, velocityY: 0, prevX: 0, prevY: 0 });

  const handleEnterAction = useCallback(() => {
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

    window.dispatchEvent(new CustomEvent('rgb:enter-project'));
    router.push('/project');
  }, [pathname, router]);

  useEffect(() => {
    if (!dockRef.current) return;
    gsap.fromTo(
      [dockRef.current, enterBtnRef.current],
      { scale: 0.15, borderRadius: '50%', y: 80, opacity: 0 },
      { scale: 1, borderRadius: '9999px', y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out' }
    );
  }, []);

  useEffect(() => {
    if (!dockRef.current) return;

    let animFrame: number;

    const updateAuraPhysics = () => {
      mouse.current.velocityX = mouse.current.x - mouse.current.prevX;
      mouse.current.velocityY = mouse.current.y - mouse.current.prevY;
      mouse.current.prevX = mouse.current.x;
      mouse.current.prevY = mouse.current.y;

      const speed = Math.hypot(mouse.current.velocityX, mouse.current.velocityY);

      if (filterRef.current) {
        const baseFreq = Math.min(0.09, 0.015 + speed * 0.0012);
        gsap.to(filterRef.current, {
          attr: { baseFrequency: `${baseFreq} ${baseFreq}` },
          duration: 0.25,
          ease: 'power1.out',
        });
      }

      animFrame = requestAnimationFrame(updateAuraPhysics);
    };

    animFrame = requestAnimationFrame(updateAuraPhysics);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
        return;
      }
      handleEnterAction();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleEnterAction]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;

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

  // GSAP Stringy Elastic Bounce
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

  // ISO Key Shape Path Coordinates
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
      <header className="fixed top-4 left-4 sm:top-8 sm:left-8 z-50 select-none">
        <Link
          href="/"
          className="relative w-20 h-7 sm:w-24 sm:h-8 flex items-center pointer-events-auto transition-transform hover:scale-105 duration-300"
        >
          <Image src="/logo.svg" alt="Logo" fill priority className="object-contain object-left filter brightness-0 invert" />
        </Link>
      </header>

      {/* Center Dock Navbar */}
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 select-none max-w-[calc(100vw-7.5rem)] sm:max-w-none">
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-red-500/30 via-emerald-500/30 to-blue-500/30 opacity-40 blur-2xl transition-all duration-700 pointer-events-none" />
        <div
          ref={dockRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative flex items-center gap-1 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 bg-[#08080c]/85 backdrop-blur-3xl rounded-full border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          <div
            ref={auraRef}
            className="absolute top-0 left-0 w-52 h-52 rounded-full pointer-events-none opacity-0 scale-50 z-0 mix-blend-screen"
            style={{
              filter: 'url(#rgb-aura-displacement)',
              background: 'radial-gradient(circle, rgba(239,68,68,0.5) 0%, rgba(16,185,129,0.4) 40%, rgba(37,99,235,0.4) 70%, transparent 100%)',
            }}
          />
          <nav className="relative z-10 flex items-center gap-0.5 sm:gap-1">
            {LINKS.map((link, idx) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  ref={(el) => { linksRef.current[idx] = el; }}
                  href={link.href}
                  onClick={(event) => {
                    if (pathname === link.href) return;
                    event.preventDefault();
                    const eventName = link.href === '/' ? 'rgb:leave-project' : link.href === '/about' ? 'rgb:enter-about' : 'rgb:enter-contact';
                    window.dispatchEvent(new CustomEvent(eventName));
                    router.push(link.href);
                  }}
                  onMouseMove={(e) => handleLinkMouseMove(e, linksRef.current[idx])}
                  onMouseLeave={() => handleLinkMouseLeave(linksRef.current[idx])}
                  className={`group relative flex items-baseline gap-1.5 sm:gap-2 py-2 px-3.5 sm:py-2.5 sm:px-6 rounded-full hover:bg-white/10 transition-colors duration-300 no-underline cursor-pointer ${
                    isActive ? 'bg-white/10' : ''
                  }`}
                >
                  <span className={`text-[9px] sm:text-[10px] font-mono transition-colors ${isActive ? 'text-cyan-400' : 'text-neutral-500 group-hover:text-cyan-400'}`}>
                    {link.code}
                  </span>
                  <span className={`text-[11px] sm:text-xs font-sans uppercase tracking-wider sm:tracking-widest font-medium transition-colors ${isActive ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ISO Enter Button - Starts Pure White, Dissipates to Dark on Hover */}
      <div className="fixed bottom-24 right-3 sm:bottom-8 sm:right-8 z-50 select-none">
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

              {/* 1. Underlying Dark Base Keycap */}
              <path d={isoPathD} className="fill-[#08080c]/90" />

              {/* 
                2. Solid White Inner Fill 
                Active (opacity-100) at start, fades away (opacity-0) on hover
              */}
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

              {/* 3. Outer Edge Highlight */}
              <path
                d={isoPathD}
                className="stroke-black/20 group-hover:stroke-white/40 transition-colors duration-300"
                strokeWidth="1.5"
              />
            </svg>

            {/* Text & Icon (Inverts from Black to White on hover) */}
            <div className="absolute bottom-1.5 left-2 sm:bottom-3.5 sm:left-3.5 flex items-center gap-1.5 pointer-events-none z-10">
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
    </>
  );
}
