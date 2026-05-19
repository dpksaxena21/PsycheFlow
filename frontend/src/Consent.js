import React, { useState } from 'react';
import { supabase } from './supabase';
import Logo from './Logo';

export default function Consent({ user, onConsent }) {
  const [checked, setChecked] = useState({ c1: false, c2: false, c3: false, c4: false });
  const [loading, setLoading] = useState(false);

  const allChecked = Object.values(checked).every(Boolean);

  const handleConsent = async () => {
    if (!allChecked) return;
    setLoading(true);
    await supabase.from('profiles').upsert({
      id: user.id,
      consent_given: true,
      consent_given_at: new Date().toISOString()
    });
    setLoading(false);
    onConsent();
  };

  const Box = ({ id, children }) => (
    <label onClick={() => setChecked(p => ({ ...p, [id]: !p[id] }))}
      style={{
        display:'flex', alignItems:'flex-start', gap:14, padding:'16px 20px',
        background: checked[id] ? '#F0FDF4' : '#fff',
        border: checked[id] ? '1.5px solid #10B981' : '1.5px solid #E5E7EB',
        borderRadius:12, cursor:'pointer', marginBottom:12, transition:'all 0.2s'
      }}>
      <div style={{
        width:22, height:22, borderRadius:6, flexShrink:0, marginTop:1,
        background: checked[id] ? '#10B981' : '#fff',
        border: checked[id] ? '2px solid #10B981' : '2px solid #D1D5DB',
        display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s'
      }}>
        {checked[id] && <span style={{ color:'#fff', fontSize:13, fontWeight:700 }}>✓</span>}
      </div>
      <span style={{ fontSize:14, color:'#374151', lineHeight:1.6 }}>{children}</span>
    </label>
  );

  return (
    <div style={{
      minHeight:'100vh', background:'#F7F6F3',
      fontFamily:"-apple-system, 'DM Sans', sans-serif",
      display:'flex', alignItems:'center', justifyContent:'center', padding:24
    }}>
      <div style={{ width:'100%', maxWidth:600 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Logo size="md" />
          <h1 style={{
            fontFamily:"'DM Serif Display', Georgia, serif",
            fontSize:28, fontWeight:400, color:'#111827',
            margin:'20px 0 8px'
          }}>Before we begin</h1>
          <p style={{ color:'#6B7280', fontSize:15, margin:0 }}>
            Please read and agree to the following before using PsycheFlow
          </p>
        </div>

        <div style={{
          background:'#fff', borderRadius:20,
          padding:32, boxShadow:'0 4px 24px rgba(0,0,0,0.06)'
        }}>
          <Box id="c1">
            <strong>AI Assessment Disclaimer —</strong> I understand that PsycheFlow uses artificial intelligence for psychological assessment. This is <strong>not a medical diagnosis</strong> and does not replace professional clinical evaluation by a licensed psychologist or psychiatrist.
          </Box>
          <Box id="c2">
            <strong>Data Storage & Privacy —</strong> I consent to PsycheFlow securely storing my assessment data, journal entries, and mood check-ins. This data may be shared with my linked psychologist to support my care. Data is stored in compliance with India's DPDP Act 2023.
          </Box>
          <Box id="c3">
            <strong>Crisis Protocol —</strong> I understand that if PsycheFlow detects a mental health crisis or risk of self-harm, the platform may alert my linked psychologist and display emergency helpline numbers. In severe cases, emergency services may be contacted.
          </Box>
          <Box id="c4">
            <strong>Voluntary Participation —</strong> I understand my participation is voluntary. I can withdraw consent, request data deletion, or stop using the platform at any time by contacting support@psycheflow.in.
          </Box>

          <div style={{
            background:'#FFF7ED', border:'1px solid #FED7AA',
            borderRadius:10, padding:'12px 16px', marginBottom:24, marginTop:8
          }}>
            <p style={{ margin:0, fontSize:13, color:'#92400E' }}>
              🆘 <strong>Crisis Helplines:</strong> iCall — 9152987821 &nbsp;|&nbsp; Vandrevala Foundation — 1860-2662-345 &nbsp;|&nbsp; NIMHANS — 080-46110007
            </p>
          </div>

          <button onClick={handleConsent} disabled={!allChecked || loading}
            style={{
              width:'100%', padding:'14px', borderRadius:12, border:'none',
              background: allChecked ? '#4F46E5' : '#E5E7EB',
              color: allChecked ? '#fff' : '#9CA3AF',
              fontSize:16, fontWeight:600, cursor: allChecked ? 'pointer' : 'not-allowed',
              transition:'all 0.2s'
            }}>
            {loading ? 'Saving...' : allChecked ? 'I Agree — Continue to PsycheFlow →' : 'Please check all boxes to continue'}
          </button>

          <p style={{ textAlign:'center', fontSize:12, color:'#9CA3AF', marginTop:16, marginBottom:0 }}>
            By continuing you agree to our <a href="#" style={{ color:'#4F46E5' }}>Privacy Policy</a> and <a href="#" style={{ color:'#4F46E5' }}>Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}
