import React, { useState } from 'react';
import axios from 'axios';
const API = process.env.REACT_APP_API_URL || 'https://web-production-3887e.up.railway.app';
export default function PP_PatientChart({ patient: p, onBack, setTab, S, card, Badge, user }) {
  const [section, setSection] = useState('overview');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const riskColor = p.riskLevel === 'critical' ? S.danger : p.riskLevel === 'high' ? S.warning : p.riskLevel === 'moderate' ? '#F59E0B' : S.success;

  const askCopilot = async (query) => {
    setAiLoading(true);
    setAiResponse('');
    try {
      const patientContext = `Patient: ${p.display_name || p.full_name}, PHQ-9: ${p.latest?.phq_score}, GAD-7: ${p.latest?.gad_score}, Risk: ${p.riskLevel}, Sessions: ${p.sessions.length}, Journals: ${p.journals.length}, Trend: ${p.phqTrend}`;
      const res = await axios.post(API + '/chatbot', { message: `${query}\n\nPatient context: ${patientContext}`, user_id: user.id, context: { role: 'psychologist', patient_id: p.id } });
      setAiResponse(res.data.response);
    } catch { setAiResponse('AI Copilot temporarily unavailable.'); }
    setAiLoading(false);
  };

  return (
    <div>
      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ padding: '7px 12px', background: S.bg, border: `0.5px solid ${S.border}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', color: S.muted }}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: S.navy }}>{p.display_name || p.full_name || p.email}</div>
          <div style={{ fontSize: 11, color: S.hint }}>{p.age ? `${p.age}y` : '—'} · {p.gender || 'N/A'} · {p.email}</div>
        </div>
        <Badge color={p.riskLevel === 'critical' ? 'red' : p.riskLevel === 'high' ? 'yellow' : p.riskLevel === 'moderate' ? 'yellow' : 'green'}>{p.riskLevel} risk</Badge>
        <button onClick={() => setTab('session')} style={{ padding: '8px 16px', background: S.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Start Session</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Left: main content */}
        <div>
          {/* Section tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: S.bg, borderRadius: 10, padding: 4 }}>
            {['overview', 'clinical', 'journals', 'sessions', 'timeline'].map(s => (
              <button key={s} onClick={() => setSection(s)} style={{ flex: 1, padding: '7px', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: section === s ? 700 : 400, background: section === s ? S.card : 'transparent', color: section === s ? S.navy : S.muted, cursor: 'pointer', textTransform: 'capitalize', boxShadow: section === s ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>{s}</button>
            ))}
          </div>

          {section === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
                {[['PHQ-9', p.latest?.phq_score ?? '—', riskColor], ['GAD-7', p.latest?.gad_score ?? '—', S.warning], ['Sessions', p.sessions.length, S.blue], ['Journals', p.journals.length, S.cyan]].map(([label, val, color]) => (
                  <div key={label} style={{ ...card, padding: '12px 14px' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color }}>{val}</div>
                    <div style={{ fontSize: 11, color: S.hint }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...card, marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Patient Summary</div>
                {[['Risk Level', p.riskLevel, riskColor], ['PHQ Trend', p.phqTrend, p.phqTrend === 'improving' ? S.success : p.phqTrend === 'deteriorating' ? S.danger : S.hint], ['Last Session', p.daysSinceSession !== null ? `${p.daysSinceSession} days ago` : 'Never', S.muted], ['Last Journal', p.daysSinceJournal !== null ? `${p.daysSinceJournal} days ago` : 'Never', S.muted], ['Linked', new Date(p.link?.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), S.muted]].map(([label, val, color]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `0.5px solid ${S.border}` }}>
                    <span style={{ fontSize: 12, color: S.muted }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color, textTransform: 'capitalize' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'clinical' && (
            <div>
              {p.sessions.length === 0 ? <div style={{ ...card, textAlign: 'center', padding: 40, color: S.hint }}>No assessment data yet.</div> : p.sessions.slice(0, 5).map((s, i) => {
                const phqSev = s.phq_score >= 20 ? 'Severe' : s.phq_score >= 15 ? 'Mod-Severe' : s.phq_score >= 10 ? 'Moderate' : s.phq_score >= 5 ? 'Mild' : 'Minimal';
                return (
                  <div key={s.id} style={{ ...card, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: S.navy }}>{new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <Badge color={s.phq_score >= 20 ? 'red' : s.phq_score >= 10 ? 'yellow' : 'green'}>{phqSev}</Badge>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {[['PHQ-9', s.phq_score, 27], ['GAD-7', s.gad_score, 21], ['Wellbeing', Math.round((s.wellbeing_score || 0.75) * 100), 100]].map(([label, score, max]) => score !== undefined && (
                        <div key={label} style={{ background: S.bg, borderRadius: 6, padding: '6px 10px' }}>
                          <div style={{ fontSize: 9, color: S.hint, marginBottom: 2 }}>{label}</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: S.navy }}>{score}{max ? `/${max}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {section === 'journals' && (
            <div>
              {p.journals.length === 0 ? <div style={{ ...card, textAlign: 'center', padding: 40, color: S.hint }}>Patient has no journal entries yet.</div> : p.journals.slice(0, 5).map(j => (
                <div key={j.id} style={{ ...card, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: S.hint }}>{new Date(j.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</div>
                    {j.analysis?.emotions?.primary && <Badge color="blue">{j.analysis.emotions.primary}</Badge>}
                  </div>
                  <div style={{ fontSize: 13, color: S.navy, lineHeight: 1.6, marginBottom: 8 }}>{j.text?.slice(0, 300)}{j.text?.length > 300 ? '...' : ''}</div>
                  {j.analysis?.themes?.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {j.analysis.themes.slice(0, 3).map(theme => <span key={theme} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: S.lightBlue, color: S.blue }}>{theme}</span>)}
                  </div>}
                </div>
              ))}
            </div>
          )}

          {section === 'sessions' && (
            <div>
              {p.sessions.length === 0 ? <div style={{ ...card, textAlign: 'center', padding: 40, color: S.hint }}>No sessions yet.</div> : p.sessions.map(s => (
                <div key={s.id} style={{ ...card, marginBottom: 8, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: S.navy }}>{new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    <div style={{ fontSize: 11, color: S.muted }}>PHQ: {s.phq_score} · GAD: {s.gad_score}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {section === 'timeline' && (
            <div style={{ ...card }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Clinical Timeline</div>
              <div style={{ position: 'relative', paddingLeft: 20 }}>
                <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: S.border }}/>
                {[
                  { date: p.link?.created_at, event: 'Patient linked', type: 'link' },
                  ...p.sessions.map(s => ({ date: s.created_at, event: `Assessment: PHQ-9=${s.phq_score}, GAD-7=${s.gad_score}`, type: 'assessment' })),
                  ...p.journals.map(j => ({ date: j.created_at, event: `Journal: ${j.analysis?.emotions?.primary || 'entry'}`, type: 'journal' })),
                ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.type === 'assessment' ? S.blue : item.type === 'journal' ? S.cyan : S.success, border: `2px solid ${S.card}`, flexShrink: 0, marginTop: 2 }}/>
                    <div>
                      <div style={{ fontSize: 12, color: S.navy }}>{item.event}</div>
                      <div style={{ fontSize: 10, color: S.hint }}>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: AI Copilot */}
        <div>
          <div style={{ ...card, position: 'sticky', top: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.navy, marginBottom: 12, display:'flex', alignItems:'center', gap:6 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="10" rx="2" stroke="#1D4ED8" strokeWidth="1.5"/><path d="M9 11V7a3 3 0 016 0v4" stroke="#1D4ED8" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="16" r="1" fill="#1D4ED8"/><circle cx="15" cy="16" r="1" fill="#1D4ED8"/></svg>AI Clinical Copilot</div>
            <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
              {['Summarize this patient', 'What changed this month?', 'Generate session plan', 'Find risk factors', 'Suggest intervention', 'Predict dropout risk'].map(q => (
                <button key={q} onClick={() => { setAiQuery(q); askCopilot(q); }} style={{ padding: '7px 10px', background: S.bg, color: S.muted, border: `0.5px solid ${S.border}`, borderRadius: 7, fontSize: 11, cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => { e.currentTarget.style.background = S.lightBlue; e.currentTarget.style.color = S.blue; }}
                  onMouseLeave={e => { e.currentTarget.style.background = S.bg; e.currentTarget.style.color = S.muted; }}>
                  {q}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 8 }}>
              <input value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && askCopilot(aiQuery)} placeholder="Ask anything about this patient..." style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: `0.5px solid ${S.border}`, fontSize: 12, outline: 'none', background: S.bg, color: S.navy, boxSizing: 'border-box' }}/>
            </div>
            {aiLoading && <div style={{ fontSize: 12, color: S.muted, padding: '8px 0' }}>Analyzing patient data...</div>}
            {aiResponse && (
              <div style={{ background: S.lightBlue, borderRadius: 8, padding: '10px 12px', fontSize: 12, color: S.navy, lineHeight: 1.6, maxHeight: 300, overflowY: 'auto' }}>
                {aiResponse}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
