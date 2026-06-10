import React, { useState } from 'react';
export default function PP_JournalIntelligence({ patients, journals, S, card, Badge }) {
  const [selPatient, setSelPatient] = useState(null);
  const patientJournals = selPatient ? journals.filter(j => j.user_id === selPatient.id) : [];

  const allThemes = patientJournals.flatMap(j => j.analysis?.themes || []);
  const themeCounts = allThemes.reduce((acc, t) => { acc[t] = (acc[t]||0)+1; return acc; }, {});
  const topThemes = Object.entries(themeCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);

  const allEmotions = patientJournals.flatMap(j => j.analysis?.emotions?.primary ? [j.analysis.emotions.primary] : []);
  const emotionCounts = allEmotions.reduce((acc, e) => { acc[e] = (acc[e]||0)+1; return acc; }, {});
  const topEmotions = Object.entries(emotionCounts).sort((a,b)=>b[1]-a[1]).slice(0,6);

  const riskEntries = patientJournals.filter(j => j.analysis?.risk_level === 'high' || j.analysis?.crisis_indicators?.length > 0);

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', color: S.navy, fontSize: 20, fontWeight: 700 }}>Journal Intelligence</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Select Patient</div>
          {patients.map(p => (
            <div key={p.id} onClick={() => setSelPatient(p)}
              style={{ ...card, cursor: 'pointer', padding: '12px 14px', borderLeft: `3px solid ${selPatient?.id===p.id?S.blue:S.border}`, background: selPatient?.id===p.id?S.lightBlue:undefined }}
              onMouseEnter={e=>e.currentTarget.style.borderLeftColor=S.blue}
              onMouseLeave={e=>e.currentTarget.style.borderLeftColor=selPatient?.id===p.id?S.blue:S.border}>
              <div style={{ fontSize: 13, fontWeight: 600, color: S.navy }}>{p.display_name||p.full_name}</div>
              <div style={{ fontSize: 11, color: S.muted }}>{p.journals?.length||0} journal entries</div>
            </div>
          ))}
          {patients.length===0&&<div style={{ ...card, textAlign:'center', padding:24, color:S.muted, fontSize:12 }}>No patients linked.</div>}
        </div>
        <div>
          {!selPatient ? <div style={{ ...card, textAlign:'center', padding:48, color:S.muted }}>Select a patient to view journal intelligence.</div> : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
                {[['Entries', patientJournals.length, S.blue],['Risk Entries', riskEntries.length, S.danger],['Themes', topThemes.length, S.cyan],['Emotions', topEmotions.length, S.purple]].map(([label,val,color])=>(
                  <div key={label} style={{ ...card, padding:'12px 14px' }}>
                    <div style={{ fontSize:20, fontWeight:700, color }}>{val}</div>
                    <div style={{ fontSize:11, color:S.muted }}>{label}</div>
                  </div>
                ))}
              </div>
              {patientJournals.length===0 ? <div style={{ ...card, textAlign:'center', padding:32, color:S.muted }}>No journal entries yet.</div> : (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                  <div style={{ ...card }}>
                    <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:12 }}>Recurring Themes</div>
                    {topThemes.length===0 ? <div style={{ fontSize:12, color:S.muted }}>No themes extracted yet.</div> :
                      topThemes.map(([theme, count]) => (
                        <div key={theme} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`0.5px solid ${S.border}` }}>
                          <span style={{ fontSize:12, color:S.navy, textTransform:'capitalize' }}>{theme}</span>
                          <Badge color="blue">{count}x</Badge>
                        </div>
                      ))
                    }
                  </div>
                  <div style={{ ...card }}>
                    <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:12 }}>Emotion Patterns</div>
                    {topEmotions.length===0 ? <div style={{ fontSize:12, color:S.muted }}>No emotions detected yet.</div> :
                      topEmotions.map(([emotion, count]) => {
                        const pct = Math.round(count/patientJournals.length*100);
                        return (
                          <div key={emotion} style={{ marginBottom:10 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                              <span style={{ fontSize:12, color:S.navy, textTransform:'capitalize' }}>{emotion}</span>
                              <span style={{ fontSize:11, color:S.muted }}>{pct}%</span>
                            </div>
                            <div style={{ height:5, borderRadius:3, background:S.border }}>
                              <div style={{ height:5, borderRadius:3, background:S.blue, width:pct+'%' }}/>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              )}
              {riskEntries.length > 0 && (
                <div style={{ ...card, borderColor:S.danger }}>
                  <div style={{ fontSize:12, fontWeight:700, color:S.danger, marginBottom:12 }}>Risk Entries ({riskEntries.length})</div>
                  {riskEntries.map(j => (
                    <div key={j.id} style={{ padding:'10px 0', borderBottom:`0.5px solid ${S.border}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:11, color:S.hint }}>{new Date(j.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                        <Badge color="red">Risk Detected</Badge>
                      </div>
                      <div style={{ fontSize:12, color:S.navy }}>{j.text?.slice(0,120)}...</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ ...card, marginTop:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:12 }}>Latest Entries</div>
                {patientJournals.slice(0,5).map(j => (
                  <div key={j.id} style={{ padding:'10px 0', borderBottom:`0.5px solid ${S.border}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:11, color:S.hint }}>{new Date(j.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                      {j.analysis?.emotions?.primary && <Badge color="blue">{j.analysis.emotions.primary}</Badge>}
                    </div>
                    <div style={{ fontSize:12, color:S.navy, lineHeight:1.5 }}>{j.text?.slice(0,200)}{j.text?.length>200?'...':''}</div>
                    {j.analysis?.themes?.length>0 && (
                      <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
                        {j.analysis.themes.slice(0,3).map(t=><span key={t} style={{ fontSize:10, padding:'2px 8px', borderRadius:100, background:S.lightBlue, color:S.blue }}>{t}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
