import React from 'react';

export default function Logo({ size = 'md', dark = false, iconOnly = false }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap: iconOnly ? 0 : 10 }}>
      <div style={{
        width: size==='sm'?24:size==='lg'?36:30,
        height: size==='sm'?24:size==='lg'?36:30,
        borderRadius: size==='sm'?7:size==='lg'?10:8,
        background:'#1D4ED8',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
      }}>
        <svg width={size==='sm'?14:size==='lg'?20:17} height={size==='sm'?14:size==='lg'?20:17} viewBox="0 0 18 18" fill="none">
          <path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/>
          <circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/>
        </svg>
      </div>
      {!iconOnly && (
        <div style={{ display:'flex', flexDirection:'column', lineHeight:1 }}>
          <span style={{
            fontFamily:"'Satoshi',-apple-system,sans-serif",
            fontSize: size==='sm'?13:size==='lg'?20:15,
            fontWeight:700,
            color: dark ? '#ffffff' : '#0C1A2E',
            letterSpacing:'-0.02em',
          }}>PsycheFlow</span>
        </div>
      )}
    </div>
  );
}
