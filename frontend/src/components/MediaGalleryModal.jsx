import React, { useEffect } from 'react';
import { normalizeTamanio, isPesoLike, formatPeso } from '../utils/mascotaUtils';

export default function MediaGalleryModal({ open, onClose, media = [], startIndex = 0, mascota = {}, refugioName, refugioContacto, publicadoPor, onDelete }) {
  const [index, setIndex] = React.useState(startIndex || 0);

  useEffect(() => {
    setIndex(startIndex || 0);
  }, [startIndex, open]);

  useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setIndex(i => Math.min(media.length - 1, i + 1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, media.length, onClose]);

  // If the media prop changes (for example after a delete), ensure the current index is valid
  React.useEffect(() => {
    if (!Array.isArray(media) || media.length === 0) {
      setIndex(0);
      return;
    }
    if (index > media.length - 1) {
      setIndex(Math.max(0, media.length - 1));
    }
  }, [media, media.length, index]);

  if (!open) return null;

  const hasMedia = Array.isArray(media) && media.length > 0;
  const current = hasMedia ? media[index] : null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(64,11,25,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 24, padding: 32, minWidth: 340, maxWidth: 920, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(64,11,25,0.15)', display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            <div style={{ fontSize: 12, color: '#666' }}>{hasMedia ? `${index + 1} / ${media.length}` : `0 / 0`}</div>
          </div>

            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button type="button" onClick={() => hasMedia && setIndex(i => Math.max(0, i - 1))} disabled={!hasMedia} style={{ background: 'transparent', border: 'none', fontSize: 28, cursor: hasMedia ? 'pointer' : 'default', marginRight: 8, opacity: hasMedia ? 1 : 0.4 }}>◀</button>

            <div style={{ maxWidth: '100%', maxHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {hasMedia ? (
                // if current is a video, render video, otherwise render image or placeholder
                current && current.type && String(current.type).toLowerCase().startsWith('video') ? (
                  <video controls src={current.url || ''} style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }} />
                ) : (
                  <div style={{ position: 'relative' }}>
                    {current && current.url ? (
                      <img src={current.url} alt={`${mascota.nombre || 'mascota'} - imagen ${index + 1}`} style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8, objectFit: 'contain' }} />
                    ) : (
                      <div style={{ width: 420, height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: '#f5f5f5', color: '#999', fontSize: 14 }}>No hay imagen disponible</div>
                    )}
                    {onDelete && (
                      <button type="button" onClick={() => onDelete(index)} title="Eliminar" style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>Eliminar</button>
                    )}
                  </div>
                )
              ) : (
                <div style={{ width: 260, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: '#f5f5f5', color: '#999', fontSize: 14 }}>No hay imágenes</div>
              )}
            </div>

            <button type="button" onClick={() => hasMedia && setIndex(i => Math.min(media.length - 1, i + 1))} disabled={!hasMedia} style={{ background: 'transparent', border: 'none', fontSize: 28, cursor: hasMedia ? 'pointer' : 'default', marginLeft: 8, opacity: hasMedia ? 1 : 0.4 }}>▶</button>
          </div>

          {hasMedia && media.length > 1 && (
            <div style={{ marginTop: 10, display: 'flex', gap: 8, overflowX: 'auto', width: '100%', paddingBottom: 6 }}>
              {media.map((m, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <button type="button" onClick={() => setIndex(i)} style={{ border: i === index ? '2px solid #F29C6B' : '1px solid #eee', padding: 0, borderRadius: 6, background: '#fff', cursor: 'pointer' }}>
                    {m.type && m.type.startsWith('video') ? (
                      <div style={{ width: 100, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>▶</div>
                    ) : (
                      <img src={m.url} alt={`${mascota.nombre || 'mascota'} - miniatura ${i + 1}`} style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 6 }} />
                    )}
                  </button>
                  {onDelete && (
                    <button type="button" onClick={() => onDelete(i)} title="Eliminar" style={{ position: 'absolute', top: -6, left: -6, background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '2px 6px', cursor: 'pointer' }}>×</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar with mascota info */}
        <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ color: '#a0522d', fontWeight: 'bold', fontSize: 18, margin: 0 }}>{mascota.nombre}</h2>
          <div style={{ color: '#400B19', fontSize: 14 }}>{mascota.especie} — {mascota.raza}</div>
          {publicadoPor && <div style={{ fontSize: 13, color: '#6b4b3a' }}>Publicado por: {publicadoPor}</div>}
          {refugioName && <div style={{ fontSize: 13, color: '#6b4b3a' }}>Refugio: {refugioName}</div>}
          {refugioContacto && <div style={{ fontSize: 13, color: '#6b4b3a' }}>Contacto: {refugioContacto}</div>}
          <div style={{ marginTop: 8, fontSize: 13, color: '#4a2f24' }}>{mascota.descripcion}</div>
          <div style={{ marginTop: 8 }}>
            <div><b>Sexo:</b> {mascota.sexo || 'N/A'}</div>
            {(() => {
              const rawTam = mascota.tamaño || mascota.tamanio || mascota.tamano || mascota.peso || mascota.pesoKg || '';
              if (!rawTam && rawTam !== 0) return null;
              if (isPesoLike(rawTam)) {
                return <div><b>Peso:</b> {formatPeso(rawTam)}</div>;
              }
              const displayTam = normalizeTamanio(rawTam);
              return displayTam ? <div><b>Tamaño:</b> {displayTam}</div> : null;
            })()}
            {(() => {
              // helper to format a yyyy-mm-dd/ISO date to dd/mm/yyyy
              const fmt = (s) => {
                try {
                  const d = new Date(s);
                  if (isNaN(d.getTime())) return s;
                  const dd = String(d.getDate()).padStart(2, '0');
                  const mm = String(d.getMonth() + 1).padStart(2, '0');
                  const yyyy = d.getFullYear();
                  return `${dd}/${mm}/${yyyy}`;
                } catch (e) { return s; }
              };

              // compute age string (prefer backend fields)
              let ageStr = '';
              if (mascota.edadYears != null) {
                ageStr = `${mascota.edadYears} año${mascota.edadYears === 1 ? '' : 's'}` + (mascota.edadMonths ? ` ${mascota.edadMonths} meses` : '');
              } else if (mascota.fechaNacimiento) {
                try {
                  const b = new Date(mascota.fechaNacimiento);
                  const today = new Date();
                  let y = today.getFullYear() - b.getFullYear();
                  let m = today.getMonth() - b.getMonth();
                  if (today.getDate() < b.getDate()) m -= 1;
                  if (m < 0) { y -= 1; m += 12; }
                  if (y < 0) { y = 0; m = 0; }
                  ageStr = `${y} año${y === 1 ? '' : 's'}` + (m ? ` ${m} meses` : '');
                } catch (e) { /* ignore */ }
              } else if (mascota.edad) {
                ageStr = `${mascota.edad} años`;
              }

              // Show explicit birth date + age in the gallery modal when available
              if (mascota.fechaNacimiento) {
                return (
                  <div><b>Nacido el:</b> {fmt(mascota.fechaNacimiento)}{ageStr ? ` (${ageStr})` : ''}</div>
                );
              }
              return (
                <div><b>Edad:</b> {ageStr || 'N/A'}</div>
              );
            })()}
            <div><b>Ubicación:</b> {mascota.ubicacion || 'N/A'}</div>
            <div><b>Registrada:</b> {mascota.fechaRegistro ? new Date(mascota.fechaRegistro).toLocaleDateString() : 'N/A'}</div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            {mascota.disponibleAdopcion ? (
              <div style={{ background: '#4caf50', color: '#fff', padding: '8px 12px', borderRadius: 12, fontWeight: '700', display: 'inline-block' }}>Disponible</div>
            ) : (
              <div style={{ background: '#9e9e9e', color: '#fff', padding: '8px 12px', borderRadius: 12, fontWeight: '700', display: 'inline-block' }}>No disponible</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
