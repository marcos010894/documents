// Configuração centralizada da API
const isLocalhost = typeof window !== 'undefined' && 
  ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);

export const API_BASE_URL = isLocalhost 
  ? "http://127.0.0.1:8000"
  : "https://api-globaltty3-little-sea-9182.fly.dev";

export const API_URL = API_BASE_URL;
