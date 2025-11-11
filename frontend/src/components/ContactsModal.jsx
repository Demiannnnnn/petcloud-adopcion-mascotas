import React, { useEffect, useState, useContext } from 'react';
import { getContacts, getUserById } from '../api/usersApi';
import { getChatsByParticipant, createChatBetween } from '../api/chatsApi';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function ContactsModal({ open, onClose, ownerPerfilId }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const { user } = useContext(AuthContext) || {};

  useEffect(() => {
    if (!open) return;
    async function load() {
      setLoading(true);
      const list = await getContacts(ownerPerfilId);
      if (Array.isArray(list)) {
        const enrichedContacts = await Promise.all(
          list.map(async (c) => {
            const profile = await getUserById(c.contactoPerfilId);
            return {
              ...c,
              nombre: profile?.nombreCompleto || profile?.nombreEmpresa || `ID: ${c.contactoPerfilId}`,
            };
          })
        );
        setContacts(enrichedContacts);
      } else {
        setContacts([]);
      }
      setLoading(false);
    }
    load();
  }, [open, ownerPerfilId]);

  if (!open) return null;
  const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1600 };
  const card = { background: '#fff', padding: 18, borderRadius: 12, minWidth: 360, maxWidth: '86%', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' };

  const filtered = (contacts || []).filter(c => {
    const name = (c.nombre || '').toLowerCase();
    const q = (filter || '').toLowerCase();
    return !q || name.includes(q) || String(c.contactoPerfilId || '').includes(q);
  });

  function initialsFor(nameOrId) {
    if (!nameOrId) return '#';
    const s = String(nameOrId).trim();
    const parts = s.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return s.slice(0,2).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
  }

  const openChatWith = async (contact) => {
    try {
      const meId = user?.id || (user?.perfil && user.perfil.id) || null;
      if (!meId) { toast.error('No estás autenticado'); return; }
      setLoading(true);
      const chats = await getChatsByParticipant(meId);
      let found = null;
      if (Array.isArray(chats)) {
        for (const ch of chats) {
          const parts = ch && (ch.participantes || (ch.chat && ch.chat.participantes)) || [];
          const ids = parts.map(p => (p && (p.perfilId || (p.perfil && p.perfil.id))) ).filter(Boolean).map(String);
          if (ids.includes(String(contact.contactoPerfilId))) { found = ch; break; }
        }
      }
      if (found) {
        window.dispatchEvent(new CustomEvent('chat.created', { detail: found }));
        onClose && onClose();
      } else {
        // try to create chat automatically (idempotent on server)
        try {
          const created = await createChatBetween(meId, contact.contactoPerfilId);
          if (created && (created.chat || created)) {
            // server may return the same shape as other chat endpoints
            const out = created.chat ? created : created;
            window.dispatchEvent(new CustomEvent('chat.created', { detail: out }));
            onClose && onClose();
          } else {
            toast.info('No existe un chat con este contacto todavía.');
          }
        } catch (ex) {
          console.error('failed to create chat', ex);
          toast.error('No se pudo crear el chat');
        }
      }
    } catch (e) {
      console.error('failed open chat', e);
      toast.error('Error abriendo chat');
    } finally { setLoading(false); }
  };

  return (
    <div style={overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <div style={card} onMouseDown={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginTop: 0, color: '#a0522d' }}>Contactos</h3>
            <div style={{ fontSize: 13, color: '#666' }}>Haz click en un contacto para abrir el chat.</div>
          </div>
          <div style={{ marginLeft: 12 }}>
            <button onClick={onClose} style={{ background: '#fff', border: '1px solid #ddd', padding: '6px 10px', borderRadius: 8 }}>Cerrar</button>
          </div>
        </div>

        <div style={{ marginTop: 12, marginBottom: 8 }}>
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Buscar contactos..." style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #eee' }} />
        </div>

        <div style={{ maxHeight: 320, overflow: 'auto' }}>
          {loading ? <div>Cargando...</div> : (
            filtered.length === 0 ? (
              <div style={{ color: '#666', padding: 12 }}>No hay contactos que coincidan. Si aún no tienes chats, inicia una solicitud de adopción para crear una conversación.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {filtered.map(c => (
                  <li key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderBottom: '1px solid #f2eae7', cursor: 'pointer' }}>
                    <div onClick={() => openChatWith(c)} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <div style={{ width:40, height:40, borderRadius:20, background:'#F29C6B', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, flexShrink:0 }}>{initialsFor(c.nombre || c.contactoPerfilId)}</div>
                      <div>
                        <div style={{ fontWeight:700, color:'#a0522d' }}>{c.nombre}</div>
                        <div style={{ fontSize:12, color:'#666' }}>{`Perfil #${c.contactoPerfilId}`}</div>
                      </div>
                    </div>
                    <div>
                      <button onClick={() => openChatWith(c)} style={{ background:'#F29C6B', color:'#fff', border:'none', padding:'6px 10px', borderRadius:8, cursor:'pointer' }}>Abrir chat</button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </div>
  );
}
