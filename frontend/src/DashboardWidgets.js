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


// ── Clickable Clinical Score Card with expandable chart + explanation ──
export function ClinicalScoreCards({ latest, sessions, t, isMobile, setTab, severity, ScoreChange, SparkLine }) {
  const [expanded, setExpanded] = React.useState(null);

  const PHQ_RANGES = [
    { range: '0–4', label: 'Minimal', desc: 'No significant depression. Continue monitoring.', color: '#059669' },
    { range: '5–9', label: 'Mild', desc: 'Mild symptoms. Watchful waiting and lifestyle support recommended.', color: '#F59E0B' },
    { range: '10–14', label: 'Moderate', desc: 'Moderate depression. Consider therapy and regular check-ins.', color: '#F97316' },
    { range: '15–19', label: 'Mod-Severe', desc: 'Moderately severe. Active therapy strongly recommended.', color: '#EF4444' },
    { range: '20–27', label: 'Severe', desc: 'Severe depression. Immediate clinical intervention needed.', color: '#DC2626' },
  ];
  const GAD_RANGES = [
    { range: '0–4', label: 'Minimal', desc: 'Minimal anxiety. Normal functioning maintained.', color: '#059669' },
    { range: '5–9', label: 'Mild', desc: 'Mild anxiety. Stress management techniques may help.', color: '#F59E0B' },
    { range: '10–14', label: 'Moderate', desc: 'Moderate anxiety. Therapy and coping strategies recommended.', color: '#F97316' },
    { range: '15–21', label: 'Severe', desc: 'Severe anxiety. Clinical evaluation and treatment required.', color: '#DC2626' },
  ];

  const cards = [
    {
      id: 'phq', label: 'PHQ-9', sublabel: 'Depression', score: latest.phq_score, max: 27,
      prev: sessions[1]?.phq_score, tab: 'clinical',
      description: 'The Patient Health Questionnaire (PHQ-9) measures depression severity across 9 symptoms over the past 2 weeks.',
      ranges: PHQ_RANGES,
      trend: sessions.slice(0,6).map(s=>s.phq_score).filter(v=>v!==undefined).reverse(),
    },
    {
      id: 'gad', label: 'GAD-7', sublabel: 'Anxiety', score: latest.gad_score, max: 21,
      prev: sessions[1]?.gad_score, tab: 'clinical',
      description: 'The Generalized Anxiety Disorder scale (GAD-7) measures anxiety severity across 7 symptoms.',
      ranges: GAD_RANGES,
      trend: sessions.slice(0,6).map(s=>s.gad_score).filter(v=>v!==undefined).reverse(),
    },
    {
      id: 'sessions', label: sessions.length.toString(), sublabel: 'Assessments Done', score: null, max: null,
      prev: null, tab: 'assessment',
      description: 'Regular assessments help track your mental health progress over time. The more consistent you are, the better your trend data.',
      ranges: null, trend: null,
    },
    {
      id: 'journals', label: '', sublabel: 'Journal Entries', score: null, max: null,
      prev: null, tab: 'journal',
      description: 'Journaling is one of the most effective mental health tools. AI analyzes your entries for themes and emotional patterns.',
      ranges: null, trend: null,
    },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 12 }}>
        {cards.map((card) => {
          const sev = card.max ? severity(card.score, card.max) : null;
          const isExpanded = expanded === card.id;
          return (
            <div key={card.id} onClick={() => setExpanded(isExpanded ? null : card.id)}
              style={{ background: t.bg2, borderRadius: 12, padding: '14px 16px', border: `0.5px solid ${isExpanded ? t.blue : t.border}`, cursor: 'pointer', transition: 'all 0.2s', gridColumn: isExpanded && !isMobile ? 'span 2' : 'span 1' }}
              onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.borderColor = t.blue; }}
              onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.borderColor = t.border; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{card.sublabel}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: sev?.color || t.blue, letterSpacing: '-0.02em' }}>
                    {card.id === 'sessions' ? sessions.length : card.id === 'journals' ? (window._journalCount || 0) : (card.score !== undefined && card.score !== null ? card.score : '—')}
                  </div>
                  {sev && <div style={{ fontSize: 11, fontWeight: 600, color: sev.color, marginTop: 2 }}>{sev.label}</div>}
                  {card.prev !== null && card.prev !== undefined && <ScoreChange current={card.score} previous={card.prev}/>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {card.trend?.length > 1 && <div style={{ width: 60 }}><SparkLine data={card.trend} color={sev?.color || t.blue}/></div>}
                  <div style={{ fontSize: 10, color: t.blue }}>{isExpanded ? '▲ Less' : '▼ More'}</div>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `0.5px solid ${t.border}` }}>
                  <div style={{ fontSize: 12, color: t.text3, lineHeight: 1.6, marginBottom: 12 }}>{card.description}</div>

                  {/* Score bar */}
                  {card.max && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: t.text3 }}>Your score: {card.score}/{card.max}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: sev?.color }}>{sev?.label}</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: t.border, position: 'relative' }}>
                        <div style={{ height: 8, borderRadius: 4, background: sev?.color, width: (card.score / card.max * 100) + '%', transition: 'width 0.4s' }}/>
                        <div style={{ position: 'absolute', top: -4, left: (card.score / card.max * 100) + '%', width: 2, height: 16, background: sev?.color, borderRadius: 1 }}/>
                      </div>
                    </div>
                  )}

                  {/* Severity ranges */}
                  {card.ranges && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Score Ranges</div>
                      <div style={{ display: 'grid', gap: 4 }}>
                        {card.ranges.map(r => (
                          <div key={r.range} style={{ display: 'flex', gap: 10, padding: '6px 8px', borderRadius: 6, background: sev?.label === r.label ? r.color + '15' : t.bg, border: sev?.label === r.label ? `1px solid ${r.color}40` : 'none' }}>
                            <div style={{ width: 32, fontSize: 10, fontWeight: 700, color: r.color, flexShrink: 0 }}>{r.range}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 11, fontWeight: sev?.label === r.label ? 700 : 500, color: t.text }}>{r.label} {sev?.label === r.label ? '← You are here' : ''}</div>
                              <div style={{ fontSize: 10, color: t.text3 }}>{r.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trend chart */}
                  {card.trend?.length > 1 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Your Trend ({card.trend.length} assessments)</div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
                        {card.trend.map((val, i) => {
                          const pct = (val / card.max) * 100;
                          const barColor = card.id === 'phq' ? (val >= 20 ? '#DC2626' : val >= 15 ? '#EF4444' : val >= 10 ? '#F97316' : val >= 5 ? '#F59E0B' : '#059669') : (val >= 15 ? '#DC2626' : val >= 10 ? '#F97316' : val >= 5 ? '#F59E0B' : '#059669');
                          return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                              <div style={{ fontSize: 9, color: t.text3 }}>{val}</div>
                              <div style={{ width: '100%', borderRadius: '3px 3px 0 0', background: barColor, height: Math.max(4, pct * 0.6) + 'px', opacity: i === card.trend.length - 1 ? 1 : 0.5 }}/>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: 10, color: t.text3, marginTop: 4, textAlign: 'center' }}>Oldest → Most Recent</div>
                    </div>
                  )}

                  <button onClick={e => { e.stopPropagation(); setTab(card.tab); }} style={{ width: '100%', padding: '8px', background: t.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    View Full {card.sublabel} Dashboard →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
