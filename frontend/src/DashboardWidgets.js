import React from 'react';

// Wellness score calculator
export function calcWellnessScore(sessions, journals, mood) {
  if (!sessions?.length) return null;
  const latest = sessions[0];
  let score = 50;
  // PHQ contribution (lower is better)
  if (latest.phq_score !== undefined) {
    score += Math.max(0, (27 - latest.phq_score) / 27 * 20);
  }
  // GAD contribution
  if (latest.gad_score !== undefined) {
    score += Math.max(0, (21 - latest.gad_score) / 21 * 15);
  }
  // Session count
  score += Math.min(10, sessions.length * 2);
  // Journal count
  score += Math.min(5, (journals?.length || 0) * 0.5);
  return Math.min(100, Math.round(score));
}

// Risk level calculator
export function calcRiskLevel(sessions) {
  if (!sessions?.length) return { level: 'unknown', color: '#94a3b8' };
  const latest = sessions[0];
  const phq = latest.phq_score || 0;
  const gad = latest.gad_score || 0;
  if (phq >= 20 || gad >= 15) return { level: 'High', color: '#DC2626' };
  if (phq >= 15 || gad >= 10) return { level: 'Moderate', color: '#D97706' };
  if (phq >= 10 || gad >= 7) return { level: 'Mild', color: '#F59E0B' };
  return { level: 'Low', color: '#059669' };
}

// Severity label
export function severity(score, max) {
  const p = score / max;
  if (p >= 0.75) return { label: 'Severe', color: '#DC2626' };
  if (p >= 0.5) return { label: 'Moderate', color: '#D97706' };
  if (p >= 0.25) return { label: 'Mild', color: '#F59E0B' };
  return { label: 'Minimal', color: '#059669' };
}

// Score change indicator
export function ScoreChange({ current, previous, inverse = true }) {
  if (previous === undefined || previous === null) return null;
  const diff = current - previous;
  if (diff === 0) return <span style={{ fontSize: 11, color: '#94a3b8' }}>→ No change</span>;
  const improved = inverse ? diff < 0 : diff > 0;
  return (
    <span style={{ fontSize: 11, color: improved ? '#059669' : '#DC2626', fontWeight: 600 }}>
      {diff > 0 ? '↑' : '↓'} {Math.abs(diff)} {improved ? '(better)' : '(worse)'}
    </span>
  );
}

// Mini spark line
export function SparkLine({ data, color, height = 32 }) {
  if (!data?.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100, h = height;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Wellness ring
export function WellnessRing({ score, size = 80, color = '#1D4ED8' }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const progress = (score || 0) / 100;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2EBF6" strokeWidth="8"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }}/>
    </svg>
  );
}

// Achievement badge
export function AchievementBadge({ icon, label, earned, t }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: earned ? 1 : 0.3 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: earned ? 'linear-gradient(135deg,#1D4ED8,#0891B2)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
        {icon}
      </div>
      <span style={{ fontSize: 9, color: t?.text3 || '#94a3b8', textAlign: 'center', maxWidth: 52 }}>{label}</span>
    </div>
  );
}
