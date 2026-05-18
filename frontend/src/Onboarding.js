import React, { useState } from 'react';
import { supabase } from './supabase';
import Logo from './Logo';

const CONCERNS = [
  { id:'anxiety',     emoji:'😰', label:'Anxiety & Worry' },
  { id:'depression',  emoji:'😔', label:'Low Mood & Depression' },
  { id:'stress',      emoji:'😤', label:'Stress & Burnout' },
  { id:'sleep',       emoji:'😴', label:'Sleep Problems' },
  { id:'trauma',      emoji:'💔', label:'Trauma & PTSD' },
  { id:'relationships',emoji:'💭', label:'Relationship Issues' },
  { id:'self_esteem', emoji:'🪞', label:'Self-Esteem & Confidence' },
  { id:'anger',       emoji:'😠', label:'Anger Management' },
  { id:'grief',       emoji:'🕊️', label:'Grief & Loss' },
  { id:'other',       emoji:'🌱', label:'General Wellbeing' },
];

const URGENCY = [
  { id:'low',    emoji:'🌱', label:"I'm doing okay",           desc:'Just want to understand myself better' },
  { id:'medium', emoji:'🌤️', label:'Some days are hard',       desc:'I need tools to cope better' },
  { id:'high',   emoji:'⛈️', label:"I'm really struggling",    desc:'I need support as soon as possible' },
  { id:'crisis', emoji:'🆘', label:'I need help right now',    desc:'I am in crisis or feel unsafe' },
];

const GOALS = [
  { id:'understand', emoji:'🧠', label:'Understand myself better' },
  { id:'manage',     emoji:'🛠️', label:'Manage symptoms' },
  { id:'therapy',    emoji:'🩺', label:'Prepare for therapy' },
  { id:'tools',      emoji:'🌱', label:'Learn coping tools' },
  { id:'track',      emoji:'📊', label:'Track my progress' },
];

