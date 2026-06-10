import React, { useState } from 'react';

const CATEGORIES = ['All', 'Clinical', 'Appointments', 'AI Alerts', 'System'];

export default function NotificationCenter({ notifications = [], t, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [dismissed, setDismissed] = useState([]);

  const visible = notifications.filter(n => !dismissed.includes(n.id) && (filter === 'All' || n.category === filter));
  const unread = visible.length;

  const dismiss = (id, e) => { e.stopPropagation(); setDismissed(d => [...d, id]); };
  const dismissAll = () => setDismissed(notifications.map(n => n.id));

  const ic = { Clinical: '#DC2626', Appointments: '#1D4ED8', 'AI Alerts': '#7C3AED', System: '#0891B2' };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: 36, height: 36, borderRadius: 9, background: t?.bg3 || '#EFF6FF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={t?.text2 || '#3B5998'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {unread > 0 && <div style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#DC2626', border: '1.5px solid white' }}/>}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 44, right: 0, width: 360, background: t?.bg2 || '#fff', borderRadius: 14, border: `0.5px solid ${t?.border || '#E2EBF6'}`, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `0.5px solid ${t?.border || '#E2EBF6'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t?.text || '#0C1A2E' }}>Notifications {unread > 0 && <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}>({unread})</span>}</div>
            {unread > 0 && <button onClick={dismissAll} style={{ fontSize: 11, color: t?.blue || '#1D4ED8', background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>}
          </div>
          <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderBottom: `0.5px solid ${t?.border || '#E2EBF6'}`, overflowX: 'auto' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: filter === cat ? 700 : 400, background: filter === cat ? t?.blue || '#1D4ED8' : 'transparent', color: filter === cat ? '#fff' : t?.muted || '#3B5998', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>{cat}</button>
            ))}
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {visible.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: t?.text3 || '#94a3b8' }}>No notifications</div>
              </div>
            ) : visible.map(n => (
              <div key={n.id} onClick={() => { if (n.tab) onNavigate?.(n.tab); setOpen(false); }}
                style={{ display: 'flex', gap: 10, padding: '12px 16px', borderBottom: `0.5px solid ${t?.border || '#E2EBF6'}`, cursor: n.tab ? 'pointer' : 'default', background: n.type === 'alert' ? '#FFF5F5' : 'transparent' }}
                onMouseEnter={e => { if (n.tab) e.currentTarget.style.background = t?.bg3 || '#EFF6FF'; }}
                onMouseLeave={e => { e.currentTarget.style.background = n.type === 'alert' ? '#FFF5F5' : 'transparent'; }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: ic[n.category] || t?.blue || '#1D4ED8', flexShrink: 0, marginTop: 5 }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: t?.text || '#0C1A2E' }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: t?.text3 || '#94a3b8', marginTop: 2 }}>{n.body}</div>
                  <div style={{ fontSize: 10, color: t?.text3 || '#94a3b8', marginTop: 4 }}>{n.time || 'Just now'} · {n.category}</div>
                </div>
                <button onClick={e => dismiss(n.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t?.text3 || '#94a3b8', fontSize: 16, padding: '0 4px', flexShrink: 0 }}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
