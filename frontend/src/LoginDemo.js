import React, { useState } from 'react';
import { Box, Button, Typography, Paper, TextField, Alert, CircularProgress, Snackbar } from '@mui/material';

function LoginDemo({ onLogin }) {
  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', username: '', password: '' });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Registro de usuario
  const handleRegister = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    // Validaciones
    if (!form.nombre || !form.email || !form.telefono || !form.username || !form.password) {
      setError('Completa todos los campos.');
      setLoading(false);
      return;
    }
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Ingresa un email válido.');
      setLoading(false);
      return;
    }
    // Validar teléfono chileno +569xxxxxxxx
    const telRegex = /^\+569\d{8}$/;
    if (!telRegex.test(form.telefono)) {
      setError('El teléfono debe ser chileno y tener el formato +569XXXXXXXX.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:8080/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const usuario = await res.json();
        setSuccess('Usuario registrado correctamente.');
        onLogin('USUARIO', usuario);
      } else {
        setError('No se pudo registrar el usuario.');
      }
    } catch (e) {
      setError('Error de red al registrar usuario.');
    }
    setLoading(false);
  };

  // Login profesionalizado
  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (!loginEmail || !loginPassword) {
      setError('Ingresa tu email y contraseña.');
      setLoading(false);
      return;
    }
    // Admin hardcodeado
    if (loginEmail === 'admin' && loginPassword === 'admin') {
      setSuccess('Bienvenido admin.');
      onLogin('ADMIN', { username: 'admin', email: 'admin', rol: 'ADMIN' });
      setLoading(false);
      return;
    }
    // Usuarios normales
    try {
      const res = await fetch('http://localhost:8080/api/usuarios');
      if (res.ok) {
        const usuarios = await res.json();
        const usuario = usuarios.find(u => u.email === loginEmail);
        if (usuario) {
          if (usuario.password && usuario.password === loginPassword) {
            setSuccess('Bienvenido.');
            onLogin('USUARIO', usuario);
          } else {
            setError('Contraseña incorrecta.');
          }
        } else {
          setError('Usuario no encontrado.');
        }
      } else {
        setError('Error al buscar usuarios.');
      }
    } catch (e) {
      setError('Error de red al buscar usuarios.');
    }
    setLoading(false);
  };

  if (mode === 'register') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f6f8' }}>
        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%' }}>{error}</Alert>
        </Snackbar>
        <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ width: '100%' }}>{success}</Alert>
        </Snackbar>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
        <Paper elevation={4} sx={{ p: 5, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5" gutterBottom>Registrar nuevo usuario</Typography>
          <form onSubmit={handleRegister} style={{ width: '100%' }}>
            <TextField label="Nombre" name="nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} fullWidth sx={{ mb: 2 }} required />
            <TextField label="Email" name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} fullWidth sx={{ mb: 2 }} required />
            <TextField
              label="Teléfono"
              name="telefono"
              value={form.telefono.replace(/^\+569/, '')}
              onChange={e => {
                // Solo permitir números y máximo 8 dígitos
                let val = e.target.value.replace(/\D/g, '').slice(0, 8);
                setForm({ ...form, telefono: '+569' + val });
              }}
              fullWidth
              sx={{ mb: 2 }}
              required
              InputProps={{ startAdornment: <span style={{ marginRight: 4, color: '#888' }}>+569</span> }}
              inputProps={{ maxLength: 8 }}
            />
            <TextField label="Nombre de usuario" name="username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} fullWidth sx={{ mb: 2 }} required />
            <TextField label="Contraseña" name="password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} fullWidth sx={{ mb: 2 }} required />
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>Registrar y entrar</Button>
            <Button onClick={() => setMode('login')} sx={{ mt: 1 }} fullWidth disabled={loading}>Volver</Button>
          </form>
        </Paper>
      </Box>
    );
  }

  if (mode === 'login') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f6f8' }}>
        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%' }}>{error}</Alert>
        </Snackbar>
        <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ width: '100%' }}>{success}</Alert>
        </Snackbar>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
        <Paper elevation={4} sx={{ p: 5, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5" gutterBottom>Iniciar sesión</Typography>
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <TextField label="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} fullWidth sx={{ mb: 2 }} required />
            <TextField label="Contraseña" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} fullWidth sx={{ mb: 2 }} required />
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>Iniciar sesión</Button>
            <Button onClick={() => setMode('register')} sx={{ mt: 1 }} fullWidth disabled={loading}>Registrarse</Button>
          </form>
        </Paper>
      </Box>
    );
  }

  // No hay pantalla de selección, solo login/registro
}

export default LoginDemo;
