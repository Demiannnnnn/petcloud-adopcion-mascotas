import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { registrarPersona, registrarEmpresa } from '../api/authApi';
function RegistroPage() {
  // Fecha máxima local para el input de fecha
  const todayLocal = new Date();
  todayLocal.setHours(0, 0, 0, 0);
  const maxDate = todayLocal.toISOString().split('T')[0];
  const [tipoPerfil, setTipoPerfil] = useState('PERSONA');
  const navigate = useNavigate();
  // Persona
  const [rut, setRut] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [correo, setCorreo] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [numeroWhatsapp, setNumeroWhatsapp] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [condicionesHogar, setCondicionesHogar] = useState('');
  // Empresa
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [rutEmpresa, setRutEmpresa] = useState('');
  const [correoEmpresa, setCorreoEmpresa] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [ubicacionEmpresa, setUbicacionEmpresa] = useState('');
  const [certificadoLegal, setCertificadoLegal] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validarRut(rut) {
    // Validación simple de formato chileno
    return /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(rut);
  }

  function validarEmail(email) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }

  function validarWhatsapp(numero) {
    // Formato chileno: +569XXXXXXXX
    return /^\+569\d{8}$/.test(numero);
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting) return;
  setError('');
  setSuccess('');
  setIsSubmitting(true);
    if (tipoPerfil === 'PERSONA') {
      if (!rut || !nombreCompleto || !contraseña || !correo || !ubicacion || !numeroWhatsapp || !fechaNacimiento || !condicionesHogar) {
        setError('Completa todos los campos.');
        setIsSubmitting(false);
        return;
      }
      if (!validarRut(rut)) {
        setError('RUT inválido. Usa el formato 12.345.678-9');
        setIsSubmitting(false);
        return;
      }
      if (!validarEmail(correo)) {
        setError('Correo electrónico inválido.');
        setIsSubmitting(false);
        return;
      }
      if (!validarWhatsapp(numeroWhatsapp)) {
        setError('Número de WhatsApp inválido. Usa el formato +569XXXXXXXX');
        setIsSubmitting(false);
        return;
      }
      if (contraseña.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setIsSubmitting(false);
        return;
      }
      let fechaNacimientoFormateada = null;
      if (fechaNacimiento) {
        const partes = fechaNacimiento.split('-');
        if (partes.length === 3) {
          if (partes[0].length === 2 && partes[1].length === 2 && partes[2].length === 4) {
            fechaNacimientoFormateada = `${partes[2]}-${partes[1]}-${partes[0]}`;
          } else {
            fechaNacimientoFormateada = fechaNacimiento;
          }
        }
      }
      try {
  const result = await registrarPersona({
          rut,
          nombreCompleto,
          contraseña,
          correo,
          tipoPerfil: 'PERSONA',
          condicionesHogar,
          activo: true,
          ubicacion,
          numeroWhatsapp,
          fechaNacimiento: fechaNacimientoFormateada
        });
        if (result && result.success) {
          setError('');
          setSuccess('Registro exitoso. Redirigiendo a inicio de sesión...');
          setTimeout(() => { navigate('/login'); }, 2000);
          setIsSubmitting(true);
        } else {
          setError(result.message || 'Error en el registro');
          setIsSubmitting(false);
        }
      } catch (err) {
  setError(err.message || 'Error de conexión');
  setIsSubmitting(false);
      }
    } else {
      // EMPRESA
      if (!nombreEmpresa || !rutEmpresa || !correoEmpresa || !contraseña || !direccion || !telefonoContacto || !ubicacionEmpresa || !certificadoLegal) {
        setError('Completa todos los campos, incluyendo el certificado legal.');
        return;
      }
      if (!validarRut(rutEmpresa)) {
        setError('RUT de empresa inválido. Usa el formato 12.345.678-9');
        return;
      }
      if (!validarEmail(correoEmpresa)) {
        setError('Correo electrónico inválido.');
        return;
      }
      if (contraseña.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (!telefonoContacto.match(/^\+56\d{9}$/)) {
        setError('Teléfono de contacto inválido. Usa el formato +569XXXXXXXX');
        return;
      }
      try {
  const result = await registrarEmpresa({
          nombreEmpresa,
          rutEmpresa,
          correo: correoEmpresa,
          contraseña,
          direccion,
          telefonoContacto,
          ubicacion: ubicacionEmpresa,
          certificadoLegal,
          tipoPerfil: 'EMPRESA',
          activo: true
        });
        if (result && result.success) {
          setSuccess('Registro exitoso. Redirigiendo a inicio de sesión...');
          setTimeout(() => { navigate('/login'); }, 2000);
          setIsSubmitting(true);
        } else {
          setError(result.message || 'Error en el registro');
          setIsSubmitting(false);
        }
        return;
      } catch (err) {
  setError(err.message || 'Error de conexión');
  setIsSubmitting(false);
        return;
      }
    }
  };

  // Ícono dinámico según perfil
  const perfilIcon = tipoPerfil === 'PERSONA'
    ? (<svg width="70" height="70" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="8" r="5" /><ellipse cx="12" cy="19" rx="7" ry="4" /></svg>)
    : (
      <svg width="70" height="70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="8" width="16" height="12" rx="3" fill="#fff" stroke="#F29C6B" strokeWidth="2" />
        <rect x="8" y="12" width="2" height="4" rx="1" fill="#F29C6B" />
        <rect x="14" y="12" width="2" height="4" rx="1" fill="#F29C6B" />
        <rect x="11" y="15" width="2" height="5" rx="1" fill="#F29C6B" />
        <rect x="10" y="8" width="4" height="3" rx="1" fill="#F29C6B" />
      </svg>
    );

  return (
    <div className="login-bg">
      <div className="login-prototype-layout">
        <div className="login-logo-prototype">
          <img src="/assets/petcloud-logo.png" alt="PetCloud Logo" style={{ width: '120px', height: '120px' }} />
        </div>
        <div className="login-container">
          <div className="login-user-icon" style={{ marginTop: '20px', marginBottom: '20px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: '#F29C6B',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(64,11,25,0.10)',
              border: '3px solid #D9663D'
            }}>
              {perfilIcon}
            </div>
          </div>
          {/* Switch para tipo de perfil */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <button type="button" onClick={() => {
              setTipoPerfil('PERSONA');
              // Limpiar todos los campos de empresa
              setNombreEmpresa('');
              setRutEmpresa('');
              setCorreoEmpresa('');
              setContraseña('');
              setDireccion('');
              setTelefonoContacto('');
              setUbicacionEmpresa('');
              setCertificadoLegal(null);
              // Limpiar también campos de persona por consistencia
              setRut('');
              setNombreCompleto('');
              setCorreo('');
              setUbicacion('');
              setNumeroWhatsapp('');
              setFechaNacimiento('');
              setCondicionesHogar('');
              setError('');
              setSuccess('');
              // Limpiar DOM directamente
              setTimeout(() => {
                const inputs = document.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                  if (input.type !== 'submit' && input.type !== 'button') {
                    input.value = '';
                  }
                });
              }, 0);
            }} style={{
              background: tipoPerfil === 'PERSONA' ? '#F29C6B' : '#fff',
              color: tipoPerfil === 'PERSONA' ? '#fff' : '#F29C6B',
              border: '2px solid #F29C6B',
              borderRadius: '20px 0 0 20px',
              padding: '8px 24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              outline: 'none'
            }}>Persona <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 8, verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="9" r="4" fill="#fff" stroke="#F29C6B" strokeWidth="2" />
              <ellipse cx="11" cy="17" rx="6" ry="4" fill="#fff" stroke="#F29C6B" strokeWidth="2" />
            </svg></button>
            <button type="button" onClick={() => {
              setTipoPerfil('EMPRESA');
              // Limpiar todos los campos de persona
              setRut('');
              setNombreCompleto('');
              setContraseña('');
              setCorreo('');
              setUbicacion('');
              setNumeroWhatsapp('');
              setFechaNacimiento('');
              setCondicionesHogar('');
              // Limpiar también campos de empresa por consistencia
              setNombreEmpresa('');
              setRutEmpresa('');
              setCorreoEmpresa('');
              setDireccion('');
              setTelefonoContacto('');
              setUbicacionEmpresa('');
              setCertificadoLegal(null);
              setError('');
              setSuccess('');
              // Limpiar DOM directamente
              setTimeout(() => {
                const inputs = document.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                  if (input.type !== 'submit' && input.type !== 'button') {
                    input.value = '';
                  }
                });
              }, 0);
            }} style={{
              background: tipoPerfil === 'EMPRESA' ? '#F29C6B' : '#fff',
              color: tipoPerfil === 'EMPRESA' ? '#fff' : '#F29C6B',
              border: '2px solid #F29C6B',
              borderRadius: '0 20px 20px 0',
              padding: '8px 24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              outline: 'none'
            }}>
                Empresa <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 8, verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="8" width="16" height="12" rx="3" fill="#fff" stroke="#F29C6B" strokeWidth="2" />
                  <rect x="8" y="12" width="2" height="4" rx="1" fill="#F29C6B" />
                  <rect x="14" y="12" width="2" height="4" rx="1" fill="#F29C6B" />
                  <rect x="11" y="15" width="2" height="5" rx="1" fill="#F29C6B" />
                  <rect x="10" y="8" width="4" height="3" rx="1" fill="#F29C6B" />
                </svg>
            </button>
          </div>
          <form className="login-form form-blanco registro-form-blanco" onSubmit={handleSubmit}>
            <div className="login-fields">
              {tipoPerfil === 'PERSONA' ? (
                <>
                  <label>RUT</label>
                  <input type="text" value={rut} onChange={e => setRut(e.target.value)} placeholder="Ej: 12.345.678-9" />
                  <label>Nombre completo</label>
                  <input type="text" value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} placeholder="Nombre completo" />
                  <label>Email</label>
                  <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="Correo electrónico" />
                  <label>Contraseña</label>
                  <input 
                    type="password" 
                    value={contraseña} 
                    onChange={e => setContraseña(e.target.value)} 
                    placeholder="Contraseña" 
                  />
                  <label>Ubicación</label>
                  <input type="text" value={ubicacion} onChange={e => setUbicacion(e.target.value)} placeholder="Ciudad, Región" />
                  <label>Número de WhatsApp</label>
                  <input type="text" value={numeroWhatsapp} onChange={e => setNumeroWhatsapp(e.target.value)} placeholder="Ej: +56912345678" />
                  <label>Fecha de nacimiento</label>
                  <input
                    type="date"
                    value={fechaNacimiento}
                    onChange={e => setFechaNacimiento(e.target.value)}
                    max={maxDate}
                  />
                  <label>Condiciones del hogar</label>
                  <textarea value={condicionesHogar} onChange={e => setCondicionesHogar(e.target.value)} placeholder="Describe tu hogar, otros animales, niños, etc." />
                </>
              ) : (
                <>
                  <label>Nombre de la empresa</label>
                  <input type="text" value={nombreEmpresa} onChange={e => setNombreEmpresa(e.target.value)} placeholder="Nombre de la empresa" />
                  <label>RUT de la empresa</label>
                  <input type="text" value={rutEmpresa} onChange={e => setRutEmpresa(e.target.value)} placeholder="Ej: 12.345.678-9" />
                  <label>Email de contacto</label>
                  <input type="email" value={correoEmpresa} onChange={e => setCorreoEmpresa(e.target.value)} placeholder="Correo electrónico" />
                  <label>Contraseña</label>
                  <input 
                    type="password" 
                    value={contraseña} 
                    onChange={e => setContraseña(e.target.value)} 
                    placeholder="Contraseña" 
                  />
                  <label>Dirección</label>
                  <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Dirección completa" />
                  <label>Teléfono de contacto</label>
                  <input type="text" value={telefonoContacto} onChange={e => setTelefonoContacto(e.target.value)} placeholder="Ej: +56912345678" />
                  <label>Ubicación</label>
                  <input type="text" value={ubicacionEmpresa} onChange={e => setUbicacionEmpresa(e.target.value)} placeholder="Ciudad, Región" />
                  <label>Certificado legal (PDF/JPG)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setCertificadoLegal(e.target.files[0])} />
                </>
              )}
              {error && <div className="login-error">{error}</div>}
              {success && <div className="login-success">{success}</div>}
            </div>
            <button type="submit" className="register-btn" style={{ marginTop: '18px', width: '100%' }} disabled={isSubmitting}>Registrarse</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistroPage;
