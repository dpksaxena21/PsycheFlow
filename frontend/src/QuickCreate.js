import React, { useState, useRef, useEffect } from 'react';

export default function QuickCreate({ t, actions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: t?.blue || '#1D4ED8', color: '#fff', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
        New
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 44, right: 0, width: 200, background: t?.bg2 || '#fff', borderRadius: 12, border: `0.5px solid ${t?.border || '#E2EBF6'}`, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden', padding: '4px 0' }}>
          {(actions || []).map((action, i) => (
            <div key={i} onClick={() => { action.onClick(); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', cursor: 'pointer', fontSize: 12, color: t?.navy || '#0C1A2E' }}
              onMouseEnter={e => e.currentTarget.style.background = t?.bg3 || '#EFF6FF'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {action.icon}
              {action.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
