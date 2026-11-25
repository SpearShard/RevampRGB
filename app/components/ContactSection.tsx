"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowUpRight, Check, Copy, Mail, MapPin, Send } from "lucide-react";

const STUDIO_EMAIL = "hello@rgbstudio.com";

const TOPICS = [
  "Spatial & Architecture",
  "Computational Design",
  "Material R&D",
  "Digital & Interactive",
] as const;

const CHANNELS = [
  {
    label: "Email",
    handle: STUDIO_EMAIL,
    href: `mailto:${STUDIO_EMAIL}`,
    accent: "#ff4d5a",
    external: false,
  },
  {
    label: "Instagram",
    handle: "Studio journal",
    href: "https://instagram.com",
    accent: "#35d58a",
    external: true,
  },
  {
    label: "LinkedIn",
    handle: "RGB Design Studio",
    href: "https://linkedin.com",
    accent: "#5795ff",
    external: true,
  },
] as const;

export default function ContactSection() {
  const root = useRef<HTMLElement>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>(TOPICS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-reveal",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.06,
          ease: "power3.out",
          clearProps: "transform",
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(STUDIO_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${STUDIO_EMAIL}`;
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[${selectedTopic}] New enquiry from ${name || "Studio Visitor"}`);
    const body = encodeURIComponent(
      `Name: ${name || "—"}\nEmail: ${email || "—"}\nDiscipline: ${selectedTopic}\n\n${message}`
    );
    window.location.href = `mailto:${STUDIO_EMAIL}?subject=${subject}&body=${body}`;
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <main
      ref={root}
      className="relative isolate min-h-screen w-full overflow-x-hidden bg-[#090a0e] text-[#f3f4f6]"
    >
      {/* Subtle ambient chromatic wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[34rem] w-[58rem] -translate-x-1/2 rounded-full opacity-[0.14] blur-[140px]"
        style={{
          background:
            "radial-gradient(circle at 25% 50%, rgba(255,77,90,0.45), transparent 55%), radial-gradient(circle at 50% 35%, rgba(53,213,138,0.35), transparent 55%), radial-gradient(circle at 75% 50%, rgba(87,149,255,0.5), transparent 55%)",
        }}
      />

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1360px] flex-col justify-center px-5 pb-32 pt-28 sm:px-10 sm:pt-32 lg:px-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          {/* Left Column: Editorial Intro & Quick Actions */}
          <div className="flex flex-col items-start lg:col-span-5 lg:pt-4">
            <div className="contact-reveal inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium tracking-wide text-white/75">
              <span className="flex items-center gap-1" aria-hidden="true">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff4d5a]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#35d58a]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#5795ff]" />
              </span>
              Contact
            </div>

            <h1 className="contact-reveal mt-6 text-[clamp(2.75rem,6vw,4.75rem)] font-medium leading-[1.02] tracking-[-0.045em] text-white">
              Start a
              <br />
              conversation
              <span className="text-[#5795ff]">.</span>
            </h1>

            <p className="contact-reveal mt-5 max-w-md text-[15px] leading-7 text-white/60 sm:text-base">
              We partner with teams and cultural spaces on material research, computational
              workflows, and spatial experiences. Share what you&apos;re building.
            </p>

            {/* Primary Pill Actions */}
            <div className="contact-reveal mt-8 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${STUDIO_EMAIL}`}
                className="inline-flex h-12 items-center gap-2.5 rounded-full bg-[#e8eaed] px-6 text-sm font-medium text-[#0b0c10] transition-all duration-200 hover:bg-white hover:shadow-[0_0_0_4px_rgba(255,255,255,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Mail className="h-4 w-4" />
                <span>{STUDIO_EMAIL}</span>
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-medium text-white/85 transition-colors hover:border-white/25 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-[#35d58a]" />
                    <span className="text-[#35d58a]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-white/60" />
                    <span>Copy address</span>
                  </>
                )}
              </button>
            </div>

            {/* Clean Metadata Card */}
            <div className="contact-reveal mt-10 w-full max-w-md rounded-[24px] border border-white/[0.08] bg-[#121319]/80 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/[0.06] text-white/80">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">Bengaluru, India</p>
                    <p className="mt-0.5 text-xs text-white/50">
                      Working globally · IST (UTC+5:30)
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#35d58a]/10 px-2.5 py-1 text-[11px] font-medium text-[#35d58a]">
                  Available
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: M3 Tonal Inquiry Surface + Channel Bento */}
          <div className="flex flex-col gap-4 lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="contact-reveal rounded-[28px] border border-white/[0.09] bg-[#121319]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-medium tracking-tight text-white sm:text-xl">
                    Project brief
                  </h2>
                  <p className="mt-1 text-xs text-white/50 sm:text-sm">
                    Select a discipline and tell us a bit about your timeline.
                  </p>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="mt-5 flex flex-wrap gap-2">
                {TOPICS.map((topic) => {
                  const active = selectedTopic === topic;
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setSelectedTopic(topic)}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-150 ${
                        active
                          ? "bg-[#d3e3fd] text-[#041e49] shadow-sm"
                          : "border border-white/[0.1] bg-white/[0.03] text-white/70 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                      <span>{topic}</span>
                    </button>
                  );
                })}
              </div>

              {/* Outlined Clean Inputs */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/60">Your name</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="h-12 w-full rounded-2xl border border-white/[0.12] bg-[#0b0c10]/70 px-4 text-sm text-white placeholder:text-white/30 transition-colors focus:border-[#8ab4f8] focus:bg-[#0b0c10] focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/60">
                    Email address
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="h-12 w-full rounded-2xl border border-white/[0.12] bg-[#0b0c10]/70 px-4 text-sm text-white placeholder:text-white/30 transition-colors focus:border-[#8ab4f8] focus:bg-[#0b0c10] focus:outline-none"
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-medium text-white/60">
                  Tell us about the project
                </span>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Scope, goals, or any early ideas you'd like to explore together..."
                  className="w-full resize-none rounded-2xl border border-white/[0.12] bg-[#0b0c10]/70 p-4 text-sm leading-6 text-white placeholder:text-white/30 transition-colors focus:border-[#8ab4f8] focus:bg-[#0b0c10] focus:outline-none"
                />
              </label>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-white/45">
                  {submitted
                    ? "Opening your mail client with your brief..."
                    : "Usually responds within 1–2 business days."}
                </p>

                <button
                  type="submit"
                  className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-[#8ab4f8] px-6 text-sm font-medium text-[#062e6f] transition-all duration-200 hover:bg-[#aecbfa] hover:shadow-[0_0_0_4px_rgba(138,180,248,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8ab4f8]"
                >
                  <span>Send enquiry</span>
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Channel Bento Strip */}
            <div className="contact-reveal grid grid-cols-1 gap-3 sm:grid-cols-3">
              {CHANNELS.map((channel) => (
                <a
                  key={channel.label}
                  href={channel.href}
                  target={channel.external ? "_blank" : undefined}
                  rel={channel.external ? "noreferrer" : undefined}
                  className="group flex items-center justify-between rounded-[22px] border border-white/[0.08] bg-[#121319]/80 px-5 py-4 transition-all duration-200 hover:border-white/20 hover:bg-[#181a22] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: channel.accent }}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium text-white">{channel.label}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-white/50">{channel.handle}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
