import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabase';

export default function PP_Messages({ patients, user, S, card }) {
  const [selPatient, setSelPatient] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const bottomRef = useRef();

  useEffect(() => { if (selPatient) loadMsgs(); }, [selPatient]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs]);

  const loadMsgs = async () => {
    const { data } = await supabase.from('messages')
      .select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .or(`sender_id.eq.${selPatient.id},receiver_id.eq.${selPatient.id}`)
      .order('created_at', { ascending:true });
    const filtered = (data||[]).filter(m => (m.sender_id===user.id&&m.receiver_id===selPatient.id)||(m.sender_id===selPatient.id&&m.receiver_id===user.id));
    setMsgs(filtered);
    // Mark as read
    await supabase.from('messages').update({ read:true }).eq('receiver_id', user.id).eq('sender_id', selPatient.id);
  };

  const send = async () => {
    if (!newMsg.trim()||!selPatient) return;
    await supabase.from('messages').insert({ sender_id:user.id, receiver_id:selPatient.id, content:newMsg, read:false });
    setNewMsg('');
    loadMsgs();
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:16, height:'75vh' }}>
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Conversations</div>
        {patients.map(p => (
          <div key={p.id} onClick={() => setSelPatient(p)} style={{ ...card, cursor:'pointer', padding:'12px 14px', marginBottom:8, borderLeft:`3px solid ${selPatient?.id===p.id?S.blue:S.border}`, background:selPatient?.id===p.id?S.lightBlue:undefined }}>
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${S.blue},${S.cyan})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>
                {(p.display_name||p.full_name||'?')[0]}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:S.navy }}>{p.display_name||p.full_name}</div>
                <div style={{ fontSize:10, color:S.muted }}>PHQ: {p.latest?.phq_score??'—'}</div>
              </div>
            </div>
          </div>
        ))}
        {patients.length===0&&<div style={{ ...card, textAlign:'center', padding:24, color:S.muted, fontSize:12 }}>No patients linked.</div>}
      </div>
      <div style={{ ...card, display:'flex', flexDirection:'column', padding:0, overflow:'hidden' }}>
        {!selPatient ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:S.muted, fontSize:13 }}>Select a patient to start messaging</div>
        ) : (
          <>
            <div style={{ padding:'12px 16px', borderBottom:`0.5px solid ${S.border}`, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:`linear-gradient(135deg,${S.blue},${S.cyan})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>{(selPatient.display_name||selPatient.full_name||'?')[0]}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:S.navy }}>{selPatient.display_name||selPatient.full_name}</div>
                <div style={{ fontSize:10, color:S.muted }}>Secure clinical messaging</div>
              </div>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:8 }}>
              {msgs.length===0&&<div style={{ textAlign:'center', padding:32, color:S.muted, fontSize:12 }}>No messages yet. Start the conversation.</div>}
              {msgs.map(m => (
                <div key={m.id} style={{ display:'flex', justifyContent:m.sender_id===user.id?'flex-end':'flex-start' }}>
                  <div style={{ maxWidth:'75%', padding:'8px 12px', borderRadius:m.sender_id===user.id?'12px 12px 4px 12px':'12px 12px 12px 4px', background:m.sender_id===user.id?S.blue:S.bg, color:m.sender_id===user.id?'#fff':S.navy, fontSize:12, lineHeight:1.5 }}>
                    <div>{m.content}</div>
                    <div style={{ fontSize:9, opacity:0.6, marginTop:3 }}>{new Date(m.created_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef}/>
            </div>
            <div style={{ padding:'8px 12px', borderTop:`0.5px solid ${S.border}`, display:'flex', gap:8 }}>
              <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Type a message..." style={{ flex:1, padding:'9px 12px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, outline:'none', background:S.bg, color:S.navy }}/>
              <button onClick={send} disabled={!newMsg.trim()} style={{ padding:'9px 18px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontWeight:600 }}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
