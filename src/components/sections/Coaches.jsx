import { coaches } from "../../data/siteContent";
import Eyebrow from "../ui/Eyebrow";
import Reveal from "../ui/Reveal";

export default function Coaches() {
  return (
    <section id="coaches" className="section coaches">
      <Reveal className="section-heading">
        <Eyebrow>MEET THE COACHES</Eyebrow>
        <h2>專業帶領，<br />讓每一次上場更有收穫。</h2>
      </Reveal>
      <div className="coach-grid">
        {coaches.map((coach, index) => (
          <Reveal
            as="article"
            className="coach-card"
            delay={index ? "delay" : ""}
            key={coach.name}
          >
            <div className="coach-profile">
              <div className="coach-avatar" aria-hidden="true">
                <span>{coach.initials}</span>
                <small>COACH</small>
              </div>
              <div>
                <p>{coach.englishName}</p>
                <h3>{coach.name} <small>教練</small></h3>
                <span>{coach.role}</span>
              </div>
            </div>
            <div className="coach-highlights">
              {coach.highlights.map((highlight) => <strong key={highlight}>{highlight}</strong>)}
            </div>
            <ul>
              {coach.credentials.map((credential) => <li key={credential}>{credential}</li>)}
            </ul>
          </Reveal>
        ))}
      </div>
      <p className="coach-photo-note">教練照片可於後續補上，版面已預留人物視覺位置。</p>
    </section>
  );
}
