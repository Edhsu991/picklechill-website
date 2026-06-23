import { useEffect, useState } from "react";

const STORAGE_KEY = "picklechill-font-size";
const VALID_SIZES = ["small", "medium", "large"];

export default function useFontSize() {
  const [fontSize, setFontSize] = useState(() => {
    const savedSize = localStorage.getItem(STORAGE_KEY);
    return VALID_SIZES.includes(savedSize) ? savedSize : "medium";
  });

  useEffect(() => {
    document.documentElement.dataset.fontSize = fontSize;
    localStorage.setItem(STORAGE_KEY, fontSize);
  }, [fontSize]);

  return { fontSize, setFontSize };
}
