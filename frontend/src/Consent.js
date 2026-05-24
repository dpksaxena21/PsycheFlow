import React, { useState } from 'react';
import { supabase } from './supabase';
import { theme as t } from './theme';

const CONSENTS = [
  { id:'ai', title:'AI-assisted assessment', desc:'I understand PsycheFlow uses AI to assist with psychological assessment. AI outputs are not medical diagnoses and are always reviewed by qualified professionals.' },
  { id:'dpdp', title:'DPDP Act 2023 data consent', desc:'I consent to my personal and health data being processed in accordance with India\'s Digital Personal Data Protection Act 2023. I can request deletion at any time.' },
  { id:'crisis', title:'Crisis protocol', desc:'I understand that if I am identified as being at high risk, PsycheFlow will notify my linked psychologist and provide crisis helpline information.' },
  { id:'voluntary', title:'Voluntary participation', desc:'I understand my participation is voluntary and I can withdraw at any time without any consequence to my care.' },
];

export default function Consent({ user, onConsent }) {
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(false);
  const allChecked = CONSENTS.every(c => checked[c.id]);

  const toggle = (id) => setChecked(p => ({ ...p, [id]: !p[id] }));

  const submit = async () => {
    if (!allChecked) return;
    setLoading(true);
    await supabase.from('profiles').update({ consent_given: true, consent_given_at: new Date().toISOString() }).eq('id', user.id);
    onConsent();
  };

  return (
    <div style={{ minHeight:'100vh', background:t.bg, fontFamily:t.font, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:520 }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:32 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:t.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white" opacity="0.9"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <span style={{ fontWeight:700, fontSize:15, letterSpacing:'-0.02em', color:t.navy }}>PsycheFlow</span>
        </div>

        <div style={{ marginBottom:8 }}>
          <div style={{ display:'inline-block', padding:'3px 12px', borderRadius:100, background:t.blue2, color:t.blue, fontSize:11, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:12 }}>Before we begin</div>
          <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.02em', color:t.navy, margin:'0 0 8px', lineHeight:1.15 }}>Your consent matters.</h1>
          <p style={{ fontSize:14, color:t.text2, lineHeight:1.7, margin:0 }}>Please read and agree to the following before using PsycheFlow. This is required by India's DPDP Act 2023.</p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:10, margin:'24px 0' }}>
          {CONSENTS.map(c => (
            <div key={c.id} onClick={() => toggle(c.id)} style={{ background:t.white, borderRadius:12, border:`0.5px solid ${checked[c.id] ? t.blue : t.border}`, padding:16, cursor:'pointer', transition:'all 0.15s', display:'flex', gap:14, alignItems:'flex-start', boxShadow: checked[c.id] ? '0 0 0 3px rgba(29,78,216,0.08)' : 'none' }}>
              <div style={{ width:20, height:20, borderRadius:6, border:`1.5px solid ${checked[c.id] ? t.blue : t.border}`, background: checked[c.id] ? t.blue : t.white, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1, transition:'all 0.15s' }}>
                {checked[c.id] && <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5L4.5 8L9 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:t.navy, marginBottom:4 }}>{c.title}</div>
                <div style={{ fontSize:12, color:t.text2, lineHeight:1.6 }}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={submit} disabled={!allChecked || loading} style={{ ...t.btn, width:'100%', opacity: allChecked ? 1 : 0.4, fontSize:15, padding:'13px 24px', borderRadius:10 }}>
          {loading ? 'Saving...' : 'I agree — continue to PsycheFlow'}
        </button>

        <div style={{ marginTop:16, fontSize:11, color:t.text3, textAlign:'center', lineHeight:1.6 }}>
          Crisis support: iCall 9152987821 · Vandrevala 1860-2662-345
        </div>
      </div>
    </div>
  );
}
