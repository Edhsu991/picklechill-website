import { useState } from "react";
import { navigation } from "../../data/siteContent";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="回到首頁" onClick={closeMenu}>
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
        <a href="#contact" className="nav-cta" onClick={closeMenu}>
          加入 LINE 揪團
        </a>
      </nav>
    </header>
  );
}
