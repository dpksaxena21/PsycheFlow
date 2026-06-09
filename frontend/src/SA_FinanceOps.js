import React, { useState } from 'react';
export default function SAFinanceOps({ subscriptions, S, card, Badge, KPICard }) {
  const [view, setView] = useState('invoices');
  const mrrTotal = subscriptions.reduce((s,sub)=>s+parseFloat(sub.monthly_cost||0),0);
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Finance Operations</h2>
        <div style={{ display:'flex', gap:8 }}>
          {['invoices','collections','gst','reports'].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'6px 14px', border:'none', borderRadius:8, fontSize:12, fontWeight:view===v?700:400, background:view===v?S.blue:'transparent', color:view===v?'#fff':S.muted, cursor:'pointer', textTransform:'capitalize' }}>{v}</button>
          ))}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        <KPICard label="MRR" value={'₹'+mrrTotal.toLocaleString()} color={S.success}/>
        <KPICard label="GST Payable" value={'₹'+(mrrTotal*0.18).toFixed(0)} color={S.warning}/>
        <KPICard label="Net Revenue" value={'₹'+(mrrTotal*0.82).toFixed(0)} color={S.blue}/>
        <KPICard label="Outstanding" value="₹0" color={S.success}/>
      </div>
      {view==='invoices' && (
        <div>
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            {['Generate Invoice','Credit Note','Debit Note','Payment Receipt'].map(action=>(
              <button key={action} style={{ padding:'8px 14px', background:S.lightBlue, color:S.blue, border:`0.5px solid ${S.border}`, borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer' }}>{action}</button>
            ))}
          </div>
          <div style={{ ...card, padding:0, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:S.bg }}>{['Hospital','Plan','Amount','GST 18%','Total','Status'].map(h=><th key={h} style={{ padding:'9px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {subscriptions.filter(s=>s.monthly_cost>0).length===0?<tr><td colSpan={6} style={{ padding:48, textAlign:'center', color:S.muted }}>No paid subscriptions yet.</td></tr>:subscriptions.filter(s=>s.monthly_cost>0).map(s=>{
                  const base = parseFloat(s.monthly_cost||0);
                  const gst = base*0.18;
                  return (
                    <tr key={s.id} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'9px 14px', fontSize:13, fontWeight:600, color:S.navy }}>{s.hospitals?.name}</td>
                      <td style={{ padding:'9px 14px' }}><Badge color={s.plan==='enterprise'?'purple':s.plan==='professional'?'blue':'green'}>{s.plan}</Badge></td>
                      <td style={{ padding:'9px 14px', fontSize:12, color:S.muted }}>₹{base.toLocaleString()}</td>
                      <td style={{ padding:'9px 14px', fontSize:12, color:S.warning }}>₹{gst.toFixed(0)}</td>
                      <td style={{ padding:'9px 14px', fontSize:13, fontWeight:700, color:S.navy }}>₹{(base+gst).toFixed(0)}</td>
                      <td style={{ padding:'9px 14px' }}><Badge color={s.status==='active'?'green':'red'}>{s.status}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {view==='gst' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="Taxable Revenue" value={'₹'+mrrTotal.toLocaleString()} color={S.blue}/>
            <KPICard label="GST @ 18%" value={'₹'+(mrrTotal*0.18).toFixed(0)} color={S.warning}/>
            <KPICard label="Total with GST" value={'₹'+(mrrTotal*1.18).toFixed(0)} color={S.success}/>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>GST Reports</div>
            {['GSTR-1 (Outward Supplies)','GSTR-3B (Monthly Summary)','GST Invoice Register','HSN Code Summary','Input Tax Credit Register'].map(report=>(
              <div key={report} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`0.5px solid ${S.border}` }}>
                <span style={{ fontSize:13, color:S.navy }}>{report}</span>
                <button style={{ fontSize:11, padding:'4px 10px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:5, cursor:'pointer' }}>Export</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {view==='collections' && (
        <div style={{ ...card, textAlign:'center', padding:48 }}>
          <div style={{ fontSize:14, fontWeight:600, color:S.navy, marginBottom:8 }}>Collections Module</div>
          <div style={{ fontSize:13, color:S.muted }}>Automated payment collection via Razorpay integration planned for Phase 2.</div>
        </div>
      )}
      {view==='reports' && (
        <div style={{ ...card }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Financial Reports</div>
          {['Monthly Revenue Report','Annual P&L Statement','Subscription Revenue by Plan','Churn Analysis Report','Customer Lifetime Value'].map(report=>(
            <div key={report} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`0.5px solid ${S.border}` }}>
              <span style={{ fontSize:13, color:S.navy }}>{report}</span>
              <button style={{ fontSize:11, padding:'4px 10px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:5, cursor:'pointer' }}>Generate</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
