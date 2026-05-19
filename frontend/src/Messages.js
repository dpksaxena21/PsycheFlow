import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Chat from './Chat';

export default function Messages({ user, contacts }) {
  const [selected, setSelected] = useState(null);
  const [unread, setUnread] = useState({});

  useEffect(() => {
    fetchUnread();
    const sub = supabase
      .channel('unread')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchUnread();
      })
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const fetchUnread = async () => {
    const { data } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('receiver_id', user.id)
      .eq('read', false);
    const counts = {};
    (data || []).forEach(m => {
      counts[m.sender_id] = (counts[m.sender_id] || 0) + 1;
    });
    setUnread(counts);
  };

  return (
    <div style={{
      display: 'flex', height: '75vh', borderRadius: 16,
      overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
    }}>
      {/* Contact List */}
      <div style={{
        width: 300, background: '#fff', borderRight: '1px solid #E5E7EB',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{
          padding: '16px 20px', background: '#075E54',
          color: '#fff', fontSize: 18, fontWeight: 700
        }}>Messages</div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {contacts.length === 0 ? (
            <div style={{ padding: 24, color: '#6B7280', fontSize: 14, textAlign: 'center' }}>
              No contacts yet. Link a psychologist to start messaging.
            </div>
          ) : contacts.map(c => (
            <div key={c.id} onClick={() => setSelected(c)}
              style={{
                padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid #F3F4F6',
                background: selected?.id === c.id ? '#F0F9F0' : '#fff',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'background 0.15s'
              }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%',
                background: '#075E54', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, flexShrink: 0
              }}>{c.name?.[0]?.toUpperCase() || '?'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#111827', fontSize: 15 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{c.role === 'psychologist' ? 'Your Psychologist' : 'Patient'}</div>
              </div>
              {unread[c.id] > 0 && (
                <div style={{
                  background: '#25D366', color: '#fff', borderRadius: '50%',
                  width: 22, height: 22, fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{unread[c.id]}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1 }}>
        {selected ? (
          <Chat user={user} contactId={selected.id} contactName={selected.name} />
        ) : (
          <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#F0F2F5'
          }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>💬</div>
            <h3 style={{ color: '#374151', margin: 0 }}>PsycheFlow Messaging</h3>
            <p style={{ color: '#6B7280', fontSize: 14 }}>Select a contact to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
