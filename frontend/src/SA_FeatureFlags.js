import React, { useState } from 'react';
const GLOBAL_FLAGS = [
  { id:'telemedicine', label:'Telemedicine', desc:'WebRTC video consultations', enabled:false, rollout:0 },
  { id:'ai_copilot', label:'AI Copilot', desc:'Natural language hospital queries', enabled:true, rollout:100 },
  { id:'ai_scribe', label:'AI Scribe', desc:'Voice-to-notes generation', enabled:false, rollout:0 },
  { id:'insurance_tpa', label:'Insurance/TPA', desc:'Insurance claim management', enabled:true, rollout:100 },
  { id:'nabh_module', label:'NABH Module', desc:'Quality & compliance tracking', enabled:false, rollout:0 },
  { id:'family_portal', label:'Family Portal', desc:'Controlled family access', enabled:false, rollout:0 },
  { id:'sms_alerts', label:'SMS Alerts', desc:'MSG91 SMS notifications', enabled:true, rollout:100 },
  { id:'advanced_analytics', label:'Advanced Analytics', desc:'BI dashboards & reports', enabled:true, rollout:100 },
  { id:'cross_referrals', label:'Cross Referrals', desc:'Hospital→psychologist referrals', enabled:true, rollout:100 },
  { id:'discharge_checklist', label:'Discharge Checklist', desc:'Multi-step discharge workflow', enabled:false, rollout:0 },
  { id:'nursing_module', label:'Nursing Module', desc:'Medication & shift handover', enabled:false, rollout:10 },
  { id:'clinical_orders', label:'Clinical Orders', desc:'Doctor→lab/pharmacy routing', enabled:false, rollout:0 },
];
export default function SAFeatureFlags({ hospitals, S, card, Badge, KPICard }) {
  const [flags, setFlags] = useState(GLOBAL_FLAGS);
  const [view, setView] = useState('global');
  const toggle = (id) => setFlags(f=>f.map(x=>x.id===id?{...x,enabled:!x.enabled,rollout:!x.enabled?100:0}:x));
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Feature Flags</h2>
        <div style={{ display:'flex', gap:8 }}>
          {['global','hospital','beta'].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'6px 14px', border:'none', borderRadius:8, fontSize:12, fontWeight:view===v?700:400, background:view===v?S.blue:'transparent', color:view===v?'#fff':S.muted, cursor:'pointer', textTransform:'capitalize' }}>{v}</button>
          ))}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        <KPICard label="Total Flags" value={flags.length} color={S.blue}/>
        <KPICard label="Enabled" value={flags.filter(f=>f.enabled).length} color={S.success}/>
        <KPICard label="Disabled" value={flags.filter(f=>!f.enabled).length} color={S.warning}/>
        <KPICard label="Partial Rollout" value={flags.filter(f=>f.rollout>0&&f.rollout<100).length} color={S.cyan}/>
      </div>
      {view==='global' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
          {flags.map(flag=>(
            <div key={flag.id} style={{ ...card, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ flex:1, marginRight:12 }}>
                <div style={{ fontSize:14, fontWeight:600, color:S.navy }}>{flag.label}</div>
                <div style={{ fontSize:11, color:S.muted, marginTop:3 }}>{flag.desc}</div>
                <div style={{ display:'flex', gap:8, marginTop:6 }}>
                  <Badge color={flag.enabled?'green':'yellow'}>{flag.enabled?'Enabled':'Disabled'}</Badge>
                  {flag.rollout>0&&flag.rollout<100&&<Badge color="cyan">{flag.rollout}% rollout</Badge>}
                </div>
              </div>
              <div onClick={()=>toggle(flag.id)} style={{ width:48, height:26, borderRadius:13, background:flag.enabled?S.blue:'#e2e8f0', cursor:'pointer', position:'relative', transition:'all 0.2s', flexShrink:0 }}>
                <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:flag.enabled?25:3, transition:'all 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
              </div>
            </div>
          ))}
        </div>
      )}
      {view==='hospital' && (
        <div>
          <div style={{ fontSize:12, color:S.muted, marginBottom:16 }}>Enable or disable features per hospital. Click a hospital to manage its feature set.</div>
          <div style={{ display:'grid', gap:10 }}>
            {hospitals.map(h=>(
              <div key={h.id} style={{ ...card, padding:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{h.name}</div>
                    <div style={{ fontSize:10, color:S.muted }}>{h.city} · {h.hospital_code}</div>
                  </div>
                  <Badge color="blue">Inherits global flags</Badge>
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {flags.filter(f=>f.enabled).map(f=><Badge key={f.id} color="green">{f.label}</Badge>)}
                </div>
              </div>
            ))}
            {hospitals.length===0&&<div style={{ ...card, textAlign:'center', padding:40, color:S.muted }}>No hospitals registered.</div>}
          </div>
        </div>
      )}
      {view==='beta' && (
        <div>
          <div style={{ fontSize:12, color:S.muted, marginBottom:16 }}>Beta features are enabled for specific hospitals before global rollout.</div>
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Beta Program</div>
            {flags.filter(f=>!f.enabled||f.rollout<100).map(f=>(
              <div key={f.id} style={{ padding:'10px 0', borderBottom:`0.5px solid ${S.border}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{f.label}</div>
                    <div style={{ fontSize:11, color:S.muted }}>{f.desc}</div>
                  </div>
                  <Badge color="yellow">Beta</Badge>
                </div>
                <div style={{ fontSize:11, color:S.muted }}>0 of {hospitals.length} hospitals enrolled</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
