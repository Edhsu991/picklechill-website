import { heroHighlights } from "../../data/siteContent";
import Eyebrow from "../ui/Eyebrow";
import Reveal from "../ui/Reveal";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-orb orb-one" />
      <div className="hero-orb orb-two" />
      <Reveal className="hero-copy">
        <Eyebrow>TAINAN PICKLEBALL COMMUNITY</Eyebrow>
        <h1>一起上場，<br /><em>匹</em>出好心情。</h1>
        <p className="hero-intro">從第一次拿起球拍，到找到一起打球的朋友。<br />匹咖揪陪你輕鬆開始，痛快開打。</p>
        <div className="hero-actions">
          <a href="#contact" className="button button-primary">加入下次揪團 <b>↗</b></a>
          <a href="#events" className="button button-ghost">查看活動資訊</a>
        </div>
        <div className="hero-meta">
          {heroHighlights.map((item) => <div key={item.title}><strong>{item.title}</strong><span>{item.detail}</span></div>)}
        </div>
      </Reveal>
      <Reveal className="hero-visual" delay="delay">
        <div className="hero-card"><img src="assets/event-poster.png" alt="匹咖揪每週揪團招生資訊" /></div>
        <div className="floating-tag tag-top">PICKLE<br />&amp; CHILL</div>
        <div className="floating-tag tag-bottom"><span>●</span> 新手也能輕鬆加入</div>
      </Reveal>
    </section>
  );
}
