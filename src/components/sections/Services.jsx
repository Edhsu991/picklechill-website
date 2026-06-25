import { useState } from "react";
import { services } from "../../data/siteContent";
import Eyebrow from "../ui/Eyebrow";
import Reveal from "../ui/Reveal";

export default function Services() {
  const [activeService, setActiveService] = useState(services[0]?.number);

  return (
    <section id="courses" className="section courses">
      <Reveal className="section-heading">
        <Eyebrow>WHAT WE DO</Eyebrow>
        <h2>想打匹克球，<br />找匹咖揪就對了。</h2>
      </Reveal>
      <div className="course-grid">
        {services.map((service, index) => {
          const isActive = activeService === service.number;
          const detailsId = `course-details-${service.number}`;

          return (
            <Reveal
              as="article"
              className={`course-card${service.variant ? ` ${service.variant}` : ""}${isActive ? " expanded" : ""}`}
              delay={index % 2 ? "delay" : ""}
              key={service.number}
            >
              <button
                type="button"
                className="course-card-trigger"
                aria-expanded={isActive}
                aria-controls={detailsId}
                onClick={() => setActiveService(isActive ? null : service.number)}
              >
                <div className="course-number">{service.number}</div>
                {service.badge && <div className="course-badge">{service.badge}</div>}
                <div className="course-icon">{service.icon}</div>
                <div>
                  <p>{service.type}</p>
                  <h3>{service.title}</h3>
                  <span>{service.description}</span>
                </div>
                <div className="course-expand">
                  <span>{isActive ? "收合資訊" : "查看更多"}</span>
                  <strong>{isActive ? "−" : "+"}</strong>
                </div>
              </button>

              <div className="course-details" id={detailsId} hidden={!isActive}>
                <ul className="course-detail-list">
                  {service.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                <div className="course-audience">
                  <strong>適合對象</strong>
                  <span>{service.audience}</span>
                </div>
                {service.note && <small className="course-note">{service.note}</small>}
                <p className="course-action">{service.action}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
