import { useEffect, useState } from "react";
import { lineGroupUrl, navigation } from "../../data/siteContent";
import ThemeToggle from "../ui/ThemeToggle";

export default function Header({ theme, onToggleTheme, page }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 180);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`site-header${isScrolled ? " is-rail" : ""}`}>
      <a className="brand" href={page === "home" ? "#top" : "#/"} aria-label="回到首頁" onClick={closeMenu}>
        <img src="assets/logo.jpg" alt="匹咖揪 PickleChill Logo" />
        <span>
          <strong>匹咖揪</strong>
          <small>PICKLECHILL TAINAN</small>
        </span>
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-label="開啟選單"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <span />
        <span />
      </button>
      <nav className={`main-nav${isMenuOpen ? " open" : ""}`}>
        {navigation.map((item) => (
          <a href={item.href} key={item.href} onClick={closeMenu}>
            {item.label}
          </a>
        ))}
        <a
          href={page === "scoring" ? "#/" : "#/scoring"}
          className={page === "scoring" ? "" : "nav-score"}
          onClick={closeMenu}
        >
          {page === "scoring" ? "返回首頁" : "比賽計分"}
        </a>
        <a
          href={lineGroupUrl}
          className="nav-cta"
          target="_blank"
          rel="noopener noreferrer"
          onClick={closeMenu}
        >
          加入 LINE
        </a>
      </nav>
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
    </header>
  );
}
