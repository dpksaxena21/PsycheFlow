import React from 'react';
export default function PP_CommandCenter({ patients, crisisAlerts, appointments, journals, sessions, setTab, openPatient, S, card, name }) {
  const today = new Date();
  const todaySessions = appointments.filter(a => a.status === 'scheduled' && new Date(a.scheduled_at).toDateString() === today.toDateString());
  const missedSessions = patients.filter(p => p.daysSinceSession > 14);
  const improving = patients.filter(p => p.phqTrend === 'improving');
  const deteriorating = patients.filter(p => p.phqTrend === 'deteriorating');
  const assessmentsDue = patients.filter(p => !p.latest || p.daysSinceSession > 21);
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${S.navy}, #1a3a6b)`, borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Clinical Intelligence Platform</div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16 }}>{greeting}, Dr. {name} 👋</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: 'Total Patients', value: patients.length, color: '#93C5FD', onClick: () => setTab('roster') },
            { label: 'Critical Alerts', value: crisisAlerts.filter(p => p.riskLevel === 'critical').length, color: '#FCA5A5', onClick: () => setTab('crisis') },
            { label: 'Sessions Today', value: todaySessions.length, color: '#6EE7B7', onClick: () => setTab('appointments') },
            { label: 'Need Review', value: deteriorating.length + missedSessions.length, color: '#FCD34D', onClick: () => setTab('roster') },
          ].map((stat, i) => (
            <div key={i} onClick={stat.onClick} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
              <div style={{ fontSize: 26, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Priority Queue */}
      <div style={{ ...card, marginBottom: 20, borderLeft: `3px solid ${S.blue}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: S.navy, marginBottom: 14 }}>🤖 AI Recommended Priorities Today</div>
        <div style={{ display: 'grid', gap: 8 }}>
          {[
            ...crisisAlerts.filter(p => p.riskLevel === 'critical').map(p => ({ patient: p.display_name || p.full_name, reason: `PHQ-9: ${p.latest?.phq_score} — Critical risk`, type: 'critical', onClick: () => openPatient(p) })),
            ...deteriorating.map(p => ({ patient: p.display_name || p.full_name, reason: `PHQ deteriorating: ${p.prev?.phq_score} → ${p.latest?.phq_score}`, type: 'warning', onClick: () => openPatient(p) })),
            ...missedSessions.map(p => ({ patient: p.display_name || p.full_name, reason: `No session in ${p.daysSinceSession} days`, type: 'info', onClick: () => openPatient(p) })),
            ...assessmentsDue.slice(0, 2).map(p => ({ patient: p.display_name || p.full_name, reason: 'Assessment overdue', type: 'info', onClick: () => openPatient(p) })),
          ].slice(0, 6).map((item, i) => (
            <div key={i} onClick={item.onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: item.type === 'critical' ? '#FEF2F2' : item.type === 'warning' ? '#FFFBEB' : S.bg, cursor: 'pointer', border: `0.5px solid ${item.type === 'critical' ? '#FECACA' : item.type === 'warning' ? '#FDE68A' : S.border}` }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.type === 'critical' ? S.danger : item.type === 'warning' ? S.warning : S.blue, flexShrink: 0 }}/>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: S.navy }}>{item.patient}</span>
                <span style={{ fontSize: 12, color: S.muted, marginLeft: 8 }}>{item.reason}</span>
              </div>
              <span style={{ fontSize: 11, color: S.blue }}>Review →</span>
            </div>
          ))}
          {patients.length === 0 && <div style={{ textAlign: 'center', padding: 24, color: S.hint, fontSize: 13 }}>No patients linked yet. Link patients to see AI priorities.</div>}
          {patients.length > 0 && improving.length > 0 && crisisAlerts.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, background: '#ECFDF5', border: '0.5px solid #A7F3D0' }}>
              <span style={{ fontSize: 16 }}>🎉</span>
              <span style={{ fontSize: 13, color: S.success, fontWeight: 600 }}>{improving.length} patient{improving.length > 1 ? 's are' : ' is'} improving — great clinical outcomes!</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Today's sessions */}
        <div style={{ ...card }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: S.navy, marginBottom: 12 }}>📅 Today's Sessions ({todaySessions.length})</div>
          {todaySessions.length === 0 ? <div style={{ fontSize: 12, color: S.hint, padding: '12px 0' }}>No sessions scheduled today.</div> :
            todaySessions.slice(0, 4).map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `0.5px solid ${S.border}` }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: S.navy }}>{new Date(a.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                  <div style={{ fontSize: 10, color: S.hint }}>{a.mode || 'Video'}</div>
                </div>
                <button onClick={() => setTab('session')} style={{ fontSize: 10, padding: '3px 8px', background: S.lightBlue, color: S.blue, border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 600 }}>Start</button>
              </div>
            ))}
        </div>

        {/* Risk distribution */}
        <div style={{ ...card }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: S.navy, marginBottom: 12 }}>🎯 Risk Distribution</div>
          {[['critical', S.danger], ['high', S.warning], ['moderate', '#F59E0B'], ['low', S.success]].map(([level, color]) => {
            const count = patients.filter(p => p.riskLevel === level).length;
            const pct = patients.length > 0 ? Math.round(count / patients.length * 100) : 0;
            return (
              <div key={level} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: S.navy, textTransform: 'capitalize', fontWeight: 500 }}>{level}</span>
                  <span style={{ fontSize: 11, color: S.muted }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: S.border }}>
                  <div style={{ height: 5, borderRadius: 3, background: color, width: pct + '%', transition: 'width 0.4s' }}/>
                </div>
              </div>
            );
          })}
          {patients.length === 0 && <div style={{ fontSize: 12, color: S.hint }}>No patient data yet.</div>}
        </div>

        {/* Quick stats */}
        <div style={{ ...card }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: S.navy, marginBottom: 12 }}>📈 Caseload Stats</div>
          {[
            ['Improving', improving.length, S.success],
            ['Deteriorating', deteriorating.length, S.danger],
            ['Stable', patients.filter(p => p.phqTrend === 'stable').length, S.blue],
            ['Missed Sessions', missedSessions.length, S.warning],
            ['Assessments Due', assessmentsDue.length, S.muted],
            ['Hospital Referrals', patients.length, S.cyan],
          ].map(([label, val, color]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `0.5px solid ${S.border}` }}>
              <span style={{ fontSize: 12, color: S.muted }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
