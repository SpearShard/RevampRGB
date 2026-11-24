"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const links = [
  { label: "Email", value: "hello@rgbstudio.com", href: "mailto:hello@rgbstudio.com" },
  { label: "Instagram", value: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", value: "LinkedIn", href: "https://linkedin.com" },
];

export default function ContactSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".contact-reveal", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "power3.out" });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={root} className="relative w-full overflow-hidden bg-transparent text-white">
      {/* Mobile contact experience */}
      <section className="relative flex min-h-[100svh] flex-col px-5 pb-36 pt-28 md:hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-[110px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-[48%] h-64 w-64 rounded-full bg-red-500/[0.08] blur-[110px]" />

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="contact-reveal mb-12 flex items-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-red-400 via-emerald-400 to-blue-400" />
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/45">A good place to start / 04</p>
          </div>

          <h1 className="contact-reveal max-w-[10ch] text-[clamp(3.7rem,17vw,6.2rem)] font-light leading-[0.84] tracking-[-0.09em]">
            Have an
            <br />
            idea<span className="text-white/35">?</span>
            <br />
            <span className="text-white/40">Let&apos;s</span> talk.
          </h1>

          <p className="contact-reveal mt-7 max-w-[29ch] text-[13px] leading-6 text-white/50">
            Big ambition, rough sketch, or just a question. We&apos;re listening. Tell us what you&apos;re thinking and let&apos;s see where it goes.
          </p>

          <a href="mailto:hello@rgbstudio.com" className="contact-reveal group mt-10 flex min-h-[76px] items-center justify-between border-y border-white/20 py-4 transition-colors active:border-white/50">
            <span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Start with an email</span>
              <span className="mt-2 block text-[15px] tracking-[-0.02em] text-white">hello@rgbstudio.com</span>
            </span>
            <span className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-xl text-white transition-all duration-300 group-active:rotate-45 group-active:bg-white group-active:text-black">↗</span>
          </a>

          <div className="contact-reveal mt-auto pt-16">
            <div className="mb-5 flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/35">Find us elsewhere</p>
              <span className="font-mono text-[9px] text-white/25">01 — 03</span>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/15">
              {links.slice(1).map((link, index) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="group flex min-h-[58px] items-center justify-between py-3">
                  <span className="text-[13px] text-white/75">{link.label}</span>
                  <span className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                    {index === 0 ? "Follow along" : "Connect"}
                    <span className="text-base text-white/55 transition-transform group-active:translate-x-1 group-active:-translate-y-1">↗</span>
                  </span>
                </a>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">
              <span>Bengaluru, India</span>
              <span>RGB Design Studio</span>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop contact layout — intentionally unchanged */}
      <section className="hidden min-h-screen w-full items-center px-4 pb-32 pt-24 sm:px-12 sm:pb-28 sm:pt-28 md:flex lg:px-20">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-10 sm:gap-16 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="contact-reveal mb-6 font-mono text-[10px] uppercase tracking-[0.32em] text-white/40">Start a conversation / 01</p>
            <h1 className="contact-reveal max-w-4xl text-[clamp(2.8rem,12vw,9rem)] font-light leading-[0.88] tracking-[-0.085em] sm:text-[clamp(3.5rem,10vw,9rem)]">Let&apos;s make<br/><span className="text-white/45">something</span><br/>meaningful.</h1>
            <p className="contact-reveal mt-6 max-w-lg text-sm leading-7 text-white/50 sm:mt-9 sm:text-base">Have a project, a question, or an idea worth exploring? Tell us what you&apos;re thinking. We&apos;ll take it from there.</p>
          </div>
          <div className="lg:col-span-5">
            <div className="contact-reveal border-y border-white/15">
              {links.map((link) => (
                <a key={link.label} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer" : undefined} className="group flex items-center justify-between gap-3 border-b border-white/10 py-4 last:border-0 sm:py-5">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-white/35">{link.label}</span>
                  <span className="flex items-center gap-4 break-all text-right text-xs text-white/75 transition-colors group-hover:text-white sm:text-sm">{link.value}<span className="text-white/30 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗</span></span>
                </a>
              ))}
            </div>
            <p className="contact-reveal mt-6 font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">Bangalore · India</p>
          </div>
        </div>
      </section>
    </main>
  );
}
