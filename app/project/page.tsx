"use client";

import React, { useEffect, useRef } from "react";

export default function ProjectsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#09090b] text-white select-none pointer-events-none">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ backgroundColor: "#09090b", zIndex: -1 }}
      />

      <div className="relative z-10 flex w-full justify-between items-start px-6 sm:px-10 pt-20 sm:pt-24">
        <div>
          <p className="uppercase tracking-[0.3em] text-white/40 text-[10px] mb-1">
            Selected Works
          </p>
          <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-white/85">
            Projects
          </h1>
        </div>
        <p className="hidden sm:block text-[10px] font-mono uppercase tracking-[0.25em] text-white/35">
          Move cursor to interact · Click a node
        </p>
      </div>
    </main>
  );
}
