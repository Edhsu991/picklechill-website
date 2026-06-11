const tickerItems = ["PICKLEBALL", "PLAY TOGETHER", "GOOD VIBES", "PICKLECHILL TAINAN"];

export default function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div>
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <span className="ticker-item" key={`${item}-${index}`}><span>{item}</span><b>✦</b></span>
        ))}
      </div>
    </div>
  );
}
