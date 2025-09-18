import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './LoginPage.css';
import { login } from '../api/authApi';
function LoginPage() {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login: loginSession } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rut || !password) {
      setError('Por favor ingresa tu RUT y contraseña.');
      return;
    }
    setError('');
    try {
      const result = await login(rut, password);
      if (typeof result === 'string') {
        setError(result);
      } else {
        loginSession(result);
        setError('Login exitoso');
        // Aquí puedes redirigir si lo deseas
      }
    } catch (err) {
      if (err && err.message) {
        setError(err.message);
      } else {
        setError('Error de conexión');
      }
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">
          <img src="/assets/petcloud-logo.png" alt="PetCloud Logo" />
        </div>
        <div className="login-user-icon">
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
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-fields">
            <label>RUT</label>
            <input
              type="text"
              value={rut}
              onChange={e => setRut(e.target.value)}
              placeholder="Ej: 12.345.678-9"
            />
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
            />
            {error && <div className="login-error">{error}</div>}
          </div>
          <button type="submit" className="login-btn" style={{ marginTop: '18px', width: '100%' }}>Iniciar sesión</button>
          <button type="button" className="register-btn" style={{ marginTop: '10px', width: '100%' }} onClick={() => navigate('/registro')}>Registrarse</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
