// En production : VITE_API_URL est défini dans les variables d'env Vercel
// En local : détection automatique du host pour les tests sur téléphone (même WiFi)
export const API_URL = import.meta.env.VITE_API_URL
	?? `http://${window.location.hostname}:3000`;
