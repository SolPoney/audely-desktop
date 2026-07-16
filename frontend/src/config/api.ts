// Utilise automatiquement le bon host selon l'appareil (PC ou téléphone sur le même WiFi)
const host = window.location.hostname;
export const API_URL = `http://${host}:3000`;
