import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Keep-alive : ping le backend toutes les 14 min pour éviter le spin-down Render
import { API_URL } from "./config/api";
setInterval(() => fetch(`${API_URL}/api/ping`).catch(() => {}), 14 * 60 * 1000);

// Déconnexion automatique si le serveur renvoie 401
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
  }
  return response;
};

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
