import { cleanRut, formatRut } from './rut';

describe('rut utils', () => {
  test('cleanRut removes non numeric and letters except k', () => {
    expect(cleanRut('21.249.468-2')).toBe('212494682');
    expect(cleanRut('12.345.678-k')).toBe('12345678k');
    expect(cleanRut('abc12.3-4K')).toBe('1234K');
  });

  test('formatRut formats basic rut correctly', () => {
    expect(formatRut('212494682')).toBe('21.249.468-2');
    expect(formatRut('12345678k')).toBe('12.345.678-K');
    expect(formatRut('1')).toBe('1');
    expect(formatRut('')).toBe('');
  });
});

describe('validateRut / normalizedRut', () => {
  const { validateRut, normalizedRut } = require('./rut');

  test.each(['11.111.111-1', '12.345.678-5', '10.000.013-K', '10000013-k', '1.000.013-0', '6-K'])(
    'acepta RUT válido %s', (rut) => {
      expect(validateRut(rut)).toBe(true);
    });

  test.each(['12.345.678-9', '11.111.111-2', '1', '', null, undefined])(
    'rechaza %p', (rut) => {
      expect(validateRut(rut)).toBe(false);
    });

  test('normalizedRut deja solo dígitos y K mayúscula', () => {
    expect(normalizedRut('10.000.013-k')).toBe('10000013K');
    expect(normalizedRut('')).toBe('');
  });

  test('cleanRut acepta números y trata 0 como valor', () => {
    expect(cleanRut(0)).toBe('0');
    expect(cleanRut(null)).toBe('');
  });
});
