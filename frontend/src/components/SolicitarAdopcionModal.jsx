import React, { useState } from 'react';
import { createAdoption } from '../api/adoptionsApi';
import { getChatBySolicitud } from '../api/chatsApi';
import { toast } from 'react-toastify';

export default function SolicitarAdopcionModal({ open, onClose, mascota, user }) {
  const [mensaje, setMensaje] = useState('');
  const [contacto, setContacto] = useState(user?.perfil?.telefono || '');
  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Include adoptanteId (from user context passed to modal) so backend can persist ownership
      const adoptanteId = user?.id || (user?.perfil && user.perfil.id) || null;
      const req = { mascotaId: mascota.id, adoptanteId, mensaje, contacto };
      const res = await createAdoption(req);
      if (res.ok) {
        const body = await res.json();
        toast.success('Solicitud enviada');
        // backend now returns { solicitud, chat?, participantes?, mensajes? }
        // If chat is included in the response, dispatch it directly. Otherwise try to fetch by solicitud id.
        try {
          if (body && body.chat) {
            // the response already contains chat + participants + mensajes
            window.dispatchEvent(new CustomEvent('chat.created', { detail: { chat: body.chat, mensajes: body.mensajes || [], participantes: body.participantes || [] } }));
          } else {
            // handle older/newer shapes: try body.id or body.solicitud.id
            const solicitudId = (body && body.id) || (body && body.solicitud && body.solicitud.id) || null;
            if (solicitudId != null) {
              const chat = await getChatBySolicitud(solicitudId);
              if (chat) window.dispatchEvent(new CustomEvent('chat.created', { detail: chat }));
            }
          }
        } catch (e) { /* ignore */ }
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
