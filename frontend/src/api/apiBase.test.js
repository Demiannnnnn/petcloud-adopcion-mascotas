import getApiBase, { API_ENDPOINTS, getPetsServerBase } from './apiBase';

describe('apiBase', () => {
  test('resuelve servicios sin importar mayúsculas', () => {
    expect(getApiBase('users')).toBe('http://localhost:8081/api');
    expect(getApiBase('ADOPTIONS')).toBe('http://localhost:8083/api/adoptions');
    expect(getPetsServerBase()).toBe('http://localhost:8082');
  });

  test('servicio desconocido lanza error descriptivo', () => {
    expect(() => getApiBase('pagos')).toThrow(/pagos/);
    expect(() => getApiBase()).toThrow();
  });

  test('la tabla de endpoints es inmutable', () => {
    expect(Object.isFrozen(API_ENDPOINTS)).toBe(true);
  });
});
