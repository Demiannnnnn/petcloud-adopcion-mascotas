import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getRefugiosByEmpresa } from '../api/refugiosApi';
import { getMascotasByRefugio } from '../api/petsApi';

export default function PerfilPage() {
  const { user, logout } = useContext(AuthContext);
  const [mascotas, setMascotas] = useState([]);
  const [refugios, setRefugios] = useState([]);
  const [mascotasPorRefugio, setMascotasPorRefugio] = useState({});
  const [selectedRefugio, setSelectedRefugio] = useState('');
  const [modalRefugioOpen, setModalRefugioOpen] = useState(false);
  const [modalMascotaOpen, setModalMascotaOpen] = useState(false);

  useEffect(() => {
    async function fetchRefugiosYmascotas() {
      if (user?.perfil?.tipoPerfil === 'EMPRESA' && user?.perfil?.id) {
        try {
          const refugiosBackend = await getRefugiosByEmpresa(user.perfil.id);
          setRefugios(Array.isArray(refugiosBackend) ? refugiosBackend : []);
          // Mascotas por refugio
          const mascotasMap = {};
          for (const refugio of refugiosBackend) {
            try {
              const mascotasR = await getMascotasByRefugio(refugio.id);
              mascotasMap[refugio.id] = Array.isArray(mascotasR) ? mascotasR : [];
            } catch {
              mascotasMap[refugio.id] = [];
            }
          }
          setMascotasPorRefugio(mascotasMap);
        } catch {
          setRefugios([]);
        }
      } else if (user && (user.id || (user.perfil && user.perfil.id))) {
        // Persona: mascotas propias
        const propietarioId = user.id || (user.perfil && user.perfil.id);
        try {
          const response = await fetch(`http://192.168.1.6:8082/api/mascotas/propietario/${propietarioId}`);
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
          <div>RUT: {rut ? rut : 'No registrado'}</div>
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
                  <button style={{ background: '#400B19', color: '#fff', border: 'none', borderRadius: 12, padding: '6px 14px', fontWeight: 'bold', fontSize: 14, cursor: 'pointer', marginTop: 8 }} onClick={() => setSelectedRefugio(r.id)}>Ver mascotas</button>
                </div>
              ))}
            </div>
          )}
          {/* Mascotas por refugio seleccionado */}
          {selectedRefugio && (
            <div style={{ marginTop: 24 }}>
              <h4 style={{ color: '#a0522d', marginBottom: 8, textAlign: 'center' }}>Mascotas en refugio seleccionado</h4>
              <button style={{ background: '#F29C6B', color: '#fff', border: 'none', borderRadius: 14, padding: '8px 18px', fontWeight: 'bold', fontSize: 15, cursor: 'pointer', marginBottom: 12 }} onClick={() => setModalMascotaOpen(true)}>+ Registrar Mascota</button>
              {mascotasPorRefugio[selectedRefugio]?.length === 0 ? (
                <div style={{ color: '#a0522d', fontSize: 15, opacity: 0.7, textAlign: 'center' }}>No hay mascotas registradas en este refugio.</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                  {mascotasPorRefugio[selectedRefugio].map((m, i) => (
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
