import React, { useState } from 'react';
export default function SASupport({ hospitals, subscriptions, S, card, Badge, KPICard }) {
  const [tickets, setTickets] = useState([
    { id:1, hospital:'Apollo Hospital', issue:'Billing tab not loading after latest update', priority:'high', status:'open', created:'2026-06-09', sla:'2h' },
    { id:2, hospital:'Fortis Healthcare', issue:'Lab Kanban cards not dragging on mobile', priority:'medium', status:'in_progress', created:'2026-06-08', sla:'8h' },
    { id:3, hospital:'Max Healthcare', issue:'SMS OTP not delivering for new staff', priority:'low', status:'resolved', created:'2026-06-07', sla:'24h' },
  ]);
  const [form, setForm] = useState({ hospital:'', issue:'', priority:'medium' });
  const [sel, setSel] = useState(null);
  const avgResolution = '4.2h';
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Support Center</h2>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        <KPICard label="Open" value={tickets.filter(t=>t.status==='open').length} color={S.danger}/>
        <KPICard label="In Progress" value={tickets.filter(t=>t.status==='in_progress').length} color={S.warning}/>
        <KPICard label="Resolved" value={tickets.filter(t=>t.status==='resolved').length} color={S.success}/>
        <KPICard label="Avg Resolution" value={avgResolution} sub="SLA performance" color={S.blue}/>
      </div>
      <div style={{ ...card, marginBottom:16, borderColor:S.blue }}>
        <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Log New Ticket</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          <div>
            <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>Hospital</div>
            <select value={form.hospital} onChange={e=>setForm({...form,hospital:e.target.value})} style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:12, background:S.bg, color:S.navy, outline:'none' }}>
              <option value="">Select hospital</option>
              {hospitals.map(h=><option key={h.id} value={h.name}>{h.name}</option>)}
              <option value="Platform">Platform Issue</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>Issue</div>
            <input value={form.issue} onChange={e=>setForm({...form,issue:e.target.value})} placeholder="Describe the issue..." style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:12, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/>
          </div>
          <div>
            <div style={{ fontSize:10, color:S.muted, marginBottom:3 }}>Priority</div>
            <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:12, background:S.bg, color:S.navy, outline:'none' }}>
              {['high','medium','low'].map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <button onClick={()=>{ if(!form.hospital||!form.issue) return; setTickets(t=>[{id:Date.now(),hospital:form.hospital,issue:form.issue,priority:form.priority,status:'open',created:new Date().toISOString().slice(0,10),sla:form.priority==='high'?'2h':form.priority==='medium'?'8h':'24h'},...t]); setForm({hospital:'',issue:'',priority:'medium'}); }}
          style={{ marginTop:10, padding:'8px 18px', background:S.blue, color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer' }}>Log Ticket</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:sel?'1fr 380px':'1fr', gap:16 }}>
        <div style={{ ...card, padding:0, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:S.bg }}>{['#','Hospital','Issue','Priority','Status','SLA','Date','Actions'].map(h=><th key={h} style={{ padding:'9px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
            <tbody>
              {tickets.map(t=>(
                <tr key={t.id} style={{ borderBottom:`0.5px solid ${S.border}`, background:sel?.id===t.id?S.lightBlue:'transparent' }}
                  onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background=sel?.id===t.id?S.lightBlue:'transparent'}>
                  <td style={{ padding:'9px 14px', fontSize:11, color:S.hint, fontFamily:'monospace' }}>#{t.id}</td>
                  <td style={{ padding:'9px 14px', fontSize:12, fontWeight:600, color:S.navy }}>{t.hospital}</td>
                  <td style={{ padding:'9px 14px', fontSize:12, color:S.muted, maxWidth:200 }}><div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.issue}</div></td>
                  <td style={{ padding:'9px 14px' }}><Badge color={t.priority==='high'?'red':t.priority==='medium'?'yellow':'green'}>{t.priority}</Badge></td>
                  <td style={{ padding:'9px 14px' }}><Badge color={t.status==='open'?'red':t.status==='in_progress'?'yellow':'green'}>{t.status.replace('_',' ')}</Badge></td>
                  <td style={{ padding:'9px 14px', fontSize:11, color:S.muted }}>{t.sla}</td>
                  <td style={{ padding:'9px 14px', fontSize:11, color:S.muted }}>{t.created}</td>
                  <td style={{ padding:'9px 14px' }}>
                    <div style={{ display:'flex', gap:4 }}>
                      <button onClick={()=>setSel(sel?.id===t.id?null:t)} style={{ fontSize:10, padding:'3px 7px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:4, cursor:'pointer' }}>View</button>
                      {t.status==='open'&&<button onClick={()=>setTickets(ts=>ts.map(x=>x.id===t.id?{...x,status:'in_progress'}:x))} style={{ fontSize:10, padding:'3px 7px', background:'#FFFBEB', color:S.warning, border:'none', borderRadius:4, cursor:'pointer' }}>Start</button>}
                      {t.status!=='resolved'&&<button onClick={()=>setTickets(ts=>ts.map(x=>x.id===t.id?{...x,status:'resolved'}:x))} style={{ fontSize:10, padding:'3px 7px', background:'#ECFDF5', color:S.success, border:'none', borderRadius:4, cursor:'pointer' }}>Resolve</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sel && (
          <div style={{ ...card, alignSelf:'start' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:S.navy }}>Ticket #{sel.id}</div>
              <button onClick={()=>setSel(null)} style={{ background:'none', border:'none', cursor:'pointer', color:S.muted, fontSize:16 }}>×</button>
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, marginBottom:4 }}>HOSPITAL</div>
              <div style={{ fontSize:13, color:S.navy }}>{sel.hospital}</div>
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, marginBottom:4 }}>ISSUE</div>
              <div style={{ fontSize:13, color:S.navy }}>{sel.issue}</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
              <div style={{ background:S.bg, borderRadius:7, padding:'8px 10px' }}>
                <div style={{ fontSize:9, color:S.muted, marginBottom:2 }}>PRIORITY</div>
                <Badge color={sel.priority==='high'?'red':sel.priority==='medium'?'yellow':'green'}>{sel.priority}</Badge>
              </div>
              <div style={{ background:S.bg, borderRadius:7, padding:'8px 10px' }}>
                <div style={{ fontSize:9, color:S.muted, marginBottom:2 }}>SLA</div>
                <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{sel.sla}</div>
              </div>
            </div>
            {(() => {
              const sub = subscriptions.find(s=>s.hospitals?.name===sel.hospital);
              return sub ? (
                <div style={{ background:'#EFF6FF', border:`1px solid #BFDBFE`, borderRadius:8, padding:'10px 12px', marginBottom:12 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:S.blue, marginBottom:4 }}>CUSTOMER HEALTH</div>
                  <div style={{ fontSize:12, color:S.navy }}>Plan: {sub.plan} · Status: {sub.status}</div>
                  <div style={{ fontSize:11, color:S.muted }}>₹{parseFloat(sub.monthly_cost||0).toLocaleString()}/mo</div>
                </div>
              ) : null;
            })()}
            <div style={{ display:'flex', gap:8 }}>
              {sel.status!=='resolved'&&<button onClick={()=>{ setTickets(ts=>ts.map(x=>x.id===sel.id?{...x,status:'resolved'}:x)); setSel({...sel,status:'resolved'}); }} style={{ flex:1, padding:'8px', background:'#ECFDF5', color:S.success, border:'none', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer' }}>Mark Resolved</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
