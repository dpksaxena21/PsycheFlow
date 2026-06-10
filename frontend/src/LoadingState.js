import React from 'react';

export function PageLoader({ message = 'Loading...' }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F8FAFF', fontFamily:"'Satoshi',-apple-system,sans-serif", flexDirection:'column', gap:12 }}>
      <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #1D4ED8', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }}/>
      <div style={{ fontSize:13, color:'#94a3b8' }}>{message}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function CardSkeleton({ rows = 3 }) {
  return (
    <div style={{ background:'#fff', borderRadius:12, border:'0.5px solid #E2EBF6', padding:20 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ height:14, background:'#F1F5F9', borderRadius:4, marginBottom:10, width:i === rows-1 ? '60%' : '100%', animation:'pulse 1.5s ease-in-out infinite' }}/>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

export function EmptyState({ icon, title, description, action, onAction }) {
  return (
    <div style={{ background:'#fff', borderRadius:12, border:'0.5px solid #E2EBF6', padding:'48px 24px', textAlign:'center' }}>
      {icon && <div style={{ marginBottom:16 }}>{icon}</div>}
      <div style={{ fontSize:15, fontWeight:600, color:'#0C1A2E', marginBottom:8 }}>{title}</div>
      {description && <div style={{ fontSize:13, color:'#94a3b8', marginBottom:action?20:0, maxWidth:320, margin:'0 auto', lineHeight:1.6 }}>{description}</div>}
      {action && <button onClick={onAction} style={{ marginTop:16, padding:'9px 20px', background:'#1D4ED8', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>{action}</button>}
    </div>
  );
}
