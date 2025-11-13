import { getApiBase } from './apiBase';

export const USERS_API_BASE = getApiBase('USERS');

// users-service exposes a Perfil endpoint at /perfil/{id} which returns PerfilDTO
export async function getUserById(id) {
	if (!id) return null;
	try {
		const res = await fetch(`${USERS_API_BASE}/perfil/${id}`);
		if (!res.ok) return null;
		return await res.json();
	} catch (e) {
		console.warn('getUserById failed', e);
		return null;
	}
}

export async function updatePerfil(id, payload) {
	if (!id) return null;
	try {
		const res = await fetch(`${USERS_API_BASE}/perfil/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		if (!res.ok) return null;
		return await res.json();
	} catch (e) {
		console.warn('updatePerfil failed', e);
		return null;
	}
}

export async function changePassword(perfilId, currentPassword, newPassword) {
	if (!perfilId) return { ok: false };
	try {
		const res = await fetch(`${USERS_API_BASE}/perfil/${perfilId}/change-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ currentPassword, newPassword })
		});
		return { ok: res.ok, status: res.status };
	} catch (e) {
		console.warn('changePassword failed', e);
		return { ok: false };
	}
}

export async function getContacts(ownerPerfilId) {
	if (!ownerPerfilId) return [];
	try {
		const res = await fetch(`${USERS_API_BASE}/contactos/participant/${ownerPerfilId}`);
		if (!res.ok) return [];
		return await res.json();
	} catch (e) {
		console.warn('getContacts failed', e);
		return [];
	}
}

export async function addContact(ownerPerfilId, contactoPerfilId) {
	if (!ownerPerfilId || !contactoPerfilId) return null;
	try {
		const res = await fetch(`${USERS_API_BASE}/contactos`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ownerPerfilId, contactoPerfilId })
		});
		if (!res.ok) return null;
		return await res.json();
	} catch (e) {
		console.warn('addContact failed', e);
		return null;
	}
}