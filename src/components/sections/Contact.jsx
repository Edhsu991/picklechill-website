import { lineGroupUrl, socialLinks } from "../../data/siteContent";
import Eyebrow from "../ui/Eyebrow";
import Reveal from "../ui/Reveal";

export default function Contact({ onMissingLink }) {
  const handleLineClick = (event) => {
    if (lineGroupUrl) return;
    event.preventDefault();
    onMissingLink("LINE 群組連結準備中，提供網址後即可更新。");
  };

  return (
    <section id="contact" className="section contact">
      <Reveal className="contact-inner">
        <Eyebrow light>JOIN THE COMMUNITY</Eyebrow>
        <h2>下一場，<br /><em>揪</em>你一起。</h2>
        <p>加入 LINE 群組掌握最新場次，線上報名、現場收費。</p>
        <div className="contact-actions">
          <a href={lineGroupUrl || "#contact"} className="button button-yellow" onClick={handleLineClick}>加入 LINE 群組 <b>↗</b></a>
          {socialLinks.map((link) => <a href={link.href} className="social-link" target="_blank" rel="noopener noreferrer" key={link.label}>{link.label} ↗</a>)}
        </div>
        {!lineGroupUrl && <small className="link-notice">LINE 群組連結待更新</small>}
      </Reveal>
      <img src="assets/logo.jpg" alt="" className="contact-logo" />
    </section>
  );
}
