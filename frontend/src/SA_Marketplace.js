import React from 'react';
const INTEGRATIONS = [
  { name:'MSG91', category:'SMS', status:'connected', detail:'DLT registration pending', icon:'📱' },
  { name:'Resend', category:'Email', status:'connected', detail:'Transactional emails active', icon:'📧' },
  { name:'Supabase', category:'Database', status:'connected', detail:'PostgreSQL + Realtime + Auth', icon:'🗄️' },
  { name:'Railway', category:'Infrastructure', status:'connected', detail:'FastAPI backend', icon:'🚂' },
  { name:'Vercel', category:'Frontend', status:'connected', detail:'React CRA deployed', icon:'▲' },
  { name:'Google Analytics', category:'Analytics', status:'connected', detail:'G-VCZP0QCEVZ', icon:'📊' },
  { name:'Anthropic Claude', category:'AI', status:'connected', detail:'claude-haiku-4-5', icon:'🤖' },
  { name:'Razorpay', category:'Payments', status:'planned', detail:'Payment gateway integration', icon:'💳' },
  { name:'WhatsApp Business', category:'Messaging', status:'planned', detail:'WABA approval required', icon:'💬' },
  { name:'Zoom', category:'Telemedicine', status:'planned', detail:'Video consultations', icon:'📹' },
  { name:'Google Calendar', category:'Scheduling', status:'planned', detail:'Appointment sync', icon:'📅' },
  { name:'Tally', category:'Accounting', status:'planned', detail:'GST billing integration', icon:'🧾' },
  { name:'Insurance APIs', category:'Insurance', status:'planned', detail:'TPA claim automation', icon:'🏥' },
  { name:'ABHA/ABDM', category:'Gov. Health', status:'planned', detail:'Ayushman Bharat integration', icon:'🇮🇳' },
];
export default function SAMarketplace({ S, card, Badge, KPICard }) {
  const connected = INTEGRATIONS.filter(i=>i.status==='connected');
  const planned = INTEGRATIONS.filter(i=>i.status==='planned');
  return (
    <div>
      <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Marketplace & Integrations</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        <KPICard label="Connected" value={connected.length} color={S.success}/>
        <KPICard label="Planned" value={planned.length} color={S.warning}/>
        <KPICard label="Total Available" value={INTEGRATIONS.length} color={S.blue}/>
        <KPICard label="Categories" value={[...new Set(INTEGRATIONS.map(i=>i.category))].length} color={S.cyan}/>
      </div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:12 }}>Connected ({connected.length})</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {connected.map(i=>(
            <div key={i.name} style={{ ...card, display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{ width:36, height:36, borderRadius:8, background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{i.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{i.name}</div>
                <div style={{ fontSize:10, color:S.muted, marginTop:2 }}>{i.detail}</div>
                <div style={{ display:'flex', gap:6, marginTop:6 }}>
                  <Badge color="green">Connected</Badge>
                  <Badge color="blue">{i.category}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:12 }}>Planned ({planned.length})</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {planned.map(i=>(
            <div key={i.name} style={{ ...card, display:'flex', gap:12, alignItems:'flex-start', opacity:0.7 }}>
              <div style={{ width:36, height:36, borderRadius:8, background:S.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{i.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{i.name}</div>
                <div style={{ fontSize:10, color:S.muted, marginTop:2 }}>{i.detail}</div>
                <div style={{ display:'flex', gap:6, marginTop:6 }}>
                  <Badge color="yellow">Planned</Badge>
                  <Badge color="blue">{i.category}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
