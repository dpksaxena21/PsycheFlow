import React from 'react';
export default function SAUsers({ totalPatients, totalProfiles, totalSessions, S, card, Badge, KPICard }) {
  return (
    <div>
      <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>User Management</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        <KPICard label="Total Profiles" value={totalProfiles?.toLocaleString()||0} color={S.blue}/>
        <KPICard label="Hospital Patients" value={totalPatients?.toLocaleString()||0} color={S.purple}/>
        <KPICard label="AI Sessions" value={totalSessions?.toLocaleString()||0} color={S.success}/>
        <KPICard label="Active Today" value="—" sub="Requires session tracking" color={S.warning}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div style={{ ...card }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>User Types</div>
          {[['Patients (Platform)',totalProfiles],['Hospital Patients',totalPatients],['Psychologists','—'],['Hospital Admins','—'],['Super Admins',1]].map(([type,count])=>(
            <div key={type} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
              <span style={{ fontSize:12, color:S.navy }}>{type}</span>
              <span style={{ fontSize:12, fontWeight:600, color:S.blue }}>{typeof count==='number'?count.toLocaleString():count}</span>
            </div>
          ))}
        </div>
        <div style={{ ...card }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Admin Actions</div>
          <div style={{ fontSize:12, color:S.muted, marginBottom:16 }}>Individual user operations are performed via Supabase Auth for security.</div>
          {[['Reset Password','Supabase Auth'],['Disable User','Supabase Auth'],['View Activity','Audit Logs'],['Impersonate','Enterprise Feature']].map(([action,where])=>(
            <div key={action} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:`0.5px solid ${S.border}` }}>
              <span style={{ fontSize:12, color:S.navy }}>{action}</span>
              <span style={{ fontSize:11, color:S.muted }}>{where}</span>
            </div>
          ))}
          <a href="https://supabase.com/dashboard/project/uckgvukjdekoxfbxnqew/auth/users" target="_blank" rel="noreferrer" style={{ display:'block', marginTop:12, padding:'9px 14px', background:S.lightBlue, color:S.blue, borderRadius:7, fontSize:12, fontWeight:600, textAlign:'center', textDecoration:'none' }}>Open Supabase Auth →</a>
        </div>
      </div>
    </div>
  );
}
