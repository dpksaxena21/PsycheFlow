import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL as API } from './config';
import { supabase } from './supabase';

// ── Design tokens ─────────────────────────────────────────
const S = {
  navy:'#0C1A2E', blue:'#1D4ED8', bg:'#F8FAFF', white:'#FFFFFF',
  border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8',
  success:'#059669', warning:'#D97706', danger:'#DC2626',
  lightBlue:'#EFF6FF', purple:'#7C3AED',
};

// ── Custom SVG Icons ──────────────────────────────────────
const I = {
  brain:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9.5 2A2.5 2.5 0 007 4.5v1A2.5 2.5 0 004.5 8v1A2.5 2.5 0 002 11.5C2 13 3 14.3 4.5 14.8V17a5 5 0 005 5h5a5 5 0 005-5v-2.2c1.5-.5 2.5-1.8 2.5-3.3A2.5 2.5 0 0019.5 9V8A2.5 2.5 0 0017 5.5v-1A2.5 2.5 0 0014.5 2h-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  wave:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M2 12c0 0 2-4 5-4s4 8 7 8 5-4 5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  anchor:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v13M5 12H2a10 10 0 0020 0h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  star:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  rocket:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 12H4s.55-3.03 2-4h5M12 15v5s3.03-.55 4-2v-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  eye:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>,
  check:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  arrow:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  back:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  clock:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  leaf:     <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 00-10 10c0 4.42 7.5 12 10 12s10-7.58 10-12A10 10 0 0012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  chart:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  target:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>,
  journal:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 7h8M8 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  trend:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 6 23 6 23 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ── ACT Process definitions ───────────────────────────────
const PROCESSES = {
  defusion:        { icon:I.brain,  label:'Cognitive Defusion',  color:'#6366f1', bg:'#EEF2FF', desc:'See thoughts as thoughts, not facts', weekLabel:'Observe Your Mind' },
  acceptance:      { icon:I.wave,   label:'Acceptance',           color:'#0ea5e9', bg:'#E0F2FE', desc:'Make room for difficult feelings',     weekLabel:'Open to Experience' },
  present_moment:  { icon:I.anchor, label:'Present Moment',       color:'#10b981', bg:'#D1FAE5', desc:'Anchor yourself in the now',           weekLabel:'Be Here Now' },
  values:          { icon:I.star,   label:'Values',               color:'#f59e0b', bg:'#FEF3C7', desc:'Clarify what truly matters',           weekLabel:'Know Your North Star' },
  committed_action:{ icon:I.rocket, label:'Committed Action',     color:'#ef4444', bg:'#FEE2E2', desc:'Act on what matters despite obstacles',weekLabel:'Move Toward Values' },
  self_as_context: { icon:I.eye,    label:'Self as Context',      color:'#8b5cf6', bg:'#EDE9FE', desc:'Connect with your observer self',      weekLabel:'The Observing Self' },
};

// ── ACT Journey — 6 weeks ────────────────────────────────
const JOURNEY_WEEKS = [
  { week:1, process:'self_as_context', title:'Meet Your Observer Self', desc:'Learn to watch your thoughts and feelings without being them.' },
  { week:2, process:'defusion',        title:'Unhook From Your Thoughts', desc:'See thoughts as mental events, not facts or commands.' },
  { week:3, process:'acceptance',      title:'Make Room for Feelings', desc:'Stop fighting difficult emotions and learn to hold them lightly.' },
  { week:4, process:'present_moment',  title:'Anchor in the Now', desc:'Come back to the present moment — where life actually happens.' },
  { week:5, process:'values',          title:'Clarify What Matters', desc:'Identify your core values across life domains.' },
  { week:6, process:'committed_action',title:'Move Toward Your Values', desc:'Take meaningful action even in the presence of difficult feelings.' },
];

// ── Life domains for values assessment ───────────────────
const LIFE_DOMAINS = [
  { id:'career',        label:'Career & Work',       desc:'Professional growth, contribution, purpose' },
  { id:'relationships', label:'Relationships',        desc:'Partner, friends, family connections' },
  { id:'health',        label:'Health & Body',        desc:'Physical wellbeing, movement, self-care' },
  { id:'family',        label:'Family',               desc:'Parenting, siblings, parents' },
  { id:'growth',        label:'Personal Growth',      desc:'Learning, creativity, spirituality' },
  { id:'community',     label:'Community',            desc:'Social contribution, belonging, citizenship' },
];

// ── AAQ-II questions ─────────────────────────────────────
const AAQ_QUESTIONS = [
  'My painful experiences and memories make it difficult for me to live a life that I would value.',
  'I\'m afraid of my feelings.',
  'I worry about not being able to control my worries and feelings.',
  'My painful memories prevent me from having a fulfilling life.',
  'Emotions cause problems in my life.',
  'It seems like most people are handling their lives better than I am.',
  'Worries get in the way of my success.',
];

// ── Built-in exercises (fallback if API fails) ────────────
const BUILTIN_EXERCISES = {
  defusion: [
    {
      id:'leaves_stream', title:'Leaves on a Stream', duration:5, process:'defusion',
      suitable_for:['Overthinking','Anxiety','Rumination'],
      description:'Watch your thoughts float by like leaves on a stream.',
      interactive: true,
      interactiveType: 'leaves',
      steps:[
        'Close your eyes and imagine you\'re sitting beside a gently flowing stream.',
        'In a moment, you\'ll type a thought that\'s been bothering you. Then watch it float away on a leaf.',
        'Notice how the thought drifts downstream. You don\'t need to stop it — just observe.',
        'If your mind wanders, gently return to the stream.',
        'Remember: you are the observer on the bank, not the leaf.',
      ]
    },
    {
      id:'passengers_bus', title:'Passengers on a Bus', duration:7, process:'defusion',
      suitable_for:['Self-criticism','Negative thoughts'],
      description:'You\'re the driver. Your thoughts are passengers — noisy but not in control.',
      steps:[
        'Imagine you\'re driving a bus toward what matters to you.',
        'Your difficult thoughts are passengers — they\'re loud, critical, and demanding.',
        'They say things like "You can\'t do this" or "Turn back now."',
        'Notice that you\'re the driver. The passengers can talk, but they don\'t steer.',
        'Keep driving toward your destination. The passengers will quiet down eventually.',
      ]
    },
    {
      id:'radio_static', title:'Radio Static', duration:4, process:'defusion',
      suitable_for:['Worry','Intrusive thoughts'],
      description:'Your mind is a radio. You can turn down the volume.',
      steps:[
        'Notice the thought that\'s bothering you right now.',
        'Imagine it being broadcast over a radio in the background of the room.',
        'Now imagine slowly turning down the volume knob.',
        'The thought is still there — but it\'s quieter. It\'s just background noise.',
        'You can act on what matters without the radio being silent first.',
      ]
    },
  ],
  acceptance: [
    {
      id:'expansion', title:'Expansion Technique', duration:6, process:'acceptance',
      suitable_for:['Anxiety','Grief','Difficult emotions'],
      description:'Make room for difficult feelings instead of fighting them.',
      steps:[
        'Notice where you feel the emotion in your body. Chest? Stomach? Throat?',
        'Breathe into that area — imagine your breath flowing directly to that space.',
        'Create space around the feeling. Give it room to exist without fighting it.',
        'Observe it with curiosity: what shape is it? Does it have a color or texture?',
        'Say to yourself: "I can make room for this feeling. It doesn\'t control me."',
      ]
    },
    {
      id:'milk_milk', title:'Word Repetition (Milk, Milk)', duration:3, process:'acceptance',
      suitable_for:['Fusion with thoughts','Self-judgment'],
      description:'Drain the power from difficult words by repeating them.',
      steps:[
        'Think of a self-critical label you often apply to yourself ("I\'m stupid", "I\'m worthless").',
        'Now say that word out loud, slowly, 30 times in a row.',
        'Notice how the word starts to lose its meaning and emotional charge.',
        'This is what defusion feels like — the word is just a sound.',
        'The label doesn\'t define you. It\'s just a word your mind learned to use.',
      ]
    },
  ],
  present_moment: [
    {
      id:'five_senses', title:'5-4-3-2-1 Grounding', duration:4, process:'present_moment',
      suitable_for:['Anxiety','Dissociation','Panic'],
      description:'Anchor yourself in the present through your senses.',
      steps:[
        'Look around and name 5 things you can SEE right now.',
        'Notice 4 things you can physically TOUCH — feel their texture.',
        'Listen and identify 3 sounds you can HEAR in this moment.',
        'Find 2 things you can SMELL — or notice the smell of the air.',
        'Notice 1 thing you can TASTE. Take a breath. You are here, now.',
      ]
    },
    {
      id:'box_breathing', title:'Box Breathing', duration:5, process:'present_moment',
      suitable_for:['Stress','Overwhelm','Anxiety'],
      description:'Use your breath to anchor in the present moment.',
      interactive: true,
      interactiveType: 'breathing',
      steps:[
        'Inhale slowly for 4 counts. Feel your chest and belly rise.',
        'Hold your breath for 4 counts. Feel the stillness.',
        'Exhale slowly for 4 counts. Let everything release.',
        'Hold empty for 4 counts. Notice the quiet.',
        'Repeat 4 times. Your nervous system is resetting.',
      ]
    },
  ],
  values: [
    {
      id:'values_clarification', title:'Values Clarification', duration:10, process:'values',
      suitable_for:['Feeling lost','Life direction','Motivation'],
      description:'Identify what truly matters across the key areas of your life.',
      steps:[
        'Think about the person you want to be, not the person you think you should be.',
        'In your relationships — what kind of partner, friend, or family member do you want to be?',
        'In your work — what quality of contribution matters most to you?',
        'In your health — what does taking care of your body mean to you?',
        'Write down one value for each area. These are your compass points.',
      ]
    },
    {
      id:'funeral_exercise', title:'The Observer Exercise', duration:8, process:'values',
      suitable_for:['Life direction','Priorities'],
      description:'Clarify your values by imagining how you want to be remembered.',
      steps:[
        'Imagine looking back on your life from a peaceful place at the very end.',
        'What do you hope people remembered about the way you treated them?',
        'What qualities do you hope you embodied — kindness, courage, honesty?',
        'What moments do you hope defined your relationships?',
        'The answers reveal your deepest values. Let them guide your choices today.',
      ]
    },
  ],
  committed_action: [
    {
      id:'one_step', title:'The One Small Step', duration:5, process:'committed_action',
      suitable_for:['Avoidance','Procrastination','Overwhelm'],
      description:'Take one concrete step toward what matters, despite discomfort.',
      steps:[
        'Think of one value you identified — something that genuinely matters to you.',
        'Think of one concrete action you\'ve been avoiding that aligns with this value.',
        'Notice the thoughts and feelings showing up as you think about it.',
        'Commit to doing one small version of this action in the next 24 hours.',
        'Remember: action comes before motivation, not after. Begin anyway.',
      ]
    },
    {
      id:'act_matrix', title:'The ACT Matrix', duration:10, process:'committed_action',
      suitable_for:['Avoidance','Clarity','Values alignment'],
      description:'Map your away-from moves and toward-values moves.',
      steps:[
        'Draw a cross on paper — four quadrants.',
        'Top right: What do you do that moves TOWARD your values?',
        'Bottom right: Who and what matters to you most? (values and people)',
        'Bottom left: What feelings and thoughts you move AWAY from?',
        'Top left: What do you do to move AWAY from discomfort? (avoidance behaviors)',
        'Now ask: which quadrant do you want to spend more time in?',
      ]
    },
  ],
  self_as_context: [
    {
      id:'observer_self', title:'The Observing Self', duration:8, process:'self_as_context',
      suitable_for:['Anxiety','Self-criticism','Emotional overwhelm'],
      description:'Connect with the part of you that watches — unchanging and stable.',
      steps:[
        'Close your eyes. Notice that right now, you are aware. Something is watching.',
        'You\'ve had thousands of thoughts this week. You are not any one of them.',
        'You\'ve had many emotions this year. You are not any of them — you noticed them.',
        'This noticing part of you — your observer self — has been there since childhood.',
        'From this stable place, you can hold any thought or feeling without being overwhelmed.',
      ]
    },
    {
      id:'sky_weather', title:'Sky and Weather', duration:6, process:'self_as_context',
      suitable_for:['Emotional reactivity','Overwhelm'],
      description:'You are the sky. Your thoughts and feelings are the weather.',
      steps:[
        'Imagine the sky on a stormy day — dark clouds, lightning, wind.',
        'Now remember: the sky is never damaged by the storm. It holds the weather.',
        'Your thoughts and feelings are like weather. They change constantly.',
        'You are like the sky — vast, unchanging, the space in which weather appears.',
        'No storm lasts forever. And the sky is always there when the clouds clear.',
      ]
    },
  ],
};

// ── Journal to ACT process mapping ────────────────────────
const JOURNAL_ACT_MAP = {
  'failure':         'defusion',
  'worthless':       'defusion',
  'stupid':          'defusion',
  'can\'t stop':     'defusion',
  'keep thinking':   'defusion',
  'avoid':           'acceptance',
  'can\'t feel':     'acceptance',
  'numb':            'acceptance',
  'scared':          'acceptance',
  'don\'t know':     'values',
  'lost':            'values',
  'no point':        'values',
  'procrastinate':   'committed_action',
  'never do':        'committed_action',
  'overwhelmed':     'present_moment',
  'can\'t focus':    'present_moment',
  'anxious':         'present_moment',
};

function detectACTProcess(journalText) {
  if (!journalText) return null;
  const lower = journalText.toLowerCase();
  for (const [keyword, process] of Object.entries(JOURNAL_ACT_MAP)) {
    if (lower.includes(keyword)) return process;
  }
  return null;
}

// ── Interactive Leaves Exercise ───────────────────────────
function LeavesExercise({ onDone }) {
  const [thought, setThought] = useState('');
  const [leaves, setLeaves] = useState([]);
  const [inputVal, setInputVal] = useState('');

  const addLeaf = () => {
    if (!inputVal.trim()) return;
    const newLeaf = { id:Date.now(), text:inputVal, x:Math.random()*60+20, delay:Math.random()*2 };
    setLeaves(l => [...l, newLeaf]);
    setThought(inputVal);
    setInputVal('');
    setTimeout(() => setLeaves(l => l.filter(leaf => leaf.id !== newLeaf.id)), 6000);
  };

  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ background:'linear-gradient(to bottom, #93C5FD, #BFDBFE)', borderRadius:16, padding:24, marginBottom:20, position:'relative', overflow:'hidden', minHeight:160 }}>
        <div style={{ fontSize:13, color:S.navy, fontWeight:600, marginBottom:12 }}>The stream flows below...</div>
        {leaves.map(leaf => (
          <div key={leaf.id} style={{ position:'absolute', top:'20%', left:`${leaf.x}%`, background:'#86efac', borderRadius:100, padding:'4px 12px', fontSize:12, color:S.navy, animation:`floatLeaf 6s linear forwards`, animationDelay:`${leaf.delay}s`, whiteSpace:'nowrap', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis' }}>
            {leaf.text}
          </div>
        ))}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:40, background:'rgba(147,197,253,0.6)', borderRadius:'0 0 16px 16px' }}/>
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <input value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addLeaf()}
          placeholder="Type a thought that's been bothering you..."
          style={{ flex:1, padding:'10px 14px', borderRadius:8, border:`1px solid ${S.border}`, fontSize:14, outline:'none', fontFamily:'inherit' }}/>
        <button onClick={addLeaf} style={{ padding:'10px 16px', background:S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:600 }}>
          Place on leaf
        </button>
      </div>
      {thought && <p style={{ fontSize:13, color:S.muted, fontStyle:'italic' }}>Watch "{thought}" float away...</p>}
      <button onClick={onDone} style={{ marginTop:12, padding:'10px 24px', background:S.success, color:'#fff', border:'none', borderRadius:8, fontSize:14, cursor:'pointer', fontWeight:600 }}>Complete Exercise</button>
      <style>{`@keyframes floatLeaf { from{transform:translateX(0) translateY(0);opacity:1} to{transform:translateX(200px) translateY(30px);opacity:0} }`}</style>
    </div>
  );
}

