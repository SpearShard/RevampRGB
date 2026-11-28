import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import HomeLoader from "./components/HomeLoader";
import Navbar from "./components/Navbar";
import PersistentFractal from "./components/PersistentFractal";
import ExperienceController from "./components/ExperienceController";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const plusJakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });
const spaceMono = Space_Mono({ variable: "--font-space-mono", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "RGB Design Studio",
  description: "RGB — a multidisciplinary design practice exploring material, computation, and space.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} ${spaceGrotesk.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <HomeLoader />
        <PersistentFractal />
        <ExperienceController>{children}</ExperienceController>
        <Footer />
      </body>
    </html>
  );
}
