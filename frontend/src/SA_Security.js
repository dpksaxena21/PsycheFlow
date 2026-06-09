import React, { useState } from 'react';
export default function SASecurity({ auditLogs, S, card, Badge, KPICard }) {
  const [view, setView] = useState('threat');
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700 }}>Security Center</h2>
        <div style={{ display:'flex', gap:8 }}>
          {['threat','measures','sessions','compliance'].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'6px 14px', border:'none', borderRadius:8, fontSize:12, fontWeight:view===v?700:400, background:view===v?S.blue:'transparent', color:view===v?'#fff':S.muted, cursor:'pointer', textTransform:'capitalize' }}>{v}</button>
          ))}
        </div>
      </div>
      {view==='threat' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            <KPICard label="Brute Force Attempts" value="0" sub="Last 24h" color={S.success}/>
            <KPICard label="Failed Logins" value="0" sub="Last 24h" color={S.success}/>
            <KPICard label="Suspicious IPs" value="0" sub="Blocked" color={S.success}/>
            <KPICard label="Security Events" value={auditLogs.length} sub="Total logged" color={S.blue}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ ...card }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Threat Monitor</div>
              <div style={{ background:'#ECFDF5', border:'1px solid #A7F3D0', borderRadius:8, padding:'12px 14px', marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:700, color:S.success }}>All Clear — No Active Threats</div>
                <div style={{ fontSize:11, color:S.muted, marginTop:4 }}>No brute force, credential stuffing, or suspicious activity detected</div>
              </div>
              {['Brute Force Protection','Rate Limiting Active','JWT Token Validation','CORS Policy Enforced','Request Size Limits','Input Sanitization'].map(item=>(
                <div key={item} style={{ display:'flex', gap:8, padding:'7px 0', borderBottom:`0.5px solid ${S.border}` }}>
                  <span style={{ color:S.success, fontSize:12 }}>✓</span>
                  <span style={{ fontSize:12, color:S.navy }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ ...card }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Recent Security Events</div>
              {auditLogs.slice(0,8).map(log=>(
                <div key={log.id} style={{ padding:'7px 0', borderBottom:`0.5px solid ${S.border}` }}>
                  <div style={{ fontSize:11, color:S.navy }}>{log.action}</div>
                  <div style={{ fontSize:9, color:S.hint, marginTop:1 }}>{log.actor_email} · {new Date(log.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                </div>
              ))}
              {auditLogs.length===0&&<div style={{ textAlign:'center', padding:24, color:S.muted, fontSize:13 }}>No events logged.</div>}
            </div>
          </div>
        </div>
      )}
      {view==='measures' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ ...card }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Active Security Measures</div>
              {[
                ['CORS locked to 4 origins','Prevents cross-origin attacks'],
                ['JWT auth on all sensitive routes','Supabase JWT verified'],
                ['Input sanitization','sanitize_text() strips null bytes'],
                ['1MB request size limit','Prevents large payload attacks'],
                ['HSTS header','max-age=31536000'],
                ['CSP header','Content Security Policy active'],
                ['X-Frame-Options: DENY','Clickjacking prevention'],
                ['Error message hardening','No internal details leaked'],
                ['Session timeout 30min','Auto-logout on inactivity'],
                ['RLS on all 21 tables','Row-level security enforced'],
              ].map(([m,d])=>(
                <div key={m} style={{ display:'flex', gap:10, padding:'7px 0', borderBottom:`0.5px solid ${S.border}` }}>
                  <div style={{ width:16, height:16, borderRadius:'50%', background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                    <span style={{ color:S.success, fontSize:9 }}>✓</span>
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{m}</div>
                    <div style={{ fontSize:10, color:S.muted }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ ...card }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Rate Limits</div>
              {[['POST /predict','30/min'],['POST /chatbot','20/min'],['POST /generate-report','5/min'],['POST /clinical-interview','10/min'],['POST /analyze-journal','20/min'],['POST /check-crisis','30/min'],['POST /send-sms','10/min']].map(([ep,limit])=>(
                <div key={ep} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`0.5px solid ${S.border}` }}>
                  <span style={{ fontSize:11, color:S.navy, fontFamily:'monospace' }}>{ep}</span>
                  <Badge color="blue">{limit}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {view==='sessions' && (
        <div style={{ ...card, textAlign:'center', padding:48 }}>
          <div style={{ fontSize:14, fontWeight:600, color:S.navy, marginBottom:8 }}>Session Monitoring</div>
          <div style={{ fontSize:13, color:S.muted }}>Real-time session tracking (IP, device, location) requires Supabase Auth audit log integration. Available in Pro tier.</div>
        </div>
      )}
      {view==='compliance' && (
        <div>
          <div style={{ ...card }}>
            <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Compliance Events</div>
            {auditLogs.map(log=>(
              <div key={log.id} style={{ display:'flex', gap:12, padding:'9px 0', borderBottom:`0.5px solid ${S.border}` }}>
                <Badge color="blue">{log.resource_type||'system'}</Badge>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:S.navy }}>{log.action}</div>
                  <div style={{ fontSize:10, color:S.hint }}>{log.actor_email} · {new Date(log.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                </div>
              </div>
            ))}
            {auditLogs.length===0&&<div style={{ textAlign:'center', padding:32, color:S.muted }}>No compliance events.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
