import { useEffect, useState } from "react";

const storageKey = "picklechill-theme";

function getInitialTheme() {
  const savedTheme = window.localStorage.getItem(storageKey);
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));

  return { theme, toggleTheme };
}
