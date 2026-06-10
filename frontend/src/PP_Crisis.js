import React, { useState } from 'react';
export default function PP_Crisis({ crisisAlerts, patients, openPatient, S, card, Badge }) {
  const [filter, setFilter] = useState('all');
  const critical = crisisAlerts.filter(p => p.riskLevel === 'critical');
  const high = crisisAlerts.filter(p => p.riskLevel === 'high');
  const filtered = filter === 'critical' ? critical : filter === 'high' ? high : crisisAlerts;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: S.navy, fontSize: 20, fontWeight: 700 }}>Crisis Center</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['all', 'All'], ['critical', 'Critical'], ['high', 'High']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{ padding: '5px 12px', border: 'none', borderRadius: 100, fontSize: 11, fontWeight: filter === val ? 700 : 400, background: filter === val ? S.danger : S.bg, color: filter === val ? '#fff' : S.muted, cursor: 'pointer' }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[['Critical', critical.length, S.danger], ['High Risk', high.length, S.warning], ['Total Alerts', crisisAlerts.length, S.blue], ['Resolved', 0, S.success]].map(([label, val, color]) => (
          <div key={label} style={{ ...card, padding: '14px 18px', borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 24, fontWeight: 700, color }}>{val}</div>
            <div style={{ fontSize: 11, color: S.hint, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: 48 }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          <div style={{ fontSize: 15, fontWeight: 600, color: S.navy, marginBottom: 8 }}>No Active Crisis Alerts</div>
          <div style={{ fontSize: 13, color: S.hint }}>All patients are within safe risk thresholds.</div>
        </div>
      ) : filtered.map(p => {
        const riskColor = p.riskLevel === 'critical' ? S.danger : S.warning;
        const reasons = [];
        if (p.latest?.phq_score >= 20) reasons.push(`PHQ-9 Critical: ${p.latest.phq_score}`);
        if (p.latest?.phq_score >= 15 && p.latest?.phq_score < 20) reasons.push(`PHQ-9 High: ${p.latest.phq_score}`);
        if (p.phqTrend === 'deteriorating') reasons.push('PHQ Deteriorating');
        if (p.daysSinceSession > 21) reasons.push(`No session in ${p.daysSinceSession} days`);
        return (
          <div key={p.id} style={{ ...card, marginBottom: 14, borderLeft: `4px solid ${riskColor}`, background: p.riskLevel === 'critical' ? '#FFFBF5' : S.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: riskColor + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: riskColor }}>
                  {(p.display_name || p.full_name || '?')[0]}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: S.navy }}>{p.display_name || p.full_name}</div>
                  <div style={{ fontSize: 11, color: S.hint }}>{p.email}</div>
                </div>
              </div>
              <Badge color={p.riskLevel === 'critical' ? 'red' : 'yellow'}>{p.riskLevel?.toUpperCase()}</Badge>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: S.muted, textTransform: 'uppercase', marginBottom: 6 }}>AI Risk Reasons</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {reasons.map(r => <span key={r} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#FEF2F2', color: S.danger, fontWeight: 500 }}>{r}</span>)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => openPatient(p)} style={{ padding: '7px 14px', background: S.blue, color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Open Chart</button>
              <button style={{ padding: '7px 14px', background: S.lightBlue, color: S.blue, border: 'none', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Message Patient</button>
              <a href="tel:9152987821" style={{ padding: '7px 14px', background: '#FEF2F2', color: S.danger, border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>iCall: 9152987821</a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
