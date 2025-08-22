import React from 'react';
import { Box, Typography, Link } from '@mui/material';

function Footer() {
  return (
    <Box sx={{ bgcolor: 'primary.main', color: '#fff', py: 2, mt: 6, textAlign: 'center', borderRadius: 0 }}>
      <Typography variant="body2">
        © {new Date().getFullYear()} Adopción de Mascotas. Desarrollado por tu equipo profesional.
        {' | '}
        <Link href="mailto:contacto@adopcion.cl" color="inherit" underline="hover">Contacto</Link>
      </Typography>
    </Box>
  );
}

export default Footer;
