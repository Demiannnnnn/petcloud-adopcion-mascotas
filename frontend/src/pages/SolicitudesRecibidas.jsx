import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { listReceivedRequestsForMascotas, approveRequest, rejectRequest } from '../api/adoptionsApi';
import { getApiBase } from '../api/apiBase';
import { getUserById } from '../api/usersApi';
import { buildMediaUrl } from '../utils/mediaUtils';

export default function SolicitudesRecibidas() {
  const { user } = useContext(AuthContext) || {};
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  // modal state for image viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  // close viewer on ESC key
  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setViewerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewerOpen]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      // obtener mascotas del propietario desde el frontend (se asume que PaginaPrincipal ya cargó mascotas)
      const propietarioId = user.id || (user.perfil && user.perfil.id);
      if (!propietarioId) return;
      try {
  // pedir mascotas del propietario (pets-service) y luego solicitudes para esas mascotas
  const PETS_BASE = getApiBase('PETS');
  const resp = await fetch(`${PETS_BASE}/api/mascotas/propietario/${propietarioId}`);
        const mascotas = resp.ok ? await resp.json() : [];
        const ids = mascotas.map(m => m.id).filter(Boolean);
        if (ids.length === 0) { setSolicitudes([]); return; }
        setLoading(true);
        const rec = await listReceivedRequestsForMascotas(ids);
        // show only pending requests to the owner
        const pending = Array.isArray(rec) ? rec.filter(r => r.estado === 'PENDING' || r.estado === 0 || r.estado === '0') : [];

  // Enrich requests with mascota name and adoptante name to avoid showing raw IDs
  const petCache = {};
  const userCache = {};

        const enriched = await Promise.all((pending || []).map(async (r) => {
          const mascotaId = r.mascotaId;
          const adoptanteId = r.adoptanteId;
          let pet = petCache[mascotaId];
          if (!pet && mascotaId) {
            try {
              const pRes = await fetch(`${PETS_BASE}/api/mascotas/${mascotaId}`);
              pet = pRes.ok ? await pRes.json() : null;
            } catch (e) {
              pet = null;
            }
            petCache[mascotaId] = pet;
          }

          let adopter = userCache[adoptanteId];
          if (!adopter && adoptanteId) {
            try {
              adopter = await getUserById(adoptanteId);
            } catch (e) {
              adopter = null;
            }
            userCache[adoptanteId] = adopter;
          }

          // derive display names defensively (different endpoints may return slightly different shapes)
          const petName = pet && (pet.nombre || pet.name) ? (pet.nombre || pet.name) : (mascotaId ? `#${mascotaId}` : 'N/D');

          let adoptanteName = null;
          if (adopter) {
            adoptanteName = adopter.perfil?.nombreCompleto || adopter.nombreCompleto || adopter.nombreEmpresa || adopter.nombre || adopter.username || (adopter.email ? adopter.email.split('@')[0] : null);
          }
          if (!adoptanteName) adoptanteName = adoptanteId ? `#${adoptanteId}` : 'N/D';

          // gather all available images for the pet so the modal can show a gallery
          let petImages = [];
          if (pet) {
            const raw = pet.media || pet.imagenes || pet.fotos || pet.files || [];
            if (Array.isArray(raw) && raw.length) {
              petImages = raw.map(m => {
                if (!m) return null;
                if (typeof m === 'string') return m;
                // object shape: try common properties
                return m.url || m.path || m.src || m.nombre || m.name || null;
              }).filter(Boolean);
            }
            // fallback to imagenUrl / imagen / foto
            if (petImages.length === 0 && (pet.imagenUrl || pet.imagen || pet.foto)) {
              petImages = [pet.imagenUrl || pet.imagen || pet.foto];
            }
          }

          return {
            ...r,
            petName,
            petImages,
            adoptanteName,
            adoptantePerfil: adopter || null,
          };
        }));

        setSolicitudes(enriched || []);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    }
    load();
  }, [user]);

  const handleApprove = async (id) => {
    const perfilId = user.id || (user.perfil && user.perfil.id) || '';
    const headers = { 'X-User-Perfil-Id': String(perfilId), 'X-User-Perfil-Tipo': (user.perfil && user.perfil.tipo) || 'USER' };
    const res = await approveRequest(id, headers, perfilId);
    if (res.ok) {
  // remove locally and optionally reload list
  setSolicitudes(prev => prev.filter(s => s.id !== id));
      // fetch the updated mascota and dispatch an event so other parts of the app can update
      try {
  const PETS_BASE = getApiBase('PETS');
  const body = await res.json();
        const mascotaId = body.mascotaId || (body && body.mascotaId) || null;
        if (mascotaId) {
          const r = await fetch(`${PETS_BASE}/api/mascotas/${mascotaId}`);
          if (r.ok) {
            const mascota = await r.json();
            window.dispatchEvent(new CustomEvent('mascota.updated', { detail: mascota }));
          }
        }
      } catch (e) { /* ignore */ }
    } else {
      alert('Error al aprobar');
    }
  };

  const handleReject = async (id) => {
    const motivo = prompt('Motivo de rechazo (opcional)') || '';
    const res = await rejectRequest(id, motivo);
    if (res.ok) {
      // remove locally
      setSolicitudes(prev => prev.filter(s => s.id !== id));
    } else {
      alert('Error al rechazar');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Solicitudes recibidas</h2>
      {/* Image viewer modal */}
      {viewerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onKeyDown={(e) => { if (e.key === 'Escape') setViewerOpen(false); }}
          tabIndex={-1}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}
          onClick={(e) => { if (e.target === e.currentTarget) setViewerOpen(false); }}
        >
          <div style={{ width: '90%', maxWidth: 960, maxHeight: '90%', background: '#fff', borderRadius: 12, display: 'flex', overflow: 'hidden' }}>
            <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative', flexDirection: 'column' }}>
              {/* left arrow */}
              {viewerImages.length > 1 && (
                <button aria-label="Anterior" onClick={() => setViewerIndex(i => (i - 1 + viewerImages.length) % viewerImages.length)} style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)', zIndex: 4100, background: 'transparent', border: 'none', fontSize: 28, cursor: 'pointer' }}>◀</button>
              )}
              <img src={buildMediaUrl(getApiBase('PETS'), viewerImages[viewerIndex])} alt="foto mascota" style={{ maxHeight: '72vh', maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }} />
              {/* thumbnails strip */}
              {viewerImages.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 6 }}>
                  {viewerImages.map((mi, idx) => (
                    <button key={idx} onClick={() => setViewerIndex(idx)} style={{ border: idx === viewerIndex ? '2px solid #F29C6B' : '1px solid #ddd', padding: 0, borderRadius: 6, background: '#fff', cursor: 'pointer' }}>
                      <img src={buildMediaUrl(getApiBase('PETS'), mi)} alt={`foto ${idx+1}`} style={{ width: 72, height: 72, objectFit: 'cover', display: 'block', borderRadius: 6 }} />
                    </button>
                  ))}
                </div>
              )}
              {viewerImages.length > 1 && (
                <button aria-label="Siguiente" onClick={() => setViewerIndex(i => (i + 1) % viewerImages.length)} style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', zIndex: 4100, background: 'transparent', border: 'none', fontSize: 28, cursor: 'pointer' }}>▶</button>
              )}
            </div>
            <div style={{ width: 320, padding: 18, borderLeft: '1px solid #eee', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setViewerOpen(false)} aria-label="Cerrar" style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ marginTop: 6, color: '#a0522d', fontWeight: 700 }}>{/* placeholder for pet title if desired */}</div>
              <div style={{ marginTop: 12, fontSize: 13, color: '#333' }}>
                {viewerImages.length} foto{viewerImages.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      )}
      {loading ? <div>Cargando...</div> : (
        solicitudes.length === 0 ? <div>No hay solicitudes para tus mascotas</div> : (
          solicitudes.map(s => (
            <div key={s.id} style={{ background: '#fff', border: '1px solid #eee', padding: 12, borderRadius: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                  {s.petImages && s.petImages.length > 0 ? (
                    <img
                      src={buildMediaUrl(getApiBase('PETS'), s.petImages[0])}
                      alt={s.petName || 'mascota'}
                      title="Ver galería"
                      onClick={async () => {
                          try {
                            // fetch fresh mascota to include any newly added media
                            const PETS_BASE = getApiBase('PETS');
                            const r = await fetch(`${PETS_BASE}/api/mascotas/${s.mascotaId}`);
                            let fresh = null;
                            if (r.ok) fresh = await r.json();
                            const source = fresh || ({});
                            const raw = source.media || source.imagenes || source.fotos || source.files || s.petImages || [];
                            let imgs = [];
                            if (Array.isArray(raw) && raw.length) {
                              imgs = raw.map(m => {
                                if (!m) return null;
                                if (typeof m === 'string') return m;
                                return m.url || m.path || m.src || m.nombre || m.name || null;
                              }).filter(Boolean);
                            }
                            if (imgs.length === 0 && (source.imagenUrl || source.imagen || source.foto)) imgs = [source.imagenUrl || source.imagen || source.foto];
                            if (imgs.length === 0) imgs = s.petImages.slice();
                            setViewerImages(imgs);
                            setViewerIndex(0);
                            setViewerOpen(true);
                          } catch (e) {
                            // fallback to previously-known images
                            setViewerImages(s.petImages.slice());
                            setViewerIndex(0);
                            setViewerOpen(true);
                          }
                        }
                      }
                      style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '2px solid #fff', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', cursor: 'pointer' }}
                    />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: 8, background: '#fff5ee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0522d', fontWeight: 700, fontSize: 14, border: '1px solid #f0d6c8' }}>{(s.petName && s.petName[0]) || '?'}</div>
                  )}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#a0522d' }}>Mascota</div>
                    <div style={{ fontSize: 15 }}>{s.petName || (s.mascotaId ? `#${s.mascotaId}` : 'N/D')}</div>
                  </div>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: '#F29C6B', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: 16 }}>
                    {s.adoptanteName && typeof s.adoptanteName === 'string' ? s.adoptanteName[0].toUpperCase() : 'U'}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Adoptante</div>
                    <div style={{ fontSize: 14 }}>{s.adoptanteName || (s.adoptanteId ? `#${s.adoptanteId}` : 'N/D')}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 8 }}><b>Mensaje:</b> {s.comentariosAdoptante || s.mensaje}</div>
              <div style={{ marginTop: 8 }}>
                <button onClick={() => handleApprove(s.id)} style={{ marginRight: 8 }}>Aceptar</button>
                <button onClick={() => handleReject(s.id)}>Rechazar</button>
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
}
