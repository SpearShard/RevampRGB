"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import HomeLoader from "./HomeLoader";
import Navbar from "./Navbar";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdmin) return <>{children}</>;
  return <><Navbar /><HomeLoader />{children}<Footer /></>;
}
