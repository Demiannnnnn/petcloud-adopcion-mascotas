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
