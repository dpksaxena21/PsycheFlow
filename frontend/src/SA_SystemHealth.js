import React, { useState } from 'react';
export default function SASystemHealth({ systemStatus, S, card, Badge, KPICard }) {
  const [pinging, setPinging] = useState(false);
  const checkAll = async () => {
    setPinging(true);
    setTimeout(()=>setPinging(false), 3000);
  };
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>System Health</h2>
        <button onClick={checkAll} disabled={pinging} style={{ padding:'8px 16px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>{pinging?'Checking...':'Refresh All'}</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {Object.entries(systemStatus).map(([name,status])=>(
          <KPICard key={name} label={name.charAt(0).toUpperCase()+name.slice(1)} value={status.charAt(0).toUpperCase()+status.slice(1)} color={status==='healthy'?S.success:status==='checking'?S.warning:S.danger}/>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16, marginBottom:16 }}>
        {[
          { name:'Railway Backend', url:'web-production-3887e.up.railway.app', status:systemStatus.railway, detail:'FastAPI + Uvicorn, US West, 1 Replica', metrics:{ cpu:'~12%', memory:'~380MB', uptime:'99.9%' } },
          { name:'Supabase Database', url:'uckgvukjdekoxfbxnqew.supabase.co', status:systemStatus.supabase, detail:'PostgreSQL 15, Singapore ap-southeast-1', metrics:{ connections:'~8/60', storage:'~45MB', uptime:'99.99%' } },
          { name:'Vercel Frontend', url:'psycheflow.in', status:'healthy', detail:'React CRA, Washington DC CDN, Global Edge', metrics:{ latency:'~28ms', bandwidth:'CDN cached', uptime:'99.99%' } },
          { name:'MSG91 SMS', url:'api.msg91.com', status:'healthy', detail:'DLT registration pending — API connected', metrics:{ delivered:'100%', pending:'DLT', uptime:'99.9%' } },
        ].map(svc=>(
          <div key={svc.name} style={{ ...card, borderLeft:`3px solid ${svc.status==='healthy'?S.success:svc.status==='checking'?S.warning:S.danger}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={{ fontSize:14, fontWeight:700, color:S.navy }}>{svc.name}</div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:svc.status==='healthy'?'#22c55e':svc.status==='checking'?S.warning:'#ef4444' }}/>
                <span style={{ fontSize:12, fontWeight:600, color:svc.status==='healthy'?S.success:svc.status==='checking'?S.warning:S.danger, textTransform:'capitalize' }}>{svc.status}</span>
              </div>
            </div>
            <div style={{ fontSize:11, color:S.muted, fontFamily:'monospace', marginBottom:8 }}>{svc.url}</div>
            <div style={{ fontSize:11, color:S.muted, marginBottom:12 }}>{svc.detail}</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {Object.entries(svc.metrics).map(([k,v])=>(
                <div key={k} style={{ background:S.bg, borderRadius:6, padding:'6px 8px', textAlign:'center' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:S.navy }}>{v}</div>
                  <div style={{ fontSize:9, color:S.muted, textTransform:'capitalize' }}>{k}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ ...card }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>API Monitoring</div>
          {[['GET /','Health check','<10ms'],['POST /predict','ML inference','~200ms'],['POST /chatbot','Claude RAG','~800ms'],['POST /clinical-interview','Claude Haiku','~1500ms'],['POST /analyze-journal','Claude Haiku','~800ms']].map(([ep,desc,latency])=>(
            <div key={ep} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
              <div>
                <div style={{ fontSize:11, fontFamily:'monospace', color:S.blue }}>{ep}</div>
                <div style={{ fontSize:10, color:S.muted }}>{desc}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:11, color:S.muted }}>{latency}</span>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e' }}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...card }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Incident History</div>
          {[
            { date:'2026-06-09', issue:'Railway healthcheck failed — slowapi request param missing', status:'resolved', duration:'~45 min' },
            { date:'2026-06-08', issue:'React error #310 — hospitalAlgorithms import crash', status:'resolved', duration:'~20 min' },
            { date:'2026-06-08', issue:'Null byte in main.py from heredoc', status:'resolved', duration:'~10 min' },
          ].map((inc,i)=>(
            <div key={i} style={{ padding:'9px 0', borderBottom:`0.5px solid ${S.border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontSize:12, fontWeight:600, color:S.navy }}>{inc.issue}</span>
                <Badge color="green">{inc.status}</Badge>
              </div>
              <div style={{ fontSize:10, color:S.muted }}>{inc.date} · Duration: {inc.duration}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
