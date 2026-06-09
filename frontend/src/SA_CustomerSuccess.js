import React from 'react';
export default function SACustomerSuccess({ hospitals, subscriptions, S, card, Badge, KPICard }) {
  const healthScore = (h) => {
    let score = 30;
    const sub = subscriptions.find(s=>s.hospital_id===h.id);
    if (sub?.status==='active') score += 30;
    if (sub?.plan==='enterprise') score += 20;
    else if (sub?.plan==='professional') score += 15;
    else if (sub?.plan==='starter') score += 10;
    if (h.nabh_accredited) score += 10;
    if (h.psychologists_count > 3) score += 10;
    return Math.min(100, score);
  };
  const churnRisk = (h) => {
    const score = healthScore(h);
    const sub = subscriptions.find(s=>s.hospital_id===h.id);
    if (!sub || sub.status==='suspended') return 'high';
    if (score < 50) return 'medium';
    return 'low';
  };
  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Customer Success</h2>
        <div style={{ fontSize:12, color:S.muted, marginTop:4 }}>Monitor adoption, health scores, and churn risk across all hospitals</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        <KPICard label="Healthy" value={hospitals.filter(h=>healthScore(h)>=70).length} sub="Score ≥ 70" color={S.success}/>
        <KPICard label="At Risk" value={hospitals.filter(h=>healthScore(h)>=40&&healthScore(h)<70).length} sub="Score 40-70" color={S.warning}/>
        <KPICard label="Critical" value={hospitals.filter(h=>healthScore(h)<40).length} sub="Score < 40" color={S.danger}/>
        <KPICard label="Avg Health Score" value={hospitals.length>0?Math.round(hospitals.reduce((s,h)=>s+healthScore(h),0)/hospitals.length)+'/100':'—'} color={S.blue}/>
      </div>
      <div style={{ ...card, padding:0, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:S.bg }}>{['Hospital','Plan','Health Score','Churn Risk','NABH','Psychologists','Actions'].map(h=><th key={h} style={{ padding:'9px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
          <tbody>
            {hospitals.length===0?<tr><td colSpan={7} style={{ padding:48, textAlign:'center', color:S.muted }}>No hospitals yet.</td></tr>:hospitals.map(h=>{
              const sub = subscriptions.find(s=>s.hospital_id===h.id);
              const score = healthScore(h);
              const risk = churnRisk(h);
              return (
                <tr key={h.id} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'9px 14px' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{h.name}</div>
                    <div style={{ fontSize:10, color:S.muted }}>{h.city}</div>
                  </td>
                  <td style={{ padding:'9px 14px' }}><Badge color={sub?.plan==='enterprise'?'purple':sub?.plan==='professional'?'blue':sub?.plan==='starter'?'green':'yellow'}>{sub?.plan||'free'}</Badge></td>
                  <td style={{ padding:'9px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, height:6, borderRadius:3, background:S.border, maxWidth:80 }}>
                        <div style={{ height:6, borderRadius:3, background:score>=70?S.success:score>=40?S.warning:S.danger, width:score+'%' }}/>
                      </div>
                      <span style={{ fontSize:11, fontWeight:600, color:score>=70?S.success:score>=40?S.warning:S.danger }}>{score}</span>
                    </div>
                  </td>
                  <td style={{ padding:'9px 14px' }}><Badge color={risk==='low'?'green':risk==='medium'?'yellow':'red'}>{risk} risk</Badge></td>
                  <td style={{ padding:'9px 14px' }}><Badge color={h.nabh_accredited?'green':'yellow'}>{h.nabh_accredited?'Yes':'No'}</Badge></td>
                  <td style={{ padding:'9px 14px', fontSize:12, color:S.navy }}>{h.psychologists_count||0}</td>
                  <td style={{ padding:'9px 14px' }}>
                    <button style={{ fontSize:10, padding:'3px 8px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:5, cursor:'pointer', fontWeight:600 }}>Contact</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
