// API para refugios
import { getApiBase } from './apiBase';

// Note: REACT_APP_API_REFUGIOS/REACT_APP_API_IP_REFUGIOS in .env may include the
// path segment (e.g. http://localhost:8081/api/refugios). getApiBase keeps that.
const BASE_URL = getApiBase('REFUGIOS');

export async function getAllRefugios() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Error al obtener refugios");
  return await res.json();
}

export async function getRefugiosByEmpresa(empresaId) {
  const res = await fetch(`${BASE_URL}/empresa/${empresaId}`);
  if (!res.ok) throw new Error("Error al obtener refugios");
  return await res.json();
}

export async function registrarRefugio(refugio) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(refugio)
  });
  if (!res.ok) throw new Error("Error al registrar refugio");
  return await res.json();
}

export async function getRefugioById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Error al obtener refugio");
  return await res.json();
}
