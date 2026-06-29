'use client'
import { useEffect, useRef } from "react";
import gsap from "gsap";
import GalleryShader from "./BgShader";
import SDFAnimation from "./SDFAnimation";

export default function LandingPage() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const textGroupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({
            defaults: { ease: "expo.out" }
        });

        // 1. Smoothly fade in the background engine layer
        if (canvasContainerRef.current) {
            tl.fromTo(canvasContainerRef.current, 
                { opacity: 0 },
                { opacity: 1, duration: 2.5 }
            );
        }

        // 2. High-end clean reveal sequence for structural layout lines and blocks
        if (textGroupRef.current) {
            const lines = textGroupRef.current.querySelectorAll('.editorial-line');
            const items = textGroupRef.current.querySelectorAll('.editorial-item');

            tl.fromTo(lines,
                { scaleX: 0 },
                { scaleX: 1, transformOrigin: "left center", duration: 1.8, stagger: 0.15 },
                "-=1.8"
            );

            tl.fromTo(items,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1.6, stagger: 0.1 },
                "-=1.4"
            );
        }

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <section 
            ref={sectionRef} 
            className="relative w-full h-screen bg-[#060608] overflow-hidden flex items-center justify-center p-6 md:p-16 select-none"
        >
            {/* GOOGLE FONTS INJECTION: RAW ARCHITECTURAL MONO + SANS */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Space+Mono:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />

            {/* ABSOLUTE VIEWPORT RENDER ENGINE LAYER (UNTOUCHED) */}
            <div 
                ref={canvasContainerRef} 
                className="absolute inset-0 w-full h-screen z-0 overflow-hidden pointer-events-none"
            >
                {/* Full-bleed Red Green Blue liquid base matrix shader */}
                <GalleryShader/>
                
                {/* Fine structural mesh container with screen mixing to preserve bright spectrum values */}
                <div className="absolute inset-0 w-full h-full mix-blend-screen opacity-90">
                    <SDFAnimation />
                </div>
            </div>

            {/* HIGH-END INDUSTRIAL ARCHITECTURE LAYOUT */}
            <div 
                ref={textGroupRef}
                className="relative z-10 w-full max-w-[1600px] h-full max-h-[600px] mx-auto flex flex-col justify-between pointer-events-none mix-blend-difference"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
                
                {/* ZONE 01: Top Structural Row */}
                <div className="w-full flex flex-col gap-4">
                    
                    <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
                        <div className="editorial-item md:col-span-2 flex flex-col gap-1 will-change-transform">
                            
                            <h1 className="text-[clamp(1.8rem,4vw,3.5rem)] m-0 font-bold leading-[0.95] text-white uppercase tracking-[-0.02em]">
                                MATHEMATICAL<br />CONVERGENCE
                            </h1>
                        </div>
                        <div className="editorial-item md:col-start-4 text-left md:text-right flex items-start md:justify-end will-change-transform">
                           
                        </div>
                    </div>
                </div>

                {/* ZONE 02: Central Asymmetric Cross-Section */}
                <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 px-2 my-auto">
                    <div className="editorial-item md:col-start-2 md:col-span-2 flex flex-col gap-4 will-change-transform">
                        <h2 
                            className="text-[clamp(1.3rem,2.8vw,2.4rem)] m-0 font-normal leading-[1.1] text-white tracking-[-0.01em]"
                            style={{ fontFamily: "'Space Mono', monospace" }}
                        >
                            Generating organic fluidity through rigid structural node parameters.
                        </h2>
                    </div>
                </div>

                {/* ZONE 03: Bottom Technical Grounding Row */}
                <div className="w-full flex flex-col gap-4">
                    <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 px-2 items-end">
                        <div className="editorial-item md:col-span-2 font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase flex flex-col gap-1 will-change-transform">
                            <span>RENDER INFRASTRUCTURE MATRIX</span>
                            <span>ALL DATA VISUALIZED IN REALTIME</span>
                        </div>
                        <div className="editorial-item md:col-start-4 text-left md:text-right will-change-transform">
                            <h3 className="text-[clamp(2rem,5vw,4.5rem)] m-0 font-bold leading-[0.8] text-white uppercase tracking-[-0.04em]">
                                LABS®
                            </h3>
                        </div>
                    </div>
                    <div className="editorial-line w-full h-[1px] bg-white/20 will-change-transform" />
                </div>

            </div>
        </section>
    );
}