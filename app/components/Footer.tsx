"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-[#050505] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-red-500/10 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-blue-500/10 blur-[140px]" />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 pb-24 pt-20 sm:px-8 sm:pb-6 sm:pt-24 lg:px-12">
        <div className="flex flex-col gap-7 border-y border-white/15 py-9 sm:flex-row sm:items-end sm:justify-between sm:py-10">
          <div className="max-w-xl">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/40">Have something in mind?</p>
            <h2 className="mt-4 max-w-[12ch] text-[2.6rem] font-light leading-[0.98] tracking-[-0.065em] sm:max-w-none sm:text-5xl">
              Let’s make it <span className="text-white/45">real.</span>
            </h2>
          </div>
          <Link href="/contact" className="group inline-flex w-fit items-center gap-5 rounded-full border border-white/25 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-white/80 transition-all duration-300 hover:border-white hover:bg-white hover:text-black">
            Start a conversation
            <span className="text-base transition-transform duration-300 group-hover:translate-x-1">↗</span>
          </Link>
        </div>

        <div className="relative overflow-hidden py-14 sm:py-14 lg:py-16">
          <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.28em] text-white/30">Independent design practice</p>
          <div className="flex items-end justify-between gap-2">
            <h3 className="select-none whitespace-nowrap text-[clamp(5rem,19vw,18rem)] font-medium uppercase leading-[0.72] tracking-[-0.115em]">
              <span className="transition-colors duration-500 hover:text-red-500">R</span><span className="transition-colors duration-500 hover:text-green-500">G</span><span className="transition-colors duration-500 hover:text-blue-500">B</span>
            </h3>
            <span className="mb-1 hidden font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 sm:block">Design<br />Studio</span>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Form / Matter / Experience</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Bengaluru · India</span>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-t border-white/15 pt-6 text-[10px] uppercase tracking-[0.16em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} RGB Design Studio. All rights reserved.</p>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <Link href="/project" className="transition-colors hover:text-white">Works</Link>
            <Link href="/about" className="transition-colors hover:text-white">About</Link>
            <Link href="/contact" className="transition-colors hover:text-white">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
