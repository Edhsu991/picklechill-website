import { useEffect, useState } from "react";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import TournamentScoring from "./components/pages/TournamentScoring";
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
import useFontSize from "./hooks/useFontSize";
import useTheme from "./hooks/useTheme";

export default function App() {
  const [toastMessage, setToastMessage] = useState("");
  const [showSiteNotice, setShowSiteNotice] = useState(true);
  const [page, setPage] = useState(() =>
    window.location.hash.startsWith("#/scoring") ? "scoring" : "home",
  );
  const { fontSize, setFontSize } = useFontSize();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleHashChange = () => {
      const isScoring = window.location.hash.startsWith("#/scoring");
      setPage(isScoring ? "scoring" : "home");

      window.setTimeout(() => {
        const targetId = window.location.hash.replace("#", "");
        const target = !isScoring && targetId ? document.getElementById(targetId) : null;
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
      <Toast message={toastMessage} onDismiss={() => setToastMessage("")} />
      {showSiteNotice && <SiteNotice onDismiss={() => setShowSiteNotice(false)} />}
    </>
  );
}
