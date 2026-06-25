import { useEffect, useState } from "react";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import TournamentScoring from "./components/pages/TournamentScoring";
import VenueInfo from "./components/pages/VenueInfo";
import About from "./components/sections/About";
import Contact from "./components/sections/Contact";
import Coaches from "./components/sections/Coaches";
import Events from "./components/sections/Events";
import Hero from "./components/sections/Hero";
import Services from "./components/sections/Services";
import Ticker from "./components/sections/Ticker";
import SiteNotice from "./components/ui/SiteNotice";
import Toast from "./components/ui/Toast";
import FontSizeControl from "./components/ui/FontSizeControl";
import VersionStamp from "./components/ui/VersionStamp";
import useFontSize from "./hooks/useFontSize";
import useTheme from "./hooks/useTheme";

export default function App() {
  const [toastMessage, setToastMessage] = useState("");
  const [showSiteNotice, setShowSiteNotice] = useState(true);
  const getCurrentPage = () => {
    if (window.location.hash.startsWith("#/scoring")) return "scoring";
    if (window.location.hash.startsWith("#/venue")) return "venue";
    return "home";
  };
  const [page, setPage] = useState(getCurrentPage);
  const { fontSize, setFontSize } = useFontSize();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleHashChange = () => {
      const nextPage = getCurrentPage();
      setPage(nextPage);

      window.setTimeout(() => {
        const targetId = window.location.hash.replace("#", "");
        const isPageRoute = window.location.hash.startsWith("#/");
        const target = nextPage === "home" && !isPageRoute && targetId ? document.getElementById(targetId) : null;
        if (target) target.scrollIntoView();
        else window.scrollTo({ top: 0, behavior: "instant" });
      }, 0);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <>
      <Header theme={theme} onToggleTheme={toggleTheme} page={page} />
      {page === "scoring" ? (
        <main id="top">
          <TournamentScoring />
        </main>
      ) : page === "venue" ? (
        <main id="top">
          <VenueInfo />
        </main>
      ) : (
        <main id="top">
          <Hero />
          <Ticker />
          <About />
          <Events />
          <Services />
          <Coaches />
          <Contact onMissingLink={setToastMessage} />
        </main>
      )}
      <Footer />
      <FontSizeControl fontSize={fontSize} onChange={setFontSize} />
      <VersionStamp />
      <Toast message={toastMessage} onDismiss={() => setToastMessage("")} />
      {showSiteNotice && <SiteNotice onDismiss={() => setShowSiteNotice(false)} />}
    </>
  );
}
