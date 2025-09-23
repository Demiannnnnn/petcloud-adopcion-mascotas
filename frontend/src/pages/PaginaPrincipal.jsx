import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './LoginPage.css';

function PaginaPrincipal() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useContext(AuthContext) || {};

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: "url('assets/fondo.png') no-repeat center center fixed",
        backgroundSize: 'cover',
      }}
    >
      {/* Mensaje descriptivo arriba en el centro */}
      <div style={{
        position: 'absolute',
        top: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        background: 'rgba(255,255,255,0.85)',
        borderRadius: 18,
        padding: '12px 32px',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#a0522d',
        boxShadow: '0 2px 8px rgba(64,11,25,0.10)',
        textAlign: 'center',
        minWidth: 320,
        maxWidth: '80vw',
      }}>
  Bienvenido a PetCloud
  {user && user.perfil && user.perfil.tipoPerfil === 'PERSONA' && user.perfil.nombreCompleto ? `, ${user.perfil.nombreCompleto}` : ''}
  {user && user.perfil && user.perfil.tipoPerfil === 'EMPRESA' && user.perfil.nombreEmpresa ? `, ${user.perfil.nombreEmpresa}` : ''}
  !
      </div>
      <img src="/assets/petcloud-logo.png" alt="PetCloud Logo" style={{ position: 'absolute', top: 24, left: 24, width: 100, height: 100 }} />
      <div style={{ position: 'absolute', top: 24, right: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none', zIndex: 20, pointerEvents: 'auto' }}>
        <div style={{ background: '#F29C6B', borderRadius: '50%', width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #D9663D', cursor: 'pointer', userSelect: 'none', zIndex: 21, pointerEvents: 'auto', fontSize: 56 }}
          onClick={() => setMenuOpen(!menuOpen)}>
          {user && user.perfil && user.perfil.tipoPerfil === 'EMPRESA'
            ? (
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="8" width="16" height="12" rx="3" fill="#fff" stroke="#F29C6B" strokeWidth="2" />
                <rect x="8" y="12" width="2" height="4" rx="1" fill="#F29C6B" />
                <rect x="14" y="12" width="2" height="4" rx="1" fill="#F29C6B" />
                <rect x="11" y="15" width="2" height="5" rx="1" fill="#F29C6B" />
                <rect x="10" y="8" width="4" height="3" rx="1" fill="#F29C6B" />
              </svg>
            )
            : (
              <svg width="56" height="56" viewBox="0 0 24 24" fill="#fff">
                <circle cx="12" cy="8" r="5" />
                <ellipse cx="12" cy="19" rx="7" ry="4" />
              </svg>
            )
          }
        </div>
        {menuOpen && (
          <div style={{ marginTop: 8, background: '#F29C6B', borderRadius: 20, boxShadow: '0 2px 8px rgba(64,11,25,0.10)', padding: '8px 0', width: 140, zIndex: 2, userSelect: 'none' }}>
            <button style={{ width: '100%', background: '#400B19', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 0', fontSize: 18, marginBottom: 8, cursor: 'pointer', userSelect: 'none' }}>Ver perfil</button>
            <button style={{ width: '100%', background: '#400B19', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 0', fontSize: 18, marginBottom: 8, cursor: 'pointer', userSelect: 'none' }}>Adopciones</button>
            <button style={{ width: '100%', background: '#400B19', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 0', fontSize: 18, cursor: 'pointer', userSelect: 'none' }}>Donaciones</button>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', zIndex: 10, position: 'relative' }}>
        <div style={{ width: 400, height: 48, background: '#fff', borderRadius: 32, border: '6px solid #400B19', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(64,11,25,0.10)', position: 'relative', zIndex: 10 }}>
          <input type="text" placeholder="" style={{ width: '100%', height: '100%', border: 'none', outline: 'none', fontSize: 22, background: 'transparent', padding: '0 24px', color: '#400B19', borderRadius: 32 }} />
          <svg style={{ position: 'absolute', right: 18, top: 12 }} width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="10" width="12" height="4" rx="2" fill="#F29C6B" />
            <rect x="10" y="8" width="4" height="8" rx="2" fill="#D9663D" />
          </svg>
        </div>
      </div>
      {/* Fondo decorativo */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          background: "url('/assets/fondo.png') no-repeat center center fixed",
          backgroundSize: 'cover',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default PaginaPrincipal;
