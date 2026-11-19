import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RGB CMS",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#111311] text-[#f1f2e9]">{children}</div>;
}
