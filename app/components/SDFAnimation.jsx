"use client";

import { useEffect, useState } from "react";
import SDFAnimationDesktop from "./SDFAnimationDesktop";
import SDFAnimationMobile from "./SDFAnimationMobile";

/**
 * @param {{
 *   mode?: string;
 *   centered?: boolean;
 *   projects?: Array<{ title: string; categoryTitle: string; cover: string; href: string }>;
 *   selectedChunkIndex?: number | null;
 *   activeHref?: string | null;
 * }} props
 */
export default function SDFAnimation({
  mode = "home",
  centered = false,
  projects = [],
  selectedChunkIndex = null,
  activeHref = null,
}) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isDesktop ? (
    <SDFAnimationDesktop
      mode={mode}
      centered={centered}
      projects={projects}
      selectedChunkIndex={selectedChunkIndex}
    />
  ) : (
    <SDFAnimationMobile
      mode={mode}
      activeHref={activeHref}
      projects={projects}
    />
  );
}
