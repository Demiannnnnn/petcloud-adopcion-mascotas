export function normalizeTamanio(raw) {
  if (raw === null || raw === undefined) return '';
  try {
    const s = String(raw).trim().toLowerCase();
    if (!s) return '';
    if (s.includes('peque')) return 'Pequeño';
    if (s.includes('med') || s.includes('medio')) return 'Mediano';
    if (s.includes('grand')) return 'Grande';
    // Accept peso values like '10kg', '10 kg', '10' — return as-is so the UI can display it
    if (s.includes('kg') || /^\d+(?:[.,]\d+)?$/.test(s)) return String(raw);
    // fallback: return original trimmed string with first char uppercased
    return String(raw).trim();
  } catch (e) {
    return String(raw || '');
  }
}

export function isPesoLike(raw) {
  if (raw === null || raw === undefined) return false;
  const s = String(raw).trim().toLowerCase();
  if (!s) return false;
  // contains kg or is a pure number
  if (s.includes('kg')) return true;
  if (/^\d+(?:[.,]\d+)?$/.test(s)) return true;
  return false;
}

export function formatPeso(raw) {
  if (raw === null || raw === undefined) return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (s.toLowerCase().includes('kg')) return s;
  if (/^\d+(?:[.,]\d+)?$/.test(s)) return `${s} kg`;
  return s;
}
