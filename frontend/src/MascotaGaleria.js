

import React, { useState } from 'react';
import { Dialog } from '@mui/material';
import { Box, ImageList, ImageListItem, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function MascotaGaleria({ imagenes = [], onDelete, horizontal }) {
  const [modalImg, setModalImg] = useState(null);
  if (!imagenes || imagenes.length === 0) return null;
  // Carrusel horizontal si prop horizontal
  if (horizontal) {
    return (
      <>
        <Box sx={{ width: '100%', mb: 2, overflowX: 'auto', display: 'flex', gap: 2, py: 1 }}>
          {imagenes.map((img, idx) => (
            <Box key={idx} sx={{ minWidth: 140, maxWidth: 180, position: 'relative' }}>
              <img
                src={img}
                alt={`Galería ${idx + 1}`}
                style={{
                  width: '100%',
                  height: 120,
                  objectFit: 'cover',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
                loading="lazy"
                onClick={() => setModalImg(img)}
              />
              {onDelete && (
                <IconButton
                  size="small"
                  onClick={() => onDelete(img)}
                  sx={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255,255,255,0.7)' }}
                  aria-label="Eliminar imagen"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
        <Dialog open={!!modalImg} onClose={() => setModalImg(null)} maxWidth="md">
          {modalImg && (
            <img src={modalImg} alt="Vista grande" style={{ maxWidth: 600, maxHeight: 600, display: 'block', margin: 'auto' }} />
          )}
        </Dialog>
      </>
    );
  }
  // Galería tipo grid (no usada en perfil)
  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <ImageList cols={imagenes.length > 1 ? 2 : 1} rowHeight={180} gap={8}>
        {imagenes.map((img, idx) => (
          <ImageListItem key={idx} sx={{ position: 'relative' }}>
            <img
              src={img}
              alt={`Mascota foto ${idx + 1}`}
              style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
              loading="lazy"
            />
            {onDelete && (
              <IconButton
                size="small"
                onClick={() => onDelete(img)}
                sx={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255,255,255,0.7)' }}
                aria-label="Eliminar imagen"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
}

export default MascotaGaleria;
