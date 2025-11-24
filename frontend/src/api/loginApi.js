// src/api/loginApi.js
import sistemaApi from "./api";

const authEndpoint = "/auth/";

/**
 * 🔐 Iniciar sesión
 */
export async function login(username, password) {
  try {
    const payload = { username, password };
    
    // ✅ CORREGIDO: antes usaba `${authEndpoint}login/`
    const res = await sistemaApi.post(authEndpoint, payload);

    if (res.data?.access) {
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      if (res.data?.username) {
        localStorage.setItem('username', res.data.username);
      }
    }

    return res.data;
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    throw new Error("Error al iniciar sesión. Verifique sus credenciales.");
  }
}

/**
 * 🚪 Cerrar sesión
 */
export async function logout() {
  const refresh = localStorage.getItem("refresh_token");

  try {
    if (refresh) {
      await sistemaApi.post(`${authEndpoint}logout/`, { refresh_token: refresh });
    }
  } catch (err) {
    console.warn("⚠️ Logout remoto falló:", err?.message || err);
  }

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
}

export default { login, logout };
