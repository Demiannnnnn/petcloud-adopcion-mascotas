import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { formatRut, cleanRut, validateRut } from '../utils/rut';
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
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [correo, setCorreo] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  // número Whatsapp ahora separado en sufijo (sin prefijo +569)
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [condicionesHogar, setCondicionesHogar] = useState('');
  // Empresa
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [rutEmpresa, setRutEmpresa] = useState('');
  const [correoEmpresa, setCorreoEmpresa] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefonoContactoSuffix, setTelefonoContactoSuffix] = useState('');
  const [ubicacionEmpresa, setUbicacionEmpresa] = useState('');
  const [certificadoLegal, setCertificadoLegal] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validarEmail(email) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }

  const [numeroWhatsappSuffix, setNumeroWhatsappSuffix] = useState('');

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
      if (!rut || !nombreCompleto || !contraseña || !correo || !ubicacion || !numeroWhatsappSuffix || !fechaNacimiento || !condicionesHogar) {
        setError('Completa todos los campos.');
        setIsSubmitting(false);
        return;
      }
      if (!validateRut(rut)) {
        setError('RUT inválido. Por favor verifica que el RUT sea real y esté bien escrito.');
        setIsSubmitting(false);
        return;
      }
      if (!validarEmail(correo)) {
        setError('Correo electrónico inválido.');
        setIsSubmitting(false);
        return;
      }
      const numeroWhatsappFull = '+569' + numeroWhatsappSuffix;
      if (!validarWhatsapp(numeroWhatsappFull)) {
        setError('Número de WhatsApp inválido. Usa el formato +569XXXXXXXX');
        setIsSubmitting(false);
        return;
      }
      if (contraseña.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setIsSubmitting(false);
        return;
      }
      if (contraseña !== confirmarContraseña) {
        setError('Las contraseñas no coinciden.');
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
          numeroWhatsapp: numeroWhatsappFull,
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
      if (!nombreEmpresa || !rutEmpresa || !correoEmpresa || !contraseña || !direccion || !telefonoContactoSuffix || !ubicacionEmpresa || !certificadoLegal) {
        setError('Completa todos los campos, incluyendo el certificado legal.');
        return;
      }
      if (!validateRut(rutEmpresa)) {
        setError('RUT de empresa inválido. Por favor verifica que el RUT sea real.');
        return;
      }
      if (!validarEmail(correoEmpresa)) {
        setError('Correo electrónico inválido.');
        return;
      }
      if (contraseña.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setIsSubmitting(false);
        return;
      }
      if (contraseña !== confirmarContraseña) {
        setError('Las contraseñas no coinciden.');
        setIsSubmitting(false);
        return;
      }
      const telefonoContactoFull = '+569' + telefonoContactoSuffix;
      if (!telefonoContactoFull.match(/^\+569\d{8}$/)) {
        setError('Teléfono de contacto inválido. Usa el formato +569XXXXXXXX (ej: +56912345678)');
        return;
      }
      try {
        const result = await registrarEmpresa({
          nombreEmpresa,
          rutEmpresa,
          correo: correoEmpresa,
          contraseña,
          direccion,
          telefonoContacto: telefonoContactoFull,
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

  // ...existing code...

  // Detectar si es móvil
  const isMobile = window.innerWidth < 600;

  return (
    <div className="login-bg" style={{ minHeight: '100vh', width: '100vw', overflowY: isMobile ? 'auto' : 'unset', position: 'relative' }}>
      {/* Logo: fijo y pequeño solo en móvil, centrado y grande en desktop */}
      {isMobile ? null : (
        <div className="login-logo-prototype" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 32, marginBottom: 0 }}>
          <img src="/assets/petcloud-logo.png" alt="PetCloud Logo" style={{ width: '120px', height: '120px' }} />
        </div>
      )}
      <div className="login-prototype-layout" style={{ marginTop: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh' }}>
        <div className="login-container" style={{ width: isMobile ? '100%' : 'auto', maxWidth: 480, margin: '32px auto 32px auto', background: '#fff', borderRadius: 24, boxShadow: '0 2px 12px rgba(64,11,25,0.10)', padding: isMobile ? '24px 12px' : '32px 32px', position: 'relative' }}>
          {isMobile && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 16 }}>
              <img src="/assets/petcloud-logo.png" alt="PetCloud Logo" style={{ width: '80px', height: '80px' }} />
            </div>
          )}
          {/* Switch para tipo de perfil */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <button type="button" onClick={() => {
              setTipoPerfil('PERSONA');
              // Limpiar todos los campos de empresa
              setNombreEmpresa('');
              setRutEmpresa('');
              setCorreoEmpresa('');
              setContraseña('');
              setConfirmarContraseña('');
              setDireccion('');
              setTelefonoContactoSuffix('');
              setUbicacionEmpresa('');
              setCertificadoLegal(null);
              // Limpiar también campos de persona por consistencia
              setRut('');
              setNombreCompleto('');
              setCorreo('');
              setUbicacion('');
              setNumeroWhatsappSuffix('');
              setFechaNacimiento('');
              setCondicionesHogar('');
              setError('');
              setSuccess('');
              // Limpiar DOM directamente
              setTimeout(() => {
                const inputs = document.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                  // don't clear submit/button elements or disabled controls (prefix +569 is disabled)
                  if (input.type !== 'submit' && input.type !== 'button' && !input.disabled) {
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
              setConfirmarContraseña('');
              setCorreo('');
              setUbicacion('');
              setNumeroWhatsappSuffix('');
              setFechaNacimiento('');
              setCondicionesHogar('');
              // Limpiar también campos de empresa por consistencia
              setNombreEmpresa('');
              setRutEmpresa('');
              setCorreoEmpresa('');
              setDireccion('');
              setTelefonoContactoSuffix('');
              setUbicacionEmpresa('');
              setCertificadoLegal(null);
              setError('');
              setSuccess('');
              // Limpiar DOM directamente
              setTimeout(() => {
                const inputs = document.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                  // don't clear submit/button elements or disabled controls (prefix +569 is disabled)
                  if (input.type !== 'submit' && input.type !== 'button' && !input.disabled) {
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
          <form className="login-form form-blanco registro-form-blanco" onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className="login-fields" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 18, alignItems: isMobile ? 'center' : 'stretch', width: '100%' }}>
              {tipoPerfil === 'PERSONA' ? (
                <>
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>RUT</label>
                  <input type="text" value={rut} onChange={e => setRut(formatRut(e.target.value.replace(/[^0-9kK.-]/g, '')))} onBlur={e => setRut(formatRut(e.target.value))} onFocus={e => setRut(cleanRut(e.target.value))} placeholder="Ej: 12.345.678-9" style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }} />
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>Nombre completo</label>
                  <input type="text" value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} placeholder="Nombre completo" style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }} />
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>Email</label>
                  <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="Correo electrónico" style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }} />
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>Contraseña</label>
                  <input
                    type="password"
                    value={contraseña}
                    onChange={e => setContraseña(e.target.value)}
                    placeholder="Contraseña"
                    style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }}
                  />
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>Confirmar contraseña</label>
                  <input
                    type="password"
                    value={confirmarContraseña}
                    onChange={e => setConfirmarContraseña(e.target.value)}
                    placeholder="Confirmar contraseña"
                    style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }}
                  />
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>Ubicación</label>
                  <input type="text" value={ubicacion} onChange={e => setUbicacion(e.target.value)} placeholder="Ciudad, Región" style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }} />
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>Número de WhatsApp</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="text" value="+569" disabled style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, border: '2px solid #eee', background: '#f5f5f5', width: 90, textAlign: 'center' }} />
                    <input type="text" value={numeroWhatsappSuffix} onChange={e => { const digits = (e.target.value || '').replace(/\D/g, ''); const suffix = digits.slice(0, 8); setNumeroWhatsappSuffix(suffix); }} placeholder="12345678" style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }} />
                  </div>
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>Fecha de nacimiento</label>
                  <input
                    type="date"
                    value={fechaNacimiento}
                    onChange={e => setFechaNacimiento(e.target.value)}
                    max={maxDate}
                    style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }}
                  />
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>Condiciones del hogar</label>
                  <textarea value={condicionesHogar} onChange={e => setCondicionesHogar(e.target.value)} placeholder="Describe tu hogar, otros animales, niños, etc." style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }} />
                </>
              ) : (
                <>
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>Nombre de la empresa</label>
                  <input type="text" value={nombreEmpresa} onChange={e => setNombreEmpresa(e.target.value)} placeholder="Nombre de la empresa" style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }} />
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>RUT de la empresa</label>
                  <input type="text" value={rutEmpresa} onChange={e => setRutEmpresa(formatRut(e.target.value.replace(/[^0-9kK.-]/g, '')))} onBlur={e => setRutEmpresa(formatRut(e.target.value))} onFocus={e => setRutEmpresa(cleanRut(e.target.value))} placeholder="Ej: 12.345.678-9" style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }} />
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>Email de contacto</label>
                  <input type="email" value={correoEmpresa} onChange={e => setCorreoEmpresa(e.target.value)} placeholder="Correo electrónico" style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }} />
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>Contraseña</label>
                  <input
                    type="password"
                    value={contraseña}
                    onChange={e => setContraseña(e.target.value)}
                    placeholder="Contraseña"
                    style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }}
                  />
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>Confirmar contraseña</label>
                  <input
                    type="password"
                    value={confirmarContraseña}
                    onChange={e => setConfirmarContraseña(e.target.value)}
                    placeholder="Confirmar contraseña"
                    style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }}
                  />
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>Dirección</label>
                  <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Dirección completa" style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }} />
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>Teléfono de contacto</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="text" value="+569" disabled style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, border: '2px solid #eee', background: '#f5f5f5', width: 90, textAlign: 'center' }} />
                    <input type="text" value={telefonoContactoSuffix} onChange={e => { const digits = (e.target.value || '').replace(/\D/g, ''); const suffix = digits.slice(0, 8); setTelefonoContactoSuffix(suffix); }} placeholder="12345678" style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }} />
                  </div>
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>Ubicación</label>
                  <input type="text" value={ubicacionEmpresa} onChange={e => setUbicacionEmpresa(e.target.value)} placeholder="Ciudad, Región" style={{ fontSize: isMobile ? 17 : 20, padding: isMobile ? '12px' : '16px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }} />
                  <label style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'left' : 'inherit' }}>Certificado legal (PDF/JPG)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setCertificadoLegal(e.target.files[0])} style={{ fontSize: isMobile ? 15 : 18, padding: isMobile ? '8px' : '12px', borderRadius: 12, width: isMobile ? '100%' : 'auto' }} />
                </>
              )}
              {error && <div className="login-error">{error}</div>}
              {success && <div className="login-success">{success}</div>}
            </div>
            <button type="submit" className="register-btn" style={{ marginTop: '18px', width: '100%', fontSize: isMobile ? 18 : 22, padding: isMobile ? '14px' : '18px', borderRadius: 14 }} disabled={isSubmitting}>Registrarse</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistroPage;
