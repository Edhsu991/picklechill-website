import { siteLastUpdated } from "../../data/siteContent";

export default function VersionStamp() {
  return (
    <div className="version-stamp" aria-label={`網站更新時間 ${siteLastUpdated}`}>
      <span>UPDATED</span>
      <time dateTime={siteLastUpdated.replace(" ", "T")}>{siteLastUpdated}</time>
    </div>
  );
}
