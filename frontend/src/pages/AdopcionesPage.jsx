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

  useEffect(() => {
    const didFetch = fetchGuardRef.current;
    if (didFetch) return; // prevent double fetch in StrictMode during development
    fetchGuardRef.current = true;
    async function load() {
      setLoading(true);
      try {
        const ownerId = user?.id || (user?.perfil && user.perfil.id);
        const API_BASE = PETS_API_BASE || (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082');
        // 1) Obtener mascotas del propietario y filtrar las no disponibles (suponemos adoptadas)
        let myAdopted = [];
        if (ownerId) {
          const res = await fetch(`${API_BASE}/api/mascotas/propietario/${ownerId}`);
          if (res.ok) {
            const data = await res.json();
            myAdopted = Array.isArray(data) ? data.filter(m => m.disponibleAdopcion === false) : [];
          };
        }

        // 2) Además, si el usuario fue solicitante y la solicitud fue aprobada, mostrar esas mascotas
        let adoptedViaRequests = [];
        try {
          const solicitanteId = user?.id || (user?.perfil && user.perfil.id);
          if (solicitanteId) {
            const reqs = await listAdoptionsBySolicitante(solicitanteId);
            if (Array.isArray(reqs)) {
              // mantener solo aprobadas y adjuntar la mascota (si viene en la respuesta) o intentar fetch
              const approved = reqs.filter(r => String(r.estado).toUpperCase() === 'APPROVED' || String(r.estado).toUpperCase() === 'APROBADO');
              // normalizar mascotas
              const petIds = [...new Set(approved.map(a => a.mascotaId).filter(Boolean))];
              const petMap = {};
              await Promise.all(petIds.map(async pid => {
                try {
                  const r = await fetch(`${API_BASE}/api/mascotas/${pid}`);
                  if (r.ok) petMap[pid] = await r.json();
                } catch (e) { }
              }));
              // fetch evaluator names for approved requests (if evaluadorId present)
              const evaluatorIds = [...new Set(approved.map(a => a.evaluadorId).filter(Boolean))];
              const evaluatorMap = {};
              await Promise.all(evaluatorIds.map(async eid => {
                try {
                  const u = await getUserById(eid);
                  if (u) evaluatorMap[String(eid)] = u; // use string keys to avoid number vs string mismatch
                } catch (e) { }
              }));

              adoptedViaRequests = approved.map(a => ({ ...a, mascota: petMap[a.mascotaId], evaluador: a.evaluadorId ? evaluatorMap[String(a.evaluadorId)] || null : null }));
            }
          }
        } catch (e) { /* ignore */ }

        // Build final list: mascotas adoptadas por el usuario (por propiedad) + mascotas adoptadas por solicitudes
        const adoptadasNormalized = [
          ...myAdopted.map(m => ({ id: m.id, mascota: m, tipo: 'propia' })),
          ...adoptedViaRequests.map(r => ({ id: `req-${r.id}`, mascota: (r.mascota ? { ...r.mascota, disponibleAdopcion: false } : { id: r.mascotaId, nombre: 'Mascota #' + r.mascotaId, disponibleAdopcion: false }), tipo: 'por_solicitud', solicitud: r, evaluador: r.evaluador || null }))
        ];

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
