import React, { useState } from 'react';
import { createAdoption } from '../api/adoptionsApi';
import { toast } from 'react-toastify';

export default function SolicitarAdopcionModal({ open, onClose, mascota, user }) {
  const [mensaje, setMensaje] = useState('');
  const [contacto, setContacto] = useState(user?.perfil?.telefono || '');
  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const req = { mascotaId: mascota.id, mensaje, contacto };
      const res = await createAdoption(req);
      if (res.ok) {
        toast.success('Solicitud enviada');
        onClose(true);
      } else {
        toast.error('Error al enviar solicitud');
      }
    } catch (err) {
      toast.error('Error de red');
    }
  };

  return (
    <div style={{ position: 'fixed', top:0,left:0,right:0,bottom:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}>
      <form onSubmit={handleSubmit} style={{ background:'#fff', padding:20, borderRadius:12, minWidth:320 }}>
        <h3>Solicitar adopción — {mascota.nombre}</h3>
        <textarea placeholder="Mensaje (opcional)" value={mensaje} onChange={e=>setMensaje(e.target.value)} style={{ width:'100%', minHeight:80 }} />
        <input placeholder="Teléfono" value={contacto} onChange={e=>setContacto(e.target.value)} style={{ width:'100%', marginTop:8 }} />
        <div style={{ display:'flex', gap:8, marginTop:12 }}>
          <button type="submit" style={{ background:'#F29C6B', color:'#fff', border:'none', padding:'8px 12px', borderRadius:8 }}>Enviar</button>
          <button type="button" onClick={()=>onClose(false)} style={{ background:'#ccc', border:'none', padding:'8px 12px', borderRadius:8 }}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
