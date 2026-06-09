import React, { useState } from 'react';
const PROMPTS = [
  { id:1, name:'Clinical Interview System Prompt', model:'claude-haiku', version:'v3.2', owner:'Deepak Saxena', status:'active', created:'2026-06-01' },
  { id:2, name:'Journal Analysis Prompt', model:'claude-haiku', version:'v2.1', owner:'Deepak Saxena', status:'active', created:'2026-05-15' },
  { id:3, name:'SOAP Notes Generation', model:'claude-haiku', version:'v1.8', owner:'Deepak Saxena', status:'active', created:'2026-05-10' },
  { id:4, name:'Crisis Detection System', model:'claude-haiku', version:'v2.0', owner:'Deepak Saxena', status:'active', created:'2026-04-20' },
  { id:5, name:'Pre-Session Brief', model:'claude-haiku', version:'v1.5', owner:'Deepak Saxena', status:'active', created:'2026-04-15' },
];
export default function SAAIGovernance({ S, card, Badge, KPICard }) {
  const [view, setView] = useState('prompts');
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>AI Governance</h2>
        <div style={{ display:'flex', gap:8 }}>
          {['prompts','safety','models','policies'].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'6px 14px', border:'none', borderRadius:8, fontSize:12, fontWeight:view===v?700:400, background:view===v?S.blue:'transparent', color:view===v?'#fff':S.muted, cursor:'pointer', textTransform:'capitalize' }}>{v}</button>
          ))}
        </div>
      </div>
      {view==='prompts' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="Total Prompts" value={PROMPTS.length} color={S.blue}/>
            <KPICard label="Active" value={PROMPTS.filter(p=>p.status==='active').length} color={S.success}/>
            <KPICard label="Models" value="2" sub="Claude Haiku + XGBoost" color={S.purple}/>
            <KPICard label="Last Review" value="Today" color={S.cyan}/>
          </div>
          <div style={{ ...card, padding:0, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:S.bg }}>{['Prompt Name','Model','Version','Owner','Status','Created','Actions'].map(h=><th key={h} style={{ padding:'9px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
              <tbody>
                {PROMPTS.map(p=>(
                  <tr key={p.id} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'9px 14px', fontSize:13, fontWeight:600, color:S.navy }}>{p.name}</td>
                    <td style={{ padding:'9px 14px', fontSize:11, color:S.muted, fontFamily:'monospace' }}>{p.model}</td>
                    <td style={{ padding:'9px 14px' }}><Badge color="blue">{p.version}</Badge></td>
                    <td style={{ padding:'9px 14px', fontSize:12, color:S.muted }}>{p.owner}</td>
                    <td style={{ padding:'9px 14px' }}><Badge color="green">{p.status}</Badge></td>
                    <td style={{ padding:'9px 14px', fontSize:11, color:S.muted }}>{p.created}</td>
                    <td style={{ padding:'9px 14px' }}><button style={{ fontSize:10, padding:'3px 8px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:5, cursor:'pointer' }}>Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {view==='safety' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="Crisis Escalations" value="—" sub="Requires pipeline" color={S.danger}/>
            <KPICard label="Flagged Outputs" value="0" color={S.success}/>
            <KPICard label="Human Review Queue" value="0" sub="All clear" color={S.success}/>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Safety Policies</div>
            {[
              ['Suicide risk screening','C-SSRS on all assessments','Active'],
              ['Crisis auto-escalation','PHQ-9 > 20 triggers alert','Active'],
              ['Psychologist notification','Real-time Supabase Realtime','Active'],
              ['Hallucination detection','Manual review process','Planned'],
              ['Output filtering','Harmful content prevention','Active'],
              ['Audit trail','All AI interactions logged','Planned'],
            ].map(([policy,detail,status])=>(
              <div key={policy} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:`0.5px solid ${S.border}` }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{policy}</div>
                  <div style={{ fontSize:10, color:S.muted }}>{detail}</div>
                </div>
                <Badge color={status==='Active'?'green':status==='Planned'?'yellow':'red'}>{status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      {view==='models' && (
        <div style={{ ...card }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Approved Models</div>
          {[['Claude Haiku','claude-haiku-4-5-20251001','Approved','Anthropic'],['XGBoost 2.0.3','Local inference','Approved','Open Source'],['SentenceTransformer','all-MiniLM-L6-v2','Approved','HuggingFace'],['Scikit-learn','1.6.1','Approved','Open Source']].map(([name,version,status,provider])=>(
            <div key={name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:`0.5px solid ${S.border}` }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{name}</div>
                <div style={{ fontSize:10, color:S.muted }}>{version} · {provider}</div>
              </div>
              <Badge color="green">{status}</Badge>
            </div>
          ))}
        </div>
      )}
      {view==='policies' && (
        <div style={{ ...card }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>AI Usage Policies</div>
          {['AI outputs are advisory only — not medical diagnosis','Clinical decisions require licensed professional review','Patient data used only for direct care, not model training','AI responses include confidence scores and limitations','Crisis AI outputs always escalate to human review','No patient PII sent to third-party AI providers without consent'].map((policy,i)=>(
            <div key={i} style={{ display:'flex', gap:10, padding:'9px 0', borderBottom:`0.5px solid ${S.border}` }}>
              <span style={{ color:S.success, fontSize:12, flexShrink:0 }}>✓</span>
              <span style={{ fontSize:12, color:S.navy }}>{policy}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
