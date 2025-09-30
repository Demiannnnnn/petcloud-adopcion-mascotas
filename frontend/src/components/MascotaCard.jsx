import React from 'react';

export default function MascotaCard({ mascota, onEdit, onDelete }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 18,
      boxShadow: '0 2px 8px rgba(64,11,25,0.10)',
      padding: 16,
      minWidth: 140,
      maxWidth: 180,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      transition: 'box-shadow 0.2s',
    }}>
      {mascota.imagenUrl && (
        <img src={typeof mascota.imagenUrl === 'string' ? `/assets/${mascota.imagenUrl}` : URL.createObjectURL(mascota.imagenUrl)} alt={mascota.nombre} style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: '50%', marginBottom: 8, border: '3px solid #F29C6B' }} />
      )}
      <div style={{ fontWeight: 'bold', color: '#a0522d', fontSize: 18, marginBottom: 2 }}>{mascota.nombre}</div>
      <div style={{ fontSize: 15, color: '#400B19', opacity: 0.8 }}>{mascota.especie}</div>
      <div style={{ fontSize: 14, color: '#400B19', opacity: 0.6 }}>{mascota.raza}</div>
      <div style={{ fontSize: 13, color: '#400B19', opacity: 0.5 }}>{mascota.edad ? `${mascota.edad} años` : ''}</div>
      {/* íconos de editar y eliminar eliminados */}
    </div>
  );
}

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  outline: 'none',
  display: 'flex',
  alignItems: 'center',
};
