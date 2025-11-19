import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { listReceivedRequestsForMascotas, approveRequest, rejectRequest } from '../api/adoptionsApi';
import { getApiBase } from '../api/apiBase';
import { getUserById } from '../api/usersApi';
import { buildMediaUrl } from '../utils/mediaUtils';
import { toast } from 'react-toastify';

function SolicitudItem({ s, onApprove, onReject, onViewImages, formatDate }) {
  const [expanded, setExpanded] = useState(false);

  const raw = String(s.estadoRaw || s.estado || '').toUpperCase();
  let color = '#a0522d';
  let badgeBg = '#fff5ee';
  if (s.isApproved || raw === 'APPROVED' || raw === 'APROBADO' || raw === 'ACCEPTED') {
    color = '#2e7d32';
    badgeBg = '#e8f5e9';
  }
  if (raw === 'REJECTED' || raw === 'RECHAZADO' || raw === 'REJECT') {
    color = '#c62828';
    badgeBg = '#ffebee';
  }
  if (s.isPending) {
    color = '#f57c00';
    badgeBg = '#fff3e0';
  }

  const statusLabel = String(s.estadoRaw || s.estado || (s.isApproved ? 'APROBADO' : 'N/D'));

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}>
      {/* Header Row - Always Visible */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          cursor: 'pointer',
          gap: 12
        }}
      >
        {/* Pet Avatar */}
        <div style={{ position: 'relative', width: 40, height: 40 }}>
          {s.petImages && s.petImages.length > 0 ? (
            <img
              src={buildMediaUrl(getApiBase('PETS_SERVER_BASE'), s.petImages[0])}
              alt={s.petName}
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#666' }}>
              {(s.petName && s.petName[0]) || '?'}
            </div>
          )}
        </div>

        {/* Names */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>{s.petName}</span>
            <span style={{ color: '#999', fontSize: 13 }}>solicitado por</span>
            <span style={{ fontWeight: 600, color: '#a0522d', fontSize: 15 }}>{s.adoptanteName}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{
          padding: '4px 10px',
          borderRadius: 12,
          background: badgeBg,
          color: color,
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap'
        }}>
          {statusLabel}
        </div>

        {/* Chevron */}
        <div style={{ color: '#ccc', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          ▼
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: '0 16px 16px 68px', animation: 'fadeIn 0.2s' }}>
          <div style={{ fontSize: 14, color: '#555', marginBottom: 8, lineHeight: 1.5 }}>
            "{s.comentariosAdoptante || s.mensaje}"
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#888', marginBottom: 12 }}>
            <span>📅 {formatDate(s.fechaSolicitud || s.fechaSolicitudUtc || s.fecha || s.createdAt)}</span>
            {s.petImages && s.petImages.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); onViewImages(s); }}
                style={{ background: 'none', border: 'none', color: '#F29C6B', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
              >
                Ver fotos de la mascota
              </button>
            )}
          </div>

          {s.motivoRechazo && (
            <div style={{ fontSize: 13, color: '#c62828', marginBottom: 12, background: '#ffebee', padding: 8, borderRadius: 6 }}>
              <b>Motivo rechazo:</b> {s.motivoRechazo}
            </div>
          )}

          {s.isPending && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={(e) => { e.stopPropagation(); onApprove(s.id); }}
                style={{
                  background: '#2e7d32',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500
                }}
              >
                Aceptar
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onReject(s.id); }}
                style={{
                  background: '#fff',
                  color: '#c62828',
                  border: '1px solid #c62828',
                  padding: '6px 14px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500
                }}
              >
                Rechazar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
  const [filter, setFilter] = useState('PENDING'); // CHANGED DEFAULT TO PENDING
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

  const handleViewImages = async (s) => {
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
  };

  return (
    <div style={{ padding: '20px 20px 40px', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ color: '#a0522d', marginBottom: 20 }}>Solicitudes recibidas</h2>

      {/* Filters */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(key => {
          const isSelected = filter === key;
          let accent = '#666';
          if (key === 'PENDING') accent = '#f57c00';
          if (key === 'APPROVED') accent = '#2e7d32';
          if (key === 'REJECTED') accent = '#c62828';

          const labelMap = {
            ALL: `Todas (${counts.ALL})`,
            PENDING: `Pendientes (${counts.PENDING})`,
            APPROVED: `Aprobadas (${counts.APPROVED})`,
            REJECTED: `Rechazadas (${counts.REJECTED})`
          };

          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '8px 14px',
                borderRadius: 20,
                border: isSelected ? `2px solid ${accent}` : '1px solid #ddd',
                background: isSelected ? '#fff' : '#f9f9f9',
                cursor: 'pointer',
                color: isSelected ? accent : '#666',
                fontWeight: isSelected ? 600 : 400,
                fontSize: 13,
                transition: 'all 0.2s'
              }}
            >
              {labelMap[key]}
            </button>
          );
        })}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 20, border: '1px solid #ddd', minWidth: 200, outline: 'none' }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading && <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>Cargando solicitudes...</div>}

        {!loading && visibleSolicitudes.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
            {solicitudes.length === 0 ? 'No tienes solicitudes recibidas.' : 'No hay solicitudes en esta categoría.'}
          </div>
        )}

        {!loading && visibleSolicitudes.map(s => (
          <SolicitudItem
            key={s.id}
            s={s}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewImages={handleViewImages}
            formatDate={formatDate}
          />
        ))}
      </div>

      {/* Image viewer modal */}
      {viewerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onKeyDown={(e) => { if (e.key === 'Escape') setViewerOpen(false); }}
          tabIndex={-1}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}
          onClick={(e) => { if (e.target === e.currentTarget) setViewerOpen(false); }}
        >
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

            <button onClick={() => setViewerOpen(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer', zIndex: 4200 }}>✕</button>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
              {viewerImages.length > 1 && (
                <button onClick={() => animateTo((viewerIndex - 1 + viewerImages.length) % viewerImages.length)} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', padding: 12, borderRadius: '50%' }}>◀</button>
              )}

              <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ maxWidth: '90%', maxHeight: '80vh', position: 'relative' }}>
                {!animating && (
                  <img src={buildMediaUrl(getApiBase('PETS_SERVER_BASE'), viewerImages[viewerIndex])} alt="foto" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 4 }} />
                )}
                {animating && (
                  <>
                    <img
                      src={animFromSrc}
                      alt="prev"
                      style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        maxWidth: '100%', maxHeight: '80vh',
                        objectFit: 'contain',
                        transition: 'opacity 360ms ease, transform 360ms ease',
                        opacity: animPhase === 'run' ? 0 : 1,
                        transform: animPhase === 'run' ? `translateX(${animDirection === 1 ? '-20%' : '20%'})` : 'translateX(0)'
                      }}
                    />
                    <img
                      src={animToSrc}
                      alt="next"
                      style={{
                        maxWidth: '100%', maxHeight: '80vh',
                        objectFit: 'contain',
                        transition: 'opacity 360ms ease, transform 360ms ease',
                        opacity: animPhase === 'run' ? 1 : 0,
                        transform: animPhase === 'run' ? 'translateX(0)' : `translateX(${animDirection === 1 ? '20%' : '-20%'})`
                      }}
                    />
                  </>
                )}
              </div>

              {viewerImages.length > 1 && (
                <button onClick={() => animateTo((viewerIndex + 1) % viewerImages.length)} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', padding: 12, borderRadius: '50%' }}>▶</button>
              )}
            </div>

            {viewerImages.length > 1 && (
              <div style={{ display: 'flex', gap: 10, padding: 20, overflowX: 'auto', maxWidth: '100%' }}>
                {viewerImages.map((mi, idx) => (
                  <img
                    key={idx}
                    src={buildMediaUrl(getApiBase('PETS_SERVER_BASE'), mi)}
                    onClick={() => animateTo(idx)}
                    alt="thumb"
                    style={{
                      width: 60, height: 60, objectFit: 'cover', borderRadius: 4,
                      border: idx === viewerIndex ? '2px solid #F29C6B' : '2px solid transparent',
                      cursor: 'pointer', opacity: idx === viewerIndex ? 1 : 0.7
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
