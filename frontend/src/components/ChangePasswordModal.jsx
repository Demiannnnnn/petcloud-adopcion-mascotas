import React, { useState } from 'react';
import { changePassword } from '../api/usersApi';

export default function ChangePasswordModal({ open, onClose, perfilId }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!newPassword || newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    const res = await changePassword(perfilId, currentPassword, newPassword);
    setLoading(false);
    if (res.ok) {
      setMessage('Contraseña actualizada');
      setTimeout(() => onClose && onClose(), 800);
    } else {
      setMessage('No se pudo cambiar la contraseña');
    }
  };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(244,235,232,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1600 };
  const card = { background: '#fff', padding: 20, borderRadius: 16, minWidth: 420, maxWidth: '86%', boxShadow: '0 14px 40px rgba(64,11,25,0.18)', border: '1px solid rgba(64,11,25,0.03)' };
  const title = { margin: 0, marginBottom: 12, color: '#a0522d', fontSize: 18, fontWeight: 700 };
  const input = { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #f0e6e4', height: 44, outline: 'none', boxSizing: 'border-box', background: '#fff' };
  const actions = { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 14, alignItems: 'center' };
  const btnCancel = { background: '#fff', border: '1px solid #efe6e6', color: '#6b6b6b', padding: '8px 18px', borderRadius: 20, cursor: 'pointer', minWidth: 96 };
  const btnChange = { background: 'linear-gradient(180deg,#4d0b12 0%, #3c050a 100%)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 22, cursor: 'pointer', boxShadow: '0 10px 30px rgba(64,11,25,0.28)', fontWeight: 700, minWidth: 96 };

  return (
    <div style={overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <form onSubmit={submit} style={card} onMouseDown={e => e.stopPropagation()}>
        <h3 style={title}>Cambiar contraseña</h3>

        <div style={{ display: 'grid', gap: 12 }}>
          <input autoFocus type="password" style={input} placeholder="Contraseña actual" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          <input type="password" style={input} placeholder="Nueva contraseña" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <input type="password" style={input} placeholder="Confirmar nueva contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        </div>

        {message && <div style={{ marginTop: 10, color: message.includes('no') || message.includes('No') ? 'red' : 'green' }}>{message}</div>}

        <div style={actions}>
          <button type="button" onClick={onClose} style={btnCancel}>Cancelar</button>
          <button aria-label="Cambiar contraseña" type="submit" disabled={loading} style={btnChange}>{loading ? '...' : 'Cambiar'}</button>
        </div>
      </form>
    </div>
  );
}
