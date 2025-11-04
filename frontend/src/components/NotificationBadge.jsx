import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationContext from '../context/NotificationContext';
import { getChatBySolicitud, getChatById } from '../api/chatsApi';

export default function NotificationBadge() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);
  const [processingAll, setProcessingAll] = useState(false);
  const [processingClear, setProcessingClear] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    try {
      // eslint-disable-next-line no-restricted-globals
      const ok = confirm('Eliminar esta notificación?');
      if (!ok) return;
      await deleteNotification(id);
    } catch (e) {
      console.error('delete failed', e);
    }
  };

  const handleNotificationClick = async (n) => {
    try {
      // close dropdown immediately
      setOpen(false);
      // mark read if unread
      if (!n.leida) {
        await markAsRead(n.id);
      }
      // prefer opening chat by chatId if provided
      if (n.chatId) {
        const chat = await getChatById(n.chatId);
        if (chat) {
          window.dispatchEvent(new CustomEvent('chat.created', { detail: chat }));
          return;
        }
      }
      // fallback: try opening chat by solicitud if available
      if (n.solicitudAdopcionId) {
        const chat = await getChatBySolicitud(n.solicitudAdopcionId);
        if (chat) {
          window.dispatchEvent(new CustomEvent('chat.created', { detail: chat }));
          return;
        }
        navigate('/solicitudes-recibidas');
        return;
      }
      // fallback: navigate to adoptions list or solicitudes
      if (n.mascotaId) {
        navigate('/adopciones');
        return;
      }
      // default: go to main solicitudes page
      navigate('/solicitudes-recibidas');
    } catch (e) {
      console.error('Failed to open notification target', e);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }} aria-label="Notificaciones">
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#F29C6B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>🔔</div>
        {unreadCount > 0 && (
          <div style={{ position: 'absolute', right: -4, top: -4, background: '#c62828', color: '#fff', borderRadius: 999, minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, padding: '0 6px', fontWeight: 700 }}>{unreadCount}</div>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 48, width: 320, maxHeight: 360, overflowY: 'auto', background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.12)', borderRadius: 8, padding: 8, zIndex: 6000 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 700 }}>Notificaciones</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {unreadCount > 0 && (
                <button onClick={async () => { setProcessingAll(true); try { await markAllAsRead(); } finally { setProcessingAll(false); } }} disabled={processingAll} style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                  {processingAll ? 'Procesando...' : 'Marcar todas como leídas'}
                </button>
              )}
              <button onClick={async () => { setProcessingClear(true); try { await clearAllNotifications(); } finally { setProcessingClear(false); } }} disabled={processingClear} style={{ background: '#c62828', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                {processingClear ? 'Limpiando...' : 'Limpiar'}
              </button>
            </div>
          </div>
          {notifications && notifications.length === 0 && <div style={{ color: '#666' }}>No hay notificaciones</div>}
          {(notifications || []).map(n => (
            <div key={n.id} onClick={async () => { await handleNotificationClick(n); }} style={{ padding: 8, borderRadius: 6, background: n.leida ? '#fafafa' : '#fff8f6', marginBottom: 6, border: '1px solid #eee', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700 }}>{n.titulo || (n.tipo || 'Notificación')}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!n.leida && <button onClick={() => markAsRead(n.id)} style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }}>Marcar leída</button>}
                  <button onClick={async (e) => { e.stopPropagation(); await handleDelete(n.id); }} style={{ background: '#9e9e9e', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }}>Eliminar</button>
                </div>
              </div>
              <div style={{ marginTop: 6, color: '#333' }}>{n.mensaje}</div>
              <div style={{ marginTop: 6, fontSize: 12, color: '#888' }}>{n.fecha ? new Date(n.fecha).toLocaleString() : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
