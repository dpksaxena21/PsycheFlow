import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
const API = 'https://web-production-3887e.up.railway.app';

export default function PP_AICopilot({ patients, user, S, card }) {
  const [msgs, setMsgs] = useState([{ role:'assistant', content:'Hello Dr. I\'m your AI Clinical Copilot. I can help you with patient summaries, treatment planning, clinical questions, and session preparation. Select a patient or ask me anything.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selPatient, setSelPatient] = useState(null);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs]);

  const send = async (message) => {
    const q = message || input;
    if (!q.trim()) return;
    const ctx = selPatient ? `\n\nCurrent patient context: ${selPatient.display_name||selPatient.full_name}, PHQ-9: ${selPatient.latest?.phq_score}, GAD-7: ${selPatient.latest?.gad_score}, Risk: ${selPatient.riskLevel}, Sessions: ${selPatient.sessions?.length}, Trend: ${selPatient.phqTrend}` : '';
    setMsgs(m => [...m, { role:'user', content:q }]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(API+'/chatbot', { message: q+ctx, user_id:user.id, context:{ role:'psychologist' } });
      setMsgs(m => [...m, { role:'assistant', content:res.data.response }]);
    } catch { setMsgs(m => [...m, { role:'assistant', content:'Connection error. Please try again.' }]); }
    setLoading(false);
  };

  const QUICK = selPatient ? [
    `Summarize ${selPatient.display_name||selPatient.full_name}'s clinical history`,
    `What changed in the last month for ${selPatient.display_name||selPatient.full_name}?`,
    `Generate a treatment plan for PHQ-9: ${selPatient.latest?.phq_score}`,
    `Identify risk factors for ${selPatient.display_name||selPatient.full_name}`,
    `Suggest session focus for next appointment`,
    `Predict dropout risk for this patient`,
  ] : ['What is the difference between CBT and ACT?','How do I manage treatment-resistant depression?','Explain GAD-7 scoring and severity thresholds','Best interventions for PTSD in Indian context','How to handle suicidal ideation in session'];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:16, height:'75vh' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Patient Context</div>
        <div onClick={() => setSelPatient(null)} style={{ ...card, cursor:'pointer', padding:'10px 12px', borderLeft:`3px solid ${!selPatient?S.blue:S.border}`, background:!selPatient?S.lightBlue:undefined }}>
          <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>General Mode</div>
          <div style={{ fontSize:10, color:S.muted }}>Clinical knowledge base</div>
        </div>
        {patients.map(p => (
          <div key={p.id} onClick={() => setSelPatient(p)} style={{ ...card, cursor:'pointer', padding:'10px 12px', borderLeft:`3px solid ${selPatient?.id===p.id?S.blue:S.border}`, background:selPatient?.id===p.id?S.lightBlue:undefined }}>
            <div style={{ fontSize:12, fontWeight:600, color:S.navy }}>{p.display_name||p.full_name}</div>
            <div style={{ fontSize:10, color:S.muted }}>PHQ:{p.latest?.phq_score??'—'} · {p.riskLevel}</div>
          </div>
        ))}
        <div style={{ marginTop:8 }}>
          <div style={{ fontSize:11, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Quick Prompts</div>
          {QUICK.map(q => (
            <div key={q} onClick={() => send(q)} style={{ padding:'7px 10px', background:S.bg, borderRadius:7, marginBottom:5, fontSize:11, color:S.blue, cursor:'pointer', border:`0.5px solid ${S.border}`, lineHeight:1.4 }}
              onMouseEnter={e => { e.currentTarget.style.background=S.lightBlue; }} onMouseLeave={e => { e.currentTarget.style.background=S.bg; }}>
              {q.length>50?q.slice(0,50)+'...':q}
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...card, display:'flex', flexDirection:'column', padding:0, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:`0.5px solid ${S.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:13, fontWeight:700, color:S.navy }}>AI Clinical Copilot</div>
          {selPatient && <div style={{ fontSize:11, color:S.blue, fontWeight:600 }}>Context: {selPatient.display_name||selPatient.full_name}</div>}
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:10 }}>
          {msgs.map((m,i) => (
            <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start' }}>
              <div style={{ maxWidth:'80%', padding:'10px 14px', borderRadius:m.role==='user'?'12px 12px 4px 12px':'12px 12px 12px 4px', background:m.role==='user'?S.blue:S.bg, color:m.role==='user'?'#fff':S.navy, fontSize:13, lineHeight:1.6 }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div style={{ fontSize:12, color:S.muted, padding:'4px 0' }}>AI is thinking...</div>}
          <div ref={bottomRef}/>
        </div>
        <div style={{ padding:'10px 14px', borderTop:`0.5px solid ${S.border}`, display:'flex', gap:8 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!loading&&send()} placeholder={selPatient?`Ask about ${selPatient.display_name||selPatient.full_name}...`:"Ask anything clinical..."}
            style={{ flex:1, padding:'9px 12px', borderRadius:8, border:`0.5px solid ${S.border}`, fontSize:13, outline:'none', background:S.bg, color:S.navy }}/>
          <button onClick={() => send()} disabled={loading||!input.trim()} style={{ padding:'9px 18px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:600 }}>Send</button>
        </div>
      </div>
    </div>
  );
}
