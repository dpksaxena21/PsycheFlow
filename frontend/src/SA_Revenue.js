import React from 'react';
export default function SA_Revenue({ S, card, Badge, KPICard, ...props }) {
  return (
    <div>
      <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Revenue</h2>
      <div style={{ ...card, textAlign:'center', padding:60, color:S.muted }}>
        <div style={{ fontSize:32, marginBottom:12 }}>🚧</div>
        <div style={{ fontSize:15, fontWeight:600, color:S.navy, marginBottom:8 }}>Coming Soon</div>
        <div style={{ fontSize:13 }}>This module is being built. Check back soon.</div>
      </div>
    </div>
  );
}
