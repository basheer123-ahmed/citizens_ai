// Central API configuration
// In production (Render), VITE_API_URL is set to the backend URL.
// In development, it falls back to an empty string so relative /api/ paths work via the Vite proxy.
const API_BASE = import.meta.env.VITE_API_URL || '';

export default API_BASE;
