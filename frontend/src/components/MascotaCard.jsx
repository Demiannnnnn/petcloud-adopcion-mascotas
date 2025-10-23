import React, { useState } from 'react';
import { getApiBase } from '../api/apiBase';
import { buildMediaUrl } from '../utils/mediaUtils';
import { normalizeTamanio, isPesoLike, formatPeso } from '../utils/mascotaUtils';
import MediaGalleryModal from './MediaGalleryModal';

export default function MascotaCard({ mascota, onEdit, onDelete, refugioName, refugioContacto, publicadoPor, isPublic, onRequestAdoption, hideAvailabilityBadge }) {
  const API_BASE = getApiBase('PETS');
  const imagenSrc = mascota.imagenUrl
    ? (typeof mascota.imagenUrl === 'string'
      ? buildMediaUrl(API_BASE, mascota.imagenUrl)
      : URL.createObjectURL(mascota.imagenUrl))
    : null;

  const [expanded] = useState(false);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryMedia, setGalleryMedia] = useState([]);

  // Prefer detailed age (years + months) when provided by the backend, otherwise fall back to the legacy `edad` field
  const edadYears = mascota.edadYears;
  const edadMonths = mascota.edadMonths;
  const ageParts = [];
  // If backend didn't return edadYears/edadMonths but fechaNacimiento exists, compute on client
  let calcYears = Number.isInteger(edadYears) ? edadYears : null;
  let calcMonths = (typeof edadMonths === 'number') ? edadMonths : null;
  if ((calcYears === null || calcMonths === null) && mascota.fechaNacimiento) {
    try {
      const b = new Date(mascota.fechaNacimiento);
      const today = new Date();
      let y = today.getFullYear() - b.getFullYear();
      let m = today.getMonth() - b.getMonth();
      // adjust if day-of-month not yet reached
      if (today.getDate() < b.getDate()) m -= 1;
      if (m < 0) { y -= 1; m += 12; }
      if (y < 0) { y = 0; m = 0; }
      calcYears = y;
      calcMonths = m;
    } catch (e) {
      // ignore parsing errors
    }
  }
  if (Number.isInteger(calcYears)) {
    ageParts.push(`${calcYears} año${calcYears === 1 ? '' : 's'}`);
  }
  if (typeof calcMonths === 'number' && calcMonths > 0) {
    ageParts.push(`${calcMonths} mes${calcMonths === 1 ? '' : 'es'}`);
  }
  const ageDisplay = ageParts.length ? ageParts.join(' ') : (mascota.edad ? `${mascota.edad} años` : '');

  function handleCardClick() {
    // Fetch latest mascota data before opening gallery so persisted media is always shown
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/mascotas`);
        if (res.ok) {
          const list = await res.json();
          const fresh = Array.isArray(list) ? list.find(x => x.id === mascota.id) : null;
          const source = fresh || mascota;
          // build mediaMapped same logic as below
          const raw = source.media || source.imagenes || source.fotos || source.files || [];
          let mediaMapped = Array.isArray(raw) ? raw.map(m => {
            if (!m) return null;
            if (typeof m === 'string') {
              const url = buildMediaUrl(API_BASE, m);
              return { url, type: '' };
            }
            const url = m.url || m.path || m.src || '';
            const finalUrl = url ? (url.startsWith('http') ? url : buildMediaUrl(API_BASE, url)) : '';
            return finalUrl ? { url: finalUrl, type: m.type || '' } : null;
          }).filter(Boolean) : [];
          if ((!mediaMapped || mediaMapped.length === 0) && source.imagenUrl) {
            const url = typeof source.imagenUrl === 'string'
              ? buildMediaUrl(API_BASE, source.imagenUrl)
              : '';
            if (url) mediaMapped.push({ url, type: 'image' });
          }
          setGalleryMedia(mediaMapped);
        } else {
          // fallback to current mascota media if fetch fails
          setGalleryMedia([]);
        }
      } catch (e) {
        setGalleryMedia([]);
      } finally {
        setGalleryOpen(true);
      }
    })();
  }

  const cardStyle = {
    background: '#fff',
    borderRadius: 18,
    boxShadow: '0 2px 8px rgba(64,11,25,0.10)',
    padding: 16,
    minWidth: 140,
    maxWidth: 220,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    transition: 'box-shadow 0.2s',
    cursor: 'pointer'
  };

  if (hideAvailabilityBadge) {
    // When the availability badge is hidden (e.g. in "Mis mascotas adoptadas"),
    // add some bottom padding and ensure the card content is visually centered.
    const isMobile = (typeof window !== 'undefined') ? window.innerWidth < 600 : false;
    cardStyle.paddingBottom = isMobile ? 16 : 20;
    cardStyle.justifyContent = 'center';
    cardStyle.minHeight = isMobile ? 160 : 200; // responsive height for mobile/desktop
  }

  return (
    <div onClick={handleCardClick} style={cardStyle}>
      {/* Edit button - shown only when onEdit is provided (PaginaPrincipal pasa onEdit sólo para las mascotas del usuario) */}
      {onEdit && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit && onEdit(); }}
          title="Editar mascota"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: '#fff',
            border: '1px solid #F29C6B',
            color: '#a0522d',
            width: 34,
            height: 34,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 5
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#a0522d" />
            <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#a0522d" />
          </svg>
        </button>
      )}
      {imagenSrc && (
        <img src={imagenSrc} alt={mascota.nombre} style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: '50%', marginBottom: 8, border: '3px solid #F29C6B' }} />
      )}

      <div style={{ fontWeight: 'bold', color: '#a0522d', fontSize: 18, marginBottom: 2 }}>{mascota.nombre}</div>
      <div style={{ fontSize: 15, color: '#400B19', opacity: 0.8 }}>{mascota.especie}</div>
      {refugioName && <div style={{ fontSize: 12, color: '#6b4b3a', opacity: 0.9, marginTop: 6 }}>Refugio: {refugioName}</div>}
      {publicadoPor && <div style={{ fontSize: 12, color: '#6b4b3a', opacity: 0.9, marginTop: 6 }}>Publicado por: {publicadoPor}</div>}

      {/* Availability badge placed inline below avatar to avoid overlap */}
      {!hideAvailabilityBadge && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span style={{ width:10, height:10, borderRadius:12, background: mascota.disponibleAdopcion ? '#a5f5b6' : '#e0e0e0', display:'inline-block' }} />
          <span style={{ background: mascota.disponibleAdopcion ? '#4caf50' : '#9e9e9e', color: '#fff', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>{mascota.disponibleAdopcion ? 'Disponible' : (mascota.adoptanteName ? 'Adoptada' : 'No disponible')}</span>
        </div>
      )}

      {/* If we know who adopted the pet, show that info in a small subtitle */}
      {mascota.adoptanteName && (
        <div style={{ marginTop: 6, fontSize: 12, color: '#6b4b3a', opacity: 0.9 }}>Adoptada por: <b style={{ color: '#444' }}>{mascota.adoptanteName}</b></div>
      )}

      <div style={{ fontSize: 14, color: '#400B19', opacity: 0.6 }}>{mascota.raza}</div>
      {/* Mostrar tamaño/peso si existe */}
      {(() => {
        const rawTam = mascota.tamaño || mascota.tamanio || mascota.tamano || mascota.peso || mascota.pesoKg || '';
        if (!rawTam && rawTam !== 0) return null;
        if (isPesoLike(rawTam)) {
          return <div style={{ fontSize: 13, color: '#400B19', opacity: 0.6 }}>Peso: {formatPeso(rawTam)}</div>;
        }
        const displayTam = normalizeTamanio(rawTam);
        return displayTam ? <div style={{ fontSize: 13, color: '#400B19', opacity: 0.6 }}>Tamaño: {displayTam}</div> : null;
      })()}
      {/* Show only the computed age on the card (years + months). The full "Nacido el" date is shown in the gallery modal. */}
      <div style={{ fontSize: 13, color: '#400B19', opacity: 0.5 }}>{ageDisplay || 'N/A'}</div>

  {/* Expanded details (animated) */}
      <div style={{ width: '100%', overflow: 'hidden', transition: 'max-height 300ms ease, opacity 220ms ease', maxHeight: expanded ? 240 : 0, opacity: expanded ? 1 : 0 }}>
        {expanded && (
          <div style={{ marginTop: 10, width: '100%', textAlign: 'left', fontSize: 13, color: '#4a2f24' }}>
            {mascota.ubicacion && (<div><b>Ubicación:</b> {mascota.ubicacion}</div>)}
            {mascota.descripcion && (<div style={{ marginTop: 6 }}>{mascota.descripcion}</div>)}
            <div style={{ marginTop: 6 }}><b>Sexo:</b> {mascota.sexo || 'N/A'}</div>
            <div><b>Edad:</b> {ageDisplay || 'N/A'}</div>
            <div><b>Registrada:</b> {mascota.fechaRegistro ? new Date(mascota.fechaRegistro).toLocaleDateString() : 'N/A'}</div>
            {refugioContacto && (<div style={{ marginTop:6 }}><b>Contacto refugio:</b> {refugioContacto}</div>)}
          </div>
        )}
      </div>

      {/* íconos de editar y eliminar eliminados */}
      {isPublic && mascota.disponibleAdopcion && !hideAvailabilityBadge && (
        <button onClick={(e) => { e.stopPropagation(); onRequestAdoption && onRequestAdoption(mascota); }} style={{ marginTop: 12, background: '#F29C6B', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 12, cursor: 'pointer' }}>Solicitar adopción</button>
      )}

      {/* Map media from various possible shapes and ensure absolute URLs when needed */}
      {(() => {
        // API_BASE is resolved above via getApiBase('PETS')
        const raw = mascota.media || mascota.imagenes || mascota.fotos || mascota.files || [];
        // map and filter only entries with a valid final URL
        let mediaMapped = Array.isArray(raw) ? raw.map(m => {
          if (!m) return null;
          if (typeof m === 'string') {
            const url = buildMediaUrl(API_BASE, m);
            return { url, type: '' };
          }
          const url = m.url || m.path || m.src || '';
          const finalUrl = url ? (url.startsWith('http') ? url : buildMediaUrl(API_BASE, url)) : '';
          return finalUrl ? { url: finalUrl, type: m.type || '' } : null;
        }).filter(Boolean) : [];

        // if no media provided, fallback to main imagenUrl (if any)
        if ((!mediaMapped || mediaMapped.length === 0) && mascota.imagenUrl) {
          const url = typeof mascota.imagenUrl === 'string'
            ? buildMediaUrl(API_BASE, mascota.imagenUrl)
            : '';
          if (url) mediaMapped.push({ url, type: 'image' });
        }

        return (
          <MediaGalleryModal open={galleryOpen} onClose={() => setGalleryOpen(false)} media={galleryMedia.length ? galleryMedia : mediaMapped} startIndex={0} mascota={mascota} refugioName={refugioName} refugioContacto={refugioContacto} publicadoPor={publicadoPor} />
        );
      })()}
    </div>
  );
}


