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

export function validateRut(rut) {
  if (!rut) return false;
  const clean = cleanRut(rut);
  if (clean.length < 2) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();

  let sum = 0;
  let multiplier = 2;

  // Loop backwards through the body
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i), 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const res = 11 - (sum % 11);
  let calculatedDv = '';
  if (res === 11) calculatedDv = '0';
  else if (res === 10) calculatedDv = 'K';
  else calculatedDv = String(res);

  return calculatedDv === dv;
}
