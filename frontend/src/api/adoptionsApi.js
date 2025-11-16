const API_BASE = process.env.REACT_APP_API_ADOPTIONS;

export async function createAdoption(request) {
  const res = await fetch(`${API_BASE}/api/adoptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  return res;
}

export async function listAdoptionsBySolicitante(adoptanteId) {
  // backend expects `adoptanteId` as query param
  const res = await fetch(`${API_BASE}/api/adoptions?adoptanteId=${adoptanteId}`);
  return res.ok ? res.json() : [];
}

export async function listReceivedRequestsForMascotas(mascotaIds) {
  // mascotaIds: array of ids
  const csv = mascotaIds.join(',');
  const res = await fetch(`${API_BASE}/api/adoptions/received?mascotaIds=${encodeURIComponent(csv)}`);
  return res.ok ? res.json() : [];
}

export async function approveRequest(solicitudId, headers = {}, userId) {
  const h = { ...headers };
  if (userId) h['X-User-Id'] = String(userId);
  const res = await fetch(`${API_BASE}/api/adoptions/${solicitudId}/approve`, { method: 'PATCH', headers: h });
  return res;
}

export async function rejectRequest(solicitudId, motivo) {
  const res = await fetch(`${API_BASE}/api/adoptions/${solicitudId}/reject`, { method: 'PATCH', headers: { 'Content-Type': 'text/plain' }, body: motivo });
  return res;
}

export async function getAdoptionCount(adoptanteId) {
  const res = await fetch(`${API_BASE}/api/adoptions/count/${adoptanteId}`);
  return res.ok ? res.json() : { approvedCount: 0 };
}
//# solicitudes, chats, notificaciones