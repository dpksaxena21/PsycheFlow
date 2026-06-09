import React, { useState } from 'react';
const PLANS = [
  { id:'free', label:'Free', price:0, beds:10, patients:100, users:5, ai_credits:50, sms:0, storage:1 },
  { id:'starter', label:'Starter', price:4999, beds:50, patients:1000, users:25, ai_credits:500, sms:500, storage:5 },
  { id:'professional', label:'Professional', price:14999, beds:200, patients:5000, users:100, ai_credits:2000, sms:2000, storage:20 },
  { id:'enterprise', label:'Enterprise', price:49999, beds:999, patients:99999, users:500, ai_credits:10000, sms:10000, storage:100 },
];
const FEATURES = [
  { name:'AI Copilot', free:false, starter:false, professional:true, enterprise:true },
  { name:'AI Scribe', free:false, starter:false, professional:false, enterprise:true },
  { name:'Telemedicine', free:false, starter:false, professional:true, enterprise:true },
  { name:'Insurance/TPA', free:false, starter:true, professional:true, enterprise:true },
  { name:'NABH Module', free:false, starter:false, professional:true, enterprise:true },
  { name:'Family Portal', free:false, starter:false, professional:false, enterprise:true },
  { name:'SMS Alerts', free:false, starter:true, professional:true, enterprise:true },
  { name:'Advanced Analytics', free:false, starter:false, professional:true, enterprise:true },
  { name:'API Access', free:false, starter:false, professional:false, enterprise:true },
  { name:'Custom Integrations', free:false, starter:false, professional:false, enterprise:true },
];
export default function SASubscriptions({ hospitals, subscriptions, S, card, Badge, KPICard }) {
  const [view, setView] = useState('overview');
  const mrrTotal = subscriptions.reduce((s,sub)=>s+parseFloat(sub.monthly_cost||0),0);
  const upcoming = subscriptions.filter(s=>s.expires_at&&new Date(s.expires_at)<new Date(Date.now()+30*24*60*60*1000)&&new Date(s.expires_at)>new Date());
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Subscription Management</h2>
        <div style={{ display:'flex', gap:8 }}>
          {['overview','plans','renewals','leakage'].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'6px 14px', border:'none', borderRadius:8, fontSize:12, fontWeight:view===v?700:400, background:view===v?S.blue:'transparent', color:view===v?'#fff':S.muted, cursor:'pointer', textTransform:'capitalize' }}>{v}</button>
          ))}
        </div>
      </div>
      {view==='overview' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            {PLANS.map(p=><KPICard key={p.id} label={p.label} value={subscriptions.filter(s=>s.plan===p.id).length+(p.id==='free'?hospitals.length-subscriptions.length:0)} sub={p.price>0?'₹'+p.price.toLocaleString()+'/mo':'No charge'} color={p.id==='enterprise'?S.purple:p.id==='professional'?S.blue:p.id==='starter'?S.success:S.muted}/>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="MRR" value={'₹'+mrrTotal.toLocaleString()} color={S.success}/>
            <KPICard label="ARR" value={'₹'+(mrrTotal*12).toLocaleString()} color={S.blue}/>
            <KPICard label="ARPU" value={subscriptions.filter(s=>s.status==='active').length>0?'₹'+(mrrTotal/subscriptions.filter(s=>s.status==='active').length).toFixed(0):'₹0'} color={S.purple}/>
          </div>
          <div style={{ ...card, padding:0, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:S.bg }}>{['Hospital','Plan','Status','Monthly','Seats','Expires'].map(h=><th key={h} style={{ padding:'9px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
              <tbody>
                {subscriptions.length===0?<tr><td colSpan={6} style={{ padding:48, textAlign:'center', color:S.muted }}>No subscriptions yet.</td></tr>:subscriptions.map(s=>(
                  <tr key={s.id} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'9px 14px', fontSize:13, fontWeight:600, color:S.navy }}>{s.hospitals?.name}</td>
                    <td style={{ padding:'9px 14px' }}><Badge color={s.plan==='enterprise'?'purple':s.plan==='professional'?'blue':s.plan==='starter'?'green':'yellow'}>{s.plan}</Badge></td>
                    <td style={{ padding:'9px 14px' }}><Badge color={s.status==='active'?'green':s.status==='trial'?'yellow':'red'}>{s.status}</Badge></td>
                    <td style={{ padding:'9px 14px', fontSize:13, fontWeight:700, color:s.monthly_cost>0?S.success:S.hint }}>{s.monthly_cost>0?'₹'+parseFloat(s.monthly_cost).toLocaleString():'Free'}</td>
                    <td style={{ padding:'9px 14px', fontSize:12, color:S.navy }}>{s.seats||10}</td>
                    <td style={{ padding:'9px 14px', fontSize:11, color:S.muted }}>{s.expires_at?new Date(s.expires_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'No expiry'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {view==='plans' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
            {PLANS.map(p=>(
              <div key={p.id} style={{ ...card, borderTop:`3px solid ${p.id==='enterprise'?S.purple:p.id==='professional'?S.blue:p.id==='starter'?S.success:S.muted}` }}>
                <div style={{ fontSize:16, fontWeight:700, color:S.navy, marginBottom:4 }}>{p.label}</div>
                <div style={{ fontSize:22, fontWeight:700, color:p.id==='enterprise'?S.purple:p.id==='professional'?S.blue:p.id==='starter'?S.success:S.muted, marginBottom:12 }}>{p.price>0?'₹'+p.price.toLocaleString():' Free'}<span style={{ fontSize:11, fontWeight:400, color:S.muted }}>{p.price>0?'/mo':''}</span></div>
                {[['Beds',p.beds==='999'?'Unlimited':p.beds],['Patients',p.patients>=99999?'Unlimited':p.patients.toLocaleString()],['Users',p.users>=500?'Unlimited':p.users],['AI Credits',p.ai_credits>=10000?'Unlimited':p.ai_credits],['SMS Credits',p.sms||'None'],['Storage',p.storage+'GB']].map(([label,val])=>(
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:12 }}>
                    <span style={{ color:S.muted }}>{label}</span><span style={{ fontWeight:600, color:S.navy }}>{val}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ ...card, overflow:'hidden', padding:0 }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:S.bg }}>
                <th style={{ padding:'10px 14px', fontSize:11, fontWeight:700, color:S.muted, textAlign:'left', borderBottom:`0.5px solid ${S.border}` }}>Feature</th>
                {PLANS.map(p=><th key={p.id} style={{ padding:'10px 14px', fontSize:11, fontWeight:700, color:S.muted, textAlign:'center', borderBottom:`0.5px solid ${S.border}` }}>{p.label}</th>)}
              </tr></thead>
              <tbody>
                {FEATURES.map(f=>(
                  <tr key={f.name} style={{ borderBottom:`0.5px solid ${S.border}` }}>
                    <td style={{ padding:'9px 14px', fontSize:12, color:S.navy }}>{f.name}</td>
                    {PLANS.map(p=><td key={p.id} style={{ padding:'9px 14px', textAlign:'center' }}>
                      {f[p.id]?<span style={{ color:S.success, fontSize:14 }}>✓</span>:<span style={{ color:S.border, fontSize:14 }}>—</span>}
                    </td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {view==='renewals' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="Next 7 Days" value={subscriptions.filter(s=>s.expires_at&&new Date(s.expires_at)<new Date(Date.now()+7*24*60*60*1000)&&new Date(s.expires_at)>new Date()).length} color={S.danger}/>
            <KPICard label="Next 30 Days" value={upcoming.length} color={S.warning}/>
            <KPICard label="Next 90 Days" value={subscriptions.filter(s=>s.expires_at&&new Date(s.expires_at)<new Date(Date.now()+90*24*60*60*1000)&&new Date(s.expires_at)>new Date()).length} color={S.blue}/>
          </div>
          <div style={{ ...card, textAlign:'center', padding:48, color:S.muted, fontSize:13 }}>{upcoming.length===0?'No renewals due in next 30 days.':'Renewal tracking active.'}</div>
        </div>
      )}
      {view==='leakage' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="Expired Accounts" value={subscriptions.filter(s=>s.status==='cancelled').length} color={S.danger}/>
            <KPICard label="Unpaid/Inactive" value={hospitals.length-subscriptions.filter(s=>s.status==='active').length} color={S.warning}/>
            <KPICard label="Trials Ending" value={subscriptions.filter(s=>s.status==='trial').length} color={S.blue}/>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Revenue at Risk</div>
            {hospitals.filter(h=>!subscriptions.find(s=>s.hospital_id===h.id&&s.status==='active')).map(h=>(
              <div key={h.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', borderBottom:`0.5px solid ${S.border}` }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{h.name}</div>
                  <div style={{ fontSize:10, color:S.muted }}>{h.city} · {h.hospital_code}</div>
                </div>
                <Badge color="red">No Active Plan</Badge>
              </div>
            ))}
            {hospitals.filter(h=>!subscriptions.find(s=>s.hospital_id===h.id&&s.status==='active')).length===0&&<div style={{ textAlign:'center', padding:24, color:S.muted, fontSize:13 }}>All hospitals have active plans.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
