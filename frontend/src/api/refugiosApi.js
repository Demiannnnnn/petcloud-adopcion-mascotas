// API para refugios
const BASE_URL =
  window.location.hostname === "localhost"
    ? process.env.REACT_APP_API_REFUGIOS
    : process.env.REACT_APP_API_IP_REFUGIOS;

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
