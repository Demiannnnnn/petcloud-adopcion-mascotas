import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Grid, Typography, Alert, Fab, Dialog, DialogTitle, DialogActions, Chip, CircularProgress, Snackbar, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PetsIcon from '@mui/icons-material/Pets';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import MascotaCard from './MascotaCard';
import MascotaPerfil from './MascotaPerfil';

const API_URL = 'http://localhost:8080/api/mascotas';

function Mascotas(props) {
  const { isPublic, onLoginRequest } = props;
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState([]);
  const [form, setForm] = useState({ nombre: '', tipo: '', raza: '', edad: '', descripcion: '', fotoUrl: '' });
  const [editId, setEditId] = useState(null);
  const [file, setFile] = useState(null);
  // Eliminado: galería en registro
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [mascotaPerfil, setMascotaPerfil] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [manageMode, setManageMode] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);


  // Permitir refresco externo
  React.useEffect(() => {
    fetchMascotas();
    window.__refetchMascotas = fetchMascotas;
    return () => { if (window.__refetchMascotas === fetchMascotas) window.__refetchMascotas = null; };
  }, [props.refetchKey]);

  const fetchMascotas = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      setMascotas(await res.json());
    } catch (e) {
      setError('Error al cargar mascotas.');
    }
    setLoading(false);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (!user || !user.username) {
        setError('Debes iniciar sesión para registrar una mascota.');
        setLoading(false);
        return;
      }
      // Validaciones
      if (!form.nombre || !form.tipo || !form.raza || !form.edad) {
        setError('Todos los campos obligatorios deben estar completos.');
        setLoading(false);
        return;
      }
      if (file && (!file.type || !file.type.startsWith('image/'))) {
        setError('El archivo debe ser una imagen.');
        setLoading(false);
        return;
      }
      let fotoUrl = form.fotoUrl;
      if (file) {
        const data = new FormData();
        data.append('file', file);
        const res = await fetch('http://localhost:8080/api/uploads/imagen', {
          method: 'POST',
          body: data
        });
        if (res.ok) {
          fotoUrl = await res.text();
        } else {
          setError('Error al subir la imagen.');
          setLoading(false);
          return;
        }
      }
      let method = editId ? 'PUT' : 'POST';
      let url = editId ? `${API_URL}/${editId}` : API_URL;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User': user.username,
          'X-Rol': user.rol
        },
        body: JSON.stringify({ ...form, edad: Number(form.edad), fotoUrl })
      });
      if (res.ok) {
        setSuccess(editId ? 'Mascota actualizada correctamente.' : 'Mascota agregada correctamente.');
        setForm({ nombre: '', tipo: '', raza: '', edad: '', descripcion: '', fotoUrl: '' });
        setFile(null);
        setEditId(null);
        setFormOpen(false); // Cierra el formulario automáticamente
        fetchMascotas();
      } else {
        setError('Error al guardar la mascota.');
      }
    } catch (e) {
      setError('Error de red al guardar la mascota.');
    }
    setLoading(false);
  };

  // Obtener usuario y rol correctamente
  const user = props.usuario || JSON.parse(localStorage.getItem('user')) || {};
  if (props.rol === 'ADMIN') {
    user.username = 'admin';
    user.rol = 'ADMIN';
  }

  const handleDelete = async id => {
    if (!user || !user.username) return;
    const mascota = mascotas.find(m => m.id === id);
    const isAdmin = user.rol === 'ADMIN';
    const isOwner = mascota && mascota.usuario && mascota.usuario.username === user.username;
    if (!isAdmin && !isOwner) {
      setError('No tienes permiso para eliminar esta mascota.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User': user.username,
          'X-Rol': user.rol
        }
      });
      if (res.ok) {
        setSuccess('Mascota eliminada correctamente.');
        fetchMascotas();
      } else {
        setError('Error al eliminar la mascota.');
      }
    } catch (e) {
      setError('Error de red al eliminar la mascota.');
    }
    setLoading(false);
    setManageMode(false);
    setSelectedMascota(null);
    setActionDialogOpen(false);
  };

  const handleEdit = mascota => {
    setForm({
      nombre: mascota.nombre,
      tipo: mascota.tipo,
      raza: mascota.raza,
      edad: mascota.edad,
      descripcion: mascota.descripcion,
      fotoUrl: mascota.fotoUrl || ''
    });
    setFile(null);
    setEditId(mascota.id);
    setFormOpen(true);
    setManageMode(false);
    setSelectedMascota(null);
    setActionDialogOpen(false);
  };

  // --- Resumen usuario normal ---
  const [adopciones, setAdopciones] = useState([]);
  useEffect(() => {
    if (user && user.rol === 'USUARIO') {
      fetch('http://localhost:8080/api/adopciones')
        .then(res => res.json())
        .then(data => setAdopciones(data.filter(a => a.usuario?.username === user.username)))
        .catch(() => setAdopciones([]));
    }
  }, [user]);

  const mascotasUsuario = mascotas.filter(m => m.usuario && m.usuario.username === user.username);
  const adopcionesPendientes = adopciones.filter(a => a.estado === 'PENDIENTE').length;
  const adopcionesAprobadas = adopciones.filter(a => a.estado === 'APROBADA').length;
  const adopcionesRechazadas = adopciones.filter(a => a.estado === 'RECHAZADA').length;

  // Calcular métricas dinámicamente según los estados presentes
  const adopcionesPorEstado = adopciones.reduce((acc, a) => {
    const estado = a.estado || 'SIN_ESTADO';
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {});
  const coloresEstado = {
    'EN_PROCESO': 'info',
    'APROBADA': 'success',
    'RECHAZADA': 'error',
    'PENDIENTE': 'warning',
    'SIN_ESTADO': 'default'
  };

  // --- UI ---
  return (
    <>
      <Box sx={{ p: 2, position: 'relative' }}>
        {/* Resumen usuario normal */}
        {user && user.rol === 'USUARIO' && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <PetsIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6">{mascotasUsuario.length}</Typography>
                <Typography variant="body2">Mis mascotas publicadas</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <AssignmentTurnedInIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6">{adopciones.length}</Typography>
                <Typography variant="body2">Adopciones solicitadas</Typography>
              </Paper>
            </Grid>
            {Object.entries(adopcionesPorEstado).map(([estado, cantidad]) => (
              <Grid item xs={12} sm={6} md={3} key={estado}>
                <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <AssignmentTurnedInIcon color={coloresEstado[estado] || 'default'} sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h6">{cantidad}</Typography>
                  <Typography variant="body2">{estado.charAt(0) + estado.slice(1).toLowerCase()}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%' }}>{error}</Alert>
        </Snackbar>
        <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ width: '100%' }}>{success}</Alert>
        </Snackbar>
        {!isPublic && formOpen && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField label="Tipo" name="tipo" value={form.tipo} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField label="Raza" name="raza" value={form.raza} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField label="Edad" name="edad" value={form.edad} onChange={handleChange} fullWidth required type="number" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField label="Descripción" name="descripcion" value={form.descripcion} onChange={handleChange} fullWidth multiline rows={2} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button variant="contained" component="label" fullWidth>
                  {file ? file.name : 'Subir Foto Principal'}
                  <input type="file" hidden onChange={e => setFile(e.target.files[0])} />
                </Button>
              </Grid>
              {/* Eliminado: input de galería en registro */}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  {editId ? 'Actualizar' : 'Agregar'} Mascota
                </Button>
                <Button onClick={() => { setEditId(null); setForm({ nombre: '', tipo: '', raza: '', edad: '', descripcion: '', fotoUrl: '' }); setFile(null); setFormOpen(false); }} sx={{ ml: 2 }}>
                  Cancelar
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
        {!isPublic && (
          <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }} onClick={() => { setFormOpen(true); setEditId(null); setForm({ nombre: '', tipo: '', raza: '', edad: '', descripcion: '', fotoUrl: '' }); setFile(null); }}>
            <AddIcon />
          </Fab>
        )}
        {isPublic && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <Button variant="contained" color="primary" size="large" onClick={() => (onLoginRequest ? onLoginRequest() : navigate('/login'))}>
              Iniciar sesión para gestionar o adoptar
            </Button>
          </Box>
        )}
        <Grid container spacing={2} justifyContent="center">
          {mascotas.map(m => {
            const isAdmin = user.rol === 'ADMIN';
            const isOwner = m.usuario && m.usuario.username === user.username;
            return (
              <Grid item key={m.id} xs={12} sm={6} md={4} lg={3} xl={2} display="flex" justifyContent="center">
                <MascotaCard
                  mascota={m}
                  onClick={() => {
                    if (manageMode) {
                      setSelectedMascota(m);
                      setActionDialogOpen(true);
                    } else {
                      setMascotaPerfil(m);
                      setPerfilOpen(true);
                    }
                  }}
                  showEditDelete={isAdmin || isOwner}
                  onDelete={() => handleDelete(m.id)}
                  onEdit={() => handleEdit(m)}
                />
              </Grid>
            );
          })}
        </Grid>
        <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
          <DialogTitle>¿Qué deseas hacer con "{selectedMascota?.nombre}"?</DialogTitle>
          <DialogActions>
            <Button onClick={() => handleEdit(selectedMascota)} color="primary">Editar</Button>
            <Button onClick={() => handleDelete(selectedMascota?.id)} color="error">Eliminar</Button>
            <Button onClick={() => setActionDialogOpen(false)}>Cancelar</Button>
          </DialogActions>
        </Dialog>
      </Box>
      <MascotaPerfil mascota={mascotaPerfil} open={perfilOpen} onClose={() => setPerfilOpen(false)} usuario={user} rol={user.rol} />
    </>
  );
}

export default Mascotas;

