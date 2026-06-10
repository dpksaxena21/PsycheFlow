import React from 'react';

export default function Breadcrumbs({ items, t }) {
  // items: [{ label, onClick }]
  if (!items?.length) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={t?.text3 || '#94a3b8'} strokeWidth="1.5" strokeLinecap="round"/></svg>}
          <span onClick={item.onClick}
            style={{ fontSize: 12, color: i === items.length - 1 ? (t?.text || '#0C1A2E') : (t?.blue || '#1D4ED8'), fontWeight: i === items.length - 1 ? 600 : 400, cursor: item.onClick ? 'pointer' : 'default' }}
            onMouseEnter={e => { if (item.onClick && i < items.length - 1) e.currentTarget.style.textDecoration = 'underline'; }}
            onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}>
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
