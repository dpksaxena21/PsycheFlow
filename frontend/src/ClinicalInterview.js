import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function ClinicalInterview({ onComplete, user }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello. I'm Dr. PsycheFlow, your AI clinical psychologist.

I'm here to understand what you're going through — not to judge, just to listen and help. This is a confidential conversation.

I'll ask you some questions, just like a real psychologist would in a first session. Take your time with each answer. There are no right or wrong responses.

**To begin — what brings you here today? What's been on your mind or bothering you lately?**`
    }
  ]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [turnCount, setTurnCount]   = useState(0);
  const [finished, setFinished]     = useState(false);
  const [assessment, setAssessment] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role:'user', content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    const newTurn = turnCount + 1;
    setTurnCount(newTurn);

    try {
      const res = await axios.post('http://127.0.0.1:8000/clinical-interview', {
        messages: updated,
        turn: newTurn
      });

      if (res.data.finished) {
        setMessages([...updated, {
          role:'assistant',
          content: res.data.reply
        }]);
        setAssessment(res.data.assessment);
        setFinished(true);
      } else {
        setMessages([...updated, {
          role:'assistant',
          content: res.data.reply
        }]);
      }
    } catch {
      setMessages([...updated, {
        role:'assistant',
        content:'I apologize — there was a technical issue. Please try again.'
      }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const progressPct = Math.round((turnCount / 15) * 100);

  const DOMAINS = [
    { label:'Mood', turns:[1,2,3] },
    { label:'Anxiety', turns:[3,4] },
    { label:'Sleep', turns:[5,6] },
    { label:'History', turns:[7,8] },
    { label:'Relationships', turns:[9,10] },
    { label:'Strengths', turns:[11,12] },
    { label:'Goals', turns:[13,14,15] },
  ];

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", minHeight:'100vh', background:'#F8FAFF', display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <div style={{ background:'#0C1A2E', padding:'14px 24px', display:'flex', flexDirection:'column', gap:10, position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'#1D4ED8', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><ellipse cx="10" cy="7" rx="5" ry="4" stroke="white" strokeWidth="1.3"/><path d="M5 7C5 9.5 3.5 11 3.5 11C3.5 13.5 6.5 15 10 15C13.5 15 16.5 13.5 16.5 11C16.5 11 15 9.5 15 7" stroke="white" strokeWidth="1.3" strokeLinecap="round"/><circle cx="10" cy="8" r="2" fill="white"/></svg>
          </div>
          <div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:14, letterSpacing:'-0.01em' }}>Dr. PsycheFlow</div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:11 }}>AI Clinical Psychologist · Confidential</div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', padding:'4px 10px', borderRadius:100, background:'rgba(255,255,255,0.08)' }}>Turn {turnCount}/15</div>
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:100, height:3 }}>
          <div style={{ width:`${progressPct}%`, background:'#3B82F6', height:3, borderRadius:100, transition:'width 0.5s ease' }}/>
        </div>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {DOMAINS.map((d,i) => {
            const active = d.turns.includes(turnCount);
            const done = d.turns[d.turns.length-1] < turnCount;
            return (
              <span key={i} style={{ fontSize:10, padding:'2px 8px', borderRadius:100, fontWeight: active?600:400,
                background: done?'rgba(59,130,246,0.3)':active?'rgba(59,130,246,0.2)':'rgba(255,255,255,0.06)',
                color: done?'#93C5FD':active?'#BFDBFE':'rgba(255,255,255,0.35)' }}>
                {done?'✓ ':''}{d.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, maxWidth:720, width:'100%', margin:'0 auto', boxSizing:'border-box' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display:'flex', justifyContent: msg.role==='user'?'flex-end':'flex-start', alignItems:'flex-start', gap:10 }}>
            {msg.role === 'assistant' && (
              <div style={{ width:30, height:30, borderRadius:8, background:'#1D4ED8', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="5.5" rx="4" ry="3" stroke="white" strokeWidth="1.2"/><path d="M4 5.5C4 7.3 3 8.5 3 8.5C3 10 5.2 11 8 11C10.8 11 13 10 13 8.5C13 8.5 12 7.3 12 5.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/><circle cx="8" cy="6.5" r="1.4" fill="white"/></svg>
              </div>
            )}
            <div style={{ maxWidth:'75%', padding:'12px 16px',
              borderRadius: msg.role==='user'?'14px 14px 3px 14px':'14px 14px 14px 3px',
              background: msg.role==='user'?'#1D4ED8':'#fff',
              color: msg.role==='user'?'#fff':'#0C1A2E',
              fontSize:13, lineHeight:1.75,
              border: msg.role==='user'?'none':'0.5px solid #E2EBF6',
              boxShadow: msg.role==='user'?'none':'0 1px 4px rgba(29,78,216,0.06)',
              whiteSpace:'pre-wrap' }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'#1D4ED8', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="5.5" rx="4" ry="3" stroke="white" strokeWidth="1.2"/><path d="M4 5.5C4 7.3 3 8.5 3 8.5C3 10 5.2 11 8 11C10.8 11 13 10 13 8.5C13 8.5 12 7.3 12 5.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/><circle cx="8" cy="6.5" r="1.4" fill="white"/></svg>
            </div>
            <div style={{ background:'#fff', border:'0.5px solid #E2EBF6', borderRadius:'14px 14px 14px 3px', padding:'12px 16px' }}>
              <div style={{ display:'flex', gap:5 }}>
                {[0,1,2].map(j => <div key={j} style={{ width:7, height:7, borderRadius:'50%', background:'#1D4ED8', opacity:0.7, animation:`bounce 1s ${j*0.2}s infinite` }}/>)}
              </div>
            </div>
          </div>
        )}

        {finished && assessment && (
          <div style={{ background:'#EFF6FF', borderRadius:14, padding:20, border:'0.5px solid #BFDBFE', marginTop:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <div style={{ width:24, height:24, borderRadius:6, background:'#1D4ED8', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:'#0C1A2E' }}>Session complete — Clinical summary</div>
            </div>
            <div style={{ fontSize:12, color:'#3B5998', lineHeight:1.8, whiteSpace:'pre-wrap', marginBottom:16 }}>{assessment}</div>
            <button onClick={() => onComplete && onComplete(assessment)}
              style={{ background:'#1D4ED8', color:'#fff', border:'none', padding:'10px 20px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              View dashboard →
            </button>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      {!finished && (
        <div style={{ background:'#fff', borderTop:'0.5px solid #E2EBF6', padding:'12px 24px', display:'flex', gap:10, alignItems:'flex-end', maxWidth:720, width:'100%', margin:'0 auto', boxSizing:'border-box' }}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Share what's on your mind... (Enter to send)"
            rows={1} style={{ flex:1, padding:'10px 14px', borderRadius:10, border:'0.5px solid #E2EBF6', fontSize:13, fontFamily:"'Satoshi',-apple-system,sans-serif", resize:'none', outline:'none', minHeight:42, maxHeight:120, color:'#0C1A2E', background:'#F8FAFF', lineHeight:1.6 }}
            onFocus={e=>e.target.style.borderColor='#1D4ED8'} onBlur={e=>e.target.style.borderColor='#E2EBF6'}
          />
          <button onClick={sendMessage} disabled={loading||!input.trim()}
            style={{ padding:'10px 18px', background:'#1D4ED8', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:600, opacity:(!input.trim()||loading)?0.4:1, whiteSpace:'nowrap', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 2L2 6.5L6.5 8.5L8.5 13L12 2Z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/></svg>
            Send
          </button>
        </div>
      )}

      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}