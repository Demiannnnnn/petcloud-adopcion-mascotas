import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();
  return (
    <Box sx={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 8
    }}>
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <PetsIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h2" fontWeight={700} gutterBottom color="primary.main">
          Bienvenido a PetAdopt Pro
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Plataforma profesional para gestión y adopción de mascotas.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Encuentra tu compañero ideal, gestiona adopciones y ayuda a cientos de mascotas a encontrar un hogar. Sistema robusto, seguro y fácil de usar para organizaciones y usuarios.
        </Typography>
        <Button variant="contained" size="large" color="primary" sx={{ mr: 2 }} onClick={() => navigate('/mascotas')}>
          Ver Mascotas
        </Button>
        <Button variant="outlined" size="large" color="primary" onClick={() => navigate('/login')}>
          Ingresar / Registrarse
        </Button>
      </Container>
    </Box>
  );
}

export default Landing;
