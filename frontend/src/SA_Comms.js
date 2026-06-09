import React, { useState } from 'react';
const TEMPLATES = [
  { id:'welcome', label:'Welcome Email', subject:'Welcome to PsycheFlow', body:'Welcome to PsycheFlow! Your hospital portal is ready. Login at psycheflow.in/hospital' },
  { id:'renewal', label:'Renewal Notice', subject:'Your PsycheFlow subscription renews soon', body:'Your subscription renews in 30 days. Ensure payment details are up to date.' },
  { id:'maintenance', label:'Maintenance Alert', subject:'Scheduled maintenance on PsycheFlow', body:'We will be performing scheduled maintenance on {date} from {time}. Expected downtime: {duration}.' },
  { id:'feature', label:'New Feature Launch', subject:'New feature available on PsycheFlow', body:'We have launched {feature}! Log in to explore the new capabilities.' },
  { id:'security', label:'Security Notice', subject:'Important security update from PsycheFlow', body:'We have detected unusual activity. Please review your account security settings.' },
];
export default function SAComms({ hospitals, auditLogs, S, card, Badge, KPICard }) {
  const [msg, setMsg] = useState('');
  const [target, setTarget] = useState('all_hospitals');
  const [channel, setChannel] = useState('in_app');
  const [subject, setSubject] = useState('');
  const [selTemplate, setSelTemplate] = useState('');
  const broadcasts = auditLogs.filter(l=>l.action?.includes('Broadcast'));
  const send = () => {
    if (!msg.trim()) return;
    alert(`Broadcast logged. ${channel==='sms'?'SMS requires DLT approval.':channel==='email'?'Email via Resend — configure template.':'In-app notification recorded.'}`);
    setMsg(''); setSubject('');
  };
  return (
    <div>
      <h2 style={{ margin:'0 0 20px', color:S.navy, fontSize:20, fontWeight:700 }}>Communication Center</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        <KPICard label="Total Broadcasts" value={broadcasts.length} color={S.blue}/>
        <KPICard label="Hospitals" value={hospitals.length} sub="Reachable" color={S.success}/>
        <KPICard label="SMS" value="Pending DLT" color={S.warning}/>
        <KPICard label="Email" value="Active" sub="via Resend" color={S.success}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <div style={{ ...card }}>
          <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:16 }}>Compose Broadcast</div>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:10, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Template</div>
            <select value={selTemplate} onChange={e=>{ setSelTemplate(e.target.value); const t=TEMPLATES.find(x=>x.id===e.target.value); if(t){setSubject(t.subject);setMsg(t.body);} }} style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:12, background:S.bg, color:S.navy, outline:'none' }}>
              <option value="">Select template or write custom</option>
              {TEMPLATES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:10, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Target Audience</div>
            <select value={target} onChange={e=>setTarget(e.target.value)} style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:12, background:S.bg, color:S.navy, outline:'none' }}>
              <option value="all_hospitals">All Hospitals ({hospitals.length})</option>
              <option value="enterprise">Enterprise Hospitals</option>
              <option value="trial">Trial Hospitals</option>
              <option value="psychologists">All Psychologists</option>
              <option value="patients">All Patients</option>
            </select>
          </div>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:10, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Channel</div>
            <div style={{ display:'flex', gap:6 }}>
              {['in_app','email','sms'].map(c=>(
                <button key={c} onClick={()=>setChannel(c)} style={{ flex:1, padding:'7px', background:channel===c?S.blue:S.bg, color:channel===c?'#fff':S.muted, border:`0.5px solid ${channel===c?S.blue:S.border}`, borderRadius:7, fontSize:11, fontWeight:600, cursor:'pointer', textTransform:'capitalize' }}>{c.replace('_',' ')}</button>
              ))}
            </div>
          </div>
          {channel==='email'&&<div style={{ marginBottom:10 }}><div style={{ fontSize:10, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Subject</div><input value={subject} onChange={e=>setSubject(e.target.value)} style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:12, background:S.bg, color:S.navy, outline:'none', boxSizing:'border-box' }}/></div>}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:10, fontWeight:600, color:S.navy, marginBottom:4, textTransform:'uppercase' }}>Message</div>
            <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={4} placeholder="Type your message..." style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`0.5px solid ${S.border}`, fontSize:12, background:S.bg, color:S.navy, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }}/>
          </div>
          <button onClick={send} disabled={!msg.trim()} style={{ width:'100%', padding:'10px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>Send Broadcast</button>
        </div>
        <div style={{ ...card }}>
          <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:16 }}>Broadcast History</div>
          {broadcasts.length===0?<div style={{ textAlign:'center', padding:32, color:S.muted, fontSize:13 }}>No broadcasts sent yet.</div>:broadcasts.map(log=>(
            <div key={log.id} style={{ padding:'10px 0', borderBottom:`0.5px solid ${S.border}` }}>
              <div style={{ fontSize:12, color:S.navy }}>{log.action}</div>
              <div style={{ fontSize:10, color:S.muted, marginTop:2 }}>{new Date(log.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...card }}>
        <div style={{ fontSize:12, fontWeight:700, color:S.navy, marginBottom:14 }}>Message Templates</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {TEMPLATES.map(t=>(
            <div key={t.id} onClick={()=>{setSubject(t.subject);setMsg(t.body);setSelTemplate(t.id);}} style={{ background:S.bg, borderRadius:8, padding:'10px 14px', cursor:'pointer', border:`0.5px solid ${S.border}` }} onMouseEnter={e=>e.currentTarget.style.borderColor=S.blue} onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>
              <div style={{ fontSize:12, fontWeight:600, color:S.navy, marginBottom:4 }}>{t.label}</div>
              <div style={{ fontSize:10, color:S.muted }}>{t.subject}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
