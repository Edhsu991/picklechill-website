import useReveal from "../../hooks/useReveal";

export default function Reveal({ as: Tag = "div", className = "", delay = "", children }) {
  const { ref, isVisible } = useReveal();
  const classes = ["reveal", isVisible ? "visible" : "", delay, className].filter(Boolean).join(" ");

  return (
    <Tag ref={ref} className={classes}>
      {children}
    </Tag>
  );
}
