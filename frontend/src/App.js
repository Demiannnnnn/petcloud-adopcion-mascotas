import React, { useState, useEffect } from 'react';
import Mascotas from './Mascotas';
import Usuarios from './Usuarios';
import Adopciones from './Adopciones';
import Navbar from './Navbar';
import LoginDemo from './LoginDemo';
import { Container, CssBaseline, Box, Typography } from '@mui/material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Footer from './Footer';
import DashboardAdmin from './DashboardAdmin';



function App({ initialSection }) {
  const [section, setSection] = useState(initialSection || 'mascotas');
  const [rol, setRol] = useState(null); // 'ADMIN' o 'USUARIO'
  const [usuario, setUsuario] = useState(null); // datos del usuario logueado
  const navigate = useNavigate();
  const location = useLocation();

  // Leer usuario/rol de localStorage al montar
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.rol) {
      setRol(user.rol);
      setUsuario(user);
    }
  }, []);

  // Guardar usuario/rol en localStorage al loguear
  const handleLogin = (rolNuevo, usuarioNuevo) => {
    setRol(rolNuevo);
    setUsuario(usuarioNuevo || null);
    if (usuarioNuevo) {
      localStorage.setItem('user', JSON.stringify({ ...usuarioNuevo, rol: rolNuevo }));
    }
    if (rolNuevo === 'ADMIN') {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/mascotas', { replace: true });
    }
  };

  // Logout: limpiar localStorage y estado
  const handleLogout = () => {
    setRol(null);
    setUsuario(null);
    setSection('mascotas');
    localStorage.removeItem('user');
    navigate('/mascotas', { replace: true });
  };

  // Sincronizar sección activa con la ruta
  useEffect(() => {
    const path = location.pathname.split('/')[1];
    if (path && path !== section) {
      setSection(path);
    }
  }, [location.pathname]);

  // Handler para navegación real
  const handleSectionChange = (key) => {
    setSection(key);
    navigate(`/${key}`);
  };

  return (
    <>
      <CssBaseline />
      {rol && (
        <Navbar
          onSectionChange={handleSectionChange}
          rol={rol}
          usuario={usuario}
          onLogout={handleLogout}
          activeSection={section}
        />
      )}
      <Container maxWidth="md" sx={{ mt: rol ? 4 : 0, p: 0 }}>
        <Box sx={{ bgcolor: rol ? '#f5f5f5' : 'transparent', p: rol ? 3 : 0, borderRadius: rol ? 2 : 0, minHeight: 400 }}>
          <Routes>
            {rol === 'ADMIN' && (
              <Route path="/dashboard" element={<DashboardAdmin />} />
            )}
            <Route path="/mascotas" element={
              rol ? <Mascotas rol={rol} usuario={usuario} refetchKey={section} /> :
                <Mascotas isPublic={true} onLoginRequest={() => navigate('/login')} />
            } />
            <Route path="/usuarios" element={rol === 'ADMIN' ? <Usuarios /> : <Typography variant="h6" color="error">Acceso solo para administradores.</Typography>} />
            <Route path="/adopciones" element={rol ? <Adopciones rol={rol} usuario={usuario} onMascotasChange={window.__refetchMascotas} /> : <Typography variant="h6" color="error">Inicia sesión para gestionar adopciones.</Typography>} />
            <Route path="/login" element={<LoginDemo onLogin={handleLogin} />} />
            <Route path="*" element={
              rol ? <Mascotas rol={rol} usuario={usuario} refetchKey={section} /> :
                <Mascotas isPublic={true} onLoginRequest={() => navigate('/login')} />
            } />
          </Routes>
        </Box>
        <Footer />
      </Container>
    </>
  );
}

export default App;
