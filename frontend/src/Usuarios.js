import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Snackbar, Alert } from '@mui/material';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: '', email: '', telefono: '', username: '', password: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/usuarios');
      setUsuarios(await res.json());
    } catch (e) {
      setError('Error al cargar usuarios.');
    }
    setLoading(false);
  };

  // Obtener usuario actual y rol
  let user = JSON.parse(localStorage.getItem('user')) || {};
  // Forzar rol ADMIN si no está definido (para pruebas locales)
  if (!user.rol) user.rol = 'ADMIN';

  const handleEditClick = usuario => {
    setEditId(usuario.id);
    setEditForm({
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono,
      username: usuario.username,
      password: usuario.password || ''
    });
    setDialogOpen(true);
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`http://localhost:8080/api/usuarios/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setSuccess('Usuario actualizado correctamente.');
        setDialogOpen(false);
        setEditId(null);
        setEditForm({ nombre: '', email: '', telefono: '', username: '', password: '' });
        fetchUsuarios();
      } else {
        setError('Error al actualizar el usuario.');
      }
    } catch (e) {
      setError('Error de red al actualizar el usuario.');
    }
    setLoading(false);
  };

  const handleDelete = async id => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`http://localhost:8080/api/usuarios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Usuario eliminado correctamente.');
        fetchUsuarios();
      } else {
        setError('Error al eliminar el usuario.');
      }
    } catch (e) {
      setError('Error de red al eliminar el usuario.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 2, position: 'relative' }}>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
      <h2>Usuarios</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Username</TableCell>
              {user.rol === 'ADMIN' && <TableCell>Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map(u => (
              <TableRow key={u.id}>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.nombre}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.telefono}</TableCell>
                <TableCell>{u.username}</TableCell>
                {user.rol === 'ADMIN' && (
                  <TableCell>
                    <Button size="small" onClick={() => handleEditClick(u)}>Editar</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(u.id)}>Eliminar</Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de edición */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Editar usuario</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
            <TextField name="nombre" label="Nombre" value={editForm.nombre} onChange={handleEditChange} required />
            <TextField name="email" label="Email" value={editForm.email} onChange={handleEditChange} required
              error={!!editForm.email && !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(editForm.email)}
              helperText={!!editForm.email && !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(editForm.email) ? 'Email inválido' : ''}
            />
            <TextField
              name="telefono"
              label="Teléfono"
              value={editForm.telefono.replace(/^\+569/, '')}
              onChange={e => {
                let val = e.target.value.replace(/\D/g, '').slice(0, 8);
                setEditForm({ ...editForm, telefono: '+569' + val });
              }}
              required
              error={!!editForm.telefono && !/^\+569\d{8}$/.test(editForm.telefono)}
              helperText={!!editForm.telefono && !/^\+569\d{8}$/.test(editForm.telefono) ? 'Debe ser +569XXXXXXXX' : ''}
              InputProps={{ startAdornment: <span style={{ marginRight: 4, color: '#888' }}>+569</span> }}
              inputProps={{ maxLength: 8 }}
            />
            <TextField name="username" label="Username" value={editForm.username} onChange={handleEditChange} required />
            <TextField name="password" label="Contraseña" type="password" value={editForm.password} onChange={handleEditChange} required />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">Guardar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Usuarios;
