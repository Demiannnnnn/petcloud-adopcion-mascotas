import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './LoginPage.css';
import { login } from '../api/authApi';
import { formatRut, cleanRut } from '../utils/rut';
function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const CatEyeIcon = ({ open }) => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="12" rx="8" ry="6" stroke="#F29C6B" strokeWidth="2" fill="#fff" />
      <circle cx="12" cy="12" r="3.5" fill={open ? '#F29C6B' : '#fff'} stroke="#F29C6B" strokeWidth="2" />
      <path d="M4 7 Q6 4 12 4 Q18 4 20 7" stroke="#F29C6B" strokeWidth="2" fill="none" />
      <path d="M4 17 Q6 20 12 20 Q18 20 20 17" stroke="#F29C6B" strokeWidth="2" fill="none" />
    </svg>
  );
  const [rut, setRut] = useState('');
  const [rutEmpresa, setRutEmpresa] = useState('');
  const [password, setPassword] = useState('');
  const [tipoPerfil, setTipoPerfil] = useState('PERSONA');
  const [error, setError] = useState('');
  const { login: loginSession } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    window.tipoPerfilLogin = tipoPerfil;
    if (tipoPerfil === 'PERSONA') {
      if (!rut || !password) {
        setError('Por favor ingresa tu RUT y contraseña.');
        setLoading(false);
        return;
      }
      setError('');
      try {
        const result = await login(rut, password);
        if (typeof result === 'string') {
          const msg = result.toLowerCase();
          if (msg.includes('empresa') && !msg.includes('credencial')) {
            setError('Este RUT corresponde a una empresa. Cambia el tipo de perfil para iniciar sesión.');
            setLoading(false);
          } else if (msg.includes('credencial') || msg.includes('incorrect')) {
            setError('RUT o contraseña incorrectos');
            setLoading(false);
          } else {
            setError(result);
            setLoading(false);
          }
        } else {
          loginSession(result);
          setTimeout(() => {
            navigate('/principal');
          }, 700); // 700ms para mostrar el mensaje
        }
      } catch (err) {
        const msg = err && err.message ? err.message.toLowerCase() : '';
        if (msg.includes('empresa') && !msg.includes('credencial')) {
          setError('Este RUT corresponde a una empresa. Cambia el tipo de perfil para iniciar sesión.');
        } else if (msg.includes('credencial') || msg.includes('incorrect')) {
          setError('RUT o contraseña incorrectos');
        } else {
          setError(err.message);
        }
        setLoading(false);
      }
    } else {
      if (!rutEmpresa || !password) {
        setError('Por favor ingresa el RUT de empresa y contraseña.');
        setLoading(false);
        return;
      }
      setError('');
      try {
        const result = await login(rutEmpresa, password);
        if (typeof result === 'string') {
          const msg = result.toLowerCase();
          if (msg.includes('persona') && !msg.includes('credencial')) {
            setError('Este RUT corresponde a una persona. Cambia el tipo de perfil para iniciar sesión.');
            setLoading(false);
          } else if (msg.includes('credencial') || msg.includes('incorrect')) {
            setError('RUT o contraseña incorrectos');
            setLoading(false);
          } else {
            setError(result);
            setLoading(false);
          }
        } else {
          loginSession(result);
          setTimeout(() => {
            navigate('/principal');
          }, 700); // 700ms para mostrar el mensaje
        }
      } catch (err) {
        const msg = err && err.message ? err.message.toLowerCase() : '';
        if (msg.includes('persona') && !msg.includes('credencial')) {
          setError('Este RUT corresponde a una persona. Cambia el tipo de perfil para iniciar sesión.');
        } else if (msg.includes('credencial') || msg.includes('incorrect')) {
          setError('RUT o contraseña incorrectos');
        } else {
          setError(err.message);
        }
        setLoading(false);
      }
    }
  };

  // ...existing code... (perfil icon removed to avoid unused variable warning)

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">
          <img src="/assets/petcloud-logo.png" alt="PetCloud Logo" style={{ width: '120px', height: '120px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <button type="button" onClick={() => {
            setTipoPerfil('PERSONA');
            setPassword('');
            setRutEmpresa(''); // Limpiar RUT de empresa
            setRut(''); // Limpiar RUT de persona también
            setError(''); // Limpiar errores
            // Limpiar DOM directamente
            setTimeout(() => {
              const passwordInputs = document.querySelectorAll('input[type="password"]');
              const textInputs = document.querySelectorAll('input[type="text"]');
              passwordInputs.forEach(input => input.value = '');
              textInputs.forEach(input => input.value = '');
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
            setPassword('');
            setRut(''); // Limpiar RUT de persona
            setRutEmpresa(''); // Limpiar RUT de empresa también
            setError(''); // Limpiar errores
            // Limpiar DOM directamente
            setTimeout(() => {
              const passwordInputs = document.querySelectorAll('input[type="password"]');
              const textInputs = document.querySelectorAll('input[type="text"]');
              passwordInputs.forEach(input => input.value = '');
              textInputs.forEach(input => input.value = '');
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
            Empresa <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 8, verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="8" width="16" height="12" rx="3" fill="#fff" stroke="#F29C6B" strokeWidth="2" />
              <rect x="8" y="12" width="2" height="4" rx="1" fill="#F29C6B" />
              <rect x="14" y="12" width="2" height="4" rx="1" fill="#F29C6B" />
              <rect x="11" y="15" width="2" height="5" rx="1" fill="#F29C6B" />
              <rect x="10" y="8" width="4" height="3" rx="1" fill="#F29C6B" />
            </svg>
          </button>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-fields">
            {tipoPerfil === 'PERSONA' ? (
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px', width: '100%' }}>
                <label>RUT</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <input
                    type="text"
                    value={rut}
                    onChange={e => setRut(formatRut(e.target.value.replace(/[^0-9kK.-]/g, '')))}
                    onBlur={e => setRut(formatRut(e.target.value))}
                    onFocus={e => setRut(cleanRut(e.target.value))}
                    placeholder="Ej: 12.345.678-9"
                    style={{ width: '100%', height: '44px', fontSize: '16px', borderRadius: '8px', border: '1.5px solid #F29C6B', background: '#FFC891', color: '#4B1C2F', padding: '0 12px' }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px', width: '100%' }}>
                <label>RUT de empresa</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <input
                    type="text"
                    value={rutEmpresa}
                    onChange={e => setRutEmpresa(formatRut(e.target.value.replace(/[^0-9kK.-]/g, '')))}
                    onBlur={e => setRutEmpresa(formatRut(e.target.value))}
                    onFocus={e => setRutEmpresa(cleanRut(e.target.value))}
                    placeholder="Ej: 12.345.678-9"
                    style={{ width: '100%', height: '44px', fontSize: '16px', borderRadius: '8px', border: '1.5px solid #F29C6B', background: '#FFC891', color: '#4B1C2F', padding: '0 12px' }}
                  />
                </div>
              </div>
            )}
            <label>Contraseña</label>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', width: '100%' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  style={{ width: '100%', height: '44px', fontSize: '16px', borderRadius: '8px', border: '1.5px solid #F29C6B', background: '#FFC891', color: '#4B1C2F', padding: '0 12px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginLeft: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '44px',
                    width: '40px'
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <CatEyeIcon open={showPassword} />
                </button>
              </div>
            {error && <div className="login-error">{error}</div>}
          </div>
          <button type="submit" className="login-btn" style={{ marginTop: '18px', width: '100%' }} disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
          <button type="button" className="register-btn" style={{ marginTop: '10px', width: '100%' }} onClick={() => navigate('/registro')}>Registrarse</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
