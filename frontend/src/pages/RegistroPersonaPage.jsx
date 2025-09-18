import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { registrarPersona } from '../api/authApi';
function RegistroPersonaPage() {
  const navigate = useNavigate();
  const [rut, setRut] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [correo, setCorreo] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [numeroWhatsapp, setNumeroWhatsapp] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [condicionesHogar, setCondicionesHogar] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    if (!rut || !nombreCompleto || !contraseña || !correo || !ubicacion || !numeroWhatsapp || !fechaNacimiento || !condicionesHogar) {
      setError('Completa todos los campos.');
      setSuccess('');
      return;
    }
    if (!validarRut(rut)) {
      setError('RUT inválido. Usa el formato 12.345.678-9');
      setSuccess('');
      return;
    }
    if (!validarEmail(correo)) {
      setError('Correo electrónico inválido.');
      setSuccess('');
      return;
    }
    if (!validarWhatsapp(numeroWhatsapp)) {
      setError('Número de WhatsApp inválido. Usa el formato +569XXXXXXXX');
      setSuccess('');
      return;
    }
    if (contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setSuccess('');
      return;
    }
    setError('');
    // Formatear fecha a yyyy-MM-dd si existe
    let fechaNacimientoFormateada = null;
    if (fechaNacimiento) {
      const partes = fechaNacimiento.split('-');
      if (partes.length === 3) {
        // Si el input es dd-MM-yyyy, lo convertimos
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
        setSuccess('Registro exitoso. Redirigiendo a inicio de sesión...');
        setError('');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message || 'Error en el registro');
        setSuccess('');
      }
    } catch (err) {
      // Si el backend responde con JSON, intenta mostrar el mensaje
      if (err && err.message && err.message !== 'Error de conexión') {
        setError(err.message);
      } else {
        setError('Error de conexión');
      }
      setSuccess('');
    }
  };

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
              <svg width="70" height="70" viewBox="0 0 24 24" fill="#fff">
                <circle cx="12" cy="8" r="5" />
                <ellipse cx="12" cy="19" rx="7" ry="4" />
              </svg>
            </div>
          </div>
          <form className="login-form form-blanco registro-form-blanco" onSubmit={handleSubmit}>
            <div className="login-fields">
              <label>RUT</label>
              <input
                type="text"
                value={rut}
                onChange={e => setRut(e.target.value)}
                placeholder="Ej: 12.345.678-9"
              />
              <label>Nombre completo</label>
              <input
                type="text"
                value={nombreCompleto}
                onChange={e => setNombreCompleto(e.target.value)}
                placeholder="Nombre completo"
              />
              <label>Email</label>
              <input
                type="email"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                placeholder="Correo electrónico"
              />
              <label>Contraseña</label>
              <input
                type="password"
                value={contraseña}
                onChange={e => setContraseña(e.target.value)}
                placeholder="Contraseña"
              />
              <label>Ubicación</label>
              <input
                type="text"
                value={ubicacion}
                onChange={e => setUbicacion(e.target.value)}
                placeholder="Ciudad, Región"
              />
              <label>Número de WhatsApp</label>
              <input
                type="text"
                value={numeroWhatsapp}
                onChange={e => setNumeroWhatsapp(e.target.value)}
                placeholder="Ej: +56912345678"
              />
              <label>Fecha de nacimiento</label>
              <input
                type="date"
                value={fechaNacimiento}
                onChange={e => setFechaNacimiento(e.target.value)}
              />
              <label>Condiciones del hogar</label>
              <textarea
                value={condicionesHogar}
                onChange={e => setCondicionesHogar(e.target.value)}
                placeholder="Describe tu hogar, otros animales, niños, etc."
              />
              {error && <div className="login-error">{error}</div>}
              {success && <div className="login-success">{success}</div>}
            </div>
            <button type="submit" className="register-btn" style={{ marginTop: '18px', width: '100%' }}>Registrarse</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistroPersonaPage;
