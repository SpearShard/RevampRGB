"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export default function Footer() {
  const pathname = usePathname();
  const footerRef = useRef<HTMLElement>(null);
  const previousPathRef = useRef(pathname);
  const hasMountedRef = useRef(false);

  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const isProjectsPage = pathname === "/project";

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      previousPathRef.current = pathname;
      if (isProjectsPage) {
        footer.style.display = "none";
        gsap.set(footer, { yPercent: 100, autoAlpha: 0 });
      }
      return;
    }

    const previousPath = previousPathRef.current;
    previousPathRef.current = pathname;
    const wasProjectsPage = previousPath === "/project";

    gsap.killTweensOf(footer);

    if (isProjectsPage) {
      footer.style.display = "block";
      gsap.to(footer, {
        yPercent: 100,
        autoAlpha: 0,
        duration: 0.68,
        ease: "power3.inOut",
        onComplete: () => {
          footer.style.display = "none";
        },
      });
      return;
    }

    if (wasProjectsPage) {
      footer.style.display = "block";
      gsap.fromTo(
        footer,
        { yPercent: 100, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.78,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
        }
      );
    }
  }, [pathname]);

  return (
    <>
      <footer
        ref={footerRef}
        className="relative hidden md:block overflow-hidden pt-20 text-white will-change-transform"
      >
        {/* Noise */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "url('https://grainy-gradients.vercel.app/noise.svg')",
          }}
        />

        <div className="relative z-10">
          <div className="relative overflow-hidden">
            <div className="translate-y-[18%]">
              <h2 className="flex select-none justify-center text-center text-[5rem] font-[500] uppercase leading-[0.8] tracking-[-0.1em] text-white sm:text-[7rem] md:text-[10rem] lg:text-[14rem] xl:text-[18rem]">
                <span className="transition-colors duration-500 hover:text-red-500">R</span>
                <span className="transition-colors duration-500 hover:text-green-500">G</span>
                <span className="transition-colors duration-500 hover:text-blue-500">B</span>
                <span>&nbsp;Design</span>
              </h2>
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 h-[180px] w-full bg-gradient-to-t from-[#050505] to-transparent" />
          </div>
        </div>
      </footer>

      <footer className="relative z-[10] mt-[50px] md:hidden w-full bg-black px-4 py-5 text-center text-white">
        <small className="block py-px text-[11px] text-white/75">
          RGB Design - Roshni Gera © 2024
        </small>
      </footer>
    </>
  );
}
