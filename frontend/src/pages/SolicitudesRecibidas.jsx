import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { listReceivedRequestsForMascotas, approveRequest, rejectRequest } from '../api/adoptionsApi';
import { getApiBase } from '../api/apiBase';
import { getUserById } from '../api/usersApi';
import { buildMediaUrl } from '../utils/mediaUtils';
import { toast } from 'react-toastify';

export default function SolicitudesRecibidas() {
  const { user } = useContext(AuthContext) || {};
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  // modal state for image viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [animFromSrc, setAnimFromSrc] = useState(null);
  const [animToSrc, setAnimToSrc] = useState(null);
  const [animDirection, setAnimDirection] = useState(1); // 1 = forward, -1 = back
  const [animPhase, setAnimPhase] = useState('idle');
  const touchStartRef = React.useRef(null);
  const [filter, setFilter] = useState('ALL'); // ALL | PENDING | APPROVED | REJECTED
  const [search, setSearch] = useState('');

  // close viewer on ESC key
  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setViewerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewerOpen]);

  // helper to format dates safely
  const formatDate = (raw) => {
    if (!raw) return 'N/D';
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return String(raw);
      return d.toLocaleString();
    } catch (e) {
      return String(raw);
    }
  };

  // helper to animate between images (crossfade + slight slide)
  const animateTo = (newIndex) => {
    if (animating || !viewerImages || newIndex === viewerIndex) return;
    const next = buildMediaUrl(getApiBase('PETS_SERVER_BASE'), viewerImages[newIndex]);
    const current = buildMediaUrl(getApiBase('PETS_SERVER_BASE'), viewerImages[viewerIndex]);
    setAnimDirection(newIndex > viewerIndex ? 1 : -1);
    setAnimFromSrc(current);
    setAnimToSrc(next);
    setAnimating(true);
    setAnimPhase('start');
    // kick to 'run' on next frame so transitions occur
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimPhase('run')));
    // duration must match CSS transition below
    const DURATION = 380;
    window.setTimeout(() => {
      setViewerIndex(newIndex);
      setAnimating(false);
      setAnimFromSrc(null);
      setAnimToSrc(null);
      setAnimPhase('idle');
    }, DURATION);
  };

  // touch handlers for swipe support on mobile
  const onTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartRef.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartRef.current == null) return;
    const endX = (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientX) || null;
    if (endX == null) { touchStartRef.current = null; return; }
    const delta = endX - touchStartRef.current;
    const THRESHOLD = 50; // pixels
    if (delta > THRESHOLD) {
      // swipe right -> previous
      const prev = (viewerIndex - 1 + viewerImages.length) % viewerImages.length;
      animateTo(prev);
    } else if (delta < -THRESHOLD) {
      // swipe left -> next
      const next = (viewerIndex + 1) % viewerImages.length;
      animateTo(next);
    }
    touchStartRef.current = null;
  };

  useEffect(() => {
    async function load() {
      if (!user) return;
      // obtener mascotas del propietario desde el frontend (se asume que PaginaPrincipal ya cargó mascotas)
      const propietarioId = user.id || (user.perfil && user.perfil.id);
      if (!propietarioId) return;
      try {
  // pedir mascotas del propietario (pets-service) y luego solicitudes para esas mascotas
  const PETS_BASE = getApiBase('PETS');
  const resp = await fetch(`${PETS_BASE}/mascotas/propietario/${propietarioId}`);
        const mascotas = resp.ok ? await resp.json() : [];
        const ids = mascotas.map(m => m.id).filter(Boolean);
        if (ids.length === 0) { setSolicitudes([]); return; }
        setLoading(true);
        const rec = await listReceivedRequestsForMascotas(ids);
        // show all requests for the owner's mascotas (do not filter by estado)
        const allRequests = Array.isArray(rec) ? rec : [];
        // sort newest first if fechaSolicitud exists
        try {
          allRequests.sort((a, b) => {
            const da = new Date(a.fechaSolicitud || a.fechaSolicitudUtc || 0).getTime() || 0;
            const db = new Date(b.fechaSolicitud || b.fechaSolicitudUtc || 0).getTime() || 0;
            return db - da;
          });
        } catch (e) {
          // ignore sort errors and continue
        }

  // Enrich requests with mascota name and adoptante name to avoid showing raw IDs
  const petCache = {};
  const userCache = {};

        const approvedSet = new Set(['APPROVED', 'ACCEPTED', 'APROBADO', 'ACCEPTED']);

  const enriched = await Promise.all((allRequests || []).map(async (r) => {
          const mascotaId = r.mascotaId;
          const adoptanteId = r.adoptanteId;
          let pet = petCache[mascotaId];
          if (!pet && mascotaId) {
            try {
              const pRes = await fetch(`${PETS_BASE}/mascotas/${mascotaId}`);
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

          const estadoRaw = String(r.estado || '').trim().toUpperCase();
          const isApproved = approvedSet.has(estadoRaw);
          const pendingSet = new Set(['PENDING', 'PENDIENTE', '0']);
          const isPending = !isApproved && pendingSet.has(estadoRaw);
          // if the request was approved, show the pet as adopted in this view
          if (isApproved) {
            pet = pet ? { ...pet } : { id: mascotaId };
            pet.disponibleAdopcion = false;
            pet.adoptanteName = adoptanteName;
          }

          return {
            ...r,
            pet,
            petName,
            petImages,
            adoptanteName,
            adoptantePerfil: adopter || null,
            isApproved,
            isPending,
            estadoRaw
           };
        }));

        setSolicitudes(enriched || []);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    }
    load();
  }, [user]);

  // derive visible list based on selected filter and search
  const visibleSolicitudes = React.useMemo(() => {
    if (!Array.isArray(solicitudes)) return [];
    const rejectedSet = new Set(['REJECTED', 'RECHAZADO', 'REJECT']);
    const q = (search || '').toString().trim().toLowerCase();
    return solicitudes.filter(s => {
      // filter by state
      if (filter === 'PENDING' && !s.isPending) return false;
      if (filter === 'APPROVED' && !s.isApproved) return false;
      if (filter === 'REJECTED' && !rejectedSet.has(String(s.estadoRaw || s.estado || '').toUpperCase())) return false;
      // search by pet name or adoptante name
      if (q) {
        const pet = (s.petName || '').toString().toLowerCase();
        const adopt = (s.adoptanteName || '').toString().toLowerCase();
        if (!pet.includes(q) && !adopt.includes(q)) return false;
      }
      return true;
    });
  }, [solicitudes, filter, search]);


  // compute counts for filters
  const counts = React.useMemo(() => {
    const result = { ALL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    if (!Array.isArray(solicitudes)) return result;
    const rejectedSet = new Set(['REJECTED', 'RECHAZADO', 'REJECT']);
    solicitudes.forEach(s => {
      result.ALL += 1;
      if (s.isPending) result.PENDING += 1;
      if (s.isApproved) result.APPROVED += 1;
      if (rejectedSet.has(String(s.estadoRaw || s.estado || '').toUpperCase())) result.REJECTED += 1;
    });
    return result;
  }, [solicitudes]);

  const handleApprove = async (id) => {
    const perfilId = user.id || (user.perfil && user.perfil.id) || '';
    const headers = { 'X-User-Perfil-Id': String(perfilId), 'X-User-Perfil-Tipo': (user.perfil && user.perfil.tipo) || 'USER' };
    const res = await approveRequest(id, headers, perfilId);
    if (res.ok) {
      // show success toast, remove locally and optionally reload list
      toast.success('Solicitud aprobada correctamente');
      setSolicitudes(prev => prev.filter(s => s.id !== id));
      // fetch the updated mascota and dispatch an event so other parts of the app can update
      try {
        const PETS_BASE = getApiBase('PETS');
        const body = await res.json();
        const mascotaId = body.mascotaId || (body && body.mascotaId) || null;
        if (mascotaId) {
          const r = await fetch(`${PETS_BASE}/mascotas/${mascotaId}`);
          if (r.ok) {
            const mascota = await r.json();
            window.dispatchEvent(new CustomEvent('mascota.updated', { detail: mascota }));
          }
        }
      } catch (e) { /* ignore */ }
    } else {
      // try to show server-provided error message
      let msg = 'Error al aprobar';
      try {
        const err = await res.json();
        if (err && err.message) msg = err.message;
      } catch (e) { /* ignore parse error */ }
      toast.error(msg);
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
      {/* filtros */}
  <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {['ALL','PENDING','APPROVED','REJECTED'].map(key => {
          const isSelected = filter === key;
          // define a small color cue per key
          let accent = '#ddd';
          if (key === 'PENDING') accent = '#f57c00';
          if (key === 'APPROVED') accent = '#2e7d32';
          if (key === 'REJECTED') accent = '#c62828';
          const label = key === 'ALL' ? `Todos (${counts.ALL})` : key === 'PENDING' ? `Pendientes (${counts.PENDING})` : key === 'APPROVED' ? `Aprobadas (${counts.APPROVED})` : `Rechazadas (${counts.REJECTED})`;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: isSelected ? `2px solid ${accent}` : '1px solid #ddd',
                background: isSelected ? '#fff5ee' : '#fff',
                cursor: 'pointer',
                color: isSelected ? accent : '#222'
              }}
            >
              {label}
            </button>
          );
        })}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            placeholder="Buscar por mascota o adoptante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', minWidth: 220 }}
          />
        </div>
      </div>
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
                <button aria-label="Anterior" onClick={() => animateTo((viewerIndex - 1 + viewerImages.length) % viewerImages.length)} style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)', zIndex: 4100, background: 'transparent', border: 'none', fontSize: 28, cursor: 'pointer' }}>◀</button>
              )}

              {/* main image area with animation and touch support */}
              <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexDirection: 'column', minHeight: 360 }}>
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 8 }}>
                  {!animating && (
                    <img src={buildMediaUrl(getApiBase('PETS_SERVER_BASE'), viewerImages[viewerIndex])} alt="foto mascota" style={{ maxHeight: '72vh', maxWidth: '100%', objectFit: 'contain', borderRadius: 8, transition: 'transform 300ms ease' }} />
                  )}
                  {animating && (
                    <>
                      <img
                        src={animFromSrc}
                        alt="prev"
                        style={{
                          position: 'absolute',
                          maxHeight: '72vh',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          borderRadius: 8,
                          transition: 'opacity 360ms ease, transform 360ms ease',
                          opacity: animPhase === 'run' ? 0 : 1,
                          transform: animPhase === 'run' ? `translateX(${animDirection === 1 ? '-20%' : '20%'})` : 'translateX(0)'
                        }}
                      />
                      <img
                        src={animToSrc}
                        alt="next"
                        style={{
                          position: 'absolute',
                          maxHeight: '72vh',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          borderRadius: 8,
                          transition: 'opacity 360ms ease, transform 360ms ease',
                          opacity: animPhase === 'run' ? 1 : 0,
                          transform: animPhase === 'run' ? 'translateX(0)' : `translateX(${animDirection === 1 ? '20%' : '-20%'})`
                        }}
                      />
                    </>
                  )}
                </div>

                {/* thumbnails strip (normal flow, below image) */}
                {viewerImages.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 6 }}>
                    {viewerImages.map((mi, idx) => (
                      <button key={idx} onClick={() => animateTo(idx)} style={{ border: idx === viewerIndex ? '2px solid #F29C6B' : '1px solid #ddd', padding: 0, borderRadius: 6, background: '#fff', cursor: 'pointer' }}>
                        <img src={buildMediaUrl(getApiBase('PETS_SERVER_BASE'), mi)} alt={`foto ${idx+1}`} style={{ width: 72, height: 72, objectFit: 'cover', display: 'block', borderRadius: 6 }} />
                      </button>
                    ))}
                  </div>
                )}

              </div>

              {viewerImages.length > 1 && (
                <button aria-label="Siguiente" onClick={() => animateTo((viewerIndex + 1) % viewerImages.length)} style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', zIndex: 4100, background: 'transparent', border: 'none', fontSize: 28, cursor: 'pointer' }}>▶</button>
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
      {loading && <div>Cargando...</div>}
      {!loading && solicitudes.length === 0 && <div>No hay solicitudes para tus mascotas</div>}
      {!loading && solicitudes.length > 0 && visibleSolicitudes.length === 0 && <div>No hay solicitudes para el filtro seleccionado</div>}
      {!loading && visibleSolicitudes.length > 0 && visibleSolicitudes.map(s => (
        <div key={s.id} style={{ background: '#fff', border: '1px solid #eee', padding: 12, borderRadius: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                  {s.petImages && s.petImages.length > 0 ? (
                    <img
                      src={buildMediaUrl(getApiBase('PETS_SERVER_BASE'), s.petImages[0])}
                      alt={s.petName || 'mascota'}
                      title="Ver galería"
                      onClick={async () => {
                          try {
                            // fetch fresh mascota to include any newly added media
                            const PETS_BASE = getApiBase('PETS');
                            const r = await fetch(`${PETS_BASE}/mascotas/${s.mascotaId}`);
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
              <div style={{ marginTop: 6 }}><b>Fecha:</b> <span style={{ marginLeft: 8 }}>{formatDate(s.fechaSolicitud || s.fechaSolicitudUtc || s.fecha || s.createdAt)}</span></div>
              <div style={{ marginTop: 6 }}>
                <b>Estado:</b>
                {(() => {
                  const raw = String(s.estadoRaw || s.estado || '').toUpperCase();
                  let color = '#a0522d';
                  if (s.isApproved || raw === 'APPROVED' || raw === 'APROBADO' || raw === 'ACCEPTED') color = '#2e7d32';
                  if (raw === 'REJECTED' || raw === 'RECHAZADO' || raw === 'REJECT') color = '#c62828';
                  if (s.isPending) color = '#f57c00';
                  return (
                    <span style={{ marginLeft: 8, fontWeight: 700, color }}>{String(s.estadoRaw || s.estado || (s.isApproved ? 'APROBADO' : 'N/D'))}</span>
                  );
                })()}
              </div>
              {s.motivoRechazo ? <div style={{ color: '#c62828', marginTop: 6 }}><b>Motivo de rechazo:</b> {s.motivoRechazo}</div> : null}
              <div style={{ marginTop: 8 }}>
                {s.isPending ? (
                  <>
                    <button onClick={() => handleApprove(s.id)} style={{ marginRight: 8 }}>Aceptar</button>
                    <button onClick={() => handleReject(s.id)}>Rechazar</button>
                  </>
                ) : null}
              </div>
            </div>
      ))}
    </div>
  );
}
