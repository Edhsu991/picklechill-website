import packageJson from "../../../package.json";

const buildTime = __APP_BUILD_TIME__;
const versionLabel = `v${packageJson.version}`;

export default function VersionStamp() {
  return (
    <div className="version-stamp" aria-label={`網站版本 ${versionLabel} 更新時間 ${buildTime}`}>
      <span>{versionLabel}</span>
      <time dateTime={buildTime.replace(" ", "T")}>{buildTime}</time>
    </div>
  );
}
