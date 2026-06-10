import React, { useState } from 'react';
import PP_PatientChart from './PP_PatientChart';
export default function PP_Roster({ patients, selectedPatient, setSelectedPatient, openPatient, setTab, S, card, Badge, user }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  if (selectedPatient) return <PP_PatientChart patient={selectedPatient} onBack={() => setSelectedPatient(null)} setTab={setTab} S={S} card={card} Badge={Badge} user={user}/>;
  const filtered = patients.filter(p => {
    const matchSearch = !search || (p.display_name || p.full_name || '').toLowerCase().includes(search.toLowerCase()) || p.email?.includes(search);
    const matchFilter = filter === 'all' || p.riskLevel === filter || (filter === 'deteriorating' && p.phqTrend === 'deteriorating') || (filter === 'missing' && p.daysSinceSession > 14);
    return matchSearch && matchFilter;
  });
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: S.navy, fontSize: 20, fontWeight: 700 }}>Patient Roster ({patients.length})</h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..." style={{ padding: '8px 12px', borderRadius: 8, border: `0.5px solid ${S.border}`, fontSize: 13, outline: 'none', background: S.bg, color: S.navy, width: 240 }}/>
      </div>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
        {[['all', 'All Patients'], ['critical', 'Critical'], ['high', 'High Risk'], ['moderate', 'Moderate'], ['low', 'Low Risk'], ['deteriorating', 'Deteriorating'], ['missing', 'Missed Sessions']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ padding: '5px 12px', border: 'none', borderRadius: 100, fontSize: 11, fontWeight: filter === val ? 700 : 400, background: filter === val ? S.blue : S.bg, color: filter === val ? '#fff' : S.muted, cursor: 'pointer', whiteSpace: 'nowrap' }}>{label}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: 48, color: S.hint }}>
          {patients.length === 0 ? 'No patients linked yet. Go to Link Patient to add patients.' : 'No patients match the current filter.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map(p => {
            const riskColor = p.riskLevel === 'critical' ? S.danger : p.riskLevel === 'high' ? S.warning : p.riskLevel === 'moderate' ? '#F59E0B' : S.success;
            const trendIcon = p.phqTrend === 'improving' ? '↑' : p.phqTrend === 'deteriorating' ? '↓' : '→';
            const trendColor = p.phqTrend === 'improving' ? S.success : p.phqTrend === 'deteriorating' ? S.danger : S.hint;
            return (
              <div key={p.id} onClick={() => openPatient(p)} style={{ ...card, cursor: 'pointer', borderLeft: `3px solid ${riskColor}`, padding: '16px 20px' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  {/* Avatar */}
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg,${S.blue},${S.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {(p.display_name || p.full_name || p.email || '?')[0].toUpperCase()}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: S.navy }}>{p.display_name || p.full_name || p.email}</div>
                        <div style={{ fontSize: 11, color: S.hint, marginTop: 1 }}>{p.age ? `${p.age}y` : '—'} · {p.gender || 'N/A'} · {p.email}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Badge color={p.riskLevel === 'critical' ? 'red' : p.riskLevel === 'high' ? 'yellow' : p.riskLevel === 'moderate' ? 'yellow' : 'green'}>{p.riskLevel}</Badge>
                        <span style={{ fontSize: 13, fontWeight: 700, color: trendColor }}>{trendIcon}</span>
                      </div>
                    </div>
                    {/* Clinical snapshot */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8, marginBottom: 8 }}>
                      {[
                        ['PHQ-9', p.latest?.phq_score, 27],
                        ['GAD-7', p.latest?.gad_score, 21],
                        ['Sessions', p.sessions.length, null],
                        ['Journals', p.journals.length, null],
                        ['Last Seen', p.daysSinceSession !== null ? `${p.daysSinceSession}d` : '—', null],
                        ['Last Journal', p.daysSinceJournal !== null ? `${p.daysSinceJournal}d` : '—', null],
                      ].map(([label, val, max]) => (
                        <div key={label} style={{ background: S.bg, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: S.navy }}>{val ?? '—'}</div>
                          <div style={{ fontSize: 9, color: S.hint }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    {/* AI alerts */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {p.riskLevel === 'critical' && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#FEF2F2', color: S.danger, fontWeight: 600 }}>⚠ Critical Risk</span>}
                      {p.phqTrend === 'deteriorating' && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#FFFBEB', color: S.warning, fontWeight: 600 }}>📉 Deteriorating</span>}
                      {p.daysSinceSession > 14 && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#F5F3FF', color: S.purple, fontWeight: 600 }}>🕐 Missed Session</span>}
                      {p.journals.length === 0 && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: S.bg, color: S.hint, fontWeight: 600 }}>No journals</span>}
                      {p.phqTrend === 'improving' && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#ECFDF5', color: S.success, fontWeight: 600 }}>✓ Improving</span>}
                    </div>
                  </div>
                  {/* Quick actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button onClick={e => { e.stopPropagation(); openPatient(p); }} style={{ padding: '5px 10px', background: S.lightBlue, color: S.blue, border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Open Chart</button>
                    <button onClick={e => { e.stopPropagation(); }} style={{ padding: '5px 10px', background: S.bg, color: S.muted, border: `0.5px solid ${S.border}`, borderRadius: 6, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>Message</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
