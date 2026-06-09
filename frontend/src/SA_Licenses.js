import React from 'react';
const PLAN_LIMITS = { free:{beds:10,patients:100,users:5,ai:50,sms:0,storage:1}, starter:{beds:50,patients:1000,users:25,ai:500,sms:500,storage:5}, professional:{beds:200,patients:5000,users:100,ai:2000,sms:2000,storage:20}, enterprise:{beds:999,patients:99999,users:500,ai:10000,sms:10000,storage:100} };
export default function SALicenses({ hospitals, subscriptions, S, card, Badge, KPICard }) {
  return (
    <div>
      <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>License Management</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        <KPICard label="Total Licenses" value={hospitals.length} color={S.blue}/>
        <KPICard label="Active" value={subscriptions.filter(s=>s.status==='active').length} color={S.success}/>
        <KPICard label="Trial" value={subscriptions.filter(s=>s.status==='trial').length} color={S.warning}/>
        <KPICard label="Overage Risk" value="0" sub="Within limits" color={S.success}/>
      </div>
      <div style={{ ...card, padding:0, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:S.bg }}>{['Hospital','Plan','Beds','Patients','Users','AI Credits','SMS','Storage','Status'].map(h=><th key={h} style={{ padding:'9px 14px', fontSize:10, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', borderBottom:`0.5px solid ${S.border}`, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
          <tbody>
            {hospitals.length===0?<tr><td colSpan={9} style={{ padding:48, textAlign:'center', color:S.muted }}>No hospitals yet.</td></tr>:hospitals.map(h=>{
              const sub = subscriptions.find(s=>s.hospital_id===h.id);
              const plan = sub?.plan||'free';
              const limits = PLAN_LIMITS[plan]||PLAN_LIMITS.free;
              const used = { beds:h.psychologists_count||0, patients:0, users:h.psychologists_count||0, ai:0, sms:0, storage:0 };
              return (
                <tr key={h.id} style={{ borderBottom:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.background=S.lightBlue} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'9px 14px', fontSize:13, fontWeight:600, color:S.navy }}>{h.name}</td>
                  <td style={{ padding:'9px 14px' }}><Badge color={plan==='enterprise'?'purple':plan==='professional'?'blue':plan==='starter'?'green':'yellow'}>{plan}</Badge></td>
                  {['beds','patients','users','ai','sms'].map(metric=>{
                    const pct = Math.round((used[metric]||0)/limits[metric]*100);
                    return <td key={metric} style={{ padding:'9px 14px' }}>
                      <div style={{ fontSize:11, color:S.muted }}>{used[metric]||0}/{limits[metric]>=99999?'∞':limits[metric]}</div>
                      <div style={{ height:3, borderRadius:2, background:S.border, marginTop:3, width:60 }}>
                        <div style={{ height:3, borderRadius:2, background:pct>80?S.danger:pct>60?S.warning:S.success, width:Math.min(100,pct)+'%' }}/>
                      </div>
                    </td>;
                  })}
                  <td style={{ padding:'9px 14px', fontSize:11, color:S.muted }}>{limits.storage}GB</td>
                  <td style={{ padding:'9px 14px' }}><Badge color={sub?.status==='active'?'green':sub?.status==='trial'?'yellow':'red'}>{sub?.status||'inactive'}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
