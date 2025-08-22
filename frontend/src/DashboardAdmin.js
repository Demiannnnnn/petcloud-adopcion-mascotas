import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PetsIcon from '@mui/icons-material/Pets';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

function DashboardAdmin() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ mascotas: 0, adoptadas: 0, disponibles: 0, usuarios: 0, adopciones: 0 });

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Mascotas
        const resMascotas = await fetch('http://localhost:8080/api/mascotas');
        const mascotas = await resMascotas.json();
        // Adopciones
        const resAdopciones = await fetch('http://localhost:8080/api/adopciones');
        const adopciones = await resAdopciones.json();
  // Adopciones por estado
  const adopcionesAprobadas = adopciones.filter(a => (a.estado || '').toUpperCase().includes('APROB'));
  const adopcionesEnProceso = adopciones.filter(a => (a.estado || '').toUpperCase().includes('PROCES'));
  const adopcionesRechazadas = adopciones.filter(a => (a.estado || '').toUpperCase().includes('RECHAZ'));
  // Mascotas adoptadas: solo si tienen adopción aprobada
  const mascotasAdoptadasIds = new Set(adopcionesAprobadas.map(a => a.mascota?.id || a.mascotaId));
  const adoptadas = mascotas.filter(m => mascotasAdoptadasIds.has(m.id)).length;
  const disponibles = mascotas.length - adoptadas;
        // Usuarios
        const resUsuarios = await fetch('http://localhost:8080/api/usuarios');
        const usuarios = await resUsuarios.json();
        setStats({
          mascotas: mascotas.length,
          adoptadas,
          disponibles,
          usuarios: usuarios.length,
          adopcionesAprobadas: adopcionesAprobadas.length,
          adopcionesEnProceso: adopcionesEnProceso.length,
          adopcionesRechazadas: adopcionesRechazadas.length
        });
      } catch (e) {
        // Error simple, podrías agregar feedback visual
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Dashboard de Administración</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <PetsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight={700}>{stats.mascotas}</Typography>
              <Typography variant="body1">Mascotas registradas</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <AssignmentTurnedInIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight={700}>{stats.adoptadas}</Typography>
              <Typography variant="body1">Mascotas adoptadas</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <PetsIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight={700}>{stats.disponibles}</Typography>
              <Typography variant="body1">Mascotas disponibles</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <GroupIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight={700}>{stats.usuarios}</Typography>
              <Typography variant="body1">Usuarios registrados</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <AssignmentTurnedInIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight={700}>{stats.adopcionesAprobadas}</Typography>
              <Typography variant="body1">Adopciones aprobadas</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <AssignmentTurnedInIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight={700}>{stats.adopcionesEnProceso}</Typography>
              <Typography variant="body1">Adopciones en proceso</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <AssignmentTurnedInIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight={700}>{stats.adopcionesRechazadas}</Typography>
              <Typography variant="body1">Adopciones rechazadas</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default DashboardAdmin;
