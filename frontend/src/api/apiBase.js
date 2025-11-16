// Tabla única con los endpoints que usa el frontend.
// Modificar aquí si cambia algún puerto o ruta base.
export const API_ENDPOINTS = Object.freeze({
  BASE_URL: 'http://localhost',
  USERS: 'http://localhost:8081/api',
  PETS: 'http://localhost:8082/api',
  ADOPTIONS: 'http://localhost:8083/api/adoptions',
  CHATS: 'http://localhost:8083/api/chats',
  NOTIFICACIONES: 'http://localhost:8083/api/notificaciones',
  DONATIONS: 'http://localhost:8084/api/donaciones',
  REFUGIOS: 'http://localhost:8081/api/refugios',
  PETS_SERVER_BASE: 'http://localhost:8082'
});

function stripTrailingSlash(url) {
  return typeof url === 'string' ? url.replace(/\/+$/, '') : url;
}

export function getApiBase(serviceKey) {
  const key = String(serviceKey || '').toUpperCase();
  const endpoint = API_ENDPOINTS[key];

  if (!endpoint) {
    throw new Error(`❌ No existe una URL configurada para el servicio "${serviceKey}". Actualiza API_ENDPOINTS en src/api/apiBase.js.`);
  }

  return stripTrailingSlash(endpoint);
}

export function getPetsServerBase() {
  return getApiBase('PETS_SERVER_BASE');
}

export default getApiBase;
