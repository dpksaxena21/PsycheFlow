import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';

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

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#F0F2F5', borderRadius: 16, overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: '#075E54', padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: '#25D366', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, color: '#fff'
        }}>{contactName?.[0]?.toUpperCase() || '?'}</div>
        <div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>{contactName || 'Chat'}</div>
          <div style={{ color: '#B2DFDB', fontSize: 12 }}>PsycheFlow Secure Messaging</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 20px',
        background: '#ECE5DD',
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
        backgroundSize: '20px 20px'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 40,
            background: 'rgba(255,255,255,0.8)', borderRadius: 12, margin: '40px auto', maxWidth: 300
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <div style={{ color: '#666', fontSize: 14 }}>
              Messages are end-to-end encrypted.<br />Start the conversation.
            </div>
          </div>
        ) : (
          Object.entries(grouped).map(([date, msgs]) => (
            <div key={date}>
              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <span style={{
                  background: 'rgba(255,255,255,0.8)', padding: '4px 12px',
                  borderRadius: 20, fontSize: 12, color: '#666'
                }}>{formatDate(msgs[0].created_at)}</span>
              </div>
              {msgs.map(m => {
                const isMine = m.sender_id === user.id;
                return (
                  <div key={m.id} style={{
                    display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start',
                    marginBottom: 4
                  }}>
                    <div style={{
                      maxWidth: '70%', padding: '8px 12px',
                      background: isMine ? '#DCF8C6' : '#fff',
                      borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      position: 'relative'
                    }}>
                      <div style={{ fontSize: 14, color: '#111', lineHeight: 1.5, wordBreak: 'break-word' }}>
                        {m.content}
                      </div>
                      <div style={{
                        fontSize: 11, color: '#999', textAlign: 'right',
                        marginTop: 4, display: 'flex', alignItems: 'center',
                        justifyContent: 'flex-end', gap: 4
                      }}>
                        {formatTime(m.created_at)}
                        {isMine && (
                          <span style={{ color: m.read ? '#53BDEB' : '#999', fontSize: 14 }}>
                            {m.read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        background: '#F0F2F5', padding: '10px 16px',
        display: 'flex', alignItems: 'flex-end', gap: 10
      }}>
        <div style={{
          flex: 1, background: '#fff', borderRadius: 24,
          padding: '10px 16px', display: 'flex', alignItems: 'flex-end'
        }}>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message..."
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none',
              fontSize: 15, lineHeight: 1.5, maxHeight: 120,
              fontFamily: 'inherit', background: 'transparent'
            }}
            rows={1}
          />
        </div>
        <button onClick={sendMessage}
          style={{
            width: 48, height: 48, borderRadius: '50%', border: 'none',
            background: input.trim() ? '#075E54' : '#B0BEC5',
            color: '#fff', fontSize: 20, cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s', flexShrink: 0
          }}>➤</button>
      </div>
    </div>
  );
}
