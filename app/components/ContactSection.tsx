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
    <main ref={root} className="relative flex min-h-screen w-full items-center overflow-hidden bg-transparent px-4 pb-32 pt-24 text-white sm:px-12 sm:pb-28 sm:pt-28 lg:px-20">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-10 sm:gap-16 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="contact-reveal mb-6 font-mono text-[10px] uppercase tracking-[0.32em] text-white/40">Start a conversation / 01</p>
          <h1 className="contact-reveal max-w-4xl text-[clamp(2.8rem,12vw,9rem)] sm:text-[clamp(3.5rem,10vw,9rem)] font-light leading-[0.88] tracking-[-0.085em]">Let&apos;s make<br/><span className="text-white/45">something</span><br/>meaningful.</h1>
          <p className="contact-reveal mt-6 max-w-lg text-sm leading-7 sm:mt-9 text-white/50 sm:text-base">Have a project, a question, or an idea worth exploring? Tell us what you&apos;re thinking. We&apos;ll take it from there.</p>
        </div>
        <div className="lg:col-span-5">
          <div className="contact-reveal border-y border-white/15">
            {links.map((link) => (
              <a key={link.label} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer" : undefined} className="group flex items-center justify-between border-b border-white/10 gap-3 py-4 sm:py-5 last:border-0">
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/35">{link.label}</span>
                <span className="flex items-center gap-4 break-all text-right text-xs text-white/75 transition-colors sm:text-sm group-hover:text-white">{link.value}<span className="text-white/30 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗</span></span>
              </a>
            ))}
          </div>
          <p className="contact-reveal mt-6 font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">Bangalore · India</p>
        </div>
      </div>
    </main>
  );
}
