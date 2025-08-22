import React, { useState } from 'react';
import { Box, Typography, Chip, Button, DialogActions, Dialog, DialogTitle, Snackbar, Alert, CircularProgress } from '@mui/material';

function AdopcionPerfil({ adopcion, mascota, usuario, onClose, onEdit, onDelete, rol, onStatusChange }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (onDelete) {
        await onDelete();
        setSuccess('Adopción eliminada correctamente.');
      }
    } catch (e) {
      setError('Error al eliminar la adopción.');
    }
    setLoading(false);
  };

  // Estado visual amigable
  let estado = (adopcion.estado || '').toUpperCase();
  let color = 'primary';
  let label = adopcion.estado || 'En proceso';
  if (estado.includes('APROB')) {
    color = 'success';
    label = 'Aprobada';
  } else if (estado.includes('RECHAZ')) {
    color = 'error';
    label = 'Rechazada';
  } else if (estado.includes('PROCES')) {
    color = 'info';
    label = 'En proceso';
  }

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
      <Typography variant="h6" gutterBottom>Detalle de Adopción</Typography>
      {mascota?.fotoUrl && (
        <Box sx={{ width: '100%', mb: 2, display: 'flex', justifyContent: 'center' }}>
          <img src={mascota.fotoUrl} alt={mascota.nombre} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12 }} />
        </Box>
      )}
      <Typography><b>Mascota:</b> {mascota?.nombre || '-'} ({mascota?.tipo || ''} {mascota?.raza || ''})</Typography>
      <Typography><b>Adoptante:</b> {usuario?.nombre || '-'} ({usuario?.email || ''} {usuario?.telefono || ''})</Typography>
      <Typography><b>Fecha adopción:</b> {adopcion.fechaAdopcion || adopcion.fechaSolicitud}</Typography>
      <Typography><b>Estado:</b> <Chip label={label} color={color} size="small" /></Typography>
      <Typography><b>Notas:</b> {adopcion.notas || '-'}</Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button onClick={onClose} variant="contained" disabled={loading}>Cerrar</Button>
        {typeof onEdit === 'function' && (
          <Button onClick={onEdit} variant="outlined" color="primary" disabled={loading}>Editar</Button>
        )}
        {rol === 'ADMIN' && (
          <>
            <Button onClick={() => setConfirmOpen(true)} variant="outlined" color="error" disabled={loading}>Eliminar</Button>
            {((adopcion.estado || '').toLowerCase().includes('proceso')) && (
              <>
                <Button onClick={async () => {
                  setLoading(true);
                  setError('');
                  setSuccess('');
                  try {
                    const res = await fetch(`http://localhost:8080/api/adopciones/${adopcion.id}/aprobar`, { method: 'PUT' });
                    if (res.ok) {
                      setSuccess('Adopción aprobada correctamente.');
                      if (typeof onStatusChange === 'function') onStatusChange();
                      if (typeof onClose === 'function') onClose();
                    } else {
                      setError('Error al aprobar la adopción.');
                    }
                  } catch (e) {
                    setError('Error de red al aprobar la adopción.');
                  }
                  setLoading(false);
                }} variant="outlined" color="success" disabled={loading}>Aprobar</Button>
                <Button onClick={async () => {
                  setLoading(true);
                  setError('');
                  setSuccess('');
                  try {
                    const res = await fetch(`http://localhost:8080/api/adopciones/${adopcion.id}/rechazar`, { method: 'PUT' });
                    if (res.ok) {
                      setSuccess('Adopción rechazada correctamente.');
                      if (typeof onStatusChange === 'function') onStatusChange();
                      if (typeof onClose === 'function') onClose();
                    } else {
                      setError('Error al rechazar la adopción.');
                    }
                  } catch (e) {
                    setError('Error de red al rechazar la adopción.');
                  }
                  setLoading(false);
                }} variant="outlined" color="warning" disabled={loading}>Rechazar</Button>
              </>
            )}
          </>
        )}
      </Box>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>¿Eliminar esta adopción?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={loading}>Cancelar</Button>
          <Button color="error" onClick={() => { setConfirmOpen(false); handleDelete(); }} disabled={loading}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdopcionPerfil;
