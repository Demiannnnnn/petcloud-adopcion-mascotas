import React, { useState, useEffect } from 'react';
import { updatePerfil } from '../api/usersApi';

export default function EditProfileModal({ open, onClose, perfil, onSaved }) {
  const [form, setForm] = useState({ nombreCompleto: '', nombreEmpresa: '', telefonoContacto: '', direccion: '', correo: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      nombreCompleto: perfil?.nombreCompleto || perfil?.nombre || '',
      nombreEmpresa: perfil?.nombreEmpresa || perfil?.nombre || '',
      telefonoContacto: perfil?.telefonoContacto || perfil?.numeroWhatsapp || '',
      direccion: perfil?.direccion || perfil?.ubicacion || '',
      correo: perfil?.correo || ''
    });
    setErrors({});
  }, [perfil]);

  if (!open) return null;

  const handleChange = (k) => (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, [k]: value }));
    // clear field error while typing
    setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  // validate fields before submit
  const validate = () => {
    const errs = {};
    const isEmpresa = perfil?.tipoPerfil === 'EMPRESA';
    const nombreCompleto = (form.nombreCompleto || '').trim();
    const nombreEmpresa = (form.nombreEmpresa || '').trim();
    const correo = (form.correo || '').trim();
    const telefono = (form.telefonoContacto || '').trim();

    if (!isEmpresa) {
      if (!nombreCompleto) errs.nombreCompleto = 'Este campo es obligatorio';
    } else {
      if (!nombreEmpresa) errs.nombreEmpresa = 'Este campo es obligatorio';
    }

    if (correo) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(correo)) errs.correo = 'Correo inválido';
    }

    if (telefono) {
      const digits = telefono.replace(/\D/g, '');
      if (digits.length < 7) errs.telefonoContacto = 'Número de teléfono demasiado corto';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    // Build payload conditionally depending on perfil type
    const isEmpresa = perfil?.tipoPerfil === 'EMPRESA';
    const payload = {};
    if (!isEmpresa) payload.nombreCompleto = form.nombreCompleto;
    if (isEmpresa) payload.nombreEmpresa = form.nombreEmpresa;
    // Shared fields
    if (form.telefonoContacto) payload.telefonoContacto = form.telefonoContacto;
    if (form.direccion) payload.direccion = form.direccion;
    if (form.correo) payload.correo = form.correo;
    const id = perfil?.id || perfil?.perfilId || null;
    // validate before sending
    if (!validate()) {
      setSaving(false);
      return;
    }
    const updated = await updatePerfil(id, payload);
    setSaving(false);
    if (!updated) {
      setError('No se pudo actualizar el perfil. Revisa la conexión.');
      return;
    }
    if (onSaved) onSaved(updated);
    onClose();
  };

  // Styles matching site theme
  const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400 };
  const card = { background: '#fff', padding: 22, borderRadius: 12, minWidth: 420, boxShadow: '0 10px 30px rgba(64,11,25,0.12)' };
  const title = { margin: 0, marginBottom: 10, color: '#a0522d' };
  const fieldLabel = { fontSize: 13, color: '#6b3a2d', marginBottom: 6, fontWeight: 600 };
  const input = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6dcdc', boxSizing: 'border-box' };
  const actions = { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 };
  const btnCancel = { background: '#fff', border: '1px solid #ddd', color: '#6b6b6b', padding: '8px 14px', borderRadius: 14, cursor: 'pointer' };
  const btnSave = { background: '#F29C6B', border: 'none', color: '#fff', padding: '9px 16px', borderRadius: 14, cursor: 'pointer', boxShadow: '0 6px 18px rgba(242,156,107,0.18)' };

  return (
    <div style={overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <form onSubmit={handleSubmit} style={card} onMouseDown={e => e.stopPropagation()}>
        <h3 style={title}>Editar perfil</h3>

        <div style={{ display: 'grid', gap: 10 }}>
          {/* Show only Nombre completo for personas */}
          {perfil?.tipoPerfil !== 'EMPRESA' && (
            <div>
              <div style={fieldLabel}>Nombre completo</div>
              <input aria-label="Nombre completo" style={input} value={form.nombreCompleto} onChange={handleChange('nombreCompleto')} placeholder="Nombre completo" />
              {errors.nombreCompleto && <div style={{ color: 'red', marginTop: 6, fontSize: 13 }}>{errors.nombreCompleto}</div>}
            </div>
          )}
          {/* Show only Nombre empresa for empresas */}
          {perfil?.tipoPerfil === 'EMPRESA' && (
            <div>
              <div style={fieldLabel}>Nombre empresa</div>
              <input style={input} value={form.nombreEmpresa} onChange={handleChange('nombreEmpresa')} placeholder="Nombre empresa" />
              {errors.nombreEmpresa && <div style={{ color: 'red', marginTop: 6, fontSize: 13 }}>{errors.nombreEmpresa}</div>}
            </div>
          )}
          <div>
            <div style={fieldLabel}>Teléfono</div>
            <input style={input} value={form.telefonoContacto} onChange={handleChange('telefonoContacto')} placeholder="Teléfono" />
            {errors.telefonoContacto && <div style={{ color: 'red', marginTop: 6, fontSize: 13 }}>{errors.telefonoContacto}</div>}
          </div>
          <div>
            <div style={fieldLabel}>Dirección</div>
            <input style={input} value={form.direccion} onChange={handleChange('direccion')} placeholder="Dirección" />
          </div>
          <div>
            <div style={fieldLabel}>Correo</div>
            <input aria-label="Correo" style={input} value={form.correo} onChange={handleChange('correo')} placeholder="Correo" />
            {errors.correo && <div style={{ color: 'red', marginTop: 6, fontSize: 13 }}>{errors.correo}</div>}
          </div>
        </div>

        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}

        <div style={actions}>
          <button type="button" onClick={onClose} style={btnCancel}>Cancelar</button>
          <button type="submit" disabled={saving} style={btnSave}>{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}
