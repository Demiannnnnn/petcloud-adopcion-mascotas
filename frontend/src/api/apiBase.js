// Utility to resolve API base URLs at runtime
// - Prefers REACT_APP_API_BASE_URL if present (global override)
// - Otherwise selects between REACT_APP_API_<SERVICE> (localhost) and
//   REACT_APP_API_IP_<SERVICE> (LAN) based on window.location.hostname
// - Falls back to sensible localhost defaults for known services
function stripTrailingSlash(url) {
  return url ? url.replace(/\/$/, '') : url;
}

const DEFAULTS = {
  PETS: 'http://localhost:8082',
  USERS: 'http://localhost:8081',
  ADOPTIONS: 'http://localhost:8083',
  REFUGIOS: 'http://localhost:8084'
};

export function getApiBase(serviceKey) {
  // global override
  const globalBase = process.env.REACT_APP_API_BASE_URL;
  if (globalBase) return stripTrailingSlash(globalBase);

  const key = String(serviceKey || '').toUpperCase();

  // decide based on current host
  let host = '';
  try {
    host = window && window.location && window.location.hostname ? window.location.hostname : '';
  } catch (e) {
    host = '';
  }

  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';

  const localEnv = process.env[`REACT_APP_API_${key}`];
  const ipEnv = process.env[`REACT_APP_API_IP_${key}`];

  let resolved = '';
  if (isLocal) {
    resolved = localEnv || ipEnv || DEFAULTS[key] || '';
  } else {
    resolved = ipEnv || localEnv || DEFAULTS[key] || '';
  }

  if (!resolved) {
    console.warn(`getApiBase: no base found for service ${serviceKey}`);
    return '';
  }
  return stripTrailingSlash(resolved);
}

export default getApiBase;
