"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SDFAnimationDesktop = dynamic(() => import("./SDFAnimationDesktop"), {
  ssr: false,
});
const SDFAnimationMobile = dynamic(() => import("./SDFAnimationMobile"), {
  ssr: false,
});

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
  const [isDesktop, setIsDesktop] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (isDesktop === null) return null;

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
