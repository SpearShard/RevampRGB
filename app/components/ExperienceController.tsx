"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import Landing from "./LandingPage";
import AboutSection from "./AboutSection";
import PremiumWorkSection from "./WorkSection";
import ProjectsPage from "./ProjectsPage";
import ContactSection from "./ContactSection";
import AboutPageSection from "./AboutPageSection";

type BaseExperienceRoute = "/" | "/project" | "/contact" | "/about";

const BASE_EXPERIENCE_ROUTES: BaseExperienceRoute[] = ["/", "/project", "/contact", "/about"];

function isProjectDetailPath(path: string) {
  return path.startsWith("/project/") && path !== "/project";
}

type ExperienceControllerProps = { children: React.ReactNode };

export default function ExperienceController({ children }: ExperienceControllerProps) {
  const pathname = usePathname();
  const isDetailRoute = isProjectDetailPath(pathname);
  const isExperienceRoute =
    BASE_EXPERIENCE_ROUTES.includes(pathname as BaseExperienceRoute) || isDetailRoute;

  const homeRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const activeRouteRef = useRef<string>(pathname);
  const transitionTargetRef = useRef<string | null>(null);
  const transitionTweenRef = useRef<gsap.core.Timeline | null>(null);
  const hasInitializedLayersRef = useRef(false);

  const setHomeActive = useCallback((active: boolean) => {
    document.documentElement.dataset.rgbHomeActive = active ? "true" : "false";
    window.dispatchEvent(new CustomEvent("rgb:home-active", { detail: { active } }));
  }, []);

  const getLayerForPath = useCallback((path: string) => {
    if (isProjectDetailPath(path)) return detailRef.current;
    if (path === "/project") return projectsRef.current;
    if (path === "/contact") return contactRef.current;
    if (path === "/about") return aboutRef.current;
    return homeRef.current;
  }, []);

  const applyLayerLayout = useCallback((targetPath: string) => {
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    const layers: Array<{ match: (p: string) => boolean; el: HTMLDivElement | null; fixed: boolean }> = [
      { match: (p) => p === "/", el: homeRef.current, fixed: false },
      { match: (p) => p === "/project", el: projectsRef.current, fixed: isDesktop },
      { match: (p) => p === "/contact", el: contactRef.current, fixed: false },
      { match: (p) => p === "/about", el: aboutRef.current, fixed: false },
      { match: isProjectDetailPath, el: detailRef.current, fixed: false },
    ];

    for (const { match, el, fixed } of layers) {
      if (!el) continue;
      const isTarget = match(targetPath);
      const isProjectsLayer = el === projectsRef.current;
      el.style.display = isTarget ? "block" : "none";
      el.style.visibility = isTarget ? "visible" : "hidden";
      el.style.pointerEvents = isTarget && !isProjectsLayer ? "auto" : "none";

      if (fixed) {
        el.style.position = "fixed";
        el.style.inset = "0";
        el.style.width = "100%";
      } else if (isTarget) {
        el.style.position = "relative";
        el.style.inset = "auto";
        el.style.width = "100%";
      } else {
        el.style.position = "absolute";
        el.style.inset = "0 auto auto 0";
        el.style.width = "100%";
      }

      gsap.set(el, { autoAlpha: isTarget ? 1 : 0 });
    }
  }, []);

  const transitionTo = useCallback(
    (targetPath: string) => {
      const incoming = getLayerForPath(targetPath);
      const outgoingPath = activeRouteRef.current;
      const outgoing = getLayerForPath(outgoingPath);

      if (!incoming || !outgoing || outgoingPath === targetPath || transitionTargetRef.current === targetPath) {
        return;
      }

      // Next/previous project navigation keeps the same detail layer mounted.
      // Let its content and selected fractal shard update without fading the
      // entire shared layer out and back in.
      if (incoming === outgoing) {
        activeRouteRef.current = targetPath;
        return;
      }

      transitionTweenRef.current?.kill();
      transitionTargetRef.current = targetPath;

      const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
      const incomingIsFixed = targetPath === "/project" && isDesktop;
      const outgoingIsFixed = outgoingPath === "/project" && isDesktop;
      incoming.style.display = "block";
      outgoing.style.display = "block";

      if (!incomingIsFixed) {
        incoming.style.position = "relative";
        incoming.style.inset = "auto";
        incoming.style.width = "100%";
        if (!outgoingIsFixed) {
          outgoing.style.position = "absolute";
          outgoing.style.inset = "0 auto auto 0";
          outgoing.style.width = "100%";
        }
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      }

      incoming.style.visibility = "visible";
      incoming.style.pointerEvents = "none";
      outgoing.style.visibility = "visible";
      outgoing.style.pointerEvents = "none";

      [homeRef.current, projectsRef.current, contactRef.current, aboutRef.current, detailRef.current].forEach(
        (el) => {
          if (!el || el === incoming || el === outgoing) return;
          el.style.display = "none";
          el.style.visibility = "hidden";
          el.style.pointerEvents = "none";
          gsap.set(el, { autoAlpha: 0 });
        }
      );

      if (targetPath === "/") {
        setHomeActive(true);
      }

      const currentOutAlpha = Number(gsap.getProperty(outgoing, "opacity"));
      gsap.set(incoming, { autoAlpha: 0 });
      gsap.set(outgoing, { autoAlpha: Number.isFinite(currentOutAlpha) ? currentOutAlpha : 1 });

      const outDur = 0.82;
      const inDur = 0.92;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          outgoing.style.display = "none";
          outgoing.style.visibility = "hidden";
          if (!outgoingIsFixed) {
            outgoing.style.position = "absolute";
            outgoing.style.inset = "0 auto auto 0";
            outgoing.style.width = "100%";
          }
          outgoing.style.pointerEvents = "none";
          incoming.style.display = "block";
          incoming.style.visibility = "visible";
          incoming.style.pointerEvents = targetPath === "/project" ? "none" : "auto";
          activeRouteRef.current = targetPath;
          transitionTargetRef.current = null;
          setHomeActive(targetPath === "/");
        },
      });

      tl.to(outgoing, { autoAlpha: 0, duration: outDur }, 0).to(incoming, { autoAlpha: 1, duration: inDur }, 0.02);

      transitionTweenRef.current = tl;
    },
    [getLayerForPath, setHomeActive]
  );

  useEffect(() => {
    if (!isExperienceRoute) {
      hasInitializedLayersRef.current = false;
      return;
    }

    if (!hasInitializedLayersRef.current) {
      activeRouteRef.current = pathname;
      applyLayerLayout(pathname);
      setHomeActive(pathname === "/");
      hasInitializedLayersRef.current = true;
      return;
    }

    if (activeRouteRef.current === pathname || transitionTargetRef.current === pathname) return;
    transitionTo(pathname);
  }, [pathname, isExperienceRoute, transitionTo, applyLayerLayout, setHomeActive]);

  useEffect(() => {
    if (!isExperienceRoute) return;

    const enterProjects = () => transitionTo("/project");
    const returnHome = () => transitionTo("/");
    const enterContact = () => transitionTo("/contact");
    const enterAbout = () => transitionTo("/about");
    const enterDetail = (e: Event) => {
      const href = (e as CustomEvent<{ href?: string }>).detail?.href;
      if (href) {
        const outgoing = getLayerForPath(activeRouteRef.current);
        if (outgoing && outgoing !== detailRef.current) {
          gsap.to(outgoing, { autoAlpha: 0, duration: 0.32, ease: "power3.out" });
        }
      }
    };

    window.addEventListener("rgb:enter-project", enterProjects);
    window.addEventListener("rgb:leave-project", returnHome);
    window.addEventListener("rgb:enter-contact", enterContact);
    window.addEventListener("rgb:enter-about", enterAbout);
    window.addEventListener("rgb:enter-detail", enterDetail);

    return () => {
      window.removeEventListener("rgb:enter-project", enterProjects);
      window.removeEventListener("rgb:leave-project", returnHome);
      window.removeEventListener("rgb:enter-contact", enterContact);
      window.removeEventListener("rgb:enter-about", enterAbout);
      window.removeEventListener("rgb:enter-detail", enterDetail);
      transitionTweenRef.current?.kill();
    };
  }, [isExperienceRoute, getLayerForPath, setHomeActive, transitionTo]);

  if (!isExperienceRoute) return <>{children}</>;

  return (
    <div className={`relative min-h-screen w-full ${pathname === "/project" ? "md:h-screen md:overflow-hidden" : ""}`}>
      <div
        ref={homeRef}
        className="relative w-full"
        style={{
          display: pathname === "/" ? "block" : "none",
          visibility: pathname === "/" ? "visible" : "hidden",
          opacity: pathname === "/" ? 1 : 0,
        }}
      >
        <Landing />
        <div className="relative z-10">
          <AboutSection />
          <PremiumWorkSection />
        </div>
      </div>

      <div
        ref={projectsRef}
        className="relative z-[8] w-full overflow-visible md:fixed md:inset-0 md:z-[6] md:overflow-hidden md:pointer-events-auto"
        style={{
          display: pathname === "/project" ? "block" : "none",
          visibility: pathname === "/project" ? "visible" : "hidden",
          opacity: pathname === "/project" ? 1 : 0,
          pointerEvents: "none",
        }}
      >
        <ProjectsPage />
      </div>

      <div
        ref={contactRef}
        className="relative w-full z-10"
        style={{
          display: pathname === "/contact" ? "block" : "none",
          visibility: pathname === "/contact" ? "visible" : "hidden",
          opacity: pathname === "/contact" ? 1 : 0,
          pointerEvents: pathname === "/contact" ? "auto" : "none",
        }}
      >
        <ContactSection />
      </div>

      <div
        ref={aboutRef}
        className="relative w-full md:z-10"
        style={{
          display: pathname === "/about" ? "block" : "none",
          visibility: pathname === "/about" ? "visible" : "hidden",
          opacity: pathname === "/about" ? 1 : 0,
          pointerEvents: pathname === "/about" ? "auto" : "none",
        }}
      >
        <AboutPageSection />
      </div>

      <div
        ref={detailRef}
        className="relative w-full z-10"
        style={{
          display: isDetailRoute ? "block" : "none",
          visibility: isDetailRoute ? "visible" : "hidden",
          opacity: isDetailRoute ? 1 : 0,
          pointerEvents: isDetailRoute ? "auto" : "none",
        }}
      >
        {isDetailRoute ? children : null}
      </div>
    </div>
  );
}
