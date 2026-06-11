import { useState } from "react";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import About from "./components/sections/About";
import Contact from "./components/sections/Contact";
import Coaches from "./components/sections/Coaches";
import Events from "./components/sections/Events";
import Hero from "./components/sections/Hero";
import Services from "./components/sections/Services";
import Ticker from "./components/sections/Ticker";
import Toast from "./components/ui/Toast";
import useTheme from "./hooks/useTheme";

export default function App() {
  const [toastMessage, setToastMessage] = useState("");
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main id="top">
        <Hero />
        <Ticker />
        <About />
        <Events />
        <Services />
        <Coaches />
        <Contact onMissingLink={setToastMessage} />
      </main>
      <Footer />
      <Toast message={toastMessage} onDismiss={() => setToastMessage("")} />
    </>
  );
}
