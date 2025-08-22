import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';

function Navbar({ onSectionChange, rol, usuario, onLogout, activeSection }) {
  const navItems = [
    ...(rol === 'ADMIN' ? [{ key: 'dashboard', label: 'Dashboard' }] : []),
    { key: 'mascotas', label: 'Mascotas' },
    ...(rol === 'ADMIN' ? [{ key: 'usuarios', label: 'Usuarios' }] : []),
    { key: 'adopciones', label: 'Adopciones' }
  ];
  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
          Adopción de Mascotas
        </Typography>
        {navItems.map(item => (
          <Button
            key={item.key}
            color={activeSection === item.key ? 'secondary' : 'inherit'}
            variant={activeSection === item.key ? 'contained' : 'text'}
            sx={{ mx: 0.5, fontWeight: activeSection === item.key ? 700 : 400 }}
            onClick={() => onSectionChange(item.key)}
          >
            {item.label}
          </Button>
        ))}
        <Box sx={{ flexGrow: 1 }} />
        {rol && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: rol === 'ADMIN' ? 'secondary.main' : 'primary.light', fontWeight: 700 }}>
              {rol === 'ADMIN' ? 'A' : (usuario?.nombre?.[0] || 'U')}
            </Avatar>
            <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600, mr: 2 }}>
              {rol === 'ADMIN' ? 'Administrador' : usuario?.nombre || ''}
            </Typography>
            <Button color="inherit" onClick={onLogout} sx={{ fontWeight: 600 }}>
              Cerrar sesión
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
