import { getApiBase } from './apiBase';

const API_BASE = getApiBase('CHATS');

// Cache perfilIds that returned 404 for participant listing to avoid
// repeated requests that flood the network while the backend route is missing
const _notFoundParticipantCache = new Set();

export async function getChatBySolicitud(solicitudId) {
  const res = await fetch(`${API_BASE}/solicitud/${solicitudId}`);
  return res.ok ? res.json() : null;
}

export async function sendMessage(chatId, payload) {
  const res = await fetch(`${API_BASE}/${chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.ok ? res.json() : null;
}

export async function getMessages(chatId) {
  const res = await fetch(`${API_BASE}/${chatId}/messages`);
  if (!res.ok) return [];
  try {
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function getChatById(chatId) {
  const res = await fetch(`${API_BASE}/${chatId}`);
  return res.ok ? res.json() : null;
}

export async function createChatBetween(perfilA, perfilB) {
  try {
    const res = await fetch(`${API_BASE}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perfilA, perfilB })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function getChatsByParticipant(perfilId) {
  if (!perfilId) return [];
  if (_notFoundParticipantCache.has(String(perfilId))) return [];

  const res = await fetch(`${API_BASE}/participant/${perfilId}`);
  if (!res.ok) {
    if (res.status === 404) {
      // remember this perfilId returned 404 to avoid spamming the backend
      _notFoundParticipantCache.add(String(perfilId));
    }
    return [];
  }
  try { return await res.json(); } catch (e) { return []; }
}
