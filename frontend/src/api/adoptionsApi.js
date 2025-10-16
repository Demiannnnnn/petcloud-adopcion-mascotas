const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8083';

export async function createAdoption(request) {
  const res = await fetch(`${API_BASE}/api/adoptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  return res;
}

export async function listAdoptionsBySolicitante(solicitanteId) {
  const res = await fetch(`${API_BASE}/api/adoptions?solicitanteId=${solicitanteId}`);
  return res.ok ? res.json() : [];
}
//# solicitudes, chats, notificaciones