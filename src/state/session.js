import { ref } from "vue";
function readSession() {
  try {
    const value = JSON.parse(sessionStorage.getItem("eventos-session"));
    return value?.token && value?.correo ? value : null;
  } catch {
    return null;
  }
}
export const session = ref(readSession());
export function saveSession(user) {
  session.value = user;
  sessionStorage.setItem("eventos-session", JSON.stringify(user));
}
export function clearSession() {
  session.value = null;
  sessionStorage.removeItem("eventos-session");
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
}
