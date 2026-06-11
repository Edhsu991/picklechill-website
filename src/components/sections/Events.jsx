import { eventDetails } from "../../data/siteContent";
import Eyebrow from "../ui/Eyebrow";
import Reveal from "../ui/Reveal";

export default function Events() {
  return (
    <section id="events" className="section event-section">
      <Reveal className="event-copy">
        <Eyebrow light>WEEKLY OPEN PLAY</Eyebrow>
        <h2>本週，<br />一起打球！</h2>
        <p>固定揪團、現場分組、新手友善，歡迎任何程度的球友加入。</p>
        <a href="#contact" className="button button-yellow">前往 LINE 群組報名 <b>↗</b></a>
      </Reveal>
      <Reveal className="event-details" delay="delay">
        {eventDetails.map((item) => (
          <article key={item.label}>
            <span className="detail-icon">{item.icon}</span>
            <p>{item.label}</p>
            <h3>{item.lines[0]}<br />{item.smallLastLine ? <small>{item.lines[1]}</small> : item.lines[1]}</h3>
          </article>
        ))}
        <div className="event-note">球與球拍用具皆有提供</div>
      </Reveal>
    </section>
  );
}
