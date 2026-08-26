import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initCapacitor } from "./lib/capacitor-plugins";

function renderApp() {
  createRoot(document.getElementById("root")!).render(<App />);
}

// Initialize Capacitor native plugins (no-op in browser), then render
initCapacitor().then(renderApp).catch(renderApp);

