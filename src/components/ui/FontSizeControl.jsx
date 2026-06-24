import { useEffect, useState } from "react";

const sizes = [
  { id: "small", label: "小" },
  { id: "medium", label: "中" },
  { id: "large", label: "大" },
];

export default function FontSizeControl({ fontSize, onChange }) {
  const [isNearFooter, setIsNearFooter] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearFooter(entry.isIntersecting),
      { threshold: 0.15 },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`font-size-control${isNearFooter ? " near-footer" : ""}`}
      aria-label="調整網站字體大小"
    >
      <span>字體</span>
      <div>
        {sizes.map((size) => (
          <button
            type="button"
            className={fontSize === size.id ? "active" : ""}
            aria-label={`切換為${size.label}字體`}
            aria-pressed={fontSize === size.id}
            onClick={() => onChange(size.id)}
            key={size.id}
          >
            {size.label}
          </button>
        ))}
      </div>
    </div>
  );
}
