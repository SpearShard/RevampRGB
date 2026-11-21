import AboutSection from "./components/AboutSection";
import Landing from "./components/LandingPage";
import PremiumWorkSection from "./components/WorkSection";

export default function Page() {
  return (
    <div>
      <Landing />
      <div className="relative z-10">
        <AboutSection />
        <PremiumWorkSection />
      </div>
    </div>
  );
}
