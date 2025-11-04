import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { sendMessage, getMessages, getChatsByParticipant } from '../api/chatsApi';
import { getUserById } from '../api/usersApi';
import { toast } from 'react-toastify';

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState(null);
  const [text, setText] = useState('');
  const { user } = useContext(AuthContext) || {};
  const scrollerRef = useRef(null);
  const pollRef = useRef(null);
  const [nameMap, setNameMap] = useState({}); // cache id -> display name
  const resolveRetriesRef = useRef({}); // track retry counts for ids

  useEffect(() => {
    const onCreated = (e) => {
      setChat(e.detail || null);
      setOpen(true);
      // scroll to bottom shortly after open
      setTimeout(() => { if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight; }, 50);
    };
    window.addEventListener('chat.created', onCreated);
    return () => window.removeEventListener('chat.created', onCreated);
  }, []);

  // On mount / user change, attempt to restore existing chat(s) for the logged user
  useEffect(() => {
    let mounted = true;
    async function restore() {
      try {
        const perfilId = user?.id || (user?.perfil && user.perfil.id) || null;
        if (!perfilId) return;
        const chats = await getChatsByParticipant(perfilId);
        if (!mounted) return;
        if (Array.isArray(chats) && chats.length > 0) {
          // pick the most recent chat (by chat.fechaCreacion) or first
          chats.sort((a,b) => {
            const ca = (a.chat && new Date(a.chat.fechaCreacion).getTime()) || 0;
            const cb = (b.chat && new Date(b.chat.fechaCreacion).getTime()) || 0;
            return cb - ca;
          });
          const chosen = chats[0];
          setChat(chosen);
          // prefill nameMap from server-provided profile info (if backend enriched responses)
          try {
            const map = {};
            if (Array.isArray(chosen.participantes)) {
              chosen.participantes.forEach(p => {
                const pid = p && (p.perfilId || (p.perfil && p.perfil.id));
                const info = p && (p.perfilInfo || p.perfil);
                if (pid && info) {
                  const name = info.displayName || info.nombreCompleto || info.nombre || info.nombreEmpresa || info.correo;
                  if (name) map[String(pid)] = name;
                }
              });
            }
            if (Array.isArray(chosen.mensajes)) {
              chosen.mensajes.forEach(m => {
                const rid = m && (m.remitenteId || (m.remitente && m.remitente.id));
                if (rid && m.remitentePerfil && m.remitentePerfil.displayName) map[String(rid)] = m.remitentePerfil.displayName;
                if (Array.isArray(m.destinatariosPerfil)) {
                  m.destinatariosPerfil.forEach(d => {
                    try {
                      const did = d && (d.id || d.perfilId);
                      if (did && d.displayName) map[String(did)] = d.displayName;
                    } catch (e) {}
                  });
                }
              });
            }
            if (Object.keys(map).length > 0) setNameMap(prev => ({ ...(prev || {}), ...map }));
          } catch (e) { /* ignore */ }
          // keep bubble closed by default
          // setOpen(true);
        }
      } catch (e) { /* ignore */ }
    }
    restore();
    return () => { mounted = false; };
  }, [user]);

  // Resolve user names for messages/participants to show friendly names instead of IDs
  useEffect(() => {
    if (!chat) return;
    const ids = new Set();
    try {
      // collect remitente and destinatarios from mensajes
      const msgs = chat.mensajes || [];
      msgs.forEach(m => {
        if (m && m.remitenteId) ids.add(String(m.remitenteId));
        if (m && Array.isArray(m.destinatarios)) m.destinatarios.forEach(d => ids.add(String(d)));
      });
      // collect participants
      const parts = (() => {
        if (!chat) return [];
        if (Array.isArray(chat.participantes) && chat.participantes.length > 0) return chat.participantes;
        if (chat.chat && Array.isArray(chat.chat.participantes) && chat.chat.participantes.length > 0) return chat.chat.participantes;
        return [];
      })();
      if (Array.isArray(parts)) parts.forEach(p => { if (p && p.perfilId) ids.add(String(p.perfilId)); });
    } catch (e) { }

    // fetch names for ids not yet resolved
    ids.forEach(id => {
      if (!id) return;
      if (nameMap && (id in nameMap)) return; // already resolved or loading
      // mark as loading
      setNameMap(prev => ({ ...(prev || {}), [id]: null }));
      const attemptResolve = async (ident) => {
        try {
          const profile = await getUserById(ident);
          // determine best display name: prefer nombreCompleto, nombre, nombreEmpresa, correo
          let display = null;
          if (profile) {
            display = profile.nombreCompleto || profile.nombre || profile.nombreEmpresa || profile.correo || null;
            if (typeof display === 'string') display = display.trim() || null;
          }
          if (display) {
            setNameMap(prev => ({ ...(prev || {}), [ident]: display }));
          } else {
            const retries = resolveRetriesRef.current[ident] || 0;
            if (retries < 2) {
              resolveRetriesRef.current[ident] = retries + 1;
              setTimeout(() => attemptResolve(ident), 2000 * (retries + 1));
            } else {
              setNameMap(prev => ({ ...(prev || {}), [ident]: `#${ident}` }));
            }
          }
        } catch (e) {
          const retries = resolveRetriesRef.current[ident] || 0;
          if (retries < 2) {
            resolveRetriesRef.current[ident] = retries + 1;
            setTimeout(() => attemptResolve(ident), 2000 * (retries + 1));
          } else {
            setNameMap(prev => ({ ...(prev || {}), [ident]: `#${ident}` }));
          }
        }
      };
      attemptResolve(id);
    });
  }, [chat, nameMap]);

  // compute header title showing other participants' names
  const headerTitle = (() => {
    try {
      const parts = chat && (chat.participantes || (chat.chat && chat.participantes)) ? (chat.participantes || chat.participantes) : (chat && chat.chat && chat.participantes) || [];
      const perfilId = String(user?.id || (user?.perfil && user.perfil.id) || '');
      const names = [];
      if (Array.isArray(parts)) {
        parts.forEach(p => {
          const id = String(p && (p.perfilId || p.perfil && p.perfil.id));
          if (!id || id === perfilId) return;
          const nm = nameMap[id];
          if (nm === null) names.push('Cargando...');
          else names.push(nm || (`#${id}`));
        });
      }
      if (names.length === 0) return 'Chat';
      return names.join(', ');
    } catch (e) { return 'Chat'; }
  })();

  const currentUserId = String(user?.id || (user?.perfil && user.perfil.id) || '');
  const currentUserName = user?.perfil?.nombreCompleto || user?.perfil?.nombre || user?.name || null;

  // Poll messages when a chat is opened. Use only chatId in deps to avoid
  // re-creating intervals whenever the `chat` object reference changes
  const chatId = (chat && (chat.chat && chat.chat.id)) || (chat && chat.id) || (chat && chat.chatId) || null;
  useEffect(() => {
    let mounted = true;
    let intervalId = null;

    async function fetchAndMerge() {
      try {
        if (!chatId) return;
        const remote = await getMessages(chatId);
        if (!mounted) return;
        if (!Array.isArray(remote)) return;
        setChat(prev => {
          const prevMsgs = (prev && prev.mensajes) || [];
          const serverById = new Map();
          remote.forEach(m => { if (m && m.id != null) serverById.set(String(m.id), m); });

          const combined = [...remote];
          prevMsgs.forEach(pm => {
            if (pm && (pm.id == null || pm.id === undefined)) {
              const existsOnServer = Array.from(serverById.values()).some(sm => sm.contenido === pm.contenido && String(sm.remitenteId) === String(pm.remitenteId));
              if (!existsOnServer) combined.push(pm);
            }
          });

          combined.sort((a,b) => {
            const da = new Date(a.fecha || a.createdAt || 0).getTime() || 0;
            const db = new Date(b.fecha || b.createdAt || 0).getTime() || 0;
            return da - db;
          });
          return { ...(prev || {}), mensajes: combined };
        });
      } catch (e) {
        // ignore polling errors
      }
    }

    // clear any previously set interval for safety
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (open && chatId) {
      fetchAndMerge();
      intervalId = setInterval(fetchAndMerge, 3000);
      pollRef.current = intervalId;
    }

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
      if (pollRef.current && pollRef.current === intervalId) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [open, chatId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    try {
      if (scrollerRef.current) {
        scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
      }
    } catch (e) { }
  }, [chat && chat.mensajes && chat.mensajes.length]);

  return (
    <div style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 5000 }}>
      {!open && (
        <button onClick={() => setOpen(true)} style={{ width:56, height:56, borderRadius:28, background:'#F29C6B', border:'none', color:'#fff', fontWeight:700, boxShadow:'0 6px 18px rgba(0,0,0,0.12)', cursor:'pointer' }}>
          💬
        </button>
      )}
      {open && (
        <div style={{ width:360, height:420, background:'#fff', borderRadius:12, boxShadow:'0 8px 30px rgba(0,0,0,0.15)', overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:10, background:'#F29C6B', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontWeight:700 }}>{headerTitle}</div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => { setOpen(false); }} style={{ background:'transparent', border:'none', color:'#fff', cursor:'pointer' }}>✕</button>
            </div>
          </div>
          <div ref={scrollerRef} style={{ padding:10, flex:1, overflowY:'auto', background:'#fafafa' }}>
            {chat && chat.mensajes && chat.mensajes.length > 0 ? (
              chat.mensajes.map((m, idx) => {
                const rid = String(m && m.remitenteId || '');
                const resolvedRemitente = nameMap[rid];
                const remitente = resolvedRemitente === null ? 'Cargando...' : (resolvedRemitente || (rid === currentUserId ? (currentUserName || `#${rid}`) : `#${rid}`));
                const fechaStr = m && (m.fecha || m.createdAt) ? new Date(m.fecha || m.createdAt).toLocaleString() : '';
                const dests = (m && Array.isArray(m.destinatarios)) ? m.destinatarios.map(d => {
                  const did = String(d);
                  const resolved = nameMap[did];
                  return resolved === null ? 'Cargando...' : (resolved || `#${did}`);
                }) : [];

                // visual alignment: messages from current user on the right
                const mine = rid === currentUserId;
                const containerStyle = { display: 'flex', gap: 8, marginBottom: 12, justifyContent: mine ? 'flex-end' : 'flex-start', alignItems: 'flex-end' };
                const bubbleStyle = {
                  background: mine ? '#F29C6B' : '#fff',
                  color: mine ? '#fff' : '#111',
                  padding: '10px 12px',
                  borderRadius: 14,
                  maxWidth: '78%',
                  boxShadow: mine ? '0 6px 18px rgba(242,156,107,0.12)' : '0 4px 10px rgba(0,0,0,0.04)',
                  wordBreak: 'break-word'
                };
                const metaStyle = { fontSize: 12, color: '#666', marginBottom: 6 };

                // avatar / initials
                const initials = (() => {
                  const name = resolvedRemitente || (rid === currentUserId ? currentUserName : null) || `#${rid}`;
                  if (!name) return '';
                  const parts = String(name).trim().split(/\s+/).filter(Boolean);
                  if (parts.length === 0) return '';
                  if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
                  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
                })();
                const avatarStyle = { width:30, height:30, borderRadius:15, background: mine ? '#fff' : '#F5F5F5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#444' };

                return (
                  <div key={idx} style={containerStyle}>
                    {!mine && <div style={avatarStyle}>{initials}</div>}
                    <div style={{ display:'flex', flexDirection:'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                      <div style={metaStyle}>{remitente} — {fechaStr}</div>
                      <div style={bubbleStyle}>{m.contenido}</div>
                      {dests.length > 0 ? (
                        <div style={{ fontSize:11, color:'#888', marginTop:6 }}>{"Para: " + dests.join(', ')}</div>
                      ) : null}
                    </div>
                    {mine && <div style={avatarStyle}>{initials}</div>}
                  </div>
                );
              })
            ) : (
              <div style={{ color:'#666' }}>{chat ? 'No hay mensajes aún. Puedes escribir al otro usuario cuando quieras.' : 'No hay chats abiertos. Crea una solicitud para empezar una conversación.'}</div>
            )}
          </div>
          <div style={{ padding:8, borderTop:'1px solid #eee', display:'flex', gap:8, alignItems:'center' }}>
            <form style={{ display:'flex', flex:1, gap:8 }} onSubmit={async (ev) => {
              ev.preventDefault();
              const chatId = chat.chat.id || chat.id || (chat.chatId && chat.chatId);
              const remitenteId = user?.id || (user?.perfil && user.perfil.id) || null;
              if (!chatId || !remitenteId) { toast.error('No se puede enviar mensaje (falta chat o usuario)'); return; }
              const content = (text || '').trim();
              if (!content) return;
              // optimistic append
              const temp = { remitenteId, contenido: content, fecha: new Date().toISOString(), leido: false, destinatarios: [] };
              const prevMsgs = (chat && chat.mensajes) || [];
              setChat(prev => ({ ...prev, mensajes: [...prevMsgs, temp] }));
              setText('');
              try {
                const saved = await sendMessage(chatId, { remitenteId, contenido: content });
                if (saved) {
                  const savedMsg = saved.mensaje ? saved.mensaje : saved;
                  const dests = saved.destinatarios || [];
                  if (dests.length) savedMsg.destinatarios = dests;
                  // replace last temp message with savedMsg
                  setChat(prev => {
                    const msgs = (prev.mensajes || []).map(m => (m === temp ? savedMsg : m));
                    return { ...prev, mensajes: msgs };
                  });
                } else {
                  toast.error('No se pudo enviar el mensaje');
                }
              } catch (e) {
                toast.error('Error enviando mensaje');
                // revert optimistic
                setChat(prev => ({ ...prev, mensajes: (prev.mensajes || []).filter(m => m !== temp) }));
              } finally {
                setTimeout(() => { if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight; }, 80);
              }
            }}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje" style={{ width:'100%', padding:10, borderRadius:20, border:'1px solid #ddd', outline:'none' }} />
              <button type="submit" style={{ background:'#F29C6B', color:'#fff', border:'none', padding:'8px 12px', borderRadius:18, cursor:'pointer' }}>Enviar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
