import React, { useContext } from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthContext, AuthProvider } from './AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

jest.mock('../components/Navbar', () => () => <nav>navbar</nav>);
// react-router-dom v7 usa "exports" que el Jest de react-scripts no resuelve; se reemplaza Navigate.
jest.mock('react-router-dom', () => ({ Navigate: ({ to }) => <p>{`redirige a ${to}`}</p> }), { virtual: true });

let ctx;
function Capture() {
  ctx = useContext(AuthContext);
  return <span>{ctx.user ? ctx.user.perfil.rut : 'anon'}</span>;
}

beforeEach(() => localStorage.clear());

describe('AuthProvider', () => {
  test('login normaliza el RUT y persiste en localStorage; logout limpia', () => {
    render(<AuthProvider><Capture /></AuthProvider>);
    expect(screen.getByText('anon')).toBeInTheDocument();

    act(() => ctx.login({ perfil: { rut: '10.000.013-k', id: 1 } }));
    expect(screen.getByText('10000013K')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('user')).perfil.rut).toBe('10000013K');

    act(() => ctx.logout());
    expect(screen.getByText('anon')).toBeInTheDocument();
    expect(localStorage.getItem('user')).toBeNull();
  });

  test('restaura el usuario guardado al montar', () => {
    localStorage.setItem('user', JSON.stringify({ perfil: { rut: '11111111-1' } }));
    render(<AuthProvider><Capture /></AuthProvider>);
    expect(screen.getByText('11111111-1')).toBeInTheDocument();
  });
});

describe('ProtectedRoute', () => {
  function renderAt(user) {
    return render(
      <AuthContext.Provider value={{ user }}>
        <ProtectedRoute><p>contenido privado</p></ProtectedRoute>
      </AuthContext.Provider>
    );
  }

  test('sin usuario redirige a /login', () => {
    renderAt(null);
    expect(screen.getByText('redirige a /login')).toBeInTheDocument();
    expect(screen.queryByText('contenido privado')).toBeNull();
  });

  test('con usuario muestra navbar y contenido', () => {
    renderAt({ perfil: { id: 1 } });
    expect(screen.getByText('navbar')).toBeInTheDocument();
    expect(screen.getByText('contenido privado')).toBeInTheDocument();
  });
});
