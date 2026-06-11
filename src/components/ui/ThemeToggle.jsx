export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={isDark ? "切換為淺色模式" : "切換為深色模式"}
      aria-pressed={isDark}
      onClick={onToggle}
    >
      <span className="theme-icon" aria-hidden="true">{isDark ? "☀" : "◐"}</span>
      <span className="theme-label">{isDark ? "LIGHT" : "DARK"}</span>
    </button>
  );
}
