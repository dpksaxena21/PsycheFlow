import React, { useState } from 'react';
import { supabase } from './supabase';
import { theme as t } from './theme';

const STEPS = [
  {
    id:'name', title:"What should we call you?", subtitle:'This is how you\'ll appear in PsycheFlow.',
    type:'text', placeholder:'Your name or nickname', field:'display_name'
  },
  {
    id:'concerns', title:'What brings you here?', subtitle:'Select all that apply. This helps us personalise your experience.',
    type:'multi', field:'concerns',
    options:[
      {id:'anxiety',label:'Anxiety & worry'},{id:'depression',label:'Low mood'},
      {id:'stress',label:'Stress & burnout'},{id:'sleep',label:'Sleep problems'},
      {id:'relationships',label:'Relationships'},{id:'trauma',label:'Trauma & PTSD'},
      {id:'adhd',label:'Focus & ADHD'},{id:'understand',label:'Self-understanding'},
    ]
  },
  {
    id:'urgency', title:'How are you feeling right now?', subtitle:'Be honest — this helps us route you to the right support.',
    type:'single', field:'urgency',
    options:[
      {id:'stable',label:'Stable — just exploring',desc:'I\'m doing okay and want to understand myself better'},
      {id:'struggling',label:'Struggling — need support',desc:'Things are difficult and I could use some help'},
      {id:'high',label:'In distress — need help now',desc:'I\'m going through something serious right now'},
      {id:'crisis',label:'Crisis — need immediate help',desc:'I need urgent mental health support'},
    ]
  },
  {
    id:'goals', title:'What are your goals?', subtitle:'Select what you\'d like to achieve.',
    type:'multi', field:'goals',
    options:[
      {id:'track',label:'Track my mental health'},{id:'understand',label:'Understand myself better'},
      {id:'therapy',label:'Access therapy tools'},{id:'connect',label:'Connect with a psychologist'},
      {id:'manage',label:'Manage symptoms'},{id:'grow',label:'Personal growth'},
    ]
  },
];

export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ display_name:'', concerns:[], urgency:'', goals:[] });
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const canNext = () => {
    if (current.type === 'text') return data.display_name.trim().length > 0;
    if (current.type === 'single') return data[current.field];
    if (current.type === 'multi') return data[current.field].length > 0;
    return true;
  };

  const toggleMulti = (field, id) => {
    setData(p => ({
      ...p,
      [field]: p[field].includes(id) ? p[field].filter(x => x !== id) : [...p[field], id]
    }));
  };

  const next = async () => {
    if (!canNext()) return;
    if (!isLast) { setStep(s => s + 1); return; }
    setLoading(true);
    await supabase.from('profiles').update({
      display_name: data.display_name,
      concerns: data.concerns,
      urgency: data.urgency,
      goals: data.goals,
      onboarded: true,
    }).eq('id', user.id);
    onComplete();
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

        {/* Progress */}
        <div style={{ display:'flex', gap:6, marginBottom:32 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex:1, height:3, borderRadius:100, background: i <= step ? t.blue : t.border, transition:'background 0.3s' }}/>
          ))}
        </div>

        {/* Step counter */}
        <div style={{ fontSize:11, fontWeight:600, color:t.text3, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:8 }}>
          Step {step+1} of {STEPS.length}
        </div>

        <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:'-0.02em', color:t.navy, margin:'0 0 8px', lineHeight:1.2 }}>{current.title}</h1>
        <p style={{ fontSize:14, color:t.text2, lineHeight:1.6, margin:'0 0 24px' }}>{current.subtitle}</p>

        {/* Text input */}
        {current.type === 'text' && (
          <input
            value={data.display_name}
            onChange={e => setData(p => ({...p, display_name: e.target.value}))}
            placeholder={current.placeholder}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && canNext() && next()}
            style={{ width:'100%', padding:'14px 16px', borderRadius:10, border:`0.5px solid ${t.border}`, fontSize:15, fontFamily:t.font, color:t.navy, background:t.white, outline:'none', boxSizing:'border-box', transition:'border-color 0.15s' }}
            onFocus={e => e.target.style.borderColor=t.blue}
            onBlur={e => e.target.style.borderColor=t.border}
          />
        )}

        {/* Single select */}
        {current.type === 'single' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {current.options.map(o => (
              <div key={o.id} onClick={() => setData(p=>({...p,[current.field]:o.id}))}
                style={{ padding:'14px 16px', borderRadius:10, border:`0.5px solid ${data[current.field]===o.id?t.blue:t.border}`, background: data[current.field]===o.id?t.blue2:t.white, cursor:'pointer', transition:'all 0.15s', boxShadow: data[current.field]===o.id?'0 0 0 3px rgba(29,78,216,0.08)':'none' }}>
                <div style={{ fontSize:13, fontWeight:600, color: data[current.field]===o.id?t.blue:t.navy }}>{o.label}</div>
                {o.desc && <div style={{ fontSize:12, color:t.text2, marginTop:3 }}>{o.desc}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Multi select */}
        {current.type === 'multi' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {current.options.map(o => {
              const sel = data[current.field].includes(o.id);
              return (
                <div key={o.id} onClick={() => toggleMulti(current.field, o.id)}
                  style={{ padding:'12px 14px', borderRadius:10, border:`0.5px solid ${sel?t.blue:t.border}`, background:sel?t.blue2:t.white, cursor:'pointer', transition:'all 0.15s', display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:16, height:16, borderRadius:5, border:`1.5px solid ${sel?t.blue:t.border}`, background:sel?t.blue:t.white, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                    {sel && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{ fontSize:13, fontWeight:sel?600:400, color:sel?t.blue:t.navy }}>{o.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display:'flex', gap:10, marginTop:24, alignItems:'center' }}>
          {step > 0 && (
            <button onClick={() => setStep(s=>s-1)} style={{ ...t.btnOutline, padding:'11px 20px' }}>Back</button>
          )}
          <button onClick={next} disabled={!canNext()||loading}
            style={{ ...t.btn, flex:1, opacity:canNext()?1:0.4, fontSize:15, padding:'13px 24px', borderRadius:10 }}>
            {loading ? 'Setting up...' : isLast ? 'Complete setup' : 'Continue'}
          </button>
        </div>

        {/* Crisis redirect */}
        {data.urgency === 'crisis' && (
          <div style={{ marginTop:16, padding:'12px 16px', background:t.dangerBg, borderRadius:10, border:`0.5px solid ${t.danger}` }}>
            <div style={{ fontSize:13, fontWeight:600, color:t.danger, marginBottom:4 }}>You\'re not alone</div>
            <div style={{ fontSize:12, color:'#991B1B', lineHeight:1.6 }}>iCall: 9152987821 · Vandrevala: 1860-2662-345 · NIMHANS: 080-46110007</div>
          </div>
        )}
      </div>
    </div>
  );
}
