import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';


function AdopcionCard({ adopcion, mascota, usuario, onClick }) {
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
    <Card sx={{ minWidth: 220, maxWidth: 320, width: { xs: '100%', sm: 260, md: 320 }, cursor: 'pointer', m: 1 }} onClick={onClick}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {mascota?.fotoUrl ? (
            <img src={mascota.fotoUrl} alt={mascota.nombre} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <Box sx={{ width: 48, height: 48, background: '#eee', borderRadius: '50%' }} />
          )}
          <Box>
            <Typography variant="subtitle1" sx={{ fontSize: { xs: 15, sm: 17 } }}>{mascota?.nombre || 'Mascota'}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12, sm: 14 } }}>{usuario?.nombre || 'Adoptante'}</Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip label={label} color={color} size="small" />
          <Typography variant="caption" sx={{ ml: 1, fontSize: { xs: 11, sm: 13 } }}>Fecha: {adopcion.fechaAdopcion || adopcion.fechaSolicitud}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default AdopcionCard;
