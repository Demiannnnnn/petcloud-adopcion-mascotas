import { normalizeTamanio, isPesoLike, formatPeso } from './mascotaUtils';

describe('normalizeTamanio', () => {
  test.each([
    ['pequeño', 'Pequeño'],
    ['PEQUENO', 'Pequeño'],
    ['Mediano', 'Mediano'],
    ['grande', 'Grande'],
    ['10kg', '10kg'],
    ['7,5', '7,5'],
    ['  enorme ', 'enorme'],
    ['', ''],
    [null, ''],
    [undefined, ''],
  ])('%p -> %p', (entrada, esperado) => {
    expect(normalizeTamanio(entrada)).toBe(esperado);
  });
});

describe('isPesoLike / formatPeso', () => {
  test('detecta pesos numéricos o con kg', () => {
    expect(isPesoLike('12')).toBe(true);
    expect(isPesoLike('3.5')).toBe(true);
    expect(isPesoLike('4 KG')).toBe(true);
    expect(isPesoLike('grande')).toBe(false);
    expect(isPesoLike('')).toBe(false);
    expect(isPesoLike(null)).toBe(false);
  });

  test('agrega la unidad solo cuando falta', () => {
    expect(formatPeso('12')).toBe('12 kg');
    expect(formatPeso('12 kg')).toBe('12 kg');
    expect(formatPeso('Mediano')).toBe('Mediano');
    expect(formatPeso(undefined)).toBe('');
  });
});
