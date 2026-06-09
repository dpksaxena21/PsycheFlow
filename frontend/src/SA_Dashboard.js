import React from 'react';
export default function SADashboard({ hospitals, subscriptions, auditLogs, totalPatients, totalProfiles, totalSessions, totalEHR, totalLabOrders, systemStatus, setTab, S, card, Badge, KPICard }) {
  const mrrTotal = subscriptions.reduce((s,sub)=>s+parseFloat(sub.monthly_cost||0),0);
  const activeHospitals = subscriptions.filter(s=>s.status==='active').length;
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:S.navy }}>Command Center</h1>
        <div style={{ fontSize:12, color:S.muted, marginTop:3 }}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:14 }}>
        <KPICard label="Active Hospitals" value={activeHospitals} sub={`${hospitals.length} total registered`} color={S.blue} onClick={()=>setTab('hospitals')}/>
        <KPICard label="Platform Patients" value={totalPatients.toLocaleString()} sub="Hospital registry" color={S.purple} onClick={()=>setTab('analytics')}/>
        <KPICard label="User Profiles" value={totalProfiles.toLocaleString()} sub="Patients + psychologists" color={S.success} onClick={()=>setTab('users')}/>
        <KPICard label="AI Sessions" value={totalSessions.toLocaleString()} sub="Assessments completed" color={S.warning} onClick={()=>setTab('ai_monitor')}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        <KPICard label="MRR" value={'₹'+mrrTotal.toLocaleString()} sub="Monthly recurring" color={S.success} onClick={()=>setTab('revenue')}/>
        <KPICard label="ARR" value={'₹'+(mrrTotal*12).toLocaleString()} sub="Annual run rate" color={S.blue} onClick={()=>setTab('revenue')}/>
        <KPICard label="EHR Records" value={totalEHR.toLocaleString()} sub="Clinical records" color={S.cyan} onClick={()=>setTab('analytics')}/>
        <KPICard label="Lab Orders" value={totalLabOrders.toLocaleString()} sub="Total lab tests" color={S.purple} onClick={()=>setTab('analytics')}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:16 }}>
        <div style={{ ...card }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Recent Hospitals</div>
          {hospitals.slice(0,6).map(h=>{
            const sub = subscriptions.find(s=>s.hospital_id===h.id);
            return (
              <div key={h.id} onClick={()=>setTab('hospitals')} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', borderBottom:`0.5px solid ${S.border}`, cursor:'pointer' }}
                onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ width:32,height:32,borderRadius:8,background:S.lightBlue,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:S.blue,flexShrink:0 }}>{h.name?.charAt(0)}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{h.name}</div>
                  <div style={{ fontSize:10, color:S.muted }}>{h.city} · {h.hospital_code}</div>
                </div>
                <Badge color={sub?.status==='active'?'green':sub?.status==='trial'?'yellow':'red'}>{sub?.plan||'free'}</Badge>
              </div>
            );
          })}
          {hospitals.length===0&&<div style={{ textAlign:'center',padding:24,color:S.muted,fontSize:13 }}>No hospitals yet.</div>}
        </div>
        <div style={{ ...card }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>System Health</div>
          {[['Railway Backend',systemStatus.railway],['Supabase DB',systemStatus.supabase],['Vercel Frontend','healthy'],['MSG91 SMS','healthy'],['Anthropic API','healthy']].map(([name,status])=>(
            <div key={name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
              <span style={{ fontSize:12, color:S.navy }}>{name}</span>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:6,height:6,borderRadius:'50%',background:status==='healthy'?'#22c55e':status==='checking'?S.warning:'#ef4444' }}/>
                <span style={{ fontSize:11, color:status==='healthy'?S.success:status==='checking'?S.warning:S.danger, fontWeight:500, textTransform:'capitalize' }}>{status}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...card }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Recent Audit</div>
          {auditLogs.slice(0,6).map(log=>(
            <div key={log.id} style={{ padding:'7px 0', borderBottom:`0.5px solid ${S.border}` }}>
              <div style={{ fontSize:11, color:S.navy, fontWeight:500 }}>{log.action?.slice(0,35)}</div>
              <div style={{ fontSize:9, color:S.hint, marginTop:1 }}>{new Date(log.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
            </div>
          ))}
          {auditLogs.length===0&&<div style={{ textAlign:'center',padding:16,color:S.muted,fontSize:12 }}>No logs yet.</div>}
        </div>
      </div>
    </div>
  );
}
