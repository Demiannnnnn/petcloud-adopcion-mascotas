import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { formatRut } from '../utils/rut';
import { getRefugiosByEmpresa } from '../api/refugiosApi';
import { getMascotasByRefugio } from '../api/petsApi';
import MascotaCard from '../components/MascotaCard';

export default function PerfilPage() {
  const { user, logout } = useContext(AuthContext);
  const [mascotas, setMascotas] = useState([]);
  const [refugios, setRefugios] = useState([]);
  const [mascotasPorRefugio, setMascotasPorRefugio] = useState({});
  const [selectedRefugio, setSelectedRefugio] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [modalRefugioOpen, setModalRefugioOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [modalMascotaOpen, setModalMascotaOpen] = useState(false);

  useEffect(() => {
    async function fetchRefugiosYmascotas() {
      if (user?.perfil?.tipoPerfil === 'EMPRESA' && user?.perfil?.id) {
        try {
          const refugiosBackend = await getRefugiosByEmpresa(user.perfil.id);
          const safeRefugios = Array.isArray(refugiosBackend) ? refugiosBackend : [];
          setRefugios(safeRefugios);
          // Mascotas por refugio (defensivo)
          const mascotasMap = {};
          for (const refugio of safeRefugios) {
            if (!refugio || typeof refugio.id === 'undefined') {
              continue;
            }
            try {
              const mascotasR = await getMascotasByRefugio(refugio.id);
              mascotasMap[refugio.id] = Array.isArray(mascotasR) ? mascotasR : [];
            } catch (err) {
              console.error('Error cargando mascotas para refugio', refugio.id, err);
              mascotasMap[refugio.id] = [];
            }
          }
          setMascotasPorRefugio(mascotasMap);
        } catch (err) {
          console.error('Error cargando refugios', err);
          setRefugios([]);
        }
      } else if (user && (user.id || (user.perfil && user.perfil.id))) {
        // Persona: mascotas propias
        const propietarioId = user.id || (user.perfil && user.perfil.id);
        try {
          const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082';
          const response = await fetch(`${API_BASE}/api/mascotas/propietario/${propietarioId}`);
          if (response.ok) {
            const data = await response.json();
            setMascotas(Array.isArray(data) ? data : []);
          } else {
            setMascotas([]);
          }
        } catch (err) {
          setMascotas([]);
        }
      }
    }
    fetchRefugiosYmascotas();
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <h2>No has iniciado sesión</h2>
        <p>Por favor, inicia sesión para ver tu perfil.</p>
      </div>
    );
  }

  const tipo = user.perfil?.tipoPerfil;
  const correo = user.perfil?.correo;
  const rut = user.perfil?.rut;

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', background: '#fff', borderRadius: 24, boxShadow: '0 4px 24px rgba(64,11,25,0.10)', padding: 32 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#F29C6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, color: '#fff', fontWeight: 'bold', marginBottom: 8 }}>
          {tipo === 'EMPRESA' ? <span>🏢</span> : (user.nombre ? user.nombre[0].toUpperCase() : <span>👤</span>)}
        </div>
        <h2 style={{ color: '#a0522d', marginBottom: 4 }}>
          {user.perfil?.nombreCompleto || user.nombre || 'Usuario'}
        </h2>
        <div style={{ color: '#400B19', fontSize: 16, marginBottom: 8 }}>{correo ? correo : 'Sin email'}</div>
        <div style={{ color: '#400B19', fontSize: 15, marginBottom: 8 }}>
          <div>Tipo de perfil: {tipo === 'EMPRESA' ? 'Empresa' : 'Persona'}</div>
          <div>RUT: {rut ? formatRut(rut) : 'No registrado'}</div>
          {tipo === 'PERSONA' ? (
            <>
              <div>Teléfono: {user.perfil?.numeroWhatsapp ? user.perfil.numeroWhatsapp : 'No registrado'}</div>
              <div>Dirección: {user.perfil?.ubicacion ? user.perfil.ubicacion : 'No registrada'}</div>
              <div>Fecha de nacimiento: {user.perfil?.fechaNacimiento ? user.perfil.fechaNacimiento : 'No registrada'}</div>
            </>
          ) : (
            <>
              <div>Teléfono: {user.perfil?.telefonoContacto ? user.perfil.telefonoContacto : 'No registrado'}</div>
              <div>Dirección: {user.perfil?.direccion ? user.perfil.direccion : 'No registrada'}</div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          <button style={{ background: '#F29C6B', color: '#fff', border: 'none', borderRadius: 14, padding: '8px 18px', fontWeight: 'bold', fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(64,11,25,0.10)' }}>Editar datos</button>
          <button style={{ background: '#400B19', color: '#fff', border: 'none', borderRadius: 14, padding: '8px 18px', fontWeight: 'bold', fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(64,11,25,0.10)' }}>Cambiar contraseña</button>
        </div>
        <button
          onClick={logout}
          style={{
            marginTop: 18,
            background: '#c62828',
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '10px 28px',
            fontWeight: 'bold',
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          Cerrar sesión
        </button>
      </div>
      {/* Sección mejorada para empresa */}
      {user?.perfil?.tipoPerfil === 'EMPRESA' ? (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ color: '#a0522d', marginBottom: 12, textAlign: 'center' }}>Refugios administrados</h3>
          {refugios.length === 0 ? (
            <div style={{ color: '#a0522d', fontSize: 15, opacity: 0.7, textAlign: 'center' }}>No tienes refugios registrados.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
              {refugios.map(r => (
                <div key={r.id} style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 8px rgba(64,11,25,0.10)', padding: 12, minWidth: 140, maxWidth: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 'bold', color: '#a0522d', fontSize: 16, marginBottom: 2 }}>{r.nombre}</div>
                  <div style={{ fontSize: 14, color: '#400B19', opacity: 0.8 }}>{r.direccion}</div>
                  <div style={{ fontSize: 13, color: '#400B19', opacity: 0.7 }}>{r.contacto}</div>
                  <button style={{ background: '#400B19', color: '#fff', border: 'none', borderRadius: 12, padding: '6px 14px', fontWeight: 'bold', fontSize: 14, cursor: 'pointer', marginTop: 8 }} onClick={() => setSelectedRefugio(prev => (String(prev) === String(r.id) ? '' : r.id))}>Ver mascotas</button>
                </div>
              ))}
            </div>
          )}
          {/* Mascotas por refugio seleccionado (con animación de apertura/cierre) */}
          {
            (() => {
              const expanded = Boolean(selectedRefugio);
              const key = selectedRefugio;
              const mascotasList = selectedRefugio ? (mascotasPorRefugio[key] || mascotasPorRefugio[String(key)] || mascotasPorRefugio[Number(key)] || []) : [];
              // Determine selected refugio object (name) for header
              const selectedRefugioObj = refugios.find(r => String(r.id) === String(selectedRefugio));
              const headerTitle = selectedRefugioObj ? `Mascotas en ${selectedRefugioObj.nombre}` : 'Mascotas en refugio seleccionado';

              return (
                <div style={{ marginTop: 24 }}>
                  {expanded && <h4 style={{ color: '#a0522d', marginBottom: 8, textAlign: 'center' }}>{headerTitle}</h4>}
                  <div
                    aria-hidden={!expanded}
                    style={{
                      maxHeight: expanded ? 520 : 0,
                      opacity: expanded ? 1 : 0,
                      transform: expanded ? 'translateY(0)' : 'translateY(-6px)',
                      overflow: 'hidden',
                      transition: 'max-height 320ms ease, opacity 220ms ease, transform 260ms ease',
                    }}
                  >
                    {/* Contenido dentro del panel animado */}
                    <div style={{ paddingTop: expanded ? 12 : 0 }}>
                      {(!mascotasList || mascotasList.length === 0) ? (
                        <div style={{ color: '#a0522d', fontSize: 15, opacity: 0.7, textAlign: 'center', padding: '12px 0' }}>No hay mascotas registradas en este refugio.</div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                          {mascotasList.map((m, i) => (
                            <MascotaCard key={i} mascota={m} refugioName={refugios.find(r => String(r.id) === String(m.refugioId))?.nombre} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()
          }
        </div>
      ) : (
        // Persona: mascotas propias
        <div style={{ marginTop: 32 }}>
          <h3 style={{ color: '#a0522d', marginBottom: 12, textAlign: 'center' }}>Mascotas publicadas para adopción</h3>
          {mascotas.filter(m => m.disponibleAdopcion).length === 0 ? (
            <div style={{ color: '#a0522d', fontSize: 15, opacity: 0.7, textAlign: 'center' }}>No has publicado mascotas para adopción.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
              {mascotas.filter(m => m.disponibleAdopcion).map((m, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 8px rgba(64,11,25,0.10)', padding: 12, minWidth: 120, maxWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {m.imagenUrl && (
                    <img src={`http://localhost:8082${m.imagenUrl.startsWith('/') ? m.imagenUrl : '/uploads/' + m.imagenUrl}`} alt={m.nombre} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '50%', marginBottom: 6, border: '2px solid #F29C6B' }} />
                  )}
                  <div style={{ fontWeight: 'bold', color: '#a0522d', fontSize: 15, marginBottom: 2 }}>{m.nombre}</div>
                  <div style={{ fontSize: 13, color: '#400B19', opacity: 0.8 }}>{m.especie}</div>
                  <div style={{ fontSize: 12, color: '#400B19', opacity: 0.6 }}>{m.raza}</div>
                  <div style={{ fontSize: 12, color: '#400B19', opacity: 0.5 }}>{m.edad ? `${m.edad} años` : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
