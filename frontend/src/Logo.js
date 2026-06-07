import React from 'react';

export const PsycheFlowIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="14" fill="#1D4ED8"/>
    <line x1="16" y1="10" x2="16" y2="54" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.18"/>
    <path d="M 16 10 C 16 10 46 10 46 26 C 46 42 16 46 16 46" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.18"/>
    <line x1="20" y1="13" x2="20" y2="52" stroke="white" strokeWidth="7.5" strokeLinecap="round"/>
    <path d="M 20 13 C 20 13 42 13 42 26 C 42 39 20 43 20 43" fill="none" stroke="white" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M 30 11 C 42 11 44 19 44 23" fill="none" stroke="#93C5FD" strokeWidth="7.5" strokeLinecap="round"/>
    <circle cx="44" cy="26" r="3.5" fill="#93C5FD" opacity="0.8"/>
    <line x1="44" y1="26" x2="50" y2="26" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
    <path d="M 50 26 L 53 18 L 56 34 L 59 26" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
  </svg>
);

export const PsycheFlowLogo = ({ size = 36, dark = false }) => {
  const text = dark ? '#FFFFFF' : '#0C1A2E';
  const muted = dark ? '#3B5998' : '#3B5998';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <PsycheFlowIcon size={size} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontSize: size * 0.72,
          fontWeight: 700,
          letterSpacing: '-0.5px',
          lineHeight: 1,
          color: text,
        }}>
          Psyche<span style={{ color: '#1D4ED8' }}>Flow</span>
        </span>
        <span style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: size * 0.25,
          fontWeight: 400,
          letterSpacing: '2.5px',
          color: muted,
          lineHeight: 1,
        }}>MENTAL HEALTH AI · INDIA</span>
      </div>
    </div>
  );
};

export default PsycheFlowLogo;
