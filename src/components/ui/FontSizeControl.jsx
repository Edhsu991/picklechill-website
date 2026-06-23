const sizes = [
  { id: "small", label: "小" },
  { id: "medium", label: "中" },
  { id: "large", label: "大" },
];

export default function FontSizeControl({ fontSize, onChange }) {
  return (
    <div className="font-size-control" aria-label="調整網站字體大小">
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
