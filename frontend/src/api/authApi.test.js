import { registrarPersona, registrarEmpresa } from './authApi';

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

describe('authApi', () => {
  test('registrarPersona formatea el RUT y envía JSON', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    const res = await registrarPersona({ rut: '123456785', correo: 'a@b.cl' });
    expect(res).toEqual({ success: true });
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe('http://localhost:8081/api/registro-persona');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ rut: '12.345.678-5', correo: 'a@b.cl' });
  });

  test('registrarPersona lanza error si la respuesta no es ok', async () => {
    global.fetch.mockResolvedValue({ ok: false });
    await expect(registrarPersona({ rut: '1-9' })).rejects.toThrow('Error de conexión');
  });

  test('registrarEmpresa envía FormData omitiendo nulos y formatea rutEmpresa', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    await registrarEmpresa({ rutEmpresa: '760864285', nombreEmpresa: 'Refugio', direccion: null });
    const body = global.fetch.mock.calls[0][1].body;
    expect(body).toBeInstanceOf(FormData);
    expect(body.get('rutEmpresa')).toBe('76.086.428-5');
    expect(body.get('nombreEmpresa')).toBe('Refugio');
    expect(body.has('direccion')).toBe(false);
  });
});
