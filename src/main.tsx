
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// Register the Service Worker for PWA (silent logging only)
registerSW({
  immediate: true,
  onRegistered: (registration) => console.log("SW registered", registration),
  onNeedRefresh: () => console.log("SW needs refresh"),
  onOfflineReady: () => console.log("SW offline ready"),
});

createRoot(document.getElementById("root")!).render(<App />);
  
