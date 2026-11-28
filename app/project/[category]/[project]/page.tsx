"use client";

import { useEffect, useState } from "react";
import DetailDesktop from "./DetailDesktop";
import DetailMobile from "./DetailMobile";

type PageProps = { params: Promise<{ category: string; project: string }> };

export default function ProjectDetailPage({ params }: PageProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return isDesktop ? <DetailDesktop params={params} /> : <DetailMobile params={params} />;
}
