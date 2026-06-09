import React, { useState } from 'react';
export default function SAAudit({ auditLogs, S, card, Badge, KPICard }) {
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('all');
  const filtered = auditLogs.filter(l=>{
    const matchSearch = !filter || l.action?.toLowerCase().includes(filter.toLowerCase()) || l.actor_email?.includes(filter);
    const matchCat = category==='all' || l.resource_type===category;
    return matchSearch && matchCat;
  });
  const exportCSV = () => {
    const csv = ['Time,Actor,Action,Resource,ID', ...filtered.map(l=>`"${new Date(l.created_at).toISOString()}","${l.actor_email||''}","${l.action||''}","${l.resource_type||''}","${l.resource_id||''}"`)]    .join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='audit_logs.csv'; a.click();
  };
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Audit Logs ({auditLogs.length})</h2>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={exportCSV} style={{ padding:'7px 14px', background:S.lightBlue, color:S.blue, border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>Export CSV</button>
        </div>
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search action, actor..." style={{ flex:1, padding:'8px 12px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, outline:'none', background:S.bg, color:S.navy, minWidth:200 }}/>
        <select value={category} onChange={e=>setCategory(e.target.value)} style={{ padding:'8px 12px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, background:S.bg, color:S.navy, outline:'none' }}>
          <option value="all">All Categories</option>
          <option value="hospital">Hospital</option>
          <option value="subscription">Subscription</option>
          <option value="feature_flag">Feature Flag</option>
          <option value="broadcast">Communication</option>
          <option value="system">System</option>
        </select>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        {['hospital','subscription','feature_flag','broadcast'].map(cat=>(
          <div key={cat} style={{ ...card, padding:'12px 16px', cursor:'pointer' }} onClick={()=>setCategory(cat==='all'?'all':cat)}>
            <div style={{ fontSize:18, fontWeight:700, color:S.blue }}>{auditLogs.filter(l=>l.resource_type===cat).length}</div>
            <div style={{ fontSize:11, color:S.muted, textTransform:'capitalize' }}>{cat.replace('_',' ')} events</div>
          </div>
        ))}
      </div>
      <div style={{ ...card, padding:0, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:S.bg }}>{['Time','Actor','Action','Resource','ID'].map(h=><th key={h} style={{ padding:'9px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.length===0?<tr><td colSpan={5} style={{ padding:48, textAlign:'center', color:S.muted }}>No audit logs found.</td></tr>:filtered.map(log=>(
              <tr key={log.id} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{ padding:'8px 14px', fontSize:11, color:S.muted, whiteSpace:'nowrap' }}>{new Date(log.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</td>
                <td style={{ padding:'8px 14px', fontSize:12, color:S.navy }}>{log.actor_email}</td>
                <td style={{ padding:'8px 14px', fontSize:12, fontWeight:500, color:S.navy }}>{log.action}</td>
                <td style={{ padding:'8px 14px' }}>{log.resource_type&&<Badge color="blue">{log.resource_type}</Badge>}</td>
                <td style={{ padding:'8px 14px', fontSize:11, color:S.hint, fontFamily:'monospace' }}>{log.resource_id?.slice(0,8)||'—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
