import useReveal from "../../hooks/useReveal";

export default function Reveal({ as: Tag = "div", className = "", delay = "", children }) {
  const ref = useReveal();
  const classes = ["reveal", delay, className].filter(Boolean).join(" ");

  return (
    <Tag ref={ref} className={classes}>
      {children}
    </Tag>
  );
}
