"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Works", href: "/project" },
  { label: "Contact", href: "/contact" },
];

export default function SideAnchorNavbar() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entry animation: Logo and Dock slide into view
      gsap.fromTo(
        [".logo-zone", ".nav-dock"],
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: 0.1 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <header ref={containerRef} className="fixed top-0 left-0 w-full z-50 p-6 md:p-8 pointer-events-none">
      <div className="max-w-[1600px] mx-auto flex items-start justify-between pointer-events-none">
        
        {/* LEFT ANCHOR: LARGE PILL-SHAPED LOGO ZONE */}
        <div className="logo-zone pointer-events-auto relative group">
          {/* Architectural Pill-Shaped Blur Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md rounded-full shadow-2xl transition-all duration-500 group-hover:bg-black/50" 
               style={{ borderRadius: '100px' }} />
          
          <Link href="/" className="relative flex items-center justify-center w-24 h-12 ">
            <Image 
              src="/logo.svg" 
              alt="Logo" 
              width={70} 
              height={70} 
              className="object-contain" 
            />
          </Link>
        </div>

        {/* RIGHT ANCHOR: SEPARATED NAVIGATION DOCK */}
        <nav className="nav-dock pointer-events-auto flex gap-6">
          <div className="hidden md:flex bg-[#0a0a0c]/60 backdrop-blur-lg border border-white/[0.08] rounded-full px-8 py-3 shadow-2xl gap-8">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* MOBILE TOGGLE */}
          <button 
            onClick={() => setOpen(!open)} 
            className="md:hidden bg-[#0a0a0c]/60 backdrop-blur-lg border border-white/[0.08] rounded-full p-4 shadow-xl"
          >
            <div className="flex flex-col gap-1.5">
              <span className={`h-[1px] bg-white transition-all ${open ? "w-4 rotate-45 translate-y-[2.5px]" : "w-5"}`} />
              <span className={`h-[1px] bg-white transition-all ${open ? "w-4 -rotate-45 -translate-y-[2.5px]" : "w-3"}`} />
            </div>
          </button>
        </nav>
      </div>

      {/* MOBILE OVERLAY */}
      {open && (
        <div className="fixed inset-0 bg-[#050505] flex flex-col justify-center items-center gap-8 z-40 pointer-events-auto">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={() => setOpen(false)} 
              className="text-3xl font-light text-white uppercase tracking-widest"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
