import { buildMediaUrl } from './mediaUtils';

const API = 'http://localhost:8082';

describe('buildMediaUrl', () => {
  test('vacíos devuelven cadena vacía', () => {
    expect(buildMediaUrl(API, '')).toBe('');
    expect(buildMediaUrl(API, null)).toBe('');
    expect(buildMediaUrl(API, '   ')).toBe('');
  });

  test('rutas /uploads/ se reescriben al proxy /api/media/', () => {
    expect(buildMediaUrl(API, '/uploads/tom.jpg')).toBe(`${API}/api/media/tom.jpg`);
    expect(buildMediaUrl(API, 'http://otro-host:9000/uploads/a/b.png')).toBe(`${API}/api/media/a/b.png`);
  });

  test('nombre de archivo suelto se asume en uploads', () => {
    expect(buildMediaUrl(API, 'firulais.jpg')).toBe(`${API}/api/media/firulais.jpg`);
  });

  test('otras rutas absolutas solo se prefijan', () => {
    expect(buildMediaUrl(API, '/static/x.png')).toBe(`${API}/static/x.png`);
  });

  test('URLs externas, data: y blob: pasan sin cambios', () => {
    expect(buildMediaUrl(API, 'https://cdn.example.com/x.jpg')).toBe('https://cdn.example.com/x.jpg');
    expect(buildMediaUrl(API, 'data:image/png;base64,AAA')).toBe('data:image/png;base64,AAA');
    expect(buildMediaUrl(API, 'blob:http://localhost/123')).toBe('blob:http://localhost/123');
  });
});
