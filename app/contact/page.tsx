'use client';
import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import LiquidGlassBackground from '../components/bgwebglshaders/RgbAuraBackground';

interface RefractiveLinkProps {
    href: string;
    label: string;
    index: string;
}

function RefractiveHubLink({ href, label, index }: RefractiveLinkProps) {
    const linkRef = useRef<HTMLAnchorElement>(null);
    const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
    const turbulenceRef = useRef<SVGFETurbulenceElement>(null);

    const handleMouseEnter = () => {
        const tl = gsap.timeline();
        
        // Dynamic fluid splash wave passing through the text geometry
        tl.to(displacementRef.current, {
            attr: { scale: 16 },
            duration: 0.3,
            ease: "power2.out"
        }).to(displacementRef.current, {
            attr: { scale: 3 }, // Settles into a gentle, continuous organic shimmer
            duration: 0.6,
            ease: "power4.out"
        });

        // Subtly animate the internal fluid turbulence frequency
        gsap.to(turbulenceRef.current, {
            attr: { baseFrequency: "0.04 0.08" },
            duration: 0.8,
            ease: "sine.inOut"
        });

        // Elegant tracking expansion
        gsap.to(linkRef.current, {
            letterSpacing: "0.08em",
            duration: 0.4,
            ease: "power3.out"
        });
    };

    const handleMouseLeave = () => {
        // Smoothly return text back to solid resting state
        gsap.to(displacementRef.current, {
            attr: { scale: 0 },
            duration: 0.6,
            ease: "power3.out",
            overwrite: "auto"
        });

        gsap.to(turbulenceRef.current, {
            attr: { baseFrequency: "0.02 0.04" },
            duration: 0.6,
            overwrite: "auto"
        });

        gsap.to(linkRef.current, {
            letterSpacing: "0.03em",
            duration: 0.6,
            ease: "power3.out"
        });
    };

    return (
        <div className="w-full relative flex justify-center items-center py-4">
            {/* Unique localized SVG filter map per link item to isolate physics loops */}
            <svg className="absolute w-0 h-0 pointer-events-none select-none">
                <defs>
                    <filter id={`fluid-refract-${index}`}>
                        <feTurbulence 
                            ref={turbulenceRef}
                            type="fractalNoise" 
                            baseFrequency="0.02 0.04" 
                            numOctaves="2" 
                            result="noise" 
                        />
                        <feDisplacementMap 
                            ref={displacementRef}
                            in="SourceGraphic" 
                            in2="noise" 
                            scale="0" 
                            xChannelSelector="R" 
                            yChannelSelector="G" 
                        />
                    </filter>
                </defs>
            </svg>

            <a
                ref={linkRef}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ filter: `url(#fluid-refract-${index})` }}
                className="group relative text-xl md:text-2xl font-light tracking-wide text-zinc-400 hover:text-zinc-50 transition-colors duration-400 select-none ease-out"
            >
                {label}
            </a>
        </div>
    );
}

export default function LuxuryRefractiveContact() {
    const pageContainer = useRef<HTMLDivElement>(null);
    const orbitRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleGlobalMouseMove = (e: React.MouseEvent) => {
        const { clientX: x, clientY: y } = e;
        setMousePos({ x, y });

        // Ultra-smooth lag behind the cursor for an ambient aura element
        gsap.to(orbitRef.current, {
            x: x,
            y: y,
            duration: 0.8,
            ease: "power2.out"
        });
    };

    useGSAP(() => {
        // High-end cinematic entry stagger sequence
        gsap.fromTo(".reveal-element",
            { opacity: 0, y: 25, filter: "blur(10px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.4, ease: "power4.out", stagger: 0.18 }
        );
    }, { scope: pageContainer });

    return (
        <div 
            ref={pageContainer}
            onMouseMove={handleGlobalMouseMove}
            className="w-full h-screen bg-transparent antialiased flex flex-col justify-center items-center overflow-hidden p-6 relative"
        >
            {/* The underlying fluid simulation medium */}
            <LiquidGlassBackground mousePos={mousePos} />

            {/* AMBIENT FLOATING GUIDE LAYER */}
            <div 
                ref={orbitRef} 
                className="absolute top-0 left-0 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.01] border border-white/[0.03] pointer-events-none z-0 hidden md:block select-none" 
            />

            {/* MASTER SYMMETRIC CORE */}
            <div className="w-full max-w-xl mx-auto flex flex-col items-center space-y-12 text-center relative z-10 mix-blend-difference">
                
                {/* Micro Editorial Statement */}
                <div className="reveal-element space-y-3">
                    <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-zinc-500 block">
                        // INITIALIZE_SESSION
                    </span>
                    <h2 className="text-xs font-light text-zinc-400/60 max-w-[280px] mx-auto leading-relaxed">
                        Digital communication pathways calibrated for immediate response.
                    </h2>
                </div>

                {/* THE REFRACTIVE NODE HUB */}
                <nav className="reveal-element flex flex-col items-center w-full py-4 border-y border-white/[0.04]">
                    <RefractiveHubLink 
                        href="mailto:hello@rgbstudio.com" 
                        label="hello@rgbstudio.com" 
                        index="email" 
                    />
                    <RefractiveHubLink 
                        href="https://instagram.com" 
                        label="instagram" 
                        index="ig" 
                    />
                    <RefractiveHubLink 
                        href="https://linkedin.com" 
                        label="linkedin" 
                        index="li" 
                    />
                </nav>

                {/* Structural Coordinates Footprint */}
                <div className="reveal-element">
                    <p className="text-[9px] font-mono tracking-[0.25em] text-zinc-500/40 uppercase">
                        LATENCY: NOMINAL // CORE_TRANSPARENT_MATRIX
                    </p>
                </div>
                
            </div>
        </div>
    );
}