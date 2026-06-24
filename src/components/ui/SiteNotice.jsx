import { useEffect } from "react";
import { socialLinks } from "../../data/siteContent";

const facebookLink = socialLinks.find((link) => link.label === "Facebook")?.href;

export default function SiteNotice({ onDismiss }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onDismiss();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  return (
    <div className="site-notice-backdrop" role="presentation">
      <section
        className="site-notice"
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-notice-title"
      >
        <span>NOTICE</span>
        <h2 id="site-notice-title">網站功能陸續更新中</h2>
        <p>
          目前網站功能會持續調整與優化。如果使用上遇到任何問題，
          歡迎到粉絲團私訊小編，我們會盡快協助處理。謝謝你的理解與見諒。
        </p>
        <div className="site-notice-actions">
          {facebookLink && (
            <a
              href={facebookLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onDismiss}
            >
              前往粉絲團私訊小編 <b>↗</b>
            </a>
          )}
          <button type="button" onClick={onDismiss}>
            我知道了
          </button>
        </div>
      </section>
    </div>
  );
}
