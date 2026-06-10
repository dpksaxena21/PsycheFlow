import React from 'react';

export default function NotFound() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F8FAFF', fontFamily:"'Satoshi',-apple-system,sans-serif" }}>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <div style={{ fontSize:72, fontWeight:700, color:'#E2EBF6', letterSpacing:'-0.04em', marginBottom:8 }}>404</div>
        <h2 style={{ fontSize:20, fontWeight:700, color:'#0C1A2E', marginBottom:8 }}>Page not found</h2>
        <p style={{ fontSize:14, color:'#94a3b8', marginBottom:24 }}>The page you are looking for does not exist.</p>
        <a href="/" style={{ padding:'10px 24px', background:'#1D4ED8', color:'#fff', borderRadius:8, fontSize:13, fontWeight:600, textDecoration:'none' }}>Go to PsycheFlow</a>
      </div>
    </div>
  );
}
