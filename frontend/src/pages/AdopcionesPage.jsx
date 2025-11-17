import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import MascotaCard from '../components/MascotaCard';
import { API_BASE as PETS_API_BASE } from '../api/petsApi';
import { listAdoptionsBySolicitante } from '../api/adoptionsApi';
import { getUserById } from '../api/usersApi';

export default function AdopcionesPage() {
  const { user } = useContext(AuthContext) || {};
  const [adoptadas, setAdoptadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchGuardRef = useRef(false);

  // detect profile type for UI hints
  const perfilTipo = user?.perfil && user.perfil.tipoPerfil ? String(user.perfil.tipoPerfil).toUpperCase() : null;

  useEffect(() => {
    const didFetch = fetchGuardRef.current;
    if (didFetch) return; // prevent double fetch in StrictMode during development
    fetchGuardRef.current = true;
    async function load() {
      setLoading(true);
      try {
        const API_BASE = PETS_API_BASE;

        // Decide qué mostrar según el tipo de perfil:
        // - Si es un refugio/empresa (tipo 'EMPRESA'): mostrar las mascotas del propietario que ya no están disponibles (adoptadas)
        // - Si es una persona u otro tipo: mostrar únicamente las mascotas que el usuario ha adoptado (solicitudes aprobadas donde es solicitante)
        const perfilTipo = user?.perfil && user.perfil.tipoPerfil ? String(user.perfil.tipoPerfil).toUpperCase() : null;

        let adoptadasNormalized = [];

        if (perfilTipo === 'EMPRESA') {
          // refugio: mostrar mascotas del propietario que estén marcadas como no disponibles
          const ownerId = user?.id || (user?.perfil && user.perfil.id);
          let myAdopted = [];
          if (ownerId) {
            try {
              const res = await fetch(`${API_BASE}/mascotas/propietario/${ownerId}`);
              if (res.ok) {
                const data = await res.json();
                myAdopted = Array.isArray(data) ? data.filter(m => m.disponibleAdopcion === false) : [];
              }
            } catch (e) { myAdopted = []; }
          }
          adoptadasNormalized = myAdopted.map(m => ({ id: m.id, mascota: m, tipo: 'propia' }));
        } else {
          // persona: mostrar las mascotas que esta persona adoptó (solicitudes aprobadas donde es solicitante)
          let adoptedViaRequests = [];
          try {
            const solicitanteId = user?.id || (user?.perfil && user.perfil.id);
            if (solicitanteId) {
              const reqs = await listAdoptionsBySolicitante(solicitanteId);
              if (Array.isArray(reqs)) {
                const approved = reqs.filter(r => String(r.estado).toUpperCase() === 'APPROVED' || String(r.estado).toUpperCase() === 'APROBADO');
                const petIds = [...new Set(approved.map(a => a.mascotaId).filter(Boolean))];
                const petMap = {};
                await Promise.all(petIds.map(async pid => {
                  try {
                    const r = await fetch(`${API_BASE}/mascotas/${pid}`);
                    if (r.ok) petMap[pid] = await r.json();
                  } catch (e) { }
                }));
                const evaluatorIds = [...new Set(approved.map(a => a.evaluadorId).filter(Boolean))];
                const evaluatorMap = {};
                await Promise.all(evaluatorIds.map(async eid => {
                  try {
                    const u = await getUserById(eid);
                    if (u) evaluatorMap[String(eid)] = u;
                  } catch (e) { }
                }));

                adoptedViaRequests = approved.map(a => ({ id: `req-${a.id}`, mascota: (a.mascota ? { ...a.mascota, disponibleAdopcion: false } : (petMap[a.mascotaId] ? petMap[a.mascotaId] : { id: a.mascotaId, nombre: 'Mascota #' + a.mascotaId, disponibleAdopcion: false })), tipo: 'por_solicitud', solicitud: a, evaluador: a.evaluadorId ? evaluatorMap[String(a.evaluadorId)] || null : null }));
              }
            }
          } catch (e) { adoptedViaRequests = []; }

          adoptadasNormalized = adoptedViaRequests;
        }

        setAdoptadas(adoptadasNormalized);

        // Ensure any missing evaluador objects are fetched (fallback if initial batch missed them)
        (async function fetchMissingEvaluators() {
          const cache = {};
          const missingIds = [...new Set(adoptadasNormalized
            .filter(x => x.tipo === 'por_solicitud' && x.solicitud && x.solicitud.evaluadorId && !x.evaluador)
            .map(x => x.solicitud.evaluadorId))];
          if (missingIds.length === 0) return;
          await Promise.all(missingIds.map(async id => {
            try {
              const u = await getUserById(id);
              if (u) cache[String(id)] = u;
            } catch (e) { }
          }));
          if (Object.keys(cache).length === 0) return;
          // update adoptadas with resolved evaluadores
          const updated = adoptadasNormalized.map(item => {
            if (item.tipo === 'por_solicitud' && item.solicitud && item.solicitud.evaluadorId && !item.evaluador) {
              const u = cache[String(item.solicitud.evaluadorId)];
              if (u) return { ...item, evaluador: u };
            }
            return item;
          });
          setAdoptadas(updated);
        })();
      } catch (err) {
        setAdoptadas([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Mis mascotas adoptadas</h2>
      {/* explicación según tipo de perfil (chip/badge) */}
      <div style={{ marginTop: 6, marginBottom: 14, display: 'flex' }}>
        <div
          role="status"
          aria-live="polite"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: '#FFF8F1',
            color: '#7a4b34',
            padding: '8px 12px',
            borderRadius: 20,
            fontSize: 14,
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)'
          }}
        >
          <span aria-hidden style={{ fontSize: 16 }}>ℹ️</span>
          <span>
            {perfilTipo === 'EMPRESA'
              ? 'Mostrando mascotas adoptadas registradas por tu refugio.'
              : 'Mostrando las mascotas que tú has adoptado.'}
          </span>
        </div>
      </div>
      {loading ? <div>Cargando...</div> : (
        adoptadas.length === 0 ? <div>No tienes mascotas adoptadas aún.</div> : (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {adoptadas.map(a => (
                    <div key={a.id} style={{ width: 220 }}>
                    <MascotaCard mascota={a.mascota} hideAvailabilityBadge />
                    {a.tipo === 'por_solicitud' && a.solicitud ? (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ background: '#fff', padding: 10, borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', color: '#333', fontSize: 13 }}>
                          <div style={{ marginBottom: 6 }}><b>Solicitada:</b> {a.solicitud.comentariosAdoptante || a.solicitud.mensaje || ''}</div>
                          {a.solicitud.fechaRespuesta ? <div style={{ marginBottom: 6 }}><b>Fecha de adopción:</b> {new Date(a.solicitud.fechaRespuesta).toLocaleString()}</div> : null}
                          {a.evaluador ? <div><b>Evaluador:</b> {a.evaluador.tipoPerfil === 'EMPRESA' ? (a.evaluador.nombreEmpresa || a.evaluador.nombreCompleto || `#${a.evaluador.id}`) : (a.evaluador.nombreCompleto || a.evaluador.nombre || a.evaluador.username || (a.evaluador.email ? a.evaluador.email.split('@')[0] : `#${a.evaluador.id}`))}</div> : (a.solicitud.evaluadorId ? <div><b>Evaluador:</b> #{a.solicitud.evaluadorId}</div> : null)}
                        </div>
                      </div>
                    ) : null}
                  </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
