"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const links = [
  { label: "Email", value: "hello@rgbstudio.com", href: "mailto:hello@rgbstudio.com", detail: "For projects, ideas, and everything in between", mark: "@" },
  { label: "Instagram", value: "Instagram", href: "https://instagram.com", detail: "A look at what we're exploring", mark: "ig" },
  { label: "LinkedIn", value: "LinkedIn", href: "https://linkedin.com", detail: "Connect with the studio", mark: "in" },
];

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}

export default function ContactSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-reveal",
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.09, ease: "power3.out", clearProps: "transform" }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={root} className="relative isolate min-h-screen w-full overflow-hidden bg-[#08090b] text-[#f4f5f7]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-28 h-[26rem] w-[26rem] rounded-full bg-blue-500/[0.07] blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-8 h-[24rem] w-[24rem] rounded-full bg-red-500/[0.06] blur-[120px]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 pb-36 pt-28 sm:px-10 sm:pt-36 lg:px-16 lg:pb-32 lg:pt-40">
        <div className="contact-reveal mb-12 flex items-center gap-3 sm:mb-16">
          <span className="flex h-[3px] w-12 overflow-hidden rounded-full">
            <span className="w-1/3 bg-[#f06b67]" />
            <span className="w-1/3 bg-[#68c99b]" />
            <span className="w-1/3 bg-[#6c9cf5]" />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">Contact · RGB Design Studio</span>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:items-center lg:gap-20">
          <div className="flex flex-col items-start">
            <p className="contact-reveal mb-5 text-sm font-medium tracking-wide text-white/45 sm:mb-7">Good work starts with a conversation.</p>
            <h1 className="contact-reveal max-w-[11ch] text-[clamp(3.8rem,11vw,9rem)] font-normal leading-[0.91] tracking-[-0.075em]">
              Let&apos;s make
              <br />
              <span className="text-white/45">something</span>
              <br />
              matter<span className="text-[#8caeff]">.</span>
            </h1>
            <p className="contact-reveal mt-7 max-w-[37rem] text-[15px] leading-7 text-white/55 sm:mt-9 sm:text-base sm:leading-8">
              Have a project in mind, a question, or an idea that&apos;s still taking shape? Bring it to us. We&apos;ll figure out the next step together.
            </p>

            <a
              href="mailto:hello@rgbstudio.com"
              className="contact-reveal group mt-9 inline-flex min-h-14 items-center gap-5 rounded-full bg-[#f1f3f4] py-2 pl-6 pr-2 text-sm font-semibold text-[#17191c] transition duration-300 hover:bg-white hover:shadow-[0_8px_32px_rgba(255,255,255,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:mt-11"
            >
              Start a conversation
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#202329] text-white transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight />
              </span>
            </a>
          </div>

          <aside className="contact-reveal relative overflow-hidden rounded-[28px] border border-white/[0.11] bg-[#14161a]/85 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:rounded-[32px] sm:p-8 lg:p-9">
            <div aria-hidden="true" className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-400/[0.07] blur-3xl" />
            <div className="relative">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Reach the studio</p>
                  <p className="mt-1 text-xs text-white/40">Choose where you&apos;d like to connect</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-medium tracking-wide text-white/45">WE&apos;RE LISTENING</span>
              </div>

              <div className="space-y-2">
                {links.map((link, index) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                    className="group flex min-h-[88px] items-center gap-4 rounded-2xl border border-transparent px-3 py-4 transition-colors duration-200 hover:border-white/10 hover:bg-white/[0.045] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:gap-5 sm:px-4"
                  >
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[17px] border text-sm font-semibold ${index === 0 ? "border-[#f06b67]/20 bg-[#f06b67]/10 text-[#ffaaa5]" : index === 1 ? "border-[#68c99b]/20 bg-[#68c99b]/10 text-[#9be4bd]" : "border-[#6c9cf5]/20 bg-[#6c9cf5]/10 text-[#a9c5ff]"}`}>
                      {link.mark}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-white/90">{link.label}</span>
                      <span className="mt-1 block break-words text-xs leading-5 text-white/40">{link.detail}</span>
                    </span>
                    <span className="text-white/35 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white">
                      <ArrowUpRight />
                    </span>
                  </a>
                ))}
              </div>

              <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.17em] text-white/35">Based in</p>
                  <p className="mt-1.5 text-sm text-white/75">Bengaluru, India</p>
                </div>
                <span className="flex items-center gap-2 text-xs text-white/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#68c99b] shadow-[0_0_10px_rgba(104,201,155,0.45)]" />
                  Open to conversations
                </span>
              </div>
            </div>
          </aside>
        </div>

        <div className="contact-reveal mt-16 flex flex-col gap-3 border-t border-white/10 pt-5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <span>Thoughtful ideas. Well made.</span>
          <span>RGB Design Studio · Bengaluru</span>
        </div>
      </section>
    </main>
  );
}
