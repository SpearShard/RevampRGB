"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const channels = [
  { code: "R", label: "Email", value: "hello@rgbstudio.com", note: "Project enquiries & ideas", href: "mailto:hello@rgbstudio.com", color: "#ff4d5a", tint: "rgba(255,77,90,.12)" },
  { code: "G", label: "Instagram", value: "Follow the studio", note: "Work in progress & experiments", href: "https://instagram.com", color: "#35d58a", tint: "rgba(53,213,138,.12)" },
  { code: "B", label: "LinkedIn", value: "Connect with us", note: "Studio updates & conversations", href: "https://linkedin.com", color: "#5795ff", tint: "rgba(87,149,255,.12)" },
];

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}

export default function ContactSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".contact-reveal", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out", clearProps: "transform" });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={root} className="relative isolate min-h-screen w-full overflow-hidden bg-[#0b0c10] text-[#f5f6fa]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#ff4d5a] via-[#35d58a] to-[#5795ff]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-48 top-20 h-[28rem] w-[28rem] rounded-full bg-[#ff4d5a]/[0.07] blur-[130px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-48 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#5795ff]/[0.08] blur-[140px]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 pb-36 pt-28 sm:px-10 sm:pt-36 lg:px-16 lg:pb-32 lg:pt-36">
        <header className="contact-reveal relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#111318]">R</span>
            <span className="text-xs font-semibold tracking-wide text-white/80">RGB Design Studio</span>
          </div>
          <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[10px] font-medium tracking-wide text-white/55">CONTACT / 04</span>
        </header>

        <div className="relative mt-14 grid flex-1 grid-cols-1 gap-10 lg:mt-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-8">
          <div className="relative z-10 flex flex-col items-start">
            <div className="contact-reveal mb-6 inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-2 text-[11px] font-medium text-white/65 ring-1 ring-white/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#35d58a] opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#35d58a]" />
              </span>
              Good things start here
            </div>
            <h1 className="contact-reveal max-w-[10ch] text-[clamp(3.8rem,10vw,8.6rem)] font-medium leading-[0.91] tracking-[-0.075em]">
              Let&apos;s talk<span className="text-[#ff5965]">.</span>
              <br />
              <span className="text-white/45">Let&apos;s</span> make
              <br />
              <span className="text-white/45">it real.</span>
            </h1>
            <p className="contact-reveal mt-7 max-w-[31rem] text-[15px] leading-7 text-white/55 sm:text-base sm:leading-8">
              Have a big idea or just the first little spark? Tell us what you&apos;re imagining. We&apos;ll bring the right mix of design, technology and curiosity.
            </p>
            <a href="mailto:hello@rgbstudio.com" className="contact-reveal mt-8 inline-flex min-h-14 items-center gap-4 rounded-full bg-[#d8e2ff] py-2 pl-6 pr-2 text-sm font-semibold text-[#14213d] transition-all duration-200 hover:bg-white hover:shadow-[0_0_0_4px_rgba(87,149,255,.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d8e2ff]">
              Start a conversation
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#273d69] text-white"><ArrowUpRight /></span>
            </a>
          </div>

          <div className="relative min-h-[220px] sm:min-h-[280px] lg:min-h-[440px]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[min(72vw,440px)] w-[min(72vw,440px)] rounded-full border border-white/[0.08]" />
              <div className="absolute h-[min(56vw,340px)] w-[min(56vw,340px)] rounded-full border border-dashed border-white/[0.09]" />
            </div>
            <div className="contact-reveal absolute bottom-2 left-0 right-0 z-10 mx-auto max-w-[430px] rounded-[28px] border border-white/[0.13] bg-[#17191f]/90 p-5 shadow-[0_18px_60px_rgba(0,0,0,.32)] backdrop-blur-xl sm:p-6 lg:bottom-5 lg:left-auto lg:right-0">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Find your way to us</p>
                  <p className="mt-1 text-xs text-white/45">Pick a channel. We&apos;ll take it from there.</p>
                </div>
                <div className="flex gap-1">
                  <span className="h-1.5 w-5 rounded-full bg-[#ff4d5a]" />
                  <span className="h-1.5 w-5 rounded-full bg-[#35d58a]" />
                  <span className="h-1.5 w-5 rounded-full bg-[#5795ff]" />
                </div>
              </div>
              <div className="space-y-2">
                {channels.map((channel) => (
                  <a key={channel.code} href={channel.href} target={channel.href.startsWith("http") ? "_blank" : undefined} rel={channel.href.startsWith("http") ? "noreferrer" : undefined} className="group flex min-h-[68px] items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] px-3 py-3 transition-colors hover:border-white/20 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] text-sm font-bold" style={{ color: channel.color, backgroundColor: channel.tint }}>{channel.code}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-white/90">{channel.label}</span>
                      <span className="mt-0.5 block truncate text-xs text-white/45">{channel.value}</span>
                    </span>
                    <span className="text-white/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"><ArrowUpRight /></span>
                  </a>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                <span className="text-white/40">Bengaluru, India</span>
                <span className="font-medium text-white/65">RGB / 2026</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="contact-reveal mt-12 flex items-center justify-between border-t border-white/10 pt-5 text-[10px] font-medium uppercase tracking-[0.15em] text-white/35">
          <span>Design × Technology × Curiosity</span>
          <span className="hidden sm:inline">R <span className="text-[#ff5965]">/</span> G <span className="text-[#35d58a]">/</span> B <span className="text-[#5795ff]">—</span> Bengaluru</span>
        </footer>
      </section>
    </main>
  );
}
