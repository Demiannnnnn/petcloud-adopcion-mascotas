
import React, { useState } from 'react';


const ESPECIES = [
  { value: 'Perro', label: 'Perro' },
  { value: 'Gato', label: 'Gato' },
  { value: 'Tortuga', label: 'Tortuga' },
  { value: 'Hurón', label: 'Hurón' },
  { value: 'Conejo', label: 'Conejo' },
  { value: 'Ave', label: 'Ave' },
  { value: 'Otro', label: 'Otro' },
];

const TAMAÑOS = [
  { value: 'Pequeño', label: 'Pequeño (≤20cm)' },
  { value: 'Mediano', label: 'Mediano (21–40cm)' },
  { value: 'Grande', label: 'Grande (>40cm)' },
];

const inputStyle = {
  borderRadius: 12,
  border: '2px solid #F29C6B',
  padding: '8px 16px',
  fontSize: 16,
  outline: 'none',
  marginBottom: 4,
};

const buttonStyle = {
  borderRadius: 18,
  border: 'none',
  padding: '10px 24px',
  fontWeight: 'bold',
  fontSize: 16,
  cursor: 'pointer',
};

export default function MascotaRegistroModal({ open, onClose, onRegister }) {
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('');
  const [raza, setRaza] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState('');
  const [tamaño, setTamaño] = useState('');
  const [vacunas, setVacunas] = useState([]);
  const [vacunaInput, setVacunaInput] = useState('');
  const [esterilizado, setEsterilizado] = useState('');
  const [enfermedades, setEnfermedades] = useState([]);
  const [enfermedadInput, setEnfermedadInput] = useState('');
  const [documentos, setDocumentos] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ubicacion, setUbicacion] = useState('');
  const [chip, setChip] = useState('');

  if (!open) return null;

  // For mobile browsers, enforce max date on input change
  const todayLocal = (() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  const handleFechaNacimiento = e => {
    let value = e.target.value;
    if (value > todayLocal) value = todayLocal;
    setFechaNacimiento(value);
  };

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFoto = e => {
    const file = e.target.files[0];
    setFoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDocumentos = e => {
    setDocumentos(Array.from(e.target.files));
  };

  const handleAddVacuna = () => {
    if (vacunaInput.trim()) {
      setVacunas([...vacunas, vacunaInput.trim()]);
      setVacunaInput('');
    }
  };
  const handleRemoveVacuna = idx => {
    setVacunas(vacunas.filter((_, i) => i !== idx));
  };

  const handleAddEnfermedad = () => {
    if (enfermedadInput.trim()) {
      setEnfermedades([...enfermedades, enfermedadInput.trim()]);
      setEnfermedadInput('');
    }
  };
  const handleRemoveEnfermedad = idx => {
    setEnfermedades(enfermedades.filter((_, i) => i !== idx));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Validación básica
    const hoy = new Date();
    const fechaNacDate = new Date(fechaNacimiento);
    if (!nombre || !especie || !fechaNacimiento || !sexo || !tamaño || vacunas.length === 0 || !esterilizado || !descripcion || !foto || !ubicacion) {
      alert('Completa todos los campos obligatorios.');
      return;
    }
    // Comparar solo año, mes y día
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const nacSinHora = new Date(fechaNacDate.getFullYear(), fechaNacDate.getMonth(), fechaNacDate.getDate());
    if (isNaN(nacSinHora.getTime()) || nacSinHora > hoySinHora) {
      alert('La fecha de nacimiento no puede ser futura.');
      return;
    }
    onRegister({ nombre, especie, raza, fechaNacimiento, sexo, tamaño, vacunas, esterilizado, enfermedades, documentos, descripcion, foto, ubicacion, chip });
    // Limpiar
    setNombre(''); setEspecie(''); setRaza(''); setFechaNacimiento(''); setSexo(''); setTamaño(''); setVacunas([]); setVacunaInput(''); setEsterilizado(''); setEnfermedades([]); setEnfermedadInput(''); setDocumentos([]); setDescripcion(''); setFoto(null); setPreview(null); setUbicacion(''); setChip('');
    onClose();
  };

  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(64,11,25,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={handleBackdropClick}
    >
      <form
        className="modal-form"
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: 32,
          minWidth: 340,
          maxWidth: 420,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 4px 24px rgba(64,11,25,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h2 style={{ color: '#a0522d', textAlign: 'center', marginBottom: 8 }}>Registrar Mascota</h2>
  <input type="text" className="modal-input" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required style={inputStyle} />
  {/* Solo para móvil: label explicativo y opción vacía sin texto largo */}
  <div className="combobox-label-mobile" style={{ display: 'none' }}>
    <label style={{ fontWeight: 'bold', color: '#a0522d', marginBottom: 2 }}>Selecciona la especie de la mascota</label>
  </div>
  <select className="modal-input" value={especie} onChange={e => setEspecie(e.target.value)} required style={inputStyle}>
    <option value="" className="select-placeholder">Selecciona especie</option>
    {ESPECIES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
  <input type="text" className="modal-input" placeholder="Raza (opcional)" value={raza} onChange={e => setRaza(e.target.value)} style={inputStyle} />
        <label style={{ fontWeight: 'bold', color: '#a0522d', marginBottom: 2 }}>Fecha de nacimiento de la mascota</label>
        <input
          type="date"
          className="modal-input"
          placeholder="Fecha de nacimiento"
          value={fechaNacimiento}
          onChange={handleFechaNacimiento}
          required
          style={inputStyle}
          max={todayLocal}
        />
  <div className="combobox-label-mobile" style={{ display: 'none' }}>
    <label style={{ fontWeight: 'bold', color: '#a0522d', marginBottom: 2 }}>Selecciona el sexo de la mascota</label>
  </div>
  <select className="modal-input" value={sexo} onChange={e => setSexo(e.target.value)} required style={inputStyle}>
    <option value="" className="select-placeholder">Sexo</option>
    <option value="Macho">Macho</option>
    <option value="Hembra">Hembra</option>
  </select>
  <div className="combobox-label-mobile" style={{ display: 'none' }}>
    <label style={{ fontWeight: 'bold', color: '#a0522d', marginBottom: 2 }}>Selecciona el tamaño de la mascota</label>
  </div>
  <select className="modal-input" value={tamaño} onChange={e => setTamaño(e.target.value)} required style={inputStyle}>
    <option value="" className="select-placeholder">Tamaño</option>
    {TAMAÑOS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
        {/* Estado de salud */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontWeight: 'bold', color: '#a0522d' }}>Vacunas (obligatorio)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" className="modal-input" placeholder="Agregar vacuna" value={vacunaInput} onChange={e => setVacunaInput(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <button type="button" onClick={handleAddVacuna} style={{ ...buttonStyle, padding: '8px 12px', fontSize: 14 }}>Agregar</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {vacunas.map((v, i) => (
              <span key={i} style={{ background: '#F29C6B', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                {v} <button type="button" onClick={() => handleRemoveVacuna(i)} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>×</button>
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontWeight: 'bold', color: '#a0522d' }}>Esterilizado</label>
          <select className="modal-input" value={esterilizado} onChange={e => setEsterilizado(e.target.value)} required style={inputStyle}>
            <option value="">¿Esterilizado?</option>
            <option value="Sí">Sí</option>
            <option value="No">No</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontWeight: 'bold', color: '#a0522d' }}>Enfermedades</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" className="modal-input" placeholder="Agregar enfermedad" value={enfermedadInput} onChange={e => setEnfermedadInput(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <button type="button" onClick={handleAddEnfermedad} style={{ ...buttonStyle, padding: '8px 12px', fontSize: 14 }}>Agregar</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {enfermedades.map((v, i) => (
              <span key={i} style={{ background: '#D9663D', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                {v} <button type="button" onClick={() => handleRemoveEnfermedad(i)} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>×</button>
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontWeight: 'bold', color: '#a0522d' }}>Documentos de salud</label>
          <input type="file" className="modal-input" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocumentos} style={{ ...inputStyle, marginBottom: 0 }} />
        </div>
  <textarea className="modal-input" placeholder="Descripción general para adopción" value={descripcion} onChange={e => setDescripcion(e.target.value)} required style={{ ...inputStyle, minHeight: 60 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ color: '#a0522d', fontWeight: 'bold', marginBottom: 4 }}>Foto de la mascota</label>
          <span style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>Sube una imagen clara y reciente de la mascota</span>
          <input type="file" className="modal-input" accept="image/*" onChange={handleFoto} required style={{ marginBottom: 8 }} />
          {preview && <img src={preview} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12, margin: '0 auto' }} />}
        </div>
  <input type="text" className="modal-input" placeholder="Ubicación (Ciudad, Región)" value={ubicacion} onChange={e => setUbicacion(e.target.value)} required style={inputStyle} />
  <input type="text" className="modal-input" placeholder="Número de chip (opcional)" value={chip} onChange={e => setChip(e.target.value)} style={inputStyle} />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{ ...buttonStyle, background: '#ccc', color: '#400B19' }}>Cancelar</button>
          <button type="submit" style={{ ...buttonStyle, background: '#a0522d', color: '#fff' }}>Registrar</button>
        </div>
      </form>
    </div>
  );
}
