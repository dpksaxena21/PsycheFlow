import React, { useState } from 'react';
import { supabase } from './supabase';
const PLANS = [
  { id:'free', label:'Free', price:0 },
  { id:'starter', label:'Starter', price:4999 },
  { id:'professional', label:'Professional', price:14999 },
  { id:'enterprise', label:'Enterprise', price:49999 },
];
export default function SAHospitals({ hospitals, subscriptions, auditLogs, totalPatients, logAction, reload, S, card, Badge, inp, KPICard }) {
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const filtered = hospitals.filter(h=>!search||h.name?.toLowerCase().includes(search.toLowerCase())||h.hospital_code?.includes(search.toUpperCase()));
  const updateSub = async (hospitalId, plan, status) => {
    const existing = subscriptions.find(s=>s.hospital_id===hospitalId);
    const planData = PLANS.find(p=>p.id===plan);
    if (existing) await supabase.from('hospital_subscriptions').update({ plan, status, monthly_cost:planData?.price||0, updated_at:new Date().toISOString() }).eq('hospital_id',hospitalId);
    else await supabase.from('hospital_subscriptions').insert({ hospital_id:hospitalId, plan, status, monthly_cost:planData?.price||0 });
    await logAction(`Updated ${hospitals.find(h=>h.id===hospitalId)?.name} → ${plan}/${status}`, 'hospital', hospitalId);
    reload();
  };
  const adoptionScore = (h) => {
    let score = 20;
    const sub = subscriptions.find(s=>s.hospital_id===h.id);
    if (sub?.status==='active') score += 30;
    if (sub?.plan==='enterprise') score += 20;
    else if (sub?.plan==='professional') score += 15;
    else if (sub?.plan==='starter') score += 10;
    if (h.psychologists_count > 5) score += 15;
    if (h.nabh_accredited) score += 15;
    return Math.min(100, score);
  };
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Hospitals ({hospitals.length})</h2>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search hospital, code, city..." style={{ ...inp, width:280 }}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        <KPICard label="Total" value={hospitals.length} color={S.blue}/>
        <KPICard label="Active" value={subscriptions.filter(s=>s.status==='active').length} color={S.success}/>
        <KPICard label="Trial" value={subscriptions.filter(s=>s.status==='trial').length} color={S.warning}/>
        <KPICard label="NABH Accredited" value={hospitals.filter(h=>h.nabh_accredited).length} color={S.cyan}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:sel?'1fr 420px':'1fr', gap:16 }}>
        <div style={{ ...card, padding:0, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:S.bg }}>{['Hospital','City','Code','NABH','Plan','Status','Adoption','Actions'].map(h=><th key={h} style={{ padding:'10px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.length===0?<tr><td colSpan={8} style={{ padding:48, textAlign:'center', color:S.muted }}>No hospitals found.</td></tr>:filtered.map(h=>{
                const sub = subscriptions.find(s=>s.hospital_id===h.id);
                const score = adoptionScore(h);
                return (
                  <tr key={h.id} style={{ borderBottom:`0.5px solid ${S.border}`, background:sel?.id===h.id?S.lightBlue:'transparent' }}
                    onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background=sel?.id===h.id?S.lightBlue:'transparent'}>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{h.name}</div>
                      <div style={{ fontSize:10, color:S.muted }}>{h.admin_name}</div>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:12, color:S.muted }}>{h.city}</td>
                    <td style={{ padding:'10px 14px', fontSize:12, fontWeight:700, color:S.blue, fontFamily:'monospace' }}>{h.hospital_code}</td>
                    <td style={{ padding:'10px 14px' }}><Badge color={h.nabh_accredited?'green':'yellow'}>{h.nabh_accredited?'NABH':'None'}</Badge></td>
                    <td style={{ padding:'10px 14px' }}><Badge color={sub?.plan==='enterprise'?'purple':sub?.plan==='professional'?'blue':sub?.plan==='starter'?'green':'yellow'}>{sub?.plan||'free'}</Badge></td>
                    <td style={{ padding:'10px 14px' }}><Badge color={sub?.status==='active'?'green':sub?.status==='trial'?'yellow':'red'}>{sub?.status||'inactive'}</Badge></td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ height:4, width:60, borderRadius:2, background:S.border }}>
                          <div style={{ height:4, borderRadius:2, background:score>=80?S.success:score>=50?S.warning:S.danger, width:score+'%' }}/>
                        </div>
                        <span style={{ fontSize:10, color:S.muted }}>{score}</span>
                      </div>
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', gap:4 }}>
                        <button onClick={()=>setSel(sel?.id===h.id?null:h)} style={{ fontSize:10, padding:'3px 8px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:5, cursor:'pointer', fontWeight:600 }}>Manage</button>
                        <button onClick={()=>updateSub(h.id, sub?.plan||'free', sub?.status==='active'?'suspended':'active')} style={{ fontSize:10, padding:'3px 8px', background:sub?.status==='active'?'#FEF2F2':'#ECFDF5', color:sub?.status==='active'?S.danger:S.success, border:'none', borderRadius:5, cursor:'pointer', fontWeight:600 }}>{sub?.status==='active'?'Suspend':'Activate'}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sel && (
          <div style={{ ...card, padding:0, overflow:'hidden', alignSelf:'start' }}>
            <div style={{ background:S.navy, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{sel.name}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', marginTop:2 }}>{sel.hospital_code} · {sel.city}</div>
              </div>
              <button onClick={()=>setSel(null)} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:6, padding:'4px 8px', fontSize:16, cursor:'pointer', color:'#fff' }}>×</button>
            </div>
            <div style={{ borderBottom:`0.5px solid ${S.border}`, display:'flex' }}>
              {['overview','subscription','contacts','usage','timeline'].map(s=>(
                <button key={s} onClick={()=>setActiveSection(s)} style={{ flex:1, padding:'10px 4px', border:'none', background:'transparent', fontSize:11, fontWeight:activeSection===s?700:400, color:activeSection===s?S.blue:S.muted, cursor:'pointer', borderBottom:activeSection===s?`2px solid ${S.blue}`:'2px solid transparent', textTransform:'capitalize' }}>{s}</button>
              ))}
            </div>
            <div style={{ padding:16, overflowY:'auto', maxHeight:'60vh' }}>
              {activeSection==='overview' && (
                <div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
                    {[['Admin',sel.admin_name],['City',sel.city],['NABH',sel.nabh_accredited?'Accredited':'Not accredited'],['Psychologists',sel.psychologists_count||0],['Code',sel.hospital_code],['Joined',new Date(sel.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})]].map(([l,v])=>(
                      <div key={l} style={{ background:S.bg, borderRadius:8, padding:'10px 12px' }}>
                        <div style={{ fontSize:9, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:2 }}>{l}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:8 }}>Adoption Score</div>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ flex:1, height:8, borderRadius:4, background:S.border }}>
                        <div style={{ height:8, borderRadius:4, background:adoptionScore(sel)>=80?S.success:adoptionScore(sel)>=50?S.warning:S.danger, width:adoptionScore(sel)+'%', transition:'width 0.3s' }}/>
                      </div>
                      <span style={{ fontSize:16, fontWeight:700, color:S.navy }}>{adoptionScore(sel)}/100</span>
                    </div>
                  </div>
                </div>
              )}
              {activeSection==='subscription' && (
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:10 }}>Plan</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
                    {PLANS.map(p=>{
                      const cur = subscriptions.find(s=>s.hospital_id===sel.id)?.plan;
                      return <button key={p.id} onClick={()=>updateSub(sel.id, p.id, 'active')} style={{ padding:'10px 12px', background:cur===p.id?S.blue:S.bg, color:cur===p.id?'#fff':S.navy, border:`0.5px solid ${cur===p.id?S.blue:S.border}`, borderRadius:8, fontSize:12, cursor:'pointer', textAlign:'left' }}>
                        <div style={{ fontWeight:700 }}>{p.label}</div>
                        <div style={{ fontSize:10, opacity:0.7, marginTop:2 }}>{p.price>0?'₹'+p.price.toLocaleString()+'/mo':'Free'}</div>
                      </button>;
                    })}
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', marginBottom:10 }}>Status</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[['active','Activate','#ECFDF5',S.success],['suspended','Suspend','#FEF2F2',S.danger],['trial','Trial','#FFFBEB',S.warning],['cancelled','Cancel','#F9FAFB',S.muted]].map(([val,label,bg,color])=>(
                      <button key={val} onClick={()=>updateSub(sel.id, subscriptions.find(s=>s.hospital_id===sel.id)?.plan||'free', val)} style={{ padding:'9px', background:bg, color, border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>{label}</button>
                    ))}
                  </div>
                </div>
              )}
              {activeSection==='contacts' && (
                <div>
                  <div style={{ fontSize:12, color:S.muted, marginBottom:12 }}>Contact management coming in next update. Store CEO, Medical Director, IT Head contacts per hospital.</div>
                  {[['CEO',''],['Medical Director',''],['Admin Head',''],['IT Head',''],['Billing Head','']].map(([role])=>(
                    <div key={role} style={{ padding:'10px 0', borderBottom:`0.5px solid ${S.border}` }}>
                      <div style={{ fontSize:11, fontWeight:600, color:S.navy }}>{role}</div>
                      <div style={{ fontSize:11, color:S.hint, marginTop:2 }}>Not configured</div>
                    </div>
                  ))}
                </div>
              )}
              {activeSection==='usage' && (
                <div>
                  {[['Patients Registered', totalPatients||0],['EHR Records','—'],['Lab Orders','—'],['Last Activity','Today']].map(([label,val])=>(
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`0.5px solid ${S.border}` }}>
                      <span style={{ fontSize:12, color:S.muted }}>{label}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:S.navy }}>{val}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeSection==='timeline' && (
                <div>
                  {[
                    { date:sel.created_at, event:'Hospital registered', type:'created' },
                    ...auditLogs.filter(l=>l.resource_id===sel.id).slice(0,10).map(l=>({ date:l.created_at, event:l.action, type:'action' }))
                  ].sort((a,b)=>new Date(b.date)-new Date(a.date)).map((item,i)=>(
                    <div key={i} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:item.type==='created'?S.success:S.blue, marginTop:4, flexShrink:0 }}/>
                      <div>
                        <div style={{ fontSize:12, color:S.navy }}>{item.event}</div>
                        <div style={{ fontSize:10, color:S.hint }}>{new Date(item.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
