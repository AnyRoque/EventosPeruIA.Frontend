import axios from "axios";
// Vite dirige /api al backend local del puerto 5166.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
});
export function getErrorMessage(error) {
  if (!error.response)
    return "No pudimos conectar con el servidor. Comprueba que el backend esté iniciado en el puerto 5166 e inténtalo de nuevo.";
  return (
    error.response.data?.mensaje ||
    "No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo."
  );
}
export default api;
