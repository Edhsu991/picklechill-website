import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const buildTime = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
}).format(new Date());

export default defineConfig({
  plugins: [react()],
  base: "./",
  define: {
    __APP_BUILD_TIME__: JSON.stringify(buildTime),
  },
});
