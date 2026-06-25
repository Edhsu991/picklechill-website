import { venueInfo } from "../../data/siteContent";
import Eyebrow from "../ui/Eyebrow";
import Reveal from "../ui/Reveal";

export default function VenueInfo() {
  return (
    <section className="venue-page">
      <Reveal className="venue-hero">
        <Eyebrow>{venueInfo.eyebrow}</Eyebrow>
        <h1>{venueInfo.title}</h1>
        <p className="venue-summary">{venueInfo.summary}</p>
      </Reveal>

      <div className="venue-layout">
        <Reveal as="article" className="venue-card">
          <span>LOCATION</span>
          <h2>{venueInfo.location}</h2>
          <p>{venueInfo.addressHint}</p>
          <p>從網球場入口進來後，左轉走到底就是匹克球場。</p>
        </Reveal>

        <Reveal as="ol" className="venue-steps" delay="delay">
          {venueInfo.steps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </li>
          ))}
        </Reveal>
      </div>

      <Reveal className="venue-map-wrap">
        <div className="subsection-heading">
          <h3>Google Map</h3>
          <a href={venueInfo.mapExternalUrl} target="_blank" rel="noopener noreferrer">
            開啟 Google Maps ↗
          </a>
        </div>
        <div className="venue-map">
          <iframe
            title="台南一中網球場 Google Map"
            src={venueInfo.mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <p className="venue-map-note">
          導航請定位「{venueInfo.location}」，到入口後依照上方路線走到底。
        </p>
      </Reveal>

      <Reveal className="venue-gallery-wrap">
        <div className="subsection-heading">
          <h3>照片導覽</h3>
          <small>照片放在 {venueInfo.photoFolder}</small>
        </div>
        <div className="venue-gallery">
          {venueInfo.gallery.map((photo) => (
            <article className="venue-photo-card" key={photo.label}>
              {photo.src ? (
                <img src={photo.src} alt={photo.label} />
              ) : (
                <div className="venue-photo-placeholder">
                  <strong>{photo.label}</strong>
                  <span>待補照片</span>
                </div>
              )}
              <div>
                <h4>{photo.label}</h4>
                <p>{photo.description}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="venue-photo-help">
          之後照片建議放在 <code>{venueInfo.photoFolder}</code>，並在 <code>src/data/siteContent.js</code> 的
          gallery 裡填入像 <code>{venueInfo.photoPathExample}</code> 這樣的路徑。
        </p>
      </Reveal>
    </section>
  );
}
