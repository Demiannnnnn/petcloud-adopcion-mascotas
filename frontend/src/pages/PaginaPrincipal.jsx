
import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { getRefugiosByEmpresa, registrarRefugio } from '../api/refugiosApi';
import { useNavigate } from 'react-router-dom';
import MascotaRegistroModal from '../components/MascotaRegistroModal';
import SolicitarAdopcionModal from '../components/SolicitarAdopcionModal';
import { listReceivedRequestsForMascotas } from '../api/adoptionsApi';
import { getUserById } from '../api/usersApi';
import MascotaCard from '../components/MascotaCard';
import { getApiBase } from '../api/apiBase';
import { AuthContext } from '../context/AuthContext';
import './LoginPage.css';



function PaginaPrincipal() {
  const { user } = useContext(AuthContext) || {};
  const PETS_BASE = getApiBase('PETS');
  // Estado para refugios (solo empresa)
  const [refugios, setRefugios] = useState([]);
  const [modalRefugioOpen, setModalRefugioOpen] = useState(false);
  const [nuevoRefugio, setNuevoRefugio] = useState({ nombre: '', direccion: '', contactoSuffix: '' });
  const [refugioError, setRefugioError] = useState('');
  const isRefugioValid = !!(nuevoRefugio.nombre && nuevoRefugio.direccion && /^\d{8}$/.test(nuevoRefugio.contactoSuffix));

  const handleRegistrarRefugio = async (e) => {
    e.preventDefault();
    setRefugioError('');
    if (!nuevoRefugio.nombre || !nuevoRefugio.direccion || !nuevoRefugio.contactoSuffix) {
      setRefugioError('Todos los campos son obligatorios');
      return;
    }
    // Combinar prefijo +569 y validar que el sufijo tenga 8 dígitos
    const contactoFull = '+569' + (nuevoRefugio.contactoSuffix || '');
    if (!/^\+569\d{8}$/.test(contactoFull)) {
      setRefugioError('Contacto inválido. Debe comenzar con +569 y contener 8 dígitos (ej: +56912345678)');
      return;
    }
    try {
      const refugioNuevo = {
        nombre: nuevoRefugio.nombre,
        direccion: nuevoRefugio.direccion,
        contacto: contactoFull,
        empresaId: user?.perfil?.id
      };
      await registrarRefugio(refugioNuevo);
      // Recargar refugios
      const refugiosActualizados = await getRefugiosByEmpresa(user.perfil.id);
      setRefugios(Array.isArray(refugiosActualizados) ? refugiosActualizados : []);
      setNuevoRefugio({ nombre: '', direccion: '', contactoSuffix: '' });
      setModalRefugioOpen(false);
    } catch (err) {
      toast.error('Error al registrar refugio');
    }
  };
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMascota, setEditingMascota] = useState(null);
  const [mascotas, setMascotas] = useState([]);
  const [publicMascotas, setPublicMascotas] = useState([]);
  const [adoptionModalOpen, setAdoptionModalOpen] = useState(false);
  const [adoptingMascota, setAdoptingMascota] = useState(null);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('ALL');
  const [isMascotaDetailOpen, setIsMascotaDetailOpen] = useState(false);

  // Cargar mascotas del usuario al iniciar sesión o recargar
  React.useEffect(() => {
    async function fetchMascotasUsuario() {
      if (user && (user.id || (user.perfil && user.perfil.id))) {
        const propietarioId = user.id || (user.perfil && user.perfil.id);
        try {
            const PETS_BASE = getApiBase('PETS');
            const response = await fetch(`${PETS_BASE}/mascotas/propietario/${propietarioId}`);
          if (response.ok) {
              const data = await response.json();
              const pets = Array.isArray(data) ? data : [];
              // Attempt to detect approved adoptions for owner's pets and annotate them
              try {
                const ids = pets.map(p => p.id).filter(Boolean);
                if (ids.length > 0) {
                  const rec = await listReceivedRequestsForMascotas(ids);
                  if (Array.isArray(rec) && rec.length > 0) {
                    const approved = rec.filter(r => r && r.estado && (String(r.estado).toUpperCase() === 'APPROVED' || String(r.estado).toUpperCase() === 'APROBADO'));
                    const byPet = {};
                    approved.forEach(r => { if (r.mascotaId) byPet[r.mascotaId] = r; });
                    // resolve adopter names
                    const adopterIds = [...new Set(approved.map(a => a.adoptanteId).filter(Boolean))];
                    const adopterMap = {};
                    await Promise.all(adopterIds.map(async id => {
                      try {
                        const u = await getUserById(id);
                        if (u) adopterMap[String(id)] = u;
                      } catch (e) { /* ignore */ }
                    }));
                    // attach metadata to pets
                    for (let i = 0; i < pets.length; i++) {
                      const p = pets[i];
                      const req = byPet[p.id];
                      if (req) {
                        p.disponibleAdopcion = false;
                        p.adoptanteId = req.adoptanteId || req.solicitanteId || null;
                        const u = adopterMap[String(p.adoptanteId)];
                        if (u) p.adoptanteName = u.nombreCompleto || u.nombreEmpresa || u.username || (u.email ? u.email.split('@')[0] : undefined);
                        p.adopcionSolicitud = req;
                      }
                    }
                  }
                }
              } catch (e) {
                // if anything fails, fall back to raw pets
              }
              setMascotas(pets);
            } else {
              setMascotas([]);
            }
        } catch (err) {
          setMascotas([]);
        }
      } else {
        setMascotas([]);
      }
    }
    fetchMascotasUsuario();
    // listen for global updates (dispatched after approval)
    function onMascotaUpdated(e) {
      const updated = e?.detail;
      if (!updated) return;
      setMascotas(prev => {
        const found = prev.find(p => String(p.id) === String(updated.id));
        if (found) return prev.map(p => String(p.id) === String(updated.id) ? updated : p);
        return prev;
      });
      setPublicMascotas(prev => {
        const found = prev.find(p => String(p.id) === String(updated.id));
        if (found) return prev.map(p => String(p.id) === String(updated.id) ? updated : p);
        return prev;
      });
    }
    window.addEventListener('mascota.updated', onMascotaUpdated);
    return () => window.removeEventListener('mascota.updated', onMascotaUpdated);
  }, [user]);

  // Cargar mascotas públicas (disponibles para adopción)
  // NOTE: Some deployments rely on the adoptions microservice to record approvals
  // and may not update the pet's `disponibleAdopcion` flag immediately. To avoid
  // showing already-adopted pets as "Disponible" we query the adoptions service
  // for received requests and mark pets with an approved request as not available.
  React.useEffect(() => {
    async function fetchPublicMascotas() {
      try {
  const PETS_BASE = getApiBase('PETS');
  const res = await fetch(`${PETS_BASE}/mascotas`);
        if (!res.ok) { setPublicMascotas([]); return; }
        const data = await res.json();
        let disponibles = Array.isArray(data) ? data.slice() : [];

        try {
          const mascotaIds = disponibles.map(m => m.id).filter(Boolean);
          if (mascotaIds.length > 0) {
            const solicitudes = await listReceivedRequestsForMascotas(mascotaIds);
            if (Array.isArray(solicitudes) && solicitudes.length > 0) {
              const aprobadas = new Set(solicitudes
                .filter(r => r && r.estado && (String(r.estado).toUpperCase() === 'APPROVED' || String(r.estado).toUpperCase() === 'APROBADO'))
                .map(r => r.mascotaId)
              );
              // mark mascotas with approved solicitudes as not available
              disponibles = disponibles.map(m => ({ ...m, disponibleAdopcion: aprobadas.has(m.id) ? false : Boolean(m.disponibleAdopcion) }));
            }
          }
        } catch (e) {
          // if adoptions query fails, fallback to backend-provided flags
        }

        // finally keep only those currently available
        const filtradas = Array.isArray(disponibles) ? disponibles.filter(m => m.disponibleAdopcion) : [];
        setPublicMascotas(filtradas);
      } catch (err) {
        setPublicMascotas([]);
      }
    }
    fetchPublicMascotas();
  }, []);

  // Cargar refugios asociados a la empresa cuando el usuario es empresa
  React.useEffect(() => {
    async function fetchRefugiosEmpresa() {
      if (user && user.perfil && user.perfil.tipoPerfil === 'EMPRESA' && user.perfil.id) {
        try {
          const data = await getRefugiosByEmpresa(user.perfil.id);
          setRefugios(Array.isArray(data) ? data : []);
        } catch (err) {
          setRefugios([]);
        }
      } else {
        setRefugios([]);
      }
    }
    fetchRefugiosEmpresa();
  }, [user]);

  // Excluir mascotas del propio usuario y filtro simple para el feed público
  const ownerId = user?.id || (user?.perfil && user.perfil.id);
  const filteredPublicMascotas = publicMascotas
    .filter(m => String(m.propietarioId) !== String(ownerId))
    .filter(m => {
      // Species filter
      if (speciesFilter && speciesFilter !== 'ALL') {
        if (speciesFilter === 'OTROS') {
          // treat especies other than Perro/Gato as OTROS
          if (m.especie && ['perro', 'gato'].includes(m.especie.toLowerCase())) return false;
        } else {
          if (!m.especie || m.especie.toLowerCase() !== speciesFilter.toLowerCase()) return false;
        }
      }
      // Text search across nombre and especie
      const q = (search || '').toLowerCase();
      if (!q) return true;
      return (m.nombre || '').toLowerCase().includes(q) || (m.especie || '').toLowerCase().includes(q);
    });

  // Detectar si es móvil
  const isMobile = window.innerWidth < 600;

  return (
    <div style={{ width: '100vw', minHeight: '100vh', position: 'relative', overflow: 'hidden', background: "url('/assets/fondo.png') no-repeat center center fixed", backgroundSize: 'cover' }}>
      {/* Header y logo */}
      {!isMascotaDetailOpen && (
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
    )}
  <img src="/assets/petcloud-logo.png" alt="PetCloud Logo" style={{ position: isMobile ? 'absolute' : 'absolute', top: isMobile ? 90 : 24, left: isMobile ? 8 : 24, width: isMobile ? 60 : 100, height: isMobile ? 60 : 100, zIndex: 101, opacity: isMascotaDetailOpen ? 0.18 : 1, transition: 'opacity 180ms ease' }} />
      
      {/* Botones de Adopciones y Donaciones */}
  <div style={{ position: isMobile ? 'absolute' : 'absolute', top: isMobile ? 90 : 24, right: isMobile ? 76 : 130, display: 'flex', gap: 8, alignItems: 'center', zIndex: 102 }}>
        <button 
          style={{ 
            background: '#400B19', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 16, 
            padding: isMobile ? '8px 12px' : '10px 16px', 
            fontSize: isMobile ? 12 : 14, 
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(64,11,25,0.10)'
          }}
          onClick={() => navigate('/adopciones')}
        >
          Adopciones
        </button>
        <button 
          style={{ 
            background: '#400B19', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 16, 
            padding: isMobile ? '8px 12px' : '10px 16px', 
            fontSize: isMobile ? 12 : 14, 
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(64,11,25,0.10)'
          }}
          onClick={() => navigate('/donaciones')}
        >
          Donaciones
        </button>
      </div>

      {/* Ícono de perfil */}
  <div style={{ position: isMobile ? 'absolute' : 'absolute', top: isMobile ? 90 : 24, right: isMobile ? 8 : 24, display: 'flex', alignItems: 'center', userSelect: 'none', zIndex: 103, pointerEvents: 'auto' }}>
        <div style={{ background: '#F29C6B', borderRadius: '50%', width: isMobile ? 60 : 90, height: isMobile ? 60 : 90, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #D9663D', cursor: 'pointer', userSelect: 'none', zIndex: 21, pointerEvents: 'auto', fontSize: isMobile ? 36 : 56 }}
          onClick={() => navigate('/perfil')}>
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
      </div>
      {/* Layout principal responsivo */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: isMobile ? '100vh' : '100vh', width: '100vw', position: 'relative', zIndex: 10 }}>
        {/* Feed público de mascotas */}
        <div style={{ flex: 1, padding: isMobile ? '170px 8px 8px 8px' : '120px 48px 32px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
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
              {['Perro', 'Gato', 'Otro'].map(spec => {
                const isActive = speciesFilter === (spec === 'Otro' ? 'OTROS' : spec);
                return (
                  <button
                    key={spec}
                    onClick={() => setSpeciesFilter(isActive ? 'ALL' : (spec === 'Otro' ? 'OTROS' : spec))}
                    style={{
                      background: isActive ? '#400B19' : '#F29C6B',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 14,
                      padding: isMobile ? '6px 10px' : '8px 18px',
                      fontWeight: 'bold',
                      fontSize: isMobile ? 13 : 15,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(64,11,25,0.10)'
                    }}
                  >
                    {spec === 'Otro' ? 'Otros' : spec + 's'}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Feed público de mascotas */}
          <div style={{ width: '100%', maxWidth: isMobile ? 340 : 900, display: 'flex', flexWrap: 'wrap', gap: isMobile ? 12 : 24, justifyContent: 'center', minHeight: 80 }}>
            {filteredPublicMascotas.length === 0 ? (
              <div style={{ color: '#a0522d', fontSize: isMobile ? 15 : 18, opacity: 0.7 }}>No hay mascotas disponibles para adopción.</div>
            ) : (
              filteredPublicMascotas.map((m) => {
                // Preferir el nombre resuelto por el backend si existe
                const publicadoPor = m.publicadoPorName
                  || (m.refugioId ? `Refugio #${m.refugioId}` : (m.propietarioId ? `Usuario #${m.propietarioId}` : undefined));
                return (
                  <MascotaCard
                    key={m.id || `${m.nombre}-${m.propietarioId || m.refugioId}`}
                    mascota={m}
                    onEdit={null}
                    onDelete={null}
                    isPublic={true}
                    publicadoPor={publicadoPor}
                    onRequestAdoption={(mascota) => { setAdoptingMascota(mascota); setAdoptionModalOpen(true); }}
                    onGalleryOpenChange={setIsMascotaDetailOpen}
                  />
                );
              })
            )}
          </div>
        </div>
        {/* Panel "Mis Mascotas" en móvil: abajo, en desktop: lateral derecho */}
        <div style={{ width: isMobile ? '100%' : 370, minWidth: isMobile ? 'unset' : 320, background: 'rgba(255,255,255,0.92)', boxShadow: isMobile ? '0 -2px 12px rgba(64,11,25,0.10)' : '-2px 0 12px rgba(64,11,25,0.10)', zIndex: 15, padding: isMobile ? '18px 8px 32px 8px' : '120px 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: 12, marginTop: isMobile ? 8 : 0 }}>
          {/* Sección de refugios para empresa */}
          {user?.perfil?.tipoPerfil === 'EMPRESA' && (
            <>
              <h2 style={{ color: '#a0522d', fontWeight: 'bold', fontSize: isMobile ? 18 : 22, marginBottom: 8 }}>Refugios</h2>
              <button onClick={() => setModalRefugioOpen(true)} style={{ background: '#F29C6B', color: '#fff', border: 'none', borderRadius: 18, padding: isMobile ? '7px 12px' : '8px 18px', fontWeight: 'bold', fontSize: isMobile ? 15 : 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(64,11,25,0.10)', marginBottom: 8 }}>+ Registrar Refugio</button>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 8 : 16, minHeight: 60 }}>
                {refugios.length === 0 ? (
                  <div style={{ color: '#a0522d', fontSize: isMobile ? 14 : 16, opacity: 0.7 }}>No tienes refugios registrados.</div>
                ) : (
                  refugios.map((r, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 8px rgba(64,11,25,0.10)', padding: 12, minWidth: 120, maxWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: '#a0522d', fontSize: 16, marginBottom: 2 }}>{r.nombre}</div>
                      <div style={{ fontSize: 14, color: '#400B19', opacity: 0.8 }}>{r.direccion}</div>
                      <div style={{ fontSize: 13, color: '#400B19', opacity: 0.7 }}>{r.contacto}</div>
                    </div>
                  ))
                )}
              </div>
              {/* Modal para registrar refugio */}
              {modalRefugioOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(64,11,25,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <form onSubmit={handleRegistrarRefugio} style={{ background: '#fff', borderRadius: 24, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 24px rgba(64,11,25,0.15)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h2 style={{ color: '#a0522d', textAlign: 'center', marginBottom: 8 }}>Registrar Refugio</h2>
                    <input type="text" placeholder="Nombre del refugio" value={nuevoRefugio.nombre} onChange={e => setNuevoRefugio({ ...nuevoRefugio, nombre: e.target.value })} required style={{ borderRadius: 12, border: '2px solid #F29C6B', padding: '8px 16px', fontSize: 16, marginBottom: 4 }} />
                    <input type="text" placeholder="Dirección" value={nuevoRefugio.direccion} onChange={e => setNuevoRefugio({ ...nuevoRefugio, direccion: e.target.value })} required style={{ borderRadius: 12, border: '2px solid #F29C6B', padding: '8px 16px', fontSize: 16, marginBottom: 4 }} />
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="text" value="+569" disabled style={{ borderRadius: 12, border: '2px solid #eee', background: '#f5f5f5', padding: '8px 12px', fontSize: 16, width: 90, textAlign: 'center' }} />
                      <input
                        type="text"
                        placeholder="12345678"
                        value={nuevoRefugio.contactoSuffix}
                        onChange={e => {
                          const raw = e.target.value || '';
                          const digits = raw.replace(/\D/g, '');
                          const suffix = digits.slice(0, 8);
                          setNuevoRefugio({ ...nuevoRefugio, contactoSuffix: suffix });
                          if (!suffix) {
                            setRefugioError('');
                          } else if (/^\d{8}$/.test(suffix)) {
                            setRefugioError('');
                          } else {
                            setRefugioError('Contacto inválido. Debe contener 8 dígitos (ej: 12345678)');
                          }
                        }}
                        required
                        style={{ borderRadius: 12, border: '2px solid #F29C6B', padding: '8px 16px', fontSize: 16, marginBottom: 4, width: '100%' }}
                      />
                    </div>
                    {refugioError && <div style={{ color: '#c62828', fontSize: 13, marginTop: 4 }}>{refugioError}</div>}
                    <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                      <button type="submit" disabled={!isRefugioValid} style={{ background: '#F29C6B', color: '#fff', border: 'none', borderRadius: 14, padding: '8px 18px', fontWeight: 'bold', fontSize: 15, cursor: isRefugioValid ? 'pointer' : 'not-allowed', opacity: isRefugioValid ? 1 : 0.6 }}>Registrar</button>
                      <button type="button" style={{ background: '#c62828', color: '#fff', border: 'none', borderRadius: 14, padding: '8px 18px', fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }} onClick={() => setModalRefugioOpen(false)}>Cancelar</button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
          {/* Sección de mascotas para todos los usuarios */}
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
                  onEdit={() => { setEditingMascota(m); setEditModalOpen(true); }}
                  onDelete={() => setMascotas(mascotas.filter((_, idx) => idx !== i))}
                  refugioName={(() => {
                    const r = refugios.find(x => x.id === m.refugioId || x.id === Number(m.refugioId));
                    return r ? r.nombre : undefined;
                  })()}
                />
              ))
            )}
          </div>
  </div>
        )}
      </div>
      {/* Modal de registro de mascota */}
      <MascotaRegistroModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onRegister={async () => {
          if (user && (user.id || (user.perfil && user.perfil.id))) {
            const propietarioId = user.id || (user.perfil && user.perfil.id);
              try {
              const response = await fetch(`${PETS_BASE}/mascotas/propietario/${propietarioId}`);
              if (response.ok) {
                const data = await response.json();
                setMascotas(Array.isArray(data) ? data : []);
              } else {
                setMascotas([]);
              }
            } catch (err) {
              setMascotas([]);
            }
          } else {
            setMascotas([]);
          }
        }}
      />
      <MascotaRegistroModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingMascota(null); }}
        onRegister={async () => {
          // refresh user's mascotas
          if (user && (user.id || (user.perfil && user.perfil.id))) {
            const propietarioId = user.id || (user.perfil && user.perfil.id);
              try {
              const response = await fetch(`${PETS_BASE}/mascotas/propietario/${propietarioId}`);
              if (response.ok) {
                const data = await response.json();
                setMascotas(Array.isArray(data) ? data : []);
              } else {
                setMascotas([]);
              }
            } catch (err) {
              setMascotas([]);
            }
          } else {
            setMascotas([]);
          }
        }}
        isEdit={true}
        initialData={editingMascota}
      />
  <SolicitarAdopcionModal open={adoptionModalOpen} onClose={(sent) => { setAdoptionModalOpen(false); setAdoptingMascota(null); if (sent) { /* optionally refresh */ } }} mascota={adoptingMascota} user={user} />
      {/* Fondo decorativo */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: "url('/assets/fondo.png') no-repeat center center fixed", backgroundSize: 'cover', pointerEvents: 'none' }} />
    </div>
  );
}

export default PaginaPrincipal;
