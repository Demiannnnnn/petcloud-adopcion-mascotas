
import React, { useState } from 'react';
import { Box, Button, TextField, MenuItem, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';


function AdopcionForm({ mascotas, usuarios, adopcion, onClose, rol, usuarioActual }) {
  // Filtrar solo mascotas disponibles
  const mascotasDisponibles = mascotas.filter(m => !m.adoptado);
  // Si usuario normal, solo puede seleccionarse a sí mismo
  const usuariosDisponibles = rol === 'ADMIN' ? usuarios : usuarioActual ? [usuarioActual] : [];

  const [form, setForm] = useState({
    mascotaId: adopcion?.mascota?.id || '',
    usuarioId: adopcion?.usuario?.id || usuarioActual?.id || '',
    fechaAdopcion: adopcion?.fechaAdopcion || '',
    notas: adopcion?.notas || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = !!adopcion;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (!form.mascotaId || !form.usuarioId || !form.fechaAdopcion) {
      setError('Todos los campos son obligatorios.');
      setLoading(false);
      return;
    }
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `http://localhost:8080/api/adopciones/${adopcion.id}` : 'http://localhost:8080/api/adopciones';
    const mascota = mascotas.find(m => m.id === Number(form.mascotaId));
    const usuario = usuarios.find(u => u.id === Number(form.usuarioId));
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mascota,
          usuario,
          fechaAdopcion: form.fechaAdopcion,
          notas: form.notas
        })
      });
      if (res.ok) {
        setSuccess(isEdit ? 'Adopción actualizada correctamente.' : 'Adopción registrada correctamente.');
        setTimeout(() => { onClose(); }, 800);
      } else {
        setError('Error al guardar la adopción.');
      }
    } catch (e) {
      setError('Error de red al guardar la adopción.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
      <Typography variant="h6" gutterBottom>{isEdit ? 'Editar adopción' : 'Registrar nueva adopción'}</Typography>
      <form onSubmit={handleSubmit}>
        <TextField select label="Mascota" name="mascotaId" value={form.mascotaId} onChange={handleChange} fullWidth sx={{ mb: 2 }} required>
          {mascotasDisponibles.map(m => <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>)}
        </TextField>
        <TextField select label="Adoptante" name="usuarioId" value={form.usuarioId} onChange={handleChange} fullWidth sx={{ mb: 2 }} required disabled={rol !== 'ADMIN'}>
          {usuariosDisponibles.map(u => <MenuItem key={u.id} value={u.id}>{u.nombre}</MenuItem>)}
        </TextField>
        <TextField label="Fecha" name="fechaAdopcion" type="date" value={form.fechaAdopcion} onChange={handleChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} required />
        <TextField label="Notas" name="notas" multiline rows={2} value={form.notas} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" type="submit" disabled={loading}>{isEdit ? 'Guardar cambios' : 'Registrar'}</Button>
          <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        </Box>
      </form>
    </Box>
  );
}

export default AdopcionForm;
