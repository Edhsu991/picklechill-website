import { services } from "../../data/siteContent";
import Eyebrow from "../ui/Eyebrow";
import Reveal from "../ui/Reveal";

export default function Services() {
  return (
    <section id="courses" className="section courses">
      <Reveal className="section-heading">
        <Eyebrow>WHAT WE DO</Eyebrow>
        <h2>想打匹克球，<br />找匹咖揪就對了。</h2>
      </Reveal>
      <div className="course-grid">
        {services.map((service, index) => (
          <Reveal
            as="article"
            className={`course-card${service.variant ? ` ${service.variant}` : ""}`}
            delay={index % 2 ? "delay" : ""}
            key={service.number}
          >
            <div className="course-number">{service.number}</div>
            {service.badge && <div className="course-badge">{service.badge}</div>}
            <div className="course-icon">{service.icon}</div>
            <div><p>{service.type}</p><h3>{service.title}</h3><span>{service.description}</span></div>
            {service.note && <small>{service.note}</small>}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
