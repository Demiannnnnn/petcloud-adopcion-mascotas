
import React, { useState, useContext } from 'react';
import MascotaRegistroModal from '../components/MascotaRegistroModal';
import MascotaCard from '../components/MascotaCard';
import { AuthContext } from '../context/AuthContext';
import './LoginPage.css';



function PaginaPrincipal() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mascotas, setMascotas] = useState([]);
  const [publicMascotas, setPublicMascotas] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useContext(AuthContext) || {};

  // Filtro simple para el feed público
  const filteredPublicMascotas = publicMascotas.filter(m =>
    m.nombre.toLowerCase().includes(search.toLowerCase()) ||
    m.especie.toLowerCase().includes(search.toLowerCase())
  );

  // Detectar si es móvil
  const isMobile = window.innerWidth < 600;

  return (
    <div style={{ width: '100vw', minHeight: '100vh', position: 'relative', overflow: 'hidden', background: "url('/assets/fondo.png') no-repeat center center fixed", backgroundSize: 'cover' }}>
      {/* Header y logo */}
      <div style={{
        position: 'absolute',
        top: isMobile ? 8 : 32,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 18,
        padding: isMobile ? '4px 8px' : '12px 32px',
        fontSize: isMobile ? 16 : 28,
        fontWeight: 'bold',
        color: '#A0522D',
        boxShadow: '0 2px 8px rgba(64,11,25,0.10)',
        textAlign: 'center',
        minWidth: isMobile ? 180 : 320,
        maxWidth: isMobile ? '90vw' : '80vw',
        border: isMobile ? '2px solid #F29C6B' : 'none',
        lineHeight: isMobile ? '1.2' : '1.1',
        letterSpacing: isMobile ? '0.5px' : '0.2px',
        marginBottom: isMobile ? 4 : 0
      }}>
        {`Bienvenido a PetCloud${user && user.perfil ? (
          user.perfil.tipoPerfil === 'PERSONA' && user.perfil.nombreCompleto
            ? `, ${user.perfil.nombreCompleto}`
            : user.perfil.tipoPerfil === 'EMPRESA' && user.perfil.nombreEmpresa
            ? `, ${user.perfil.nombreEmpresa}`
            : ''
        ) : ''}!`}
      </div>
      <img src="/assets/petcloud-logo.png" alt="PetCloud Logo" style={{ position: 'absolute', top: isMobile ? 8 : 24, left: isMobile ? 8 : 24, width: isMobile ? 60 : 100, height: isMobile ? 60 : 100 }} />
      {/* Menú usuario */}
      <div style={{ position: 'absolute', top: isMobile ? 8 : 24, right: isMobile ? 8 : 24, display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none', zIndex: 20, pointerEvents: 'auto' }}>
        <div style={{ background: '#F29C6B', borderRadius: '50%', width: isMobile ? 60 : 90, height: isMobile ? 60 : 90, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #D9663D', cursor: 'pointer', userSelect: 'none', zIndex: 21, pointerEvents: 'auto', fontSize: isMobile ? 36 : 56 }}
          onClick={() => setMenuOpen(!menuOpen)}>
          {user && user.perfil && user.perfil.tipoPerfil === 'EMPRESA'
            ? (
              <svg width={isMobile ? '36' : '56'} height={isMobile ? '36' : '56'} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="8" width="16" height="12" rx="3" fill="#fff" stroke="#F29C6B" strokeWidth="2" />
                <rect x="8" y="12" width="2" height="4" rx="1" fill="#F29C6B" />
                <rect x="14" y="12" width="2" height="4" rx="1" fill="#F29C6B" />
                <rect x="11" y="15" width="2" height="5" rx="1" fill="#F29C6B" />
                <rect x="10" y="8" width="4" height="3" rx="1" fill="#F29C6B" />
              </svg>
            )
            : (
              <svg width={isMobile ? '36' : '56'} height={isMobile ? '36' : '56'} viewBox="0 0 24 24" fill="#fff">
                <circle cx="12" cy="8" r="5" />
                <ellipse cx="12" cy="19" rx="7" ry="4" />
              </svg>
            )
          }
        </div>
        {menuOpen && (
          <div style={{ marginTop: 8, background: '#F29C6B', borderRadius: 20, boxShadow: '0 2px 8px rgba(64,11,25,0.10)', padding: '8px 0', width: isMobile ? 100 : 140, zIndex: 2, userSelect: 'none' }}>
            <button style={{ width: '100%', background: '#400B19', color: '#fff', border: 'none', borderRadius: 12, padding: '8px 0', fontSize: isMobile ? 14 : 18, marginBottom: 8, cursor: 'pointer', userSelect: 'none' }}>Ver perfil</button>
            <button style={{ width: '100%', background: '#400B19', color: '#fff', border: 'none', borderRadius: 12, padding: '8px 0', fontSize: isMobile ? 14 : 18, marginBottom: 8, cursor: 'pointer', userSelect: 'none' }}>Adopciones</button>
            <button style={{ width: '100%', background: '#400B19', color: '#fff', border: 'none', borderRadius: 12, padding: '8px 0', fontSize: isMobile ? 14 : 18, cursor: 'pointer', userSelect: 'none' }}>Donaciones</button>
          </div>
        )}
      </div>
      {/* Layout principal responsivo */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: isMobile ? '100vh' : '100vh', width: '100vw', position: 'relative', zIndex: 10 }}>
        {/* Feed público de mascotas */}
        <div style={{ flex: 1, width: '100%', padding: isMobile ? '90px 8px 8px 8px' : '120px 48px 32px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          {/* Barra de búsqueda y filtros */}
          <div style={{ width: '100%', maxWidth: isMobile ? 340 : 600, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: 10, marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Buscar mascotas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, height: isMobile ? 38 : 48, background: '#fff', borderRadius: 32, border: '3px solid #400B19', fontSize: isMobile ? 16 : 22, padding: '0 16px', color: '#400B19', boxShadow: '0 2px 8px rgba(64,11,25,0.10)', marginBottom: isMobile ? 8 : 0 }}
            />
            <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
              <button style={{ background: '#F29C6B', color: '#fff', border: 'none', borderRadius: 14, padding: isMobile ? '6px 10px' : '8px 18px', fontWeight: 'bold', fontSize: isMobile ? 13 : 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(64,11,25,0.10)' }}>Perros</button>
              <button style={{ background: '#F29C6B', color: '#fff', border: 'none', borderRadius: 14, padding: isMobile ? '6px 10px' : '8px 18px', fontWeight: 'bold', fontSize: isMobile ? 13 : 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(64,11,25,0.10)' }}>Gatos</button>
              <button style={{ background: '#F29C6B', color: '#fff', border: 'none', borderRadius: 14, padding: isMobile ? '6px 10px' : '8px 18px', fontWeight: 'bold', fontSize: isMobile ? 13 : 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(64,11,25,0.10)' }}>Otros</button>
            </div>
          </div>
          {/* Feed público de mascotas */}
          <div style={{ width: '100%', maxWidth: isMobile ? 340 : 900, display: 'flex', flexWrap: 'wrap', gap: isMobile ? 12 : 24, justifyContent: 'center', minHeight: 80 }}>
            {filteredPublicMascotas.length === 0 ? (
              <div style={{ color: '#a0522d', fontSize: isMobile ? 15 : 18, opacity: 0.7 }}>No hay mascotas disponibles para adopción.</div>
            ) : (
              filteredPublicMascotas.map((m, i) => (
                <MascotaCard
                  key={i}
                  mascota={m}
                  onEdit={null}
                  onDelete={null}
                  isPublic={true}
                />
              ))
            )}
          </div>
        </div>
        {/* Panel "Mis Mascotas" en móvil: abajo, en desktop: lateral derecho */}
        <div style={{ width: isMobile ? '100%' : 370, minWidth: isMobile ? 'unset' : 320, background: 'rgba(255,255,255,0.92)', boxShadow: isMobile ? '0 -2px 12px rgba(64,11,25,0.10)' : '-2px 0 12px rgba(64,11,25,0.10)', position: isMobile ? 'static' : 'absolute', right: isMobile ? 'unset' : 0, top: isMobile ? 'unset' : 0, height: isMobile ? 'auto' : '100vh', zIndex: 15, padding: isMobile ? '18px 8px 32px 8px' : '120px 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: 12, marginTop: isMobile ? 8 : 0 }}>
          <h2 style={{ color: '#a0522d', fontWeight: 'bold', fontSize: isMobile ? 18 : 22, marginBottom: 8 }}>Mis Mascotas</h2>
          <button onClick={() => setModalOpen(true)} style={{ background: '#F29C6B', color: '#fff', border: 'none', borderRadius: 18, padding: isMobile ? '7px 12px' : '8px 18px', fontWeight: 'bold', fontSize: isMobile ? 15 : 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(64,11,25,0.10)', marginBottom: 8 }}>+ Registrar Mascota</button>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 8 : 16, minHeight: 60 }}>
            {mascotas.length === 0 ? (
              <div style={{ color: '#a0522d', fontSize: isMobile ? 14 : 16, opacity: 0.7 }}>No tienes mascotas registradas.</div>
            ) : (
              mascotas.map((m, i) => (
                <MascotaCard
                  key={i}
                  mascota={m}
                  onEdit={() => alert('Función editar próximamente')}
                  onDelete={() => setMascotas(mascotas.filter((_, idx) => idx !== i))}
                />
              ))
            )}
          </div>
        </div>
      </div>
      {/* Modal de registro de mascota */}
      <MascotaRegistroModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onRegister={mascota => setMascotas([...mascotas, mascota])}
      />
      {/* Fondo decorativo */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: "url('/assets/fondo.png') no-repeat center center fixed", backgroundSize: 'cover', pointerEvents: 'none' }} />
    </div>
  );
}

export default PaginaPrincipal;
