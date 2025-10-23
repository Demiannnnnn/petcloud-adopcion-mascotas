// Utilities to clean and format Chilean RUT values
export function cleanRut(value) {
  if (!value && value !== 0) return '';
  return String(value).replace(/[^0-9kK]/g, '');
}

export function formatRut(value) {
  const s = cleanRut(value);
  if (!s) return '';
  if (s.length === 1) return s;
  const dv = s.slice(-1);
  let num = s.slice(0, -1);
  // Group digits from right in blocks of 3
  const rev = num.split('').reverse().join('');
  const parts = rev.match(/.{1,3}/g) || [rev];
  const withDots = parts.join('.').split('').reverse().join('');
  return `${withDots}-${dv.toUpperCase()}`;
}

// Optionally return only the numeric part plus verifier
export function normalizedRut(value) {
  const s = cleanRut(value);
  return s ? s.toUpperCase() : '';
}
