"use client";

import Link from "next/link";



export default function Footer() {
  return (
    <footer className="relative overflow-hidden  pt-20 text-white">
      {/* Noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      />

      <div className="relative z-10">
        {/* Navigation */}
        

        {/* Huge Text */}
        <div className="relative overflow-hidden">
          {/* Actual Text */}
          <div className="translate-y-[18%]">
            <h2 className="flex select-none justify-center text-center text-[5rem] font-[500] uppercase leading-[0.8] tracking-[-0.1em] text-white sm:text-[7rem] md:text-[10rem] lg:text-[14rem] xl:text-[18rem]">
              {/* R */}
              <span className="transition-colors duration-500 hover:text-red-500">
                R
              </span>

              {/* G */}
              <span className="transition-colors duration-500 hover:text-green-500">
                G
              </span>

              {/* B */}
              <span className="transition-colors duration-500 hover:text-blue-500">
                B
              </span>

              <span>&nbsp;Design</span>
            </h2>
          </div>

          {/* REAL Blur Mask */}
          

          {/* Dark Fade */}
          <div className="pointer-events-none absolute bottom-0 left-0 h-[180px] w-full bg-gradient-to-t from-[#050505] to-transparent" />
        </div>
      </div>
    </footer>
  );
}
