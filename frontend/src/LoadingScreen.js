import React, { useEffect, useState } from 'react';

const MESSAGES = [
  'Initialising clinical models...',
  'Loading assessment engine...',
  'Preparing your workspace...',
  'Almost ready...',
];

export default function LoadingScreen({ message }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0C1A2E',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 40,
    }}>

      {/* Logo mark */}
      <svg width="72" height="72" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
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

      {/* Wordmark */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontSize: 28, fontWeight: 700,
          letterSpacing: '-0.5px', color: '#fff',
          marginBottom: 4,
        }}>
          Psyche<span style={{ color: '#60A5FA' }}>Flow</span>
        </div>
        <div style={{
          fontFamily: 'system-ui', fontSize: 9,
          letterSpacing: '3px', color: '#3B5998',
        }}>MENTAL HEALTH AI · INDIA</div>
      </div>

      {/* Animated EEG wave */}
      <svg width="280" height="60" viewBox="0 0 280 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes eeg-shift { from { transform: translateX(0); } to { transform: translateX(-140px); } }
          .eeg-track { animation: eeg-shift 1.8s linear infinite; }
        `}</style>
        {/* clip so wave doesn't overflow */}
        <defs>
          <clipPath id="eeg-clip">
            <rect x="0" y="0" width="280" height="60"/>
          </clipPath>
        </defs>
        <g clipPath="url(#eeg-clip)">
          {/* Two copies side by side so loop is seamless */}
          <g className="eeg-track">
            {/* copy 1 */}
            <polyline
              points="0,30 20,30 28,30 34,14 40,46 46,22 52,30 72,30 80,30 86,18 92,42 98,30 118,30 126,30 132,10 138,50 144,24 150,30 170,30"
              fill="none" stroke="#1D4ED8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"
            />
            {/* highlight spike — blue bright */}
            <polyline
              points="126,30 132,10 138,50 144,24 150,30"
              fill="none" stroke="#60A5FA" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
            />
            {/* copy 2 — offset 140px right */}
            <polyline
              points="140,30 160,30 168,30 174,14 180,46 186,22 192,30 212,30 220,30 226,18 232,42 238,30 258,30 266,30 272,10 278,50 284,24 290,30 310,30"
              fill="none" stroke="#1D4ED8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"
            />
            <polyline
              points="266,30 272,10 278,50 284,24 290,30"
              fill="none" stroke="#60A5FA" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>

      {/* Status message */}
      <div style={{
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13, color: '#3B5998',
        letterSpacing: '0.5px',
        minHeight: 20,
        transition: 'opacity 0.4s',
      }}>
        {message || MESSAGES[msgIndex]}
      </div>

    </div>
  );
}
