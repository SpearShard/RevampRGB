// "use client";

// import { useState, useRef, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import gsap from "gsap";

// const links = [
//   { label: "Home", href: "/" },
//   { label: "About", href: "/about" },
//   { label: "Works", href: "/project" },
//   { label: "Contact", href: "/contact" },
// ];

// export default function SideAnchorNavbar() {
//   const [open, setOpen] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       // Entry animation: Logo and Dock slide into view
//       gsap.fromTo(
//         [".logo-zone", ".nav-dock"],
//         { opacity: 0, y: -20 },
//         { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: 0.1 }
//       );
//     }, containerRef);

//     return () => ctx.revert();
//   }, []);

//   return (
//     <header ref={containerRef} className="fixed top-0 left-0 w-full z-50 p-6 md:p-8 pointer-events-none">
//       <div className="max-w-[1600px] mx-auto flex items-start justify-between pointer-events-none">
        
//         {/* LEFT ANCHOR: LARGE PILL-SHAPED LOGO ZONE */}
//         <div className="logo-zone pointer-events-auto relative group">
//           {/* Architectural Pill-Shaped Blur Backdrop */}
//           <div className="absolute inset-0 bg-black/30 backdrop-blur-md rounded-full shadow-2xl transition-all duration-500 group-hover:bg-black/50" 
//                style={{ borderRadius: '100px' }} />
          
//           <Link href="/" className="relative flex items-center justify-center w-24 h-12 ">
//             <Image 
//               src="/logo.svg" 
//               alt="Logo" 
//               width={70} 
//               height={70} 
//               className="object-contain" 
//             />
//           </Link>
//         </div>

//         {/* RIGHT ANCHOR: SEPARATED NAVIGATION DOCK */}
//         <nav className="nav-dock pointer-events-auto flex gap-6">
//           <div className="hidden md:flex bg-[#0a0a0c]/60 backdrop-blur-lg border border-white/[0.08] rounded-full px-8 py-3 shadow-2xl gap-8">
//             {links.map((link) => (
//               <Link 
//                 key={link.href} 
//                 href={link.href} 
//                 className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors duration-300"
//               >
//                 {link.label}
//               </Link>
//             ))}
//           </div>

//           {/* MOBILE TOGGLE */}
//           <button 
//             onClick={() => setOpen(!open)} 
//             className="md:hidden bg-[#0a0a0c]/60 backdrop-blur-lg border border-white/[0.08] rounded-full p-4 shadow-xl"
//           >
//             <div className="flex flex-col gap-1.5">
//               <span className={`h-[1px] bg-white transition-all ${open ? "w-4 rotate-45 translate-y-[2.5px]" : "w-5"}`} />
//               <span className={`h-[1px] bg-white transition-all ${open ? "w-4 -rotate-45 -translate-y-[2.5px]" : "w-3"}`} />
//             </div>
//           </button>
//         </nav>
//       </div>

//       {/* MOBILE OVERLAY */}
//       {open && (
//         <div className="fixed inset-0 bg-[#050505] flex flex-col justify-center items-center gap-8 z-40 pointer-events-auto">
//           {links.map((link) => (
//             <Link 
//               key={link.href} 
//               href={link.href} 
//               onClick={() => setOpen(false)} 
//               className="text-3xl font-light text-white uppercase tracking-widest"
//             >
//               {link.label}
//             </Link>
//           ))}
//         </div>
//       )}
//     </header>
//   );
// }




















'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';

interface NavLink {
  label: string;
  href: string;
  code: string;
}

const LINKS: NavLink[] = [
  { label: 'About', href: '/about', code: '01' },
  { label: 'Work', href: '/project', code: '02' },
  { label: 'Contact', href: '/contact', code: '03' },
];

