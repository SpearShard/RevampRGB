"use client";

import Link from "next/link";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Works", href: "/project" },
  { label: "Contact", href: "/contact" },
];

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
        <div className=" flex items-center justify-center gap-8 px-6 md:gap-14">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[11px] uppercase tracking-[0.3em] text-white/30 transition-all duration-300 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

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