// ── Interactive Breathing Exercise ────────────────────────
function BreathingExercise({ onDone }) {
  const [phase, setPhase] = useState('inhale');
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    const phases = ['inhale','hold','exhale','holdEmpty'];
    const phaseDurations = { inhale:4, hold:4, exhale:4, holdEmpty:4 };
    let currentPhase = 0;
    let currentCount = 4;
    const interval = setInterval(() => {
      currentCount--;
      if (currentCount === 0) {
        currentPhase = (currentPhase + 1) % 4;
        if (currentPhase === 0) setCycles(c => c + 1);
        currentCount = 4;
        setPhase(phases[currentPhase]);
      }
      setCount(currentCount);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const phaseColor = { inhale:S.blue, hold:'#7C3AED', exhale:S.success, holdEmpty:S.muted };
  const phaseLabel = { inhale:'Breathe In', hold:'Hold', exhale:'Breathe Out', holdEmpty:'Hold Empty' };
  const phaseSize = { inhale:1.4, hold:1.4, exhale:1.0, holdEmpty:1.0 };

  return (
    <div style={{ textAlign:'center', padding:'20px 0' }}>
      <div style={{ width:120, height:120, borderRadius:'50%', background:`${phaseColor[phase]}20`, border:`2px solid ${phaseColor[phase]}40`, margin:'0 auto 24px', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 1s ease', transform:`scale(${phaseSize[phase]})` }}>
        <div style={{ width:60, height:60, borderRadius:'50%', background:phaseColor[phase], transition:'all 1s ease', opacity:0.8 }}/>
      </div>
      <div style={{ fontSize:22, fontWeight:700, color:phaseColor[phase], marginBottom:8, transition:'color 1s' }}>{phaseLabel[phase]}</div>
      <div style={{ fontSize:48, fontWeight:700, color:S.navy, marginBottom:8 }}>{count}</div>
      <div style={{ fontSize:13, color:S.muted, marginBottom:24 }}>Cycle {cycles + 1} of 4</div>
      {cycles >= 4 && (
        <button onClick={onDone} style={{ padding:'12px 32px', background:S.success, color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:600, cursor:'pointer' }}>
          Complete
        </button>
      )}
    </div>
  );
}

// ── Exercise Player ───────────────────────────────────────
function ExercisePlayer({ exercise, onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showInteractive, setShowInteractive] = useState(false);
  const process = PROCESSES[exercise.process];

  const submitFeedback = async (helpful) => {
    setFeedback(helpful);
    try { await axios.post(API + '/act/feedback', { exercise_id:exercise.id, helpful }); } catch {}
    setDone(true);
  };

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", maxWidth:580, margin:'0 auto' }}>
      <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'transparent', border:`1px solid ${S.border}`, borderRadius:8, cursor:'pointer', fontSize:13, color:S.muted, marginBottom:20, fontFamily:'inherit' }}>
        {I.back} Back
      </button>
      <div style={{ background:S.white, borderRadius:20, border:`1px solid ${S.border}`, overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
        {/* Header */}
        <div style={{ background:process?.bg||'#EEF2FF', padding:'20px 24px', borderBottom:`1px solid ${S.border}` }}>
          <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:4 }}>
            <div style={{ color:process?.color||S.blue }}>{process?.icon}</div>
            <span style={{ fontSize:11, fontWeight:700, color:process?.color||S.blue, textTransform:'uppercase', letterSpacing:'0.06em' }}>{process?.label}</span>
            <span style={{ fontSize:11, color:S.hint, display:'flex', alignItems:'center', gap:3 }}>{I.clock} {exercise.duration} min</span>
          </div>
          <h2 style={{ margin:0, color:S.navy, fontSize:20, fontWeight:700, letterSpacing:'-0.02em' }}>{exercise.title}</h2>
        </div>
        <div style={{ padding:24 }}>
          {/* Progress */}
          <div style={{ height:4, borderRadius:2, background:S.border, marginBottom:24 }}>
            <div style={{ height:4, borderRadius:2, background:process?.color||S.blue, width:`${((step+1)/exercise.steps.length)*100}%`, transition:'width 0.3s ease' }}/>
          </div>

          {!done ? (
            <div>
              {/* Interactive mode */}
              {exercise.interactive && showInteractive ? (
                <div>
                  {exercise.interactiveType === 'leaves' && <LeavesExercise onDone={()=>submitFeedback(true)}/>}
                  {exercise.interactiveType === 'breathing' && <BreathingExercise onDone={()=>submitFeedback(true)}/>}
                </div>
              ) : (
                <div>
                  <div style={{ background:S.bg, borderRadius:12, padding:24, marginBottom:20, minHeight:100 }}>
                    <div style={{ fontSize:11, color:S.hint, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Step {step+1} of {exercise.steps.length}</div>
                    <p style={{ fontSize:17, color:S.navy, lineHeight:1.75, margin:0, fontWeight:400 }}>{exercise.steps[step]}</p>
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    {step > 0 && (
                      <button onClick={()=>setStep(step-1)} style={{ flex:1, padding:'12px', background:S.bg, color:S.muted, border:`1px solid ${S.border}`, borderRadius:10, cursor:'pointer', fontSize:14, fontFamily:'inherit' }}>
                        ← Previous
                      </button>
                    )}
                    {step < exercise.steps.length - 1 ? (
                      <button onClick={()=>setStep(step+1)} style={{ flex:2, padding:'12px', background:process?.color||S.blue, color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:600, fontFamily:'inherit' }}>
                        Next Step →
                      </button>
                    ) : (
                      <div style={{ flex:2 }}>
                        {exercise.interactive && (
                          <button onClick={()=>setShowInteractive(true)} style={{ width:'100%', padding:'12px', background:process?.color||S.blue, color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:600, fontFamily:'inherit', marginBottom:10 }}>
                            Try Interactive Mode →
                          </button>
                        )}
                        <div style={{ fontSize:13, color:S.muted, textAlign:'center', marginBottom:10 }}>Was this exercise helpful?</div>
                        <div style={{ display:'flex', gap:10 }}>
                          <button onClick={()=>submitFeedback(true)} style={{ flex:1, padding:'11px', background:S.success, color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:500, fontFamily:'inherit' }}>Yes, helpful</button>
                          <button onClick={()=>submitFeedback(false)} style={{ flex:1, padding:'11px', background:S.bg, color:S.muted, border:`1px solid ${S.border}`, borderRadius:10, cursor:'pointer', fontSize:14, fontFamily:'inherit' }}>Not really</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:feedback?'#ECFDF5':'#EFF6FF', border:`2px solid ${feedback?'#A7F3D0':'#BFDBFE'}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:feedback?S.success:S.blue }}>
                {feedback ? I.check : I.chart}
              </div>
              <h3 style={{ color:S.navy, marginBottom:8 }}>{feedback ? 'Well done.' : 'Thank you for the feedback.'}</h3>
              <p style={{ color:S.muted, fontSize:14, lineHeight:1.6, marginBottom:24 }}>
                {feedback ? 'You just practiced psychological flexibility. Every practice session builds the skill.' : 'Your feedback helps us recommend better exercises.'}
              </p>
              <button onClick={onComplete} style={{ padding:'12px 32px', background:S.blue, color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:600, fontFamily:'inherit' }}>
                Back to ACT Engine
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Exercise Card ─────────────────────────────────────────
function ExerciseCard({ exercise, onStart }) {
  const process = PROCESSES[exercise.process];
  return (
    <div style={{ background:S.white, borderRadius:14, padding:20, border:`1px solid ${S.border}`, transition:'all 0.15s', cursor:'pointer' }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor=process?.color||S.blue; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor=S.border; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div style={{ flex:1, paddingRight:12 }}>
          <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:4 }}>
            <div style={{ color:process?.color||S.blue }}>{process?.icon}</div>
            <span style={{ fontSize:10, fontWeight:700, color:process?.color||S.blue, textTransform:'uppercase', letterSpacing:'0.06em' }}>{process?.label}</span>
            {exercise.interactive && <span style={{ fontSize:9, background:'#EDE9FE', color:'#7C3AED', padding:'1px 6px', borderRadius:100, fontWeight:600 }}>Interactive</span>}
          </div>
          <h3 style={{ margin:'0 0 4px', color:S.navy, fontSize:15, fontWeight:700, letterSpacing:'-0.01em' }}>{exercise.title}</h3>
          <p style={{ margin:0, fontSize:13, color:S.muted, lineHeight:1.5 }}>{exercise.description}</p>
        </div>
        <span style={{ fontSize:11, color:S.muted, display:'flex', alignItems:'center', gap:3, flexShrink:0 }}>{I.clock} {exercise.duration}m</span>
      </div>
      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:14 }}>
        {exercise.suitable_for?.map((tag,i)=>(
          <span key={i} style={{ background:S.bg, color:S.muted, padding:'2px 8px', borderRadius:100, fontSize:11 }}>{tag}</span>
        ))}
      </div>
      <button onClick={()=>onStart(exercise)} style={{ width:'100%', padding:'11px', background:process?.color||S.blue, color:'#fff', border:'none', borderRadius:9, cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
        Start Exercise {I.arrow}
      </button>
    </div>
  );
}

// ── ACT Profile Scores ────────────────────────────────────
function ACTProfile({ scores, compact=false }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:compact?'repeat(3,1fr)':'repeat(2,1fr)', gap:compact?8:12 }}>
      {Object.entries(PROCESSES).map(([key, info])=>{
        const score = scores?.[key] || Math.floor(Math.random()*40+40);
        const level = score >= 75 ? 'Strong' : score >= 50 ? 'Developing' : 'Needs Attention';
        const levelColor = score >= 75 ? S.success : score >= 50 ? S.warning : S.danger;
        return (
          <div key={key} style={{ background:S.white, borderRadius:10, padding:compact?10:14, border:`1px solid ${S.border}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <div style={{ color:info.color }}>{React.cloneElement(info.icon, { width:14, height:14 })}</div>
                <span style={{ fontSize:compact?10:11, fontWeight:600, color:S.navy }}>{info.label.split(' ')[0]}</span>
              </div>
              <span style={{ fontSize:12, fontWeight:700, color:levelColor }}>{score}%</span>
            </div>
            <div style={{ height:5, borderRadius:3, background:S.border }}>
              <div style={{ height:5, borderRadius:3, background:info.color, width:`${score}%`, transition:'width 0.8s ease' }}/>
            </div>
            {!compact && <div style={{ fontSize:10, color:levelColor, marginTop:4, fontWeight:500 }}>{level}</div>}
          </div>
        );
      })}
    </div>
  );
}

// ── Values Assessment ─────────────────────────────────────
function ValuesAssessment({ onComplete }) {
  const [values, setValues] = useState({});

  const setDomain = (id, field, val) => {
    setValues(v => ({ ...v, [id]: { ...(v[id]||{}), [field]:val } }));
  };

  const complete = () => {
    onComplete(values);
  };

  const allFilled = LIFE_DOMAINS.every(d => values[d.id]?.importance && values[d.id]?.alignment);

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h3 style={{ fontSize:18, fontWeight:700, color:S.navy, margin:'0 0 6px', letterSpacing:'-0.01em' }}>Values Assessment</h3>
        <p style={{ fontSize:13, color:S.muted, margin:0, lineHeight:1.6 }}>For each life domain, rate how important it is to you and how aligned your current life is with it.</p>
      </div>
      {LIFE_DOMAINS.map(domain=>{
        const val = values[domain.id] || {};
        const gap = val.importance && val.alignment ? val.importance - val.alignment : 0;
        return (
          <div key={domain.id} style={{ background:S.white, borderRadius:12, padding:18, marginBottom:10, border:`1px solid ${gap>3?S.warning:S.border}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:S.navy }}>{domain.label}</div>
                <div style={{ fontSize:12, color:S.muted }}>{domain.desc}</div>
              </div>
              {gap > 3 && <span style={{ fontSize:10, fontWeight:700, color:S.warning, background:'#FFFBEB', padding:'2px 8px', borderRadius:100 }}>Values gap</span>}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <div style={{ fontSize:11, color:S.muted, marginBottom:6 }}>How important? {val.importance && <strong style={{ color:S.navy }}>{val.importance}/10</strong>}</div>
                <input type="range" min={1} max={10} value={val.importance||5} onChange={e=>setDomain(domain.id,'importance',parseInt(e.target.value))}
                  style={{ width:'100%', cursor:'pointer' }}/>
              </div>
              <div>
                <div style={{ fontSize:11, color:S.muted, marginBottom:6 }}>How aligned? {val.alignment && <strong style={{ color:S.navy }}>{val.alignment}/10</strong>}</div>
                <input type="range" min={1} max={10} value={val.alignment||5} onChange={e=>setDomain(domain.id,'alignment',parseInt(e.target.value))}
                  style={{ width:'100%', cursor:'pointer' }}/>
              </div>
            </div>
          </div>
        );
      })}
      <button onClick={complete} disabled={!allFilled}
        style={{ width:'100%', padding:'13px', background:allFilled?S.blue:'#CBD5E1', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:allFilled?'pointer':'not-allowed', fontFamily:'inherit', marginTop:8 }}>
        See My Values Map →
      </button>
    </div>
  );
}

// ── AAQ Assessment ────────────────────────────────────────
function AAQAssessment({ onComplete }) {
  const [answers, setAnswers] = useState(Array(7).fill(4));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(API + '/act/aaq-score', { answers });
      setResult(res.data);
    } catch {
      const total = answers.reduce((s,a)=>s+a,0);
      setResult({
        total_score: total, level: total<=18?'High Flexibility':total<=28?'Moderate Flexibility':'Low Flexibility',
        psychologically_flexible: total<=18,
        interpretation: total<=18?'You show good psychological flexibility. Keep practicing ACT skills to maintain this.':total<=28?'You show moderate flexibility. Regular ACT practice can help you respond more flexibly to difficult thoughts and feelings.':'Your scores suggest psychological inflexibility may be limiting your life. ACT exercises are strongly recommended.',
        act_indicated: total>18,
      });
    }
    setLoading(false);
  };

  if (result) return (
    <div style={{ background:S.white, borderRadius:14, padding:28, border:`1px solid ${S.border}`, textAlign:'center' }}>
      <div style={{ fontSize:56, fontWeight:700, color:result.psychologically_flexible?S.success:S.warning, letterSpacing:'-0.04em', marginBottom:4 }}>
        {result.total_score}<span style={{ fontSize:22, color:S.hint }}>/49</span>
      </div>
      <div style={{ fontSize:18, fontWeight:700, color:S.navy, marginBottom:10 }}>{result.level}</div>
      <p style={{ fontSize:14, color:S.muted, lineHeight:1.7, marginBottom:20, maxWidth:400, margin:'0 auto 20px' }}>{result.interpretation}</p>
      {result.act_indicated && (
        <div style={{ background:'#FFFBEB', borderRadius:10, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#92400e', border:'1px solid #FDE68A' }}>
          Regular ACT practice is recommended. Start with the Acceptance or Defusion exercises.
        </div>
      )}
      <button onClick={onComplete} style={{ padding:'11px 28px', background:S.blue, color:'#fff', border:'none', borderRadius:9, cursor:'pointer', fontSize:14, fontWeight:600, fontFamily:'inherit' }}>
        Start Practicing →
      </button>
    </div>
  );

  return (
    <div style={{ background:S.white, borderRadius:14, padding:24, border:`1px solid ${S.border}` }}>
      <h3 style={{ margin:'0 0 6px', color:S.navy, fontSize:16, fontWeight:700 }}>AAQ-II: Psychological Flexibility</h3>
      <p style={{ fontSize:13, color:S.muted, marginBottom:24, lineHeight:1.6 }}>Rate each statement from 1 (Never true) to 7 (Always true). This takes about 2 minutes.</p>
      {AAQ_QUESTIONS.map((q,i)=>(
        <div key={i} style={{ marginBottom:20 }}>
          <p style={{ fontSize:14, color:S.navy, margin:'0 0 10px', lineHeight:1.5 }}>{i+1}. {q}</p>
          <div style={{ display:'flex', gap:4 }}>
            {[1,2,3,4,5,6,7].map(val=>(
              <button key={val} onClick={()=>{ const a=[...answers]; a[i]=val; setAnswers(a); }}
                style={{ flex:1, padding:'8px 4px', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:answers[i]===val?700:400, background:answers[i]===val?S.blue:'#F1F5F9', color:answers[i]===val?'#fff':S.muted, transition:'all 0.1s', fontFamily:'inherit' }}>
                {val}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:S.hint, marginTop:3 }}>
            <span>Never true</span><span>Always true</span>
          </div>
        </div>
      ))}
      <button onClick={submit} disabled={loading} style={{ width:'100%', padding:'12px', background:S.blue, color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:600, fontFamily:'inherit' }}>
        {loading?'Calculating...':'Get My Flexibility Score'}
      </button>
    </div>
  );
}

// ── Psychological Flexibility Score Ring ──────────────────
function FlexScore({ score }) {
  const r = 44, circ = 2*Math.PI*r;
  const dash = (score/100)*circ;
  const color = score>=75?S.success:score>=50?S.warning:S.danger;
  return (
    <div style={{ position:'relative', width:120, height:120 }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke={S.border} strokeWidth="8"/>
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition:'stroke-dasharray 1s ease' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:22, fontWeight:700, color, lineHeight:1 }}>{score}</div>
        <div style={{ fontSize:9, color:S.hint, marginTop:2 }}>Flexibility</div>
      </div>
    </div>
  );
}

// ── Main ACT Engine ───────────────────────────────────────
export default function ACTEngine({ user, phqScore, gadScore, condition, latestJournal }) {
  const [exercises, setExercises] = useState(BUILTIN_EXERCISES);
  const [recommended, setRecommended] = useState(null);
  const [activeProcess, setActiveProcess] = useState(null);
  const [activeExercise, setActiveExercise] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [actScores, setActScores] = useState({ defusion:58, acceptance:42, present_moment:65, values:72, committed_action:38, self_as_context:55 });
  const [flexScore, setFlexScore] = useState(55);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [valuesData, setValuesData] = useState(null);
  const [journalProcess, setJournalProcess] = useState(null);

  useEffect(() => {
    fetchData();
    // Detect ACT process from journal
    if (latestJournal) {
      const detected = detectACTProcess(latestJournal);
      if (detected) setJournalProcess(detected);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [exRes, recRes] = await Promise.all([
        axios.get(API + '/act/exercises'),
        axios.post(API + '/act/recommend', { condition:condition||'normal', phq_score:phqScore||0, gad_score:gadScore||0, journal_risk:{}, days_since_last:1 }),
      ]);
      setExercises(exRes.data || BUILTIN_EXERCISES);
      setRecommended(recRes.data);
    } catch { setExercises(BUILTIN_EXERCISES); }
    setLoading(false);
  };

  // JITAI trigger engine
  const getTriggerRecommendation = () => {
    if (phqScore >= 15) return { process:'acceptance', reason:'High depression indicators — acceptance exercises can help.' };
    if (gadScore >= 15) return { process:'defusion', reason:'High anxiety detected — defusion can help unhook from anxious thoughts.' };
    if (journalProcess) return { process:journalProcess, reason:`Your recent journal suggests ${PROCESSES[journalProcess]?.label} exercises may help.` };
    const lowest = Object.entries(actScores).sort((a,b)=>a[1]-b[1])[0];
    return { process:lowest[0], reason:`${PROCESSES[lowest[0]]?.label} is your lowest-scoring area. Practice here.` };
  };

  const trigger = getTriggerRecommendation();
  const triggerProcess = PROCESSES[trigger.process];

  if (activeExercise) return (
    <ExercisePlayer exercise={activeExercise} onBack={()=>setActiveExercise(null)} onComplete={()=>setActiveExercise(null)}/>
  );

  const tabs = [
    { id:'home', label:'Home' },
    { id:'journey', label:'My Journey' },
    { id:'library', label:'Exercises' },
    { id:'values', label:'Values' },
    { id:'profile', label:'ACT Profile' },
    { id:'aaq', label:'Flexibility Score' },
  ];

  return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", maxWidth:720, margin:'0 auto', padding:24 }}>

      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:4 }}>
          <div style={{ color:S.blue }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22V12M12 12C12 12 7 9 7 5a5 5 0 0110 0c0 4-5 7-5 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12C12 12 17 9 17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <h2 style={{ color:S.navy, margin:0, fontSize:20, fontWeight:700, letterSpacing:'-0.02em' }}>ACT Engine</h2>
        </div>
        <p style={{ color:S.muted, fontSize:13, margin:0 }}>Acceptance and Commitment Therapy — Build Psychological Flexibility</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, overflowX:'auto', marginBottom:20, paddingBottom:4 }}>
        {tabs.map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
            style={{ padding:'8px 14px', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:activeTab===tab.id?700:400, background:activeTab===tab.id?S.blue:'transparent', color:activeTab===tab.id?'#fff':S.muted, whiteSpace:'nowrap', fontFamily:'inherit', transition:'all 0.15s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── HOME TAB ── */}
      {activeTab === 'home' && (
        <div>
          {/* Flex score + profile */}
          <div style={{ background:S.navy, borderRadius:16, padding:24, marginBottom:16, display:'flex', gap:20, alignItems:'center' }}>
            <FlexScore score={flexScore}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Psychological Flexibility</div>
              <div style={{ fontSize:18, fontWeight:700, color:'#fff', marginBottom:8 }}>{flexScore>=75?'Strong':'Developing'}</div>
              <ACTProfile scores={actScores} compact={true}/>
            </div>
          </div>

          {/* JITAI — intelligent recommendation */}
          <div style={{ background:triggerProcess?.bg||S.lightBlue, borderRadius:14, padding:18, marginBottom:16, border:`1px solid ${triggerProcess?.color||S.blue}30` }}>
            <div style={{ fontSize:11, fontWeight:700, color:triggerProcess?.color||S.blue, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
              Recommended for You Now
            </div>
            <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
              <div style={{ color:triggerProcess?.color||S.blue }}>{triggerProcess?.icon}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:S.navy }}>{triggerProcess?.label}</div>
                <div style={{ fontSize:12, color:S.muted }}>{trigger.reason}</div>
              </div>
            </div>
            {BUILTIN_EXERCISES[trigger.process]?.[0] && (
              <button onClick={()=>setActiveExercise(BUILTIN_EXERCISES[trigger.process][0])}
                style={{ padding:'10px 18px', background:triggerProcess?.color||S.blue, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                Start: {BUILTIN_EXERCISES[trigger.process][0].title} →
              </button>
            )}
          </div>

          {/* Journal connection */}
          {journalProcess && (
            <div style={{ background:'#EFF6FF', borderRadius:12, padding:14, marginBottom:16, border:`1px solid #BFDBFE`, display:'flex', gap:10, alignItems:'flex-start' }}>
              <div style={{ color:S.blue, flexShrink:0 }}>{I.journal}</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:S.blue, marginBottom:3 }}>Journal Intelligence</div>
                <div style={{ fontSize:13, color:S.muted }}>Your recent journal suggests <strong>{PROCESSES[journalProcess]?.label}</strong> exercises may be particularly helpful right now.</div>
              </div>
            </div>
          )}

          {/* 6 processes grid */}
          <div style={{ fontSize:13, fontWeight:700, color:S.navy, marginBottom:12 }}>The 6 ACT Processes</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {Object.entries(PROCESSES).map(([key, info])=>(
              <div key={key} onClick={()=>{ setActiveProcess(key); setActiveTab('library'); }}
                style={{ background:S.white, borderRadius:12, padding:14, border:`1px solid ${S.border}`, cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=info.color; e.currentTarget.style.background=info.bg; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=S.border; e.currentTarget.style.background=S.white; }}>
                <div style={{ color:info.color, marginBottom:8 }}>{info.icon}</div>
                <div style={{ fontSize:13, fontWeight:700, color:S.navy, marginBottom:3 }}>{info.label}</div>
                <div style={{ fontSize:11, color:S.muted, marginBottom:8 }}>{info.desc}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ height:4, flex:1, borderRadius:2, background:S.border, marginRight:8 }}>
                    <div style={{ height:4, borderRadius:2, background:info.color, width:`${actScores[key]||50}%` }}/>
                  </div>
                  <span style={{ fontSize:10, color:info.color, fontWeight:700 }}>{actScores[key]||50}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── JOURNEY TAB ── */}
      {activeTab === 'journey' && (
        <div>
          <div style={{ marginBottom:20 }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:S.navy, margin:'0 0 6px' }}>Your ACT Journey</h3>
            <p style={{ fontSize:13, color:S.muted, margin:0 }}>A structured 6-week program to build psychological flexibility.</p>
          </div>
          {JOURNEY_WEEKS.map((week,i)=>{
            const process = PROCESSES[week.process];
            const isActive = week.week === currentWeek;
            const isDone = week.week < currentWeek;
            return (
              <div key={week.week} onClick={()=>{ if(isActive||isDone){ setCurrentWeek(week.week); setActiveProcess(week.process); setActiveTab('library'); } }}
                style={{ background:S.white, borderRadius:14, padding:18, marginBottom:10, border:`2px solid ${isActive?process.color:isDone?S.success:S.border}`, cursor:isActive||isDone?'pointer':'default', opacity:week.week>currentWeek+1?0.5:1, transition:'all 0.15s' }}>
                <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:isDone?S.success:isActive?process.color:S.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:isDone||isActive?'#fff':S.hint }}>
                    {isDone ? I.check : <span style={{ fontSize:14, fontWeight:700 }}>{week.week}</span>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:3 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:process.color, textTransform:'uppercase', letterSpacing:'0.06em' }}>Week {week.week}</div>
                      {isActive && <span style={{ fontSize:10, background:process.color, color:'#fff', padding:'1px 7px', borderRadius:100, fontWeight:600 }}>Current</span>}
                    </div>
                    <div style={{ fontSize:14, fontWeight:700, color:S.navy, marginBottom:2 }}>{week.title}</div>
                    <div style={{ fontSize:12, color:S.muted }}>{week.desc}</div>
                  </div>
                  <div style={{ color:process.color }}>{process.icon}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── LIBRARY TAB ── */}
      {activeTab === 'library' && (
        <div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
            <button onClick={()=>setActiveProcess(null)} style={{ padding:'6px 14px', borderRadius:100, border:'none', cursor:'pointer', fontSize:12, fontWeight:!activeProcess?700:400, background:!activeProcess?S.blue:'#F1F5F9', color:!activeProcess?'#fff':S.muted, fontFamily:'inherit' }}>All</button>
            {Object.entries(PROCESSES).map(([key,info])=>(
              <button key={key} onClick={()=>setActiveProcess(key)} style={{ padding:'6px 12px', borderRadius:100, border:'none', cursor:'pointer', fontSize:12, fontWeight:activeProcess===key?700:400, background:activeProcess===key?info.color:'#F1F5F9', color:activeProcess===key?'#fff':S.muted, fontFamily:'inherit', display:'flex', alignItems:'center', gap:4 }}>
                {React.cloneElement(info.icon, { width:12, height:12 })} {info.label.split(' ')[0]}
              </button>
            ))}
          </div>
          <div style={{ display:'grid', gap:14 }}>
            {Object.entries(exercises)
              .filter(([key])=>!activeProcess||key===activeProcess)
              .flatMap(([key,exList])=>(exList||[]).map(ex=>({ ...ex, process:key })))
              .map(ex=><ExerciseCard key={ex.id} exercise={ex} onStart={setActiveExercise}/>)}
          </div>
        </div>
      )}

      {/* ── VALUES TAB ── */}
      {activeTab === 'values' && (
        <div>
          {!valuesData ? (
            <ValuesAssessment onComplete={(data)=>setValuesData(data)}/>
          ) : (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <h3 style={{ fontSize:16, fontWeight:700, color:S.navy, margin:0 }}>Your Values Map</h3>
                <button onClick={()=>setValuesData(null)} style={{ fontSize:12, color:S.blue, background:'none', border:'none', cursor:'pointer' }}>Retake</button>
              </div>
              {LIFE_DOMAINS.map(domain=>{
                const val = valuesData[domain.id] || {};
                const imp = val.importance||5;
                const ali = val.alignment||5;
                const gap = imp - ali;
                return (
                  <div key={domain.id} style={{ background:S.white, borderRadius:12, padding:16, marginBottom:10, border:`1px solid ${gap>3?S.warning:S.border}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:S.navy }}>{domain.label}</div>
                      {gap > 3 && <span style={{ fontSize:11, color:S.warning, fontWeight:600 }}>Gap: {gap} pts — focus here</span>}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      {[['Importance',imp,'#7C3AED'],['Alignment',ali,gap>3?S.warning:S.success]].map(([label,val,color])=>(
                        <div key={label}>
                          <div style={{ fontSize:11, color:S.muted, marginBottom:4 }}>{label}</div>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ flex:1, height:6, borderRadius:3, background:S.border }}>
                              <div style={{ height:6, borderRadius:3, background:color, width:`${val*10}%` }}/>
                            </div>
                            <span style={{ fontSize:13, fontWeight:700, color, minWidth:20 }}>{val}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {gap > 3 && (
                      <button onClick={()=>{ setActiveProcess('committed_action'); setActiveTab('library'); }}
                        style={{ marginTop:10, padding:'6px 12px', background:'#FEF3C7', color:'#92400e', border:'none', borderRadius:7, fontSize:11, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
                        Start Committed Action exercises →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ACT PROFILE TAB ── */}
      {activeTab === 'profile' && (
        <div>
          <div style={{ background:S.navy, borderRadius:16, padding:24, marginBottom:20, display:'flex', gap:24, alignItems:'center' }}>
            <FlexScore score={flexScore}/>
            <div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Psychological Flexibility Score</div>
              <div style={{ fontSize:24, fontWeight:700, color:'#fff', marginBottom:4 }}>{flexScore}/100</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>Track this monthly to see your progress</div>
            </div>
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:S.navy, marginBottom:12 }}>Your 6 ACT Process Scores</div>
          <ACTProfile scores={actScores}/>
          <div style={{ marginTop:20, background:S.lightBlue, borderRadius:12, padding:16, border:`1px solid ${S.border}` }}>
            <div style={{ fontSize:12, fontWeight:700, color:S.blue, marginBottom:8 }}>AI Insight</div>
            <div style={{ fontSize:13, color:S.muted, lineHeight:1.6 }}>
              Your lowest score is <strong>{PROCESSES[Object.entries(actScores).sort((a,b)=>a[1]-b[1])[0][0]]?.label}</strong>. Practicing exercises in this area will have the biggest impact on your psychological flexibility.
            </div>
          </div>
        </div>
      )}

      {/* ── AAQ TAB ── */}
      {activeTab === 'aaq' && (
        <AAQAssessment onComplete={()=>setActiveTab('home')}/>
      )}
    </div>
  );
}
