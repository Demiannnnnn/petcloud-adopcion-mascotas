import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { listAdoptionsBySolicitante } from '../api/adoptionsApi';

export default function MisSolicitudes() {
  const { user } = useContext(AuthContext) || {};
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    async function load() {
      if (user && (user.id || (user.perfil && user.perfil.id))) {
        const id = user.id || user.perfil.id;
        const data = await listAdoptionsBySolicitante(id);
        setSolicitudes(Array.isArray(data) ? data : []);
      }
    }
    load();
  }, [user]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Mis solicitudes</h2>
      {solicitudes.length === 0 ? <div>No tienes solicitudes</div> : (
        solicitudes.map(s => (
          <div key={s.id} style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, marginBottom: 8 }}>
            <div><b>Mascota ID:</b> {s.mascotaId}</div>
            <div><b>Estado:</b> {s.estado}</div>
            <div><b>Mensaje:</b> {s.mensaje}</div>
          </div>
        ))
      )}
    </div>
  );
}
