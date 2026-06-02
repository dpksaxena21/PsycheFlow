import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';


function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export default function InvitePatient({ user }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [invites, setInvites] = useState([]);

  useEffect(() => { fetchInvites(); }, []);

  const fetchInvites = async () => {
    const { data } = await supabase
      .from('invites')
      .select('*')
      .eq('psychologist_id', user.id)
      .order('created_at', { ascending: false });
    setInvites(data || []);
  };

  const sendInvite = async () => {
    if (!email.trim()) return;
    setSending(true);
    setMsg('');
    const token = generateToken();
    const inviteLink = `${window.location.origin}?invite=${token}&email=${encodeURIComponent(email)}`;

    const { error } = await supabase.from('invites').insert({
      psychologist_id: user.id,
      patient_email: email.trim(),
      token,
      status: 'pending'
    });

    if (error) {
      setMsg('Failed to create invite: ' + error.message);
    } else {
      // Send email via backend
      try {
        const res = await fetch(API + '/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_email: email.trim(),
            psychologist_name: user.email,
            invite_link: inviteLink
          })
        });
        const result = await res.json();
        if (result.sent) {
          setMsg('Invitation email sent to ' + email.trim() + '!');
        } else {
          setMsg('Invite created! Share this link:\n' + inviteLink);
        }
      } catch(e) {
        setMsg('Invite created! Share this link:\n' + inviteLink);
      }
      setEmail('');
      fetchInvites();
    }
    setSending(false);
  };

  const copyLink = (token, patientEmail) => {
    const link = `${window.location.origin}?invite=${token}&email=${encodeURIComponent(patientEmail)}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const statusColor = { pending: '#f59e0b', accepted: '#10B981', expired: '#ef4444' };

  return (
    <div>
      <h2 style={{ color:'#1e293b', margin:'0 0 24px', fontSize:22 }}>Invite Patient</h2>

      {/* Send Invite */}
      <div style={{
        background:'#fff', borderRadius:16, padding:28,
        boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:28
      }}>
        <h3 style={{ margin:'0 0 16px', color:'#1e293b', fontSize:16 }}>Send Invitation Link</h3>
        <p style={{ fontSize:13, color:'#6B7280', margin:'0 0 16px' }}>
          Enter your patient's email to generate a personal invite link. They'll be guided to create an account and will be automatically linked to you.
        </p>
        <div style={{ display:'flex', gap:12 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="patient@email.com"
            onKeyDown={e => e.key === 'Enter' && sendInvite()}
            style={{
              flex:1, padding:'12px 16px', borderRadius:10,
              border:'1.5px solid #E5E7EB', fontSize:14, outline:'none'
            }} />
          <button onClick={sendInvite} disabled={sending}
            style={{
              padding:'12px 24px', borderRadius:10, border:'none',
              background:'#4F46E5', color:'#fff', fontSize:14,
              fontWeight:600, cursor:'pointer', whiteSpace:'nowrap'
            }}>
            {sending ? 'Creating...' : 'Generate Invite'}
          </button>
        </div>
        {msg && (
          <div style={{
            marginTop:16, padding:'12px 16px', borderRadius:10,
            background: msg.includes('Failed') ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${msg.includes('Failed') ? '#FECACA' : '#BBF7D0'}`,
            fontSize:13, color: msg.includes('Failed') ? '#DC2626' : '#166534',
            whiteSpace:'pre-wrap', wordBreak:'break-all'
          }}>{msg}</div>
        )}
      </div>

      {/* Invite History */}
      <h3 style={{ color:'#1e293b', margin:'0 0 16px', fontSize:16 }}>Sent Invitations</h3>
      {invites.length === 0 ? (
        <div style={{
          background:'#fff', borderRadius:16, padding:40, textAlign:'center',
          boxShadow:'0 2px 12px rgba(0,0,0,0.06)'
        }}>
          <p style={{ color:'#6B7280' }}>No invitations sent yet.</p>
        </div>
      ) : invites.map(inv => (
        <div key={inv.id} style={{
          background:'#fff', borderRadius:14, padding:'16px 20px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.05)', marginBottom:10,
          display:'flex', justifyContent:'space-between', alignItems:'center'
        }}>
          <div>
            <div style={{ fontWeight:600, color:'#1e293b', fontSize:15 }}>{inv.patient_email}</div>
            <div style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>
              Sent: {new Date(inv.created_at).toLocaleDateString('en-IN')} · 
              Expires: {new Date(inv.expires_at).toLocaleDateString('en-IN')}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{
              padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600,
              background: (statusColor[inv.status] || '#6B7280') + '20',
              color: statusColor[inv.status] || '#6B7280'
            }}>{inv.status.toUpperCase()}</span>
            {inv.status === 'pending' && (
              <button onClick={() => copyLink(inv.token, inv.patient_email)}
                style={{
                  padding:'6px 14px', borderRadius:8, border:'1px solid #4F46E5',
                  background:'#fff', color:'#4F46E5', fontSize:13, cursor:'pointer'
                }}>Copy Link</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
