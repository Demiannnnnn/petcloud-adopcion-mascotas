import React, { useEffect, useState } from 'react';
import { Box, Button, MenuItem, TextField, Dialog, Typography, Fab, CircularProgress, Snackbar, Alert, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AdopcionCard from './AdopcionCard';
import AdopcionPerfil from './AdopcionPerfil';
import AdopcionForm from './AdopcionForm';

function Adopciones({ rol, usuario, onMascotasChange }) {
  const [adopciones, setAdopciones] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [adopcionSeleccionada, setAdopcionSeleccionada] = useState(null);
  const [adopcionEdit, setAdopcionEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Cargar datos al montar
  useEffect(() => {
    fetchAdopciones();
    fetchMascotas();
    fetchUsuarios();
  }, []);

  // Funciones para cargar datos
  const fetchAdopciones = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/adopciones');
      setAdopciones(await res.json());
    } catch (e) {
      setError('Error al cargar adopciones.');
    }
    setLoading(false);
  };
  const fetchMascotas = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/mascotas');
      setMascotas(await res.json());
    } catch (e) {
      setError('Error al cargar mascotas.');
    }
    setLoading(false);
  };
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

  // Filtrar adopciones según el rol
  let adopcionesFiltradas = adopciones;
  if (rol === 'USUARIO' && usuario?.id) {
    adopcionesFiltradas = adopciones.filter(a => {
      // a.usuario puede ser objeto o solo id
      if (a.usuario && typeof a.usuario === 'object') {
        return a.usuario.id === usuario.id;
      }
      return a.usuarioId === usuario.id;
    });
  }

  // Refrescar adopciones tras cerrar perfil
  const handleClosePerfil = () => {
    setPerfilOpen(false);
    setAdopcionSeleccionada(null);
    fetchAdopciones();
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
      <Typography variant="h4" gutterBottom>Adopciones</Typography>
      <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }} onClick={() => { setFormOpen(true); setAdopcionEdit(null); }}>
        <AddIcon />
      </Fab>
      <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        {adopcionesFiltradas.map(a => (
          <Grid item key={a.id} xs={12} sm={6} md={4} lg={3} xl={2} display="flex" justifyContent="center">
            <AdopcionCard
              adopcion={a}
              mascota={a.mascota || mascotas.find(m => m.id === (a.mascota?.id || a.mascotaId))}
              usuario={a.usuario || usuarios.find(u => u.id === (a.usuario?.id || a.usuarioId))}
              onClick={() => { setAdopcionSeleccionada(a); setPerfilOpen(true); }}
            />
          </Grid>
        ))}
      </Grid>
      <Dialog open={formOpen} onClose={() => { setFormOpen(false); setAdopcionEdit(null); }} maxWidth="sm" fullWidth>
        <AdopcionForm
          mascotas={mascotas}
          usuarios={usuarios}
          adopcion={adopcionEdit}
          onClose={() => {
            setFormOpen(false);
            setAdopcionEdit(null);
            setSuccess(adopcionEdit ? 'Adopción actualizada correctamente.' : 'Adopción registrada correctamente.');
            fetchAdopciones();
            if (typeof onMascotasChange === 'function') onMascotasChange();
          }}
          rol={rol}
          usuarioActual={usuario}
        />
      </Dialog>
      <Dialog open={perfilOpen} onClose={handleClosePerfil} maxWidth="sm" fullWidth>
        {adopcionSeleccionada && (
          <AdopcionPerfil
            adopcion={adopcionSeleccionada}
            mascota={adopcionSeleccionada.mascota || mascotas.find(m => m.id === (adopcionSeleccionada.mascota?.id || adopcionSeleccionada.mascotaId))}
            usuario={adopcionSeleccionada.usuario || usuarios.find(u => u.id === (adopcionSeleccionada.usuario?.id || adopcionSeleccionada.usuarioId))}
            onClose={handleClosePerfil}
            onEdit={() => {
              setPerfilOpen(false);
              setAdopcionEdit(adopcionSeleccionada);
              setFormOpen(true);
            }}
            onDelete={async () => {
              if (!adopcionSeleccionada) return;
              setLoading(true);
              setError('');
              setSuccess('');
              try {
                const res = await fetch(`http://localhost:8080/api/adopciones/${adopcionSeleccionada.id}`, { method: 'DELETE' });
                if (res.ok) {
                  setSuccess('Adopción eliminada correctamente.');
                  setPerfilOpen(false);
                  fetchAdopciones();
                  if (typeof onMascotasChange === 'function') onMascotasChange();
                } else {
                  setError('Error al eliminar la adopción.');
                }
              } catch (e) {
                setError('Error de red al eliminar la adopción.');
              }
              setLoading(false);
            }}
            rol={rol}
            onStatusChange={fetchAdopciones}
          />
        )}
      </Dialog>
    </Box>
  );
  // ...código moderno arriba...
}

export default Adopciones;
