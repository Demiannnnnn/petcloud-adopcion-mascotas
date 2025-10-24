import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { listAdoptionsBySolicitante } from '../api/adoptionsApi';
import MascotaCard from '../components/MascotaCard';
import { API_BASE as PETS_API_BASE } from '../api/petsApi';

// Helper: translate estado values to Spanish (accepts strings or enums)
function translateEstado(estado) {
  if (estado === null || estado === undefined) return '';
  const s = String(estado).trim().toUpperCase();
  switch (s) {
    case 'PENDING':
    case 'EN_ESPERA':
      return 'Pendiente';
    case 'APPROVED':
    case 'ACCEPTED':
    case 'APROBADO':
      return 'Aprobada';
    case 'REJECTED':
    case 'RECHAZADO':
      return 'Rechazada';
    case 'CANCELLED':
    case 'CANCELED':
    case 'CANCELADO':
      return 'Cancelada';
    default:
      // fallback: return original value but capitalized
      return String(estado);
  }
}

export default function MisSolicitudes() {
  const { user } = useContext(AuthContext) || {};
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    async function load() {
      if (user && (user.id || (user.perfil && user.perfil.id))) {
        const id = user.id || user.perfil.id;
        const data = await listAdoptionsBySolicitante(id);
        const arr = Array.isArray(data) ? data : [];
        // fetch mascota details in parallel
        const petIds = [...new Set(arr.map(x => x.mascotaId).filter(Boolean))];
        const petMap = {};
        await Promise.all(petIds.map(async pid => {
          try {
            const res = await fetch(`${PETS_API_BASE}/api/mascotas/${pid}`);
            if (res.ok) {
              petMap[pid] = await res.json();
            }
          } catch (e) { /* ignore */ }
        }));
        // attach and patch mascota when the solicitud is approved so the card shows "Adoptada"
        const enriched = arr.map(a => ({ ...a, mascota: petMap[a.mascotaId] }));

        // If a solicitud was approved, the backend pet record might not have been updated yet
        // (or the client may still have stale data). For the purposes of the "Mis solicitudes"
        // view we override the mascota object so the `MascotaCard` displays Adoptada instead
        // of Disponible when the request's estado indicates approval.
        const approvedSet = new Set(['APPROVED', 'ACCEPTED', 'APROBADO', 'ACCEPTED']);
        const userDisplayName = (user && (user.perfil?.nombreCompleto || user.nombreCompleto || user.nombre || user.username)) || (user && user.email ? user.email.split('@')[0] : 'Tú');

        const adjusted = enriched.map(s => {
          const estadoRaw = String(s.estado || '').trim().toUpperCase();
          const pet = s.mascota ? { ...s.mascota } : { id: s.mascotaId, nombre: 'Mascota #' + s.mascotaId, imagenUrl: '' };
          if (approvedSet.has(estadoRaw)) {
            // mark as not available and show adopter (current user)
            pet.disponibleAdopcion = false;
            pet.adoptanteName = userDisplayName;
            // also set an adoptanteId so other components can act on it if needed
            pet.adoptanteId = user && (user.id || user.perfil?.id) ? (user.id || user.perfil?.id) : pet.adoptanteId;
          }
          return { ...s, mascota: pet };
        });

        setSolicitudes(adjusted);
      }
    }
    load();
  }, [user]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Mis solicitudes</h2>
      {solicitudes.length === 0 ? (
        <div>No tienes solicitudes</div>
      ) : (
        solicitudes.map(s => (
          <div key={s.id} style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 6px 18px rgba(64,11,25,0.06)', marginBottom: 12, display: 'flex', gap: 18, alignItems: 'flex-start', minHeight: 140 }}>
            <div style={{ width: 160, flex: '0 0 160px' }}>
              {/* Use MascotaCard so it's clickable and opens the gallery/modal */}
              <MascotaCard mascota={s.mascota ? s.mascota : { id: s.mascotaId, nombre: 'Mascota #' + s.mascotaId, imagenUrl: '' }} />
            </div>
            <div style={{ flex: 1, paddingLeft: 8 }}>
              <div style={{ fontWeight: 'bold', color: '#a0522d', marginBottom: 6 }}>{s.mascota && s.mascota.nombre ? s.mascota.nombre : `Mascota #${s.mascotaId}`}</div>
              <div><b>Estado:</b> {translateEstado(s.estado)}</div>
              {s.motivoRechazo ? <div style={{ color: '#c62828', marginTop: 6 }}><b>Motivo de rechazo:</b> {s.motivoRechazo}</div> : null}
              <div style={{ marginTop: 8 }}><b>Mensaje:</b> {s.comentariosAdoptante || s.mensaje || ''}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
