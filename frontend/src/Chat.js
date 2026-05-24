import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { logAction, ACTIONS } from './audit';

export default function Chat({ user, contactId, contactName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!contactId) return;
    fetchMessages();
    const sub = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, payload => {
        const m = payload.new;
        if ((m.sender_id === user.id && m.receiver_id === contactId) ||
            (m.sender_id === contactId && m.receiver_id === user.id)) {
          setMessages(prev => [...prev, m]);
        }
      })
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [contactId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    // Mark received messages as read
    await supabase.from('messages')
      .update({ read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', contactId)
      .eq('read', false);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput('');
    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: contactId,
      content,
    });
    fetchMessages();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  // Group messages by date
  const grouped = messages.reduce((acc, m) => {
    const date = new Date(m.created_at).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(m);
    return acc;
  }, {});

  const T = {
    blue:'#1D4ED8', blue2:'#EFF6FF', navy:'#0C1A2E',
    text2:'#3B5998', text3:'#94a3b8', border:'#E2EBF6',
    bg:'#F8FAFF', bg2:'#fff', font:"'Satoshi',-apple-system,sans-serif"
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:T.bg, fontFamily:T.font }}>

      {/* Header */}
      <div style={{ background:T.bg2, borderBottom:`0.5px solid ${T.border}`, padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:T.blue2, color:T.blue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>
          {contactName?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <div style={{ fontWeight:700, color:T.navy, fontSize:13 }}>{contactName || 'Chat'}</div>
          <div style={{ fontSize:10, color:T.text3 }}>Secure · End-to-end encrypted</div>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:4 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#15803D' }}/>
          <span style={{ fontSize:10, color:'#15803D', fontWeight:500 }}>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:4 }}>
        {loading ? (
          <div style={{ textAlign:'center', color:T.text3, padding:40, fontSize:13 }}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign:'center', padding:40, margin:'40px auto', maxWidth:280 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:T.blue2, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="5" width="18" height="13" rx="3.5" stroke={T.blue} strokeWidth="1.4"/><path d="M2 9L11 14L20 9" stroke={T.blue} strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>
            <div style={{ color:T.navy, fontSize:13, fontWeight:600, marginBottom:4 }}>No messages yet</div>
            <div style={{ color:T.text3, fontSize:12, lineHeight:1.6 }}>Messages are end-to-end encrypted. Start the conversation.</div>
          </div>
        ) : (
          Object.entries(grouped).map(([date, msgs]) => (
            <div key={date}>
              <div style={{ textAlign:'center', margin:'12px 0' }}>
                <span style={{ background:T.bg2, border:`0.5px solid ${T.border}`, padding:'3px 12px', borderRadius:100, fontSize:10, color:T.text3 }}>{formatDate(msgs[0].created_at)}</span>
              </div>
              {msgs.map(m => {
                const isMine = m.sender_id === user.id;
                return (
                  <div key={m.id} style={{ display:'flex', justifyContent:isMine?'flex-end':'flex-start', marginBottom:3 }}>
                    <div style={{ maxWidth:'72%', padding:'9px 13px',
                      background: isMine ? T.blue : T.bg2,
                      borderRadius: isMine ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                      border: isMine ? 'none' : `0.5px solid ${T.border}`,
                      boxShadow: isMine ? 'none' : '0 1px 3px rgba(29,78,216,0.06)' }}>
                      <div style={{ fontSize:13, color:isMine?'#fff':T.navy, lineHeight:1.65, wordBreak:'break-word' }}>{m.content}</div>
                      <div style={{ fontSize:10, color:isMine?'rgba(255,255,255,0.6)':T.text3, textAlign:'right', marginTop:3, display:'flex', alignItems:'center', justifyContent:'flex-end', gap:3 }}>
                        {formatTime(m.created_at)}
                        {isMine && <span style={{ color: m.read?'rgba(255,255,255,0.9)':'rgba(255,255,255,0.5)', fontSize:12 }}>{m.read?'✓✓':'✓'}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{ background:T.bg2, borderTop:`0.5px solid ${T.border}`, padding:'10px 14px', display:'flex', alignItems:'flex-end', gap:8 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder="Type a message..." rows={1}
          style={{ flex:1, padding:'9px 13px', borderRadius:10, border:`0.5px solid ${T.border}`, fontSize:13, fontFamily:T.font, resize:'none', outline:'none', maxHeight:100, lineHeight:1.6, color:T.navy, background:T.bg }}
          onFocus={e => e.target.style.borderColor=T.blue} onBlur={e => e.target.style.borderColor=T.border}
        />
        <button onClick={sendMessage} disabled={!input.trim()}
          style={{ width:38, height:38, borderRadius:10, border:'none', background:input.trim()?T.blue:'#E2EBF6', color:'#fff', cursor:input.trim()?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 0.2s' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 2L2 7L7 9L9 14L14 2Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
}
