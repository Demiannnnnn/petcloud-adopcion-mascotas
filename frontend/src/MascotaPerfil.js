


import React, { useState } from 'react';
import { Dialog as MuiDialog } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Button, Alert, CircularProgress, Snackbar } from '@mui/material';
import MascotaGaleria from './MascotaGaleria';

function MascotaPerfil({ mascota, open, onClose, usuario, rol }) {
  // Usar props si existen, si no, fallback a localStorage
  const user = usuario || JSON.parse(localStorage.getItem('user')) || {};
  const userRol = rol || user.rol;
  const isAdmin = userRol === 'ADMIN';
  const isOwner = mascota?.usuario && user.username && mascota.usuario.username === user.username;
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [modalImg, setModalImg] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagenes, setImagenes] = useState(mascota?.imagenes || []);

  // Sincronizar galería con la mascota activa
  React.useEffect(() => {
    setImagenes(mascota?.imagenes || []);
  }, [mascota]);
  if (!open || !mascota) return null;

  // Eliminar imagen de galería
  const handleDeleteImage = async (imgUrl) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/mascotas/${mascota.id}/imagenes?url=${encodeURIComponent(imgUrl)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const updated = await res.json();
        setImagenes(updated.imagenes);
        setSuccess('Imagen eliminada correctamente.');
      } else {
        setError('No se pudo eliminar la imagen.');
      }
    } catch (e) {
      setError('Error de red al eliminar la imagen.');
    }
    setLoading(false);
  };

  const handleAddImages = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    let nuevas = [];
    for (let f of galleryFiles) {
      if (!f.type || !f.type.startsWith('image/')) {
        setError('Todos los archivos deben ser imágenes.');
        setLoading(false);
        return;
      }
      const data = new FormData();
      data.append('file', f);
      const res = await fetch('http://localhost:8080/api/uploads/imagen', {
        method: 'POST',
        body: data
      });
      if (res.ok) {
        nuevas.push(await res.text());
      } else {
        setError('Error al subir una imagen.');
        setLoading(false);
        return;
      }
    }
    // Llamar endpoint backend para asociar imágenes
    try {
      const res = await fetch(`http://localhost:8080/api/mascotas/${mascota.id}/imagenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevas)
      });
      if (res.ok) {
        const updated = await res.json();
        setImagenes(updated.imagenes);
        setGalleryFiles([]);
        setSuccess('Imágenes agregadas correctamente.');
      } else {
        setError('Error al asociar imágenes.');
      }
    } catch (e) {
      setError('Error de red al asociar imágenes.');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
      <DialogTitle>{mascota.nombre}</DialogTitle>
      <DialogContent>
        {/* Imagen principal grande */}
        {mascota.fotoUrl && (
          <Box sx={{ width: '100%', mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5', borderRadius: 3, minHeight: 220, maxHeight: 260, overflow: 'hidden' }}>
            <img
              src={mascota.fotoUrl}
              alt="Foto principal"
              style={{ width: '100%', height: 240, objectFit: 'contain', objectPosition: 'center', borderRadius: 12, background: '#f5f5f5', cursor: 'pointer' }}
              onClick={() => setModalImg(mascota.fotoUrl)}
            />
          </Box>
        )}
        <MuiDialog open={!!modalImg} onClose={() => setModalImg(null)} maxWidth="md">
          {modalImg && (
            <img src={modalImg} alt="Vista grande" style={{ maxWidth: 600, maxHeight: 600, display: 'block', margin: 'auto' }} />
          )}
        </MuiDialog>
        {/* Galería tipo carrusel horizontal */}
        {imagenes.length > 0 && (
          <MascotaGaleria
            imagenes={imagenes}
            onDelete={(isAdmin || isOwner) ? handleDeleteImage : undefined}
            horizontal
          />
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {mascota.tipo} • {mascota.raza} • {mascota.edad} años
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {mascota.descripcion || 'Sin descripción.'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Estado: {mascota.adoptado ? 'Adoptado' : 'Disponible'}
          </Typography>
        </Box>
        {(isAdmin || isOwner) && (
          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" component="label" disabled={loading} fullWidth>
              {galleryFiles.length > 0 ? `${galleryFiles.length} imágenes seleccionadas` : 'Agregar imágenes a galería'}
              <input type="file" hidden multiple onChange={e => setGalleryFiles(Array.from(e.target.files))} />
            </Button>
            {galleryFiles.length > 0 && (
              <Button onClick={handleAddImages} variant="contained" color="primary" fullWidth sx={{ mt: 1 }} disabled={loading}>
                Subir imágenes
              </Button>
            )}
          </Box>
        )}
        <Button onClick={onClose} variant="contained" color="primary" fullWidth>Cerrar</Button>
      </DialogContent>
    </Dialog>
  );
}

export default MascotaPerfil;