export default function Navbar() {
  const dockRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<SVGFETurbulenceElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  // Mouse vector tracking
  const mouse = useRef({ x: 0, y: 0, velocityX: 0, velocityY: 0, prevX: 0, prevY: 0 });

  useEffect(() => {
    if (!dockRef.current) return;

    // Circular blob entrance animation on mount
    gsap.fromTo(
      dockRef.current,
      {
        scale: 0.15,
        borderRadius: '50%',
        y: 80,
        opacity: 0,
      },
      {
        scale: 1,
        borderRadius: '9999px',
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
      }
    );

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
    return () => cancelAnimationFrame(animFrame);
  }, []);

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
      gsap.to(auraRef.current, {
        opacity: 0,
        scale: 0.4,
        duration: 0.4,
        ease: 'power2.inOut',
      });
    }
  };

  const handleLinkMouseMove = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    const target = linksRef.current[index];
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

  const handleLinkMouseLeave = (index: number) => {
    const target = linksRef.current[index];
    if (!target) return;

    gsap.to(target, {
      x: 0,
      y: 0,
      skewX: 0,
      duration: 0.7,
      ease: 'elastic.out(1.2, 0.3)',
    });
  };

  return (
    <>
      {/* SVG Liquid Refraction Filter */}
      <svg className="hidden">
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

      {/* Top-Left Logo Mark */}
      <header className="fixed top-6 left-6 sm:top-8 sm:left-8 z-50 select-none">
        <Link 
          href="/" 
          className="relative w-20 h-7 sm:w-24 sm:h-8 flex items-center pointer-events-auto transition-transform hover:scale-105 duration-300"
        >
          <Image
            src="/logo.svg"
            alt="Logo"
            fill
            priority
            className="object-contain object-left filter brightness-0 invert"
          />
        </Link>
      </header>

      {/* Bottom-Middle Responsive Glassmorphic Dock Navbar */}
      <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 select-none max-w-[92vw] sm:max-w-none">
        {/* Dynamic Multi-Color Ambient Glow Layer */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-red-500/30 via-emerald-500/30 to-blue-500/30 opacity-40 blur-2xl transition-all duration-700 pointer-events-none" />

        <div
          ref={dockRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative flex items-center gap-1 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 bg-[#08080c]/85 backdrop-blur-3xl rounded-full border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden"
          style={{ willChange: 'transform, border-radius, opacity' }}
        >
          {/* Reactive RGB Chromatic Liquid Aura Indicator */}
          <div
            ref={auraRef}
            className="absolute top-0 left-0 w-52 h-52 rounded-full pointer-events-none opacity-0 scale-50 z-0 mix-blend-screen"
            style={{
              filter: 'url(#rgb-aura-displacement)',
              background:
                'radial-gradient(circle, rgba(239,68,68,0.5) 0%, rgba(16,185,129,0.4) 40%, rgba(37,99,235,0.4) 70%, transparent 100%)',
            }}
          />

          {/* Navigation Links with Responsive Sizing */}
          <nav className="relative z-10 flex items-center gap-0.5 sm:gap-1">
            {LINKS.map((link, idx) => (
              <Link
                key={link.label}
                ref={(el) => {
                  linksRef.current[idx] = el;
                }}
                href={link.href}
                onMouseMove={(e) => handleLinkMouseMove(e, idx)}
                onMouseLeave={() => handleLinkMouseLeave(idx)}
                className="group relative flex items-baseline gap-1.5 sm:gap-2 py-2 px-3.5 sm:py-2.5 sm:px-6 rounded-full hover:bg-white/10 transition-colors duration-300 no-underline cursor-pointer"
              >
                <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 group-hover:text-cyan-400 transition-colors">
                  {link.code}
                </span>
                <span className="text-[11px] sm:text-xs font-sans uppercase tracking-wider sm:tracking-widest font-medium text-neutral-300 group-hover:text-white transition-colors">
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}








// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import gsap from "gsap";

// const navLinks = [
//   { name: "About", href: "/about" },
//   { name: "Work", href: "/work" },
//   { name: "Contact", href: "/contact" },
// ];

// export default function Navbar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const triggerRef = useRef<HTMLButtonElement>(null);
//   const rippleContainerRef = useRef<HTMLDivElement>(null);
//   const contentRef = useRef<HTMLDivElement>(null);
//   const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
//   const tl = useRef<gsap.core.Timeline | null>(null);

//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//       document.documentElement.style.overflow = "hidden";
//       document.body.style.paddingRight = "calc(100vw - 100%)";
//     } else {
//       document.body.style.overflow = "";
//       document.documentElement.style.overflow = "";
//       document.body.style.paddingRight = "0px";
//     }
//     return () => {
//       document.body.style.overflow = "";
//       document.documentElement.style.overflow = "";
//       document.body.style.paddingRight = "0px";
//     };
//   }, [isOpen]);

//   useEffect(() => {
//     const container = rippleContainerRef.current;
//     const content = contentRef.current;
//     const items = itemRefs.current.filter(Boolean);
//     const trigger = triggerRef.current;

//     if (!container || !content || !items.length || !trigger) return;

//     const rect = trigger.getBoundingClientRect();
//     const x = rect.left + rect.width / 2;
//     const y = rect.top + rect.height / 2;

//     const maxRadius = Math.hypot(
//       Math.max(x, window.innerWidth - x),
//       Math.max(y, window.innerHeight - y)
//     );

//     const circles = container.querySelectorAll(".ripple-circle");

//     gsap.set(container, { top: y, left: x });
//     gsap.set(circles, { width: 0, height: 0, xPercent: -50, yPercent: -50, opacity: 1 });
//     gsap.set(content, { opacity: 0, pointerEvents: "none" });
//     gsap.set(items, { y: 40, opacity: 0 });

//     tl.current = gsap.timeline({ paused: true });

//     tl.current
//       // Three staggered expanding ripple rings emanating outward simultaneously from the hamburger trigger
//       .to(circles[0], {
//         width: maxRadius * 2.5,
//         height: maxRadius * 2.5,
//         duration: 0.9,
//         ease: "power3.inOut",
//       })
//       .to(
//         circles[1],
//         {
//           width: maxRadius * 2.5,
//           height: maxRadius * 2.5,
//           duration: 0.9,
//           ease: "power3.inOut",
//         },
//         "-=0.75"
//       )
//       .to(
//         circles[2],
//         {
//           width: maxRadius * 2.5,
//           height: maxRadius * 2.5,
//           duration: 0.9,
//           ease: "power3.inOut",
//         },
//         "-=0.75"
//       )
//       .set(content, { pointerEvents: "auto" }, "-=0.4")
//       .to(
//         content,
//         {
//           opacity: 1,
//           duration: 0.3,
//         },
//         "-=0.4"
//       )
//       .to(
//         items,
//         {
//           y: 0,
//           opacity: 1,
//           duration: 0.6,
//           stagger: 0.08,
//           ease: "power4.out",
//         },
//         "-=0.3"
//       );
//   }, []);

//   const toggleMenu = () => {
//     if (!tl.current) return;
//     if (!isOpen) {
//       setIsOpen(true);
//       tl.current.timeScale(1).play();
//     } else {
//       tl.current.timeScale(1.4).reverse().then(() => setIsOpen(false));
//     }
//   };

//   return (
//     <>
//       <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 md:px-16 py-8 pointer-events-none mix-blend-difference">
//         <Link 
//           href="/" 
//           className="relative w-20 h-6 flex items-center pointer-events-auto transition-transform hover:scale-105 duration-300"
//         >
//           <Image
//             src="/logo.svg"
//             alt="Logo"
//             fill
//             priority
//             className="object-contain object-left filter brightness-0 invert"
//           />
//         </Link>

//         <button
//           ref={triggerRef}
//           onClick={toggleMenu}
//           aria-label="Toggle Menu"
//           className="relative z-50 flex flex-col justify-center items-end gap-[6px] w-12 h-12 pointer-events-auto group cursor-pointer"
//         >
//           <span 
//             className={`h-[1.5px] bg-white transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
//               isOpen ? "w-8 rotate-45 translate-y-[7px]" : "w-8 group-hover:w-4"
//             }`} 
//           />
//           <span 
//             className={`h-[1.5px] bg-white transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
//               isOpen ? "w-0 opacity-0" : "w-5 group-hover:w-8"
//             }`} 
//           />
//           <span 
//             className={`h-[1.5px] bg-white transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
//               isOpen ? "w-8 -rotate-45 -translate-y-[7px]" : "w-6 group-hover:w-8"
//             }`} 
//           />
//         </button>
//       </header>

//       {/* RGB Triple-Dot Ripple Expansion Originating from Trigger */}
//       <div ref={rippleContainerRef} className="fixed z-40 pointer-events-none overflow-visible">
//         <div className="ripple-circle absolute rounded-full bg-red-600/20 border border-red-400/30 backdrop-blur-3xl" />
//         <div className="ripple-circle absolute rounded-full bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-3xl" />
//         <div className="ripple-circle absolute rounded-full bg-blue-600/25 border border-blue-400/30 shadow-2xl backdrop-blur-3xl" />
//       </div>

//       <div
//         ref={contentRef}
//         className="fixed inset-0 z-40 flex flex-col justify-between pointer-events-none"
//       >
//         <div className="relative z-20 flex flex-col justify-center h-full max-w-4xl mx-auto w-full px-8 md:px-16">
//           <nav className="flex flex-col gap-4">
//             {navLinks.map((link, index) => (
//               <div key={index} className="overflow-hidden py-1">
//                 <Link
//                   href={link.href}
//                   onClick={toggleMenu}
//                   className="inline-block pointer-events-auto"
//                 >
//                   <div 
//                     ref={(el) => { itemRefs.current[index] = el; }}
//                     className="flex items-baseline gap-6 group"
//                   >
//                     <span className="text-xs font-mono text-neutral-500 group-hover:text-white transition-colors">
//                       0{index + 1}
//                     </span>
//                     <span className="text-5xl md:text-7xl font-light tracking-tight text-neutral-400 group-hover:text-white transition-all duration-300">
//                       {link.name}
//                     </span>
//                   </div>
//                 </Link>
//               </div>
//             ))}
//           </nav>
//         </div>

//         <div className="relative z-20 flex justify-between items-center px-8 md:px-16 py-8 text-xs font-light text-neutral-500 uppercase tracking-widest pointer-events-auto">
//           <span>Portfolio</span>
//           <span>2026</span>
//         </div>
//       </div>
//     </>
//   );
// }