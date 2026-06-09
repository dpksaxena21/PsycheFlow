import React, { useState } from 'react';
const PLANS = [
  { id:'starter', label:'Starter', price:4999, color:'#059669' },
  { id:'professional', label:'Professional', price:14999, color:'#1D4ED8' },
  { id:'enterprise', label:'Enterprise', price:49999, color:'#7C3AED' },
];
export default function SARevenue({ hospitals, subscriptions, S, card, Badge, KPICard }) {
  const [view, setView] = useState('executive');
  const mrrTotal = subscriptions.reduce((s,sub)=>s+parseFloat(sub.monthly_cost||0),0);
  const arrTotal = mrrTotal * 12;
  const activePaid = subscriptions.filter(s=>s.status==='active'&&s.monthly_cost>0);
  const arpu = activePaid.length>0?(mrrTotal/activePaid.length).toFixed(0):0;
  const churnedRev = subscriptions.filter(s=>s.status==='cancelled').reduce((s,sub)=>s+parseFloat(sub.monthly_cost||0),0);
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Revenue Dashboard</h2>
        <div style={{ display:'flex', gap:8 }}>
          {['executive','billing','gst'].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'6px 14px', border:'none', borderRadius:8, fontSize:12, fontWeight:view===v?700:400, background:view===v?S.blue:'transparent', color:view===v?'#fff':S.muted, cursor:'pointer', textTransform:'capitalize' }}>{v==='gst'?'GST Center':v}</button>
          ))}
        </div>
      </div>
      {view==='executive' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
            <KPICard label="MRR" value={'₹'+mrrTotal.toLocaleString()} sub="Monthly recurring revenue" color={S.success}/>
            <KPICard label="ARR" value={'₹'+arrTotal.toLocaleString()} sub="Annual run rate" color={S.blue}/>
            <KPICard label="ARPU" value={'₹'+arpu} sub="Per hospital/month" color={S.purple}/>
            <KPICard label="Churned MRR" value={'₹'+churnedRev.toLocaleString()} sub="Lost revenue" color={S.danger}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
            <div style={{ ...card }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Revenue by Plan</div>
              {PLANS.map(p=>{
                const count = subscriptions.filter(s=>s.plan===p.id&&s.status==='active').length;
                const rev = count * p.price;
                const pct = mrrTotal>0?Math.round(rev/mrrTotal*100):0;
                return (
                  <div key={p.id} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <div>
                        <span style={{ fontSize:13, color:S.navy, fontWeight:600 }}>{p.label}</span>
                        <span style={{ fontSize:11, color:S.muted, marginLeft:8 }}>{count} hospitals</span>
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, color:S.navy }}>₹{rev.toLocaleString()} <span style={{ fontSize:10, color:S.muted }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height:8, borderRadius:4, background:S.border }}>
                      <div style={{ height:8, borderRadius:4, background:p.color, width:pct+'%', transition:'width 0.4s' }}/>
                    </div>
                  </div>
                );
              })}
              {mrrTotal===0&&<div style={{ textAlign:'center', padding:24, color:S.muted, fontSize:13 }}>No paid subscriptions yet.</div>}
            </div>
            <div style={{ ...card }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Customer Revenue</div>
              {subscriptions.filter(s=>s.monthly_cost>0).sort((a,b)=>parseFloat(b.monthly_cost)-parseFloat(a.monthly_cost)).slice(0,8).map(s=>(
                <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{s.hospitals?.name||'Unknown'}</div>
                    <div style={{ fontSize:10, color:S.muted }}>{s.hospitals?.city}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:S.success }}>₹{parseFloat(s.monthly_cost).toLocaleString()}/mo</div>
                    <Badge color={s.plan==='enterprise'?'purple':s.plan==='professional'?'blue':'green'}>{s.plan}</Badge>
                  </div>
                </div>
              ))}
              {subscriptions.filter(s=>s.monthly_cost>0).length===0&&<div style={{ textAlign:'center', padding:24, color:S.muted, fontSize:13 }}>No paying customers yet.</div>}
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            {[
              { label:'Total Hospitals', value:hospitals.length },
              { label:'Paying Customers', value:activePaid.length },
              { label:'Free Tier', value:hospitals.length-subscriptions.length },
              { label:'Suspended', value:subscriptions.filter(s=>s.status==='suspended').length },
            ].map((k,i)=>(
              <div key={i} style={{ ...card, padding:'14px 18px' }}>
                <div style={{ fontSize:22, fontWeight:700, color:S.navy }}>{k.value}</div>
                <div style={{ fontSize:12, color:S.muted, marginTop:2 }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {view==='billing' && (
        <div>
          <div style={{ ...card, marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Billing Operations</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
              {['Generate Invoice','Credit Note','Debit Note','Payment Receipt'].map(action=>(
                <button key={action} style={{ padding:'12px', background:S.lightBlue, color:S.blue, border:`0.5px solid ${S.border}`, borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>{action}</button>
              ))}
            </div>
          </div>
          <div style={{ ...card, padding:0, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:S.bg }}>{['Hospital','Plan','Monthly','Status','Renewal'].map(h=><th key={h} style={{ padding:'9px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {subscriptions.map(s=>(
                  <tr key={s.id} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'9px 14px', fontSize:13, fontWeight:600, color:S.navy }}>{s.hospitals?.name}</td>
                    <td style={{ padding:'9px 14px' }}><Badge color={s.plan==='enterprise'?'purple':s.plan==='professional'?'blue':'green'}>{s.plan}</Badge></td>
                    <td style={{ padding:'9px 14px', fontSize:13, fontWeight:700, color:s.monthly_cost>0?S.success:S.hint }}>{s.monthly_cost>0?'₹'+parseFloat(s.monthly_cost).toLocaleString():'Free'}</td>
                    <td style={{ padding:'9px 14px' }}><Badge color={s.status==='active'?'green':s.status==='trial'?'yellow':'red'}>{s.status}</Badge></td>
                    <td style={{ padding:'9px 14px', fontSize:11, color:S.muted }}>{s.expires_at?new Date(s.expires_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {view==='gst' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="GST @ 18%" value={'₹'+(mrrTotal*0.18).toFixed(0)} sub="On MRR" color={S.warning}/>
            <KPICard label="Taxable Revenue" value={'₹'+mrrTotal.toLocaleString()} sub="Monthly" color={S.blue}/>
            <KPICard label="Total with GST" value={'₹'+(mrrTotal*1.18).toFixed(0)} sub="Monthly" color={S.success}/>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>GST Center</div>
            {['GST Reports','GST Exports','GST Reconciliation','HSN Codes','Tax Invoices'].map(item=>(
              <div key={item} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`0.5px solid ${S.border}` }}>
                <span style={{ fontSize:13, color:S.navy }}>{item}</span>
                <button style={{ fontSize:11, padding:'4px 10px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:5, cursor:'pointer' }}>Export</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
