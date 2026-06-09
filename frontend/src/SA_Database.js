import React from 'react';
export default function SADatabase({ hospitals, subscriptions, totalPatients, totalProfiles, totalSessions, totalEHR, totalLabOrders, auditLogs, S, card, Badge, KPICard }) {
  return (
    <div>
      <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Database Insights</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        <KPICard label="Total Tables" value="21" color={S.blue}/>
        <KPICard label="RLS Enabled" value="21/21" color={S.success}/>
        <KPICard label="Region" value="Singapore" color={S.cyan}/>
        <KPICard label="PostgreSQL" value="v15" color={S.purple}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
        {[['hospital_patients',totalPatients,'#7C3AED'],['ehr_records',totalEHR,S.blue],['sessions',totalSessions,S.success],['lab_orders',totalLabOrders,S.warning],['profiles',totalProfiles,S.cyan],['hospitals',hospitals.length,S.navy],['subscriptions',subscriptions.length,S.blue],['audit_logs',auditLogs.length,S.muted],['billing_invoices',0,S.danger],['opd_queue',0,S.blue],['ipd_admissions',0,S.success],['pharmacy_inventory',0,S.warning]].map(([table,count,color])=>(
          <div key={table} style={{ background:S.bg, borderRadius:8, padding:'12px 14px', border:`0.5px solid ${S.border}` }}>
            <div style={{ fontSize:20, fontWeight:700, color }}>{count?.toLocaleString()||0}</div>
            <div style={{ fontSize:9, color:S.muted, marginTop:3, fontFamily:'monospace' }}>{table}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ ...card }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Connection Info</div>
          {[['Host','uckgvukjdekoxfbxnqew.supabase.co'],['Region','ap-southeast-1 (Singapore)'],['Database','PostgreSQL 15'],['Pooling','PgBouncer'],['Max Connections','60 (free tier)'],['Storage Limit','500MB (free tier)'],['Realtime','Enabled'],['Auth','Supabase Auth v2']].map(([l,v])=>(
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`0.5px solid ${S.border}` }}>
              <span style={{ fontSize:12, color:S.muted }}>{l}</span>
              <span style={{ fontSize:12, fontWeight:600, color:S.navy, fontFamily:l.includes('Host')?'monospace':'inherit' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ ...card }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>RLS Policies Active</div>
          {['profiles','sessions','journal_entries','appointments','messages','hospitals','hospital_staff','opd_queue','bed_tracking','referrals','hospital_patients','ehr_records','ipd_admissions','pharmacy_inventory','lab_orders','billing_invoices','insurance_claims','bill_charges','bill_payments','bill_refunds','bill_discounts'].map((table,i)=>(
            <div key={table} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`0.5px solid ${S.border}` }}>
              <span style={{ fontSize:11, color:S.navy, fontFamily:'monospace' }}>{table}</span>
              <span style={{ fontSize:10, color:S.success, fontWeight:600 }}>✓ RLS</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
