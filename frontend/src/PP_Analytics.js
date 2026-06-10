import React from 'react';
export default function PP_Analytics({ patients, sessions, journals, appointments, S, card, Badge, KPICard }) {
  const totalSessions = sessions?.length || 0;
  const improving = patients.filter(p => p.phqTrend === 'improving').length;
  const deteriorating = patients.filter(p => p.phqTrend === 'deteriorating').length;
  const avgPHQ = patients.length > 0 ? (patients.filter(p => p.latest?.phq_score !== undefined).reduce((s, p) => s + p.latest.phq_score, 0) / Math.max(1, patients.filter(p => p.latest?.phq_score !== undefined).length)).toFixed(1) : '—';
  const completionRate = totalSessions > 0 ? Math.round((appointments?.filter(a => a.status === 'completed').length || 0) / totalSessions * 100) : 0;

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', color: S.navy, fontSize: 20, fontWeight: 700 }}>Practice Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[['Total Patients', patients.length, S.blue],['Improving', improving, S.success],['Deteriorating', deteriorating, S.danger],['Avg PHQ-9', avgPHQ, S.warning]].map(([label, val, color]) => (
          <div key={label} style={{ ...card, padding: '16px 18px', borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 26, fontWeight: 700, color }}>{val}</div>
            <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ ...card }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: S.navy, marginBottom: 14 }}>PHQ-9 Distribution</div>
          {[['Minimal (0-4)', patients.filter(p => (p.latest?.phq_score||0) <= 4).length, S.success],['Mild (5-9)', patients.filter(p => (p.latest?.phq_score||0) >= 5 && (p.latest?.phq_score||0) <= 9).length, '#F59E0B'],['Moderate (10-14)', patients.filter(p => (p.latest?.phq_score||0) >= 10 && (p.latest?.phq_score||0) <= 14).length, S.warning],['Mod-Severe (15-19)', patients.filter(p => (p.latest?.phq_score||0) >= 15 && (p.latest?.phq_score||0) <= 19).length, '#EF4444'],['Severe (20+)', patients.filter(p => (p.latest?.phq_score||0) >= 20).length, S.danger]].map(([label, count, color]) => {
            const pct = patients.length > 0 ? Math.round(count / patients.length * 100) : 0;
            return (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: S.navy }}>{label}</span>
                  <span style={{ fontSize: 11, color: S.muted }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: S.border }}>
                  <div style={{ height: 6, borderRadius: 3, background: color, width: pct + '%', transition: 'width 0.4s' }}/>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ ...card }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: S.navy, marginBottom: 14 }}>Risk Distribution</div>
          {[['Critical', patients.filter(p => p.riskLevel === 'critical').length, S.danger],['High', patients.filter(p => p.riskLevel === 'high').length, S.warning],['Moderate', patients.filter(p => p.riskLevel === 'moderate').length, '#F59E0B'],['Low', patients.filter(p => p.riskLevel === 'low').length, S.success]].map(([label, count, color]) => {
            const pct = patients.length > 0 ? Math.round(count / patients.length * 100) : 0;
            return (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: S.navy }}>{label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: S.border }}>
                  <div style={{ height: 6, borderRadius: 3, background: color, width: pct + '%' }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[['Total Sessions', totalSessions, S.blue, 'All time'],['Completed', appointments?.filter(a=>a.status==='completed').length||0, S.success, 'Appointments'],['Journals', journals?.length||0, S.cyan, 'Entries analyzed'],['Improving Patients', improving, S.success, `${patients.length > 0 ? Math.round(improving/patients.length*100) : 0}% of caseload`],['Stable', patients.filter(p=>p.phqTrend==='stable').length, S.blue, 'No change in PHQ'],['Missed Sessions', patients.filter(p=>p.daysSinceSession>14).length, S.warning, 'Not seen in 14+ days']].map(([label, val, color, sub]) => (
          <div key={label} style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color }}>{val}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: S.navy, marginTop: 2 }}>{label}</div>
            <div style={{ fontSize: 10, color: S.muted }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
