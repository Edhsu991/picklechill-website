import { useEffect } from "react";

export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(onDismiss, 2800);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div className={`toast${message ? " show" : ""}`} role="status">
      {message}
    </div>
  );
}
