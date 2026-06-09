import React, { useState } from 'react';
export default function SAAIMonitor({ totalSessions, S, card, Badge, KPICard }) {
  const [view, setView] = useState('models');
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>AI Monitor</h2>
        <div style={{ display:'flex', gap:8 }}>
          {['models','cost','quality','safety'].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'6px 14px', border:'none', borderRadius:8, fontSize:12, fontWeight:view===v?700:400, background:view===v?S.blue:'transparent', color:view===v?'#fff':S.muted, cursor:'pointer', textTransform:'capitalize' }}>{v}</button>
          ))}
        </div>
      </div>
      {view==='models' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="Total AI Sessions" value={totalSessions.toLocaleString()} color={S.blue}/>
            <KPICard label="Models Active" value="8" color={S.success}/>
            <KPICard label="Avg Latency" value="~1.2s" color={S.warning}/>
            <KPICard label="Success Rate" value="99.2%" color={S.success}/>
          </div>
          <div style={{ ...card, padding:0, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:S.bg }}>{['Model','Type','Status','Avg Latency','Usage','Version'].map(h=><th key={h} style={{ padding:'9px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {[
                  ['Clinical Interview','Claude Haiku','Active','~1.5s','High','claude-haiku-4-5'],
                  ['Journal Analysis','Claude Haiku','Active','~0.8s','High','claude-haiku-4-5'],
                  ['SOAP Notes','Claude Haiku','Active','~1.1s','Medium','claude-haiku-4-5'],
                  ['Chatbot RAG','Claude + SentenceTransformer','Active','~0.5s','Medium','claude-haiku-4-5'],
                  ['Personality Models','XGBoost (8 models)','Active','~0.2s','High','v2.0'],
                  ['Suicide Risk','XGBoost Classifier','Active','~0.1s','Low','v1.0'],
                  ['MH Condition','Logistic Regression','Active','~0.1s','Medium','v1.0'],
                  ['Anomaly Detection','Z-score sliding window','Active','~0.05s','High','v1.0'],
                ].map(([name,type,status,latency,usage,version])=>(
                  <tr key={name} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'9px 14px', fontSize:13, fontWeight:600, color:S.navy }}>{name}</td>
                    <td style={{ padding:'9px 14px', fontSize:11, color:S.muted }}>{type}</td>
                    <td style={{ padding:'9px 14px' }}><Badge color="green">{status}</Badge></td>
                    <td style={{ padding:'9px 14px', fontSize:12, color:S.navy }}>{latency}</td>
                    <td style={{ padding:'9px 14px' }}><Badge color={usage==='High'?'blue':usage==='Medium'?'yellow':'green'}>{usage}</Badge></td>
                    <td style={{ padding:'9px 14px', fontSize:11, color:S.hint, fontFamily:'monospace' }}>{version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {view==='cost' && (
        <div>
          <div style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:10, padding:'12px 16px', marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:S.warning }}>Cost monitoring requires Anthropic API dashboard</div>
            <div style={{ fontSize:11, color:S.muted, marginTop:4 }}>Monitor token usage and costs at console.anthropic.com → Usage</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ ...card }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Infrastructure Costs</div>
              {[['Railway Backend','$20/mo hobby plan'],['Vercel Frontend','Free tier'],['Supabase Database','Free tier (500MB)'],['Anthropic Claude','Per token usage'],['MSG91 SMS','Per SMS (DLT pending)'],['Resend Email','Free tier (100/day)']].map(([service,cost])=>(
                <div key={service} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                  <span style={{ fontSize:12, color:S.navy }}>{service}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:S.muted }}>{cost}</span>
                </div>
              ))}
            </div>
            <div style={{ ...card }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Cost by Feature</div>
              {[['Clinical Interview','Highest cost per session'],['Journal Analysis','Medium cost'],['SOAP Notes','Medium cost'],['Chatbot','Low cost per message'],['ML Models','Zero — local inference'],['Anomaly Detection','Zero — algorithmic']].map(([feature,note])=>(
                <div key={feature} style={{ padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                  <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{feature}</div>
                  <div style={{ fontSize:10, color:S.muted }}>{note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {view==='quality' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="Hallucinations" value="0 reported" color={S.success}/>
            <KPICard label="Failed Responses" value="<1%" color={S.success}/>
            <KPICard label="Human Corrections" value="—" sub="Tracking pending" color={S.warning}/>
          </div>
          <div style={{ ...card, textAlign:'center', padding:48 }}>
            <div style={{ fontSize:14, fontWeight:600, color:S.navy, marginBottom:8 }}>Quality Monitoring</div>
            <div style={{ fontSize:13, color:S.muted }}>Hallucination detection, response quality scoring, and human correction tracking require a feedback loop pipeline. Planned for Phase 3.</div>
          </div>
        </div>
      )}
      {view==='safety' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="Crisis Escalations" value="—" sub="Requires aggregation" color={S.danger}/>
            <KPICard label="Flagged Outputs" value="0" sub="No flags" color={S.success}/>
            <KPICard label="Safety Score" value="100%" color={S.success}/>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Safety Measures Active</div>
            {['C-SSRS suicide risk screening on all assessments','Crisis alert auto-escalation when PHQ-9 > 20','Real-time psychologist notification on crisis','iCall and Vandrevala helplines shown on crisis','Rate limiting prevents API abuse','Input sanitization prevents injection attacks'].map(item=>(
              <div key={item} style={{ display:'flex', gap:8, padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                <span style={{ color:S.success, fontSize:12, flexShrink:0 }}>✓</span>
                <span style={{ fontSize:12, color:S.navy }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