export default function Onboarding({ user, onComplete }) {
  const [step, setStep]         = useState(0);
  const [concerns, setConcerns] = useState([]);
  const [urgency, setUrgency]   = useState(null);
  const [goals, setGoals]       = useState([]);
  const [name, setName]         = useState('');

  const totalSteps = 4;
  const progress   = ((step + 1) / totalSteps) * 100;

  const toggleConcern = (id) => {
    setConcerns(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleGoal = (id) => {
    setGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    await supabase.from('profiles').upsert({
      id:           user.id,
      display_name: name.trim() || null,
      concerns,
      urgency,
      goals,
      onboarded:    true,
    });
    onComplete({ name, concerns, urgency, goals });
  };

  const canNext = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return concerns.length > 0;
    if (step === 2) return urgency !== null;
    if (step === 3) return goals.length > 0;
    return true;
  };

  const steps = [
    /* Step 0 — Name */
    <div key="0">
      <h2 style={{ fontFamily:"Georgia,serif", fontSize:28, fontWeight:400,
        color:'#111827', margin:'0 0 8px', letterSpacing:'-0.02em' }}>
        Welcome to PsycheFlow
      </h2>
      <p style={{ fontSize:15, color:'#6B7280', margin:'0 0 32px', lineHeight:1.6 }}>
        You've taken a brave first step. Let's make this feel personal.
      </p>
      <label style={{ fontSize:13, fontWeight:500, color:'#374151',
        display:'block', marginBottom:8 }}>
        What should we call you?
      </label>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && canNext() && setStep(1)}
        placeholder="Your first name or nickname"
        autoFocus
        style={{ width:'100%', padding:'14px 16px', borderRadius:12,
          border:'1.5px solid #E5E7EB', fontSize:16, boxSizing:'border-box',
          outline:'none', color:'#111827', background:'#fff',
          transition:'border-color 0.15s' }}
        onFocus={e => e.target.style.borderColor='#4F46E5'}
        onBlur={e  => e.target.style.borderColor='#E5E7EB'}
      />
      {name && (
        <p style={{ fontSize:14, color:'#10B981', marginTop:12 }}>
          Hi {name} 👋 It's great to meet you.
        </p>
      )}
    </div>,

    /* Step 1 — Concerns */
    <div key="1">
      <h2 style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:400,
        color:'#111827', margin:'0 0 8px', letterSpacing:'-0.02em' }}>
        What brings you here{name ? `, ${name}` : ''}?
      </h2>
      <p style={{ fontSize:14, color:'#6B7280', margin:'0 0 24px' }}>
        Select everything that feels relevant. There are no wrong answers.
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {CONCERNS.map(c => (
          <button key={c.id} onClick={() => toggleConcern(c.id)}
            style={{
              padding:'14px 16px', borderRadius:12, border:'none',
              cursor:'pointer', textAlign:'left', transition:'all 0.15s',
              background: concerns.includes(c.id) ? '#EEF2FF' : '#F9FAFB',
              outline: concerns.includes(c.id) ? '2px solid #4F46E5' : '2px solid transparent',
              transform: concerns.includes(c.id) ? 'scale(1.02)' : 'scale(1)',
            }}>
            <span style={{ fontSize:20, display:'block', marginBottom:4 }}>{c.emoji}</span>
            <span style={{ fontSize:13, fontWeight:500,
              color: concerns.includes(c.id) ? '#4F46E5' : '#374151' }}>
              {c.label}
            </span>
          </button>
        ))}
      </div>
    </div>,

    /* Step 2 — Urgency */
    <div key="2">
      <h2 style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:400,
        color:'#111827', margin:'0 0 8px', letterSpacing:'-0.02em' }}>
        How are you doing right now?
      </h2>
      <p style={{ fontSize:14, color:'#6B7280', margin:'0 0 24px' }}>
        Be honest — this helps us understand what kind of support you need.
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {URGENCY.map(u => (
          <button key={u.id} onClick={() => setUrgency(u.id)}
            style={{
              padding:'16px 20px', borderRadius:14, border:'none',
              cursor:'pointer', textAlign:'left', transition:'all 0.15s',
              background: urgency === u.id ? '#EEF2FF' : '#F9FAFB',
              outline: urgency === u.id ? '2px solid #4F46E5' : '2px solid transparent',
              display:'flex', alignItems:'center', gap:16
            }}>
            <span style={{ fontSize:28 }}>{u.emoji}</span>
            <div>
              <div style={{ fontSize:14, fontWeight:600,
                color: urgency === u.id ? '#4F46E5' : '#111827' }}>
                {u.label}
              </div>
              <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>
                {u.desc}
              </div>
            </div>
          </button>
        ))}
      </div>
      {urgency === 'crisis' && (
        <div style={{ background:'#FEF2F2', borderRadius:12, padding:16,
          marginTop:16, border:'1px solid #FECACA' }}>
          <p style={{ fontSize:13, color:'#DC2626', margin:'0 0 8px', fontWeight:600 }}>
            🆘 Please reach out for immediate support
          </p>
          <p style={{ fontSize:13, color:'#374151', margin:0 }}>
            iCall: <strong>9152987821</strong> · Vandrevala: <strong>1860-2662-345</strong>
          </p>
        </div>
      )}
    </div>,

    /* Step 3 — Goals */
    <div key="3">
      <h2 style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:400,
        color:'#111827', margin:'0 0 8px', letterSpacing:'-0.02em' }}>
        What would you like to achieve?
      </h2>
      <p style={{ fontSize:14, color:'#6B7280', margin:'0 0 24px' }}>
        Choose your goals — we'll personalize your experience around them.
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {GOALS.map(g => (
          <button key={g.id} onClick={() => toggleGoal(g.id)}
            style={{
              padding:'14px 20px', borderRadius:12, border:'none',
              cursor:'pointer', textAlign:'left', transition:'all 0.15s',
              background: goals.includes(g.id) ? '#EEF2FF' : '#F9FAFB',
              outline: goals.includes(g.id) ? '2px solid #4F46E5' : '2px solid transparent',
              display:'flex', alignItems:'center', gap:14
            }}>
            <span style={{ fontSize:22 }}>{g.emoji}</span>
            <span style={{ fontSize:14, fontWeight:500,
              color: goals.includes(g.id) ? '#4F46E5' : '#374151' }}>
              {g.label}
            </span>
            {goals.includes(g.id) && (
              <span style={{ marginLeft:'auto', color:'#4F46E5', fontSize:16 }}>✓</span>
            )}
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#F7F6F3',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:24, fontFamily:"-apple-system,'DM Sans',sans-serif" }}>
      <div style={{ width:'100%', maxWidth:520 }}>

        {/* Logo */}
        <div style={{ marginBottom:32, display:'flex', justifyContent:'center' }}>
          <Logo size="md" />
        </div>

        {/* Progress */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:'flex', justifyContent:'space-between',
            fontSize:12, color:'#9CA3AF', marginBottom:8 }}>
            <span>Step {step + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div style={{ background:'#E5E7EB', borderRadius:6, height:4 }}>
            <div style={{ width:`${progress}%`, background:'#4F46E5',
              height:4, borderRadius:6, transition:'width 0.4s ease' }} />
          </div>
        </div>

        {/* Card */}
        <div style={{ background:'#fff', borderRadius:20, padding:36,
          boxShadow:'0 4px 24px rgba(0,0,0,0.06)',
          border:'1px solid #F3F4F6', marginBottom:20 }}>
          {steps[step]}
        </div>

        {/* Navigation */}
        <div style={{ display:'flex', gap:12 }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              style={{ flex:1, padding:'13px', background:'#fff',
                color:'#6B7280', border:'1.5px solid #E5E7EB',
                borderRadius:12, fontSize:15, cursor:'pointer',
                fontWeight:500 }}>
              ← Back
            </button>
          )}
          <button
            onClick={() => step < totalSteps - 1 ? setStep(step + 1) : handleComplete()}
            disabled={!canNext()}
            style={{
              flex: step > 0 ? 2 : 1,
              padding:'13px',
              background: canNext() ? '#4F46E5' : '#E5E7EB',
              color: canNext() ? '#fff' : '#9CA3AF',
              border:'none', borderRadius:12, fontSize:15,
              cursor: canNext() ? 'pointer' : 'not-allowed',
              fontWeight:600, transition:'all 0.15s'
            }}>
            {step === totalSteps - 1 ? "Let's Begin →" : 'Continue →'}
          </button>
        </div>

        {/* Skip */}
        <p style={{ textAlign:'center', marginTop:16, fontSize:12, color:'#9CA3AF' }}>
          <span style={{ cursor:'pointer', textDecoration:'underline' }}
            onClick={handleComplete}>
            Skip for now
          </span>
          {' · '}You can always update this in settings
        </p>
      </div>
    </div>
  );
}