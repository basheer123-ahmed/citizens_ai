// Central API configuration
export const API_URL = "https://citizens-ai.onrender.com";

// Falling back to empty string in development for Vite proxy
const API_BASE = import.meta.env.VITE_API_URL || API_URL;

export default API_BASE;
