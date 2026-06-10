import React, { useState } from 'react';
export default function PP_Assessments({ patients, sessions, S, card, Badge }) {
  const [selPatient, setSelPatient] = useState(null);
  const patientSessions = selPatient ? sessions.filter(s => s.user_id === selPatient.id) : [];

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', color: S.navy, fontSize: 20, fontWeight: 700 }}>Assessment Center</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Patients</div>
          {patients.map(p => (
            <div key={p.id} onClick={() => setSelPatient(p)}
              style={{ ...card, cursor:'pointer', padding:'12px 14px', borderLeft:`3px solid ${selPatient?.id===p.id?S.blue:S.border}`, background:selPatient?.id===p.id?S.lightBlue:undefined }}>
              <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{p.display_name||p.full_name}</div>
              <div style={{ fontSize:11, color:S.muted }}>{p.sessions?.length||0} assessments</div>
              {p.latest && <div style={{ fontSize:11, color:p.riskLevel==='critical'?S.danger:p.riskLevel==='high'?S.warning:S.success, fontWeight:600, marginTop:3 }}>PHQ: {p.latest.phq_score} · GAD: {p.latest.gad_score}</div>}
            </div>
          ))}
          {patients.length===0&&<div style={{ ...card, textAlign:'center', padding:24, color:S.muted, fontSize:12 }}>No patients linked.</div>}
        </div>
        <div>
          {!selPatient ? <div style={{ ...card, textAlign:'center', padding:48, color:S.muted }}>Select a patient to view assessments.</div> : (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
                {[['Total Assessments', patientSessions.length, S.blue],['Latest PHQ-9', selPatient.latest?.phq_score??'—', selPatient.riskLevel==='critical'?S.danger:selPatient.riskLevel==='high'?S.warning:S.success],['Latest GAD-7', selPatient.latest?.gad_score??'—', S.warning],['Trend', selPatient.phqTrend||'—', selPatient.phqTrend==='improving'?S.success:selPatient.phqTrend==='deteriorating'?S.danger:S.muted]].map(([label,val,color])=>(
                  <div key={label} style={{ ...card, padding:'12px 14px' }}>
                    <div style={{ fontSize:20, fontWeight:700, color, textTransform:'capitalize' }}>{val}</div>
                    <div style={{ fontSize:11, color:S.muted }}>{label}</div>
                  </div>
                ))}
              </div>
              {patientSessions.length > 1 && (
                <div style={{ ...card, marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:14 }}>PHQ-9 Trend</div>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:80 }}>
                    {patientSessions.slice(0,8).reverse().map((s,i)=>{
                      const pct = (s.phq_score/27)*100;
                      const color = s.phq_score>=20?S.danger:s.phq_score>=15?S.warning:s.phq_score>=10?'#F59E0B':S.success;
                      return (
                        <div key={s.id} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                          <div style={{ fontSize:9, color:S.muted }}>{s.phq_score}</div>
                          <div style={{ width:'100%', borderRadius:'3px 3px 0 0', background:color, height:Math.max(4,pct*0.8)+'px', opacity:i===patientSessions.slice(0,8).length-1?1:0.5 }}/>
                          <div style={{ fontSize:8, color:S.muted }}>{new Date(s.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div style={{ ...card, padding:0, overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:S.bg }}>{['Date','PHQ-9','GAD-7','Severity','Wellbeing'].map(h=><th key={h} style={{ padding:'9px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}` }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {patientSessions.length===0?<tr><td colSpan={5} style={{ padding:32, textAlign:'center', color:S.muted }}>No assessments yet.</td></tr>:patientSessions.map(s=>{
                      const sev = s.phq_score>=20?'Severe':s.phq_score>=15?'Mod-Severe':s.phq_score>=10?'Moderate':s.phq_score>=5?'Mild':'Minimal';
                      const sevColor = s.phq_score>=20?S.danger:s.phq_score>=15?S.warning:s.phq_score>=10?'#F59E0B':S.success;
                      return (
                        <tr key={s.id} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{ padding:'9px 14px', fontSize:12, color:S.muted }}>{new Date(s.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                          <td style={{ padding:'9px 14px', fontSize:14, fontWeight:700, color:sevColor }}>{s.phq_score}</td>
                          <td style={{ padding:'9px 14px', fontSize:14, fontWeight:700, color:S.warning }}>{s.gad_score}</td>
                          <td style={{ padding:'9px 14px' }}><Badge color={s.phq_score>=20?'red':s.phq_score>=10?'yellow':'green'}>{sev}</Badge></td>
                          <td style={{ padding:'9px 14px', fontSize:12, color:S.navy }}>{s.wellbeing_score?Math.round(s.wellbeing_score*100)+'%':'—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
