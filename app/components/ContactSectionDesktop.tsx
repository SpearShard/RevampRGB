'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const STUDIO_EMAIL = 'hello@rgbstudio.com';

const CHANNELS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
] as const;

export default function ContactSection() {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const headline = headlineRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      tl.fromTo(
        '.editorial-line',
        { scaleX: 0 },
        { scaleX: 1, transformOrigin: 'left center', duration: 1.6, stagger: 0.15 }
      ).fromTo(
        '.editorial-item',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.4, stagger: 0.1 },
        '-=1.2'
      );

      if (headline) {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = headline.getBoundingClientRect();
          const xPct = ((e.clientX - rect.left) / rect.width) * 100;
          const yPct = ((e.clientY - rect.top) / rect.height) * 100;

          gsap.to(headline, {
            '--prism-x': `${xPct}%`,
            '--prism-y': `${yPct}%`,
            duration: 0.4,
            ease: 'power2.out',
          });
        };

        container.addEventListener('mousemove', handleMouseMove);
        return () => container.removeEventListener('mousemove', handleMouseMove);
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(STUDIO_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${STUDIO_EMAIL}`;
    }
  };

  return (
    <main
      ref={containerRef}
      className="relative w-full min-h-screen bg-transparent text-white flex flex-col justify-center py-28 pb-36 px-8 sm:px-16 lg:px-28 overflow-hidden select-none antialiased"
      style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;800&display=swap"
        rel="stylesheet"
      />

      <div className="relative z-10 w-full max-w-[1500px] mx-auto flex flex-col space-y-20">
        {/* Eyebrow + RGB Prism Headline */}
        <div className="space-y-6 max-w-[1200px]">
          <p className="editorial-item text-[10px] uppercase tracking-[0.35em] text-white/35">
            Contact
          </p>

          <h1
            ref={headlineRef}
            className="editorial-item text-[10vw] sm:text-[7vw] lg:text-[4.8vw] font-extrabold leading-[1.02] tracking-tighter uppercase will-change-[background-image]"
            style={{
              ['--prism-x' as string]: '20%',
              ['--prism-y' as string]: '20%',
              backgroundColor: '#ffffff',
              backgroundImage:
                'linear-gradient(135deg, transparent calc(var(--prism-x) - 4%), #ff003c calc(var(--prism-x) - 2%), #00ff66 var(--prism-x), #0066ff calc(var(--prism-x) + 2%), transparent calc(var(--prism-x) + 4%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundBlendMode: 'difference',
              backgroundSize: '150% 150%',
            }}
          >
            Let&apos;s shape what comes next.
          </h1>
        </div>

        {/* Architectural Divider + Two-Column Studio Frame */}
        <div className="w-full space-y-12">
          <div className="editorial-line w-full h-[1px] bg-white/15 will-change-transform" />

          <div className="w-full flex flex-col md:flex-row items-start justify-between gap-12">
            {/* Left: Direct Inquiry */}
            <div className="editorial-item md:w-1/2 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
                Direct Inquiries
              </p>
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <a
                  href={`mailto:${STUDIO_EMAIL}`}
                  className="group inline-block text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white/90 hover:text-white transition-colors duration-300"
                >
                  {STUDIO_EMAIL}
                  <span className="block h-[1px] w-full bg-white/20 transition-colors duration-300 group-hover:bg-white" />
                </a>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/40 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Right: Studio Note & Social Links */}
            <div className="editorial-item md:w-5/12 max-w-sm space-y-8">
              <p className="text-sm font-light text-white/45 leading-relaxed tracking-wider">
                For architecture, spatial installations, computational design, and select creative commissions.
              </p>

              <div className="flex items-center gap-8 pt-1">
                {CHANNELS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center space-x-3 text-xs font-medium tracking-[0.28em] uppercase text-white/50 hover:text-white transition-colors duration-300"
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] transform transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
