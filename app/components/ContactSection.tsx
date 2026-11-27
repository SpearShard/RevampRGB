"use client";

import { useEffect, useState } from "react";
import DesktopView from "./ContactSectionDesktop";
import MobileView from "./ContactSectionMobile";

export default function ContactSection() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  if (isDesktop === null) return null;
  return isDesktop ? <DesktopView /> : <MobileView />;
}
