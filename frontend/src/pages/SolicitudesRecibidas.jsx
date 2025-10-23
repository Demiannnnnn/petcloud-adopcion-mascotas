import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { listReceivedRequestsForMascotas, approveRequest, rejectRequest } from '../api/adoptionsApi';
import { getApiBase } from '../api/apiBase';

export default function SolicitudesRecibidas() {
  const { user } = useContext(AuthContext) || {};
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

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
  setSolicitudes(pending || []);
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
      {loading ? <div>Cargando...</div> : (
        solicitudes.length === 0 ? <div>No hay solicitudes para tus mascotas</div> : (
          solicitudes.map(s => (
            <div key={s.id} style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, marginBottom: 8 }}>
              <div><b>Mascota ID:</b> {s.mascotaId}</div>
              <div><b>Adoptante ID:</b> {s.adoptanteId}</div>
              <div><b>Mensaje:</b> {s.comentariosAdoptante || s.mensaje}</div>
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
