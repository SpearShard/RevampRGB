'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';

export default function PrismInteriorSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const headline = headlineRef.current;
        if (!container || !headline) return;

        const ctx = gsap.context(() => {
            // THE MOUSE GLASS PRISM INTERACTION
            const handleMouseMove = (e: MouseEvent) => {
                const rect = headline.getBoundingClientRect();
                
                // Track mouse relative to the text frame itself
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Map mouse positions to strict percentage bounds
                const xPct = (x / rect.width) * 100;
                const yPct = (y / rect.height) * 100;

                // Smoothly slide a linear razor-sharp RGB slice across the typography coordinates
                gsap.to(headline, {
                    '--prism-x': `${xPct}%`,
                    '--prism-y': `${yPct}%`,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            };

            container.addEventListener('mousemove', handleMouseMove);
            return () => container.removeEventListener('mousemove', handleMouseMove);
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section 
            ref={containerRef} 
            className="relative w-full min-h-screen bg-[#080808] text-[#ffffff] flex flex-col justify-center py-24 px-8 sm:px-16 lg:px-28 overflow-hidden select-none antialiased"
        >
            {/* LUXURY DISPLAY TYPOGRAPHY */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;800&display=swap" rel="stylesheet" />

            {/* UNCLUTTERED INTERIOR LAYOUT CONTAINER */}
            <div className="relative w-full max-w-[1500px] mx-auto flex flex-col space-y-24 z-10">
                
                {/* THE PRISM HEADLINE TRACKER */}
                <div className="w-full max-w-[1300px]">
                    <h2 
                        ref={headlineRef}
                        className="text-[8vw] sm:text-[6vw] lg:text-[4vw] font-extrabold leading-[1.1] tracking-tighter uppercase transition-shadow duration-300 will-change-[background-image]"
                        style={{
                            fontFamily: '"Plus Jakarta Sans", sans-serif',
                            // Custom properties initialized to safe positions
                            ['--prism-x' as any]: '20%',
                            ['--prism-y' as any]: '20%',
                            // The magic: A solid white text canvas that gets sheared by a sharp RGB spectrum slice on mouseover
                            backgroundColor: '#ffffff',
                            backgroundImage: 'linear-gradient(135deg, transparent calc(var(--prism-x) - 4%), #ff003c calc(var(--prism-x) - 2%), #00ff66 var(--prism-x), #0066ff calc(var(--prism-x) + 2%), transparent calc(var(--prism-x) + 4%))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundBlendMode: 'difference',
                            backgroundSize: '150% 150%'
                        }}
                    >
                        Where design, tech, and nature converge. Innovating sustainable, striking futures.
                    </h2>
                </div>

                {/* THE NARRATIVE CONTENT FRAME */}
                <div 
                    className="w-full flex flex-col md:flex-row items-start justify-between gap-12 pt-12 border-t border-white/5"
                    style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                >
                    {/* Architectural Concept Anchor */}
                    <div className="md:w-1/2 max-w-md">
                        <p className="text-xl sm:text-2xl font-light text-white/90 leading-relaxed tracking-wide">
                            At RGB Design, we craft human habitats through the physics of volume and lighting materiality.
                        </p>
                    </div>

                    {/* Secondary Narrative Detail */}
                    <div className="md:w-5/12 max-w-sm space-y-8 self-end">
                        <p className="text-sm font-light text-white/40 leading-relaxed tracking-wider">
                            We coordinate raw structural planes with custom lighting spectrums to map out quiet, permanent interior sanctuaries that interact beautifully with light over cycles of seasons.
                        </p>

                        {/* Completely Clean Minimalist Micro-Link */}
                        <div className="pt-2">
                            <Link 
                                href="/about" 
                                className="group inline-flex items-center space-x-4 text-xs font-medium tracking-[0.3em] uppercase text-white/50 hover:text-white transition-colors duration-300"
                            >
                                <span>[ View Portfolios ]</span>
                                <span className="text-[10px] transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}