import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Chat from './Chat';
import { theme as t } from './theme';

export default function Messages({ user, contacts }) {
  const [selected, setSelected] = useState(null);
  const [unread, setUnread] = useState({});

  useEffect(() => {
    fetchUnread();
    const sub = supabase.channel('unread')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'messages' }, fetchUnread)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const fetchUnread = async () => {
    const { data } = await supabase.from('messages').select('sender_id').eq('receiver_id', user.id).eq('read', false);
    const counts = {};
    (data || []).forEach(m => { counts[m.sender_id] = (counts[m.sender_id] || 0) + 1; });
    setUnread(counts);
  };

  return (
    <div style={{ display:'flex', height:'75vh', borderRadius:14, overflow:'hidden', border:`0.5px solid ${t.border}`, fontFamily:t.font }}>

      {/* Contact list */}
      <div style={{ width:260, background:t.bg2, borderRight:`0.5px solid ${t.border}`, display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'14px 16px', borderBottom:`0.5px solid ${t.border}` }}>
          <div style={{ fontSize:13, fontWeight:700, color:t.navy, letterSpacing:'-0.01em' }}>Messages</div>
          <div style={{ fontSize:11, color:t.text3, marginTop:1 }}>Secure · End-to-end encrypted</div>
        </div>
        <div style={{ overflowY:'auto', flex:1 }}>
          {contacts.length === 0 ? (
            <div style={{ padding:24, color:t.text3, fontSize:13, textAlign:'center', lineHeight:1.6 }}>
              No contacts yet.<br/>Link a psychologist to start messaging.
            </div>
          ) : contacts.map(c => (
            <div key={c.id} onClick={() => setSelected(c)}
              style={{ padding:'12px 16px', cursor:'pointer', borderBottom:`0.5px solid ${t.border}`, background: selected?.id===c.id ? t.blue2 : t.bg2, display:'flex', alignItems:'center', gap:10, transition:'background 0.15s' }}
              onMouseEnter={e => { if(selected?.id!==c.id) e.currentTarget.style.background=t.bg; }}
              onMouseLeave={e => { if(selected?.id!==c.id) e.currentTarget.style.background=t.bg2; }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background: selected?.id===c.id?t.blue:t.blue2, color: selected?.id===c.id?'#fff':t.blue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>
                {c.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, color: selected?.id===c.id?t.blue:t.navy, fontSize:13 }}>{c.name}</div>
                <div style={{ fontSize:11, color:t.text3 }}>{c.role==='psychologist'?'Your Psychologist':'Patient'}</div>
              </div>
              {unread[c.id] > 0 && (
                <div style={{ background:t.blue, color:'#fff', borderRadius:'50%', width:20, height:20, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{unread[c.id]}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex:1, background:t.bg }}>
        {selected ? (
          <Chat user={user} contactId={selected.id} contactName={selected.name} />
        ) : (
          <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:56, height:56, borderRadius:14, background:t.blue2, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="14" rx="4" stroke={t.blue} strokeWidth="1.5"/><path d="M6 11H18M6 15H12" stroke={t.blue} strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <div style={{ fontSize:14, fontWeight:600, color:t.navy, marginBottom:6 }}>PsycheFlow Messaging</div>
            <div style={{ fontSize:12, color:t.text3 }}>Select a contact to start chatting</div>
          </div>
        )}
      </div>
    </div>
  );
}
