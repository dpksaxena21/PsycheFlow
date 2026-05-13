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

  return (
    <div style={{ fontFamily:'sans-serif', maxWidth:680, margin:'0 auto',
      height:'85vh', display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <div style={{ background:'#6366f1', borderRadius:'16px 16px 0 0',
        padding:'16px 24px', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:'50%',
          background:'rgba(255,255,255,0.2)', display:'flex',
          alignItems:'center', justifyContent:'center', fontSize:20 }}>
          🧠
        </div>
        <div>
          <div style={{ color:'#fff', fontWeight:'bold', fontSize:15 }}>
            Dr. PsycheFlow
          </div>
          <div style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>
            AI Clinical Psychologist • Confidential Session
          </div>
        </div>
        <div style={{ marginLeft:'auto', background:'rgba(255,255,255,0.15)',
          borderRadius:20, padding:'4px 12px', fontSize:12, color:'#fff' }}>
          Turn {turnCount}/12
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:20,
        background:'#f8fafc', display:'flex', flexDirection:'column', gap:16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display:'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            {msg.role === 'assistant' && (
              <div style={{ width:32, height:32, borderRadius:'50%',
                background:'#6366f1', display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:14, marginRight:10,
                flexShrink:0, marginTop:4 }}>
                🧠
              </div>
            )}
            <div style={{
              maxWidth:'75%',
              padding:'12px 16px',
              borderRadius: msg.role === 'user'
                ? '16px 16px 4px 16px'
                : '16px 16px 16px 4px',
              background: msg.role === 'user' ? '#6366f1' : '#fff',
              color: msg.role === 'user' ? '#fff' : '#1e293b',
              fontSize:14,
              lineHeight:1.7,
              boxShadow:'0 1px 4px rgba(0,0,0,0.08)',
              whiteSpace:'pre-wrap'
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:'50%',
              background:'#6366f1', display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:14 }}>🧠</div>
            <div style={{ background:'#fff', borderRadius:16, padding:'12px 16px',
              boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ display:'flex', gap:4 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:8, height:8, borderRadius:'50%',
                    background:'#6366f1', animation:`bounce 1s ${i*0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {finished && assessment && (
          <div style={{ background:'#f0fdf4', borderRadius:16, padding:20,
            border:'1px solid #86efac', marginTop:8 }}>
            <h3 style={{ color:'#16a34a', margin:'0 0 12px' }}>
              ✅ Session Complete — Clinical Summary
            </h3>
            <div style={{ fontSize:13, color:'#374151', lineHeight:1.8,
              whiteSpace:'pre-wrap' }}>
              {assessment}
            </div>
            <button onClick={() => onComplete && onComplete(assessment)}
              style={{ marginTop:16, padding:'10px 24px', background:'#6366f1',
                color:'#fff', border:'none', borderRadius:8,
                cursor:'pointer', fontSize:14, fontWeight:'bold' }}>
              View Full Dashboard →
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!finished && (
        <div style={{ background:'#fff', borderRadius:'0 0 16px 16px',
          padding:16, borderTop:'1px solid #e2e8f0',
          display:'flex', gap:10, alignItems:'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your response... (Enter to send, Shift+Enter for new line)"
            style={{ flex:1, padding:'10px 14px', borderRadius:10,
              border:'1px solid #e2e8f0', fontSize:14,
              fontFamily:'sans-serif', resize:'none', outline:'none',
              minHeight:44, maxHeight:120 }}
            rows={1}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            style={{ padding:'10px 20px', background:'#6366f1',
              color:'#fff', border:'none', borderRadius:10,
              cursor:'pointer', fontSize:14, fontWeight:'bold',
              opacity: (!input.trim() || loading) ? 0.5 : 1,
              whiteSpace:'nowrap' }}>
            Send →
          </button>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}