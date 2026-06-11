import { values } from "../../data/siteContent";
import Eyebrow from "../ui/Eyebrow";
import Reveal from "../ui/Reveal";

export default function About() {
  return (
    <section id="about" className="section about">
      <Reveal className="section-heading">
        <Eyebrow>ABOUT PICKLECHILL</Eyebrow>
        <h2>不只打球，<br />更是一起享受生活。</h2>
      </Reveal>
      <Reveal className="about-content">
        <p className="lead">「匹咖揪」，台南一揪就來打匹克球！從 8 到 80 歲，都能輕鬆享受這項新運動。</p>
        <p>匹克球結合桌球、羽球與網球的樂趣，簡單好上手。我們在台南提供個人與團體教學、輕鬆揪團及企業活動規劃。不論第一次接觸，或正在找固定球友，都歡迎一起上場。</p>
        <div className="values">
          {values.map((item) => <article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}
        </div>
      </Reveal>
    </section>
  );
}
