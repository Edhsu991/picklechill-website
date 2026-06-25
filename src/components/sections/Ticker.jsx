const tickerItems = ["PICKLEBALL", "PLAY TOGETHER", "GOOD VIBES", "PICKLECHILL TAINAN"];

export default function Ticker() {
  const tickerGroup = (groupIndex) => (
    <div className="ticker-group" aria-hidden={groupIndex > 0} key={groupIndex}>
      {tickerItems.map((item) => (
        <span className="ticker-item" key={`${groupIndex}-${item}`}>
          <span>{item}</span>
          <b>✦</b>
        </span>
      ))}
    </div>
  );

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {[0, 1].map((groupIndex) => tickerGroup(groupIndex))}
      </div>
    </div>
  );
}
