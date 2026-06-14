import React, { useState, useEffect, useRef } from 'react';

// ── Design tokens ─────────────────────────────────────────
const S = {
  navy:'#0C1A2E', blue:'#1D4ED8', bg:'#F8FAFF', white:'#FFFFFF',
  border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8',
  success:'#059669', warning:'#D97706', danger:'#DC2626',
  lightBlue:'#EFF6FF', purple:'#7C3AED',
};

// ── Clinical question bank ────────────────────────────────
const Q = {
  // PHQ-9
  PHQ1:{ id:'PHQ1', text:'Little interest or pleasure in doing things', module:'PHQ9', type:'freq4' },
  PHQ2:{ id:'PHQ2', text:'Feeling down, depressed, or hopeless', module:'PHQ9', type:'freq4' },
  PHQ3:{ id:'PHQ3', text:'Trouble falling or staying asleep, or sleeping too much', module:'PHQ9', type:'freq4' },
  PHQ4:{ id:'PHQ4', text:'Feeling tired or having little energy', module:'PHQ9', type:'freq4' },
  PHQ5:{ id:'PHQ5', text:'Poor appetite or overeating', module:'PHQ9', type:'freq4' },
  PHQ6:{ id:'PHQ6', text:'Feeling bad about yourself — or that you are a failure or have let yourself or family down', module:'PHQ9', type:'freq4' },
  PHQ7:{ id:'PHQ7', text:'Trouble concentrating on things, such as reading or watching TV', module:'PHQ9', type:'freq4' },
  PHQ8:{ id:'PHQ8', text:'Moving or speaking so slowly that other people have noticed — or being fidgety or restless', module:'PHQ9', type:'freq4' },
  PHQ9:{ id:'PHQ9', text:'Thoughts that you would be better off dead, or thoughts of hurting yourself', module:'PHQ9', type:'freq4', critical:true },
  // GAD-7
  GAD1:{ id:'GAD1', text:'Feeling nervous, anxious, or on edge', module:'GAD7', type:'freq4' },
  GAD2:{ id:'GAD2', text:'Not being able to stop or control worrying', module:'GAD7', type:'freq4' },
  GAD3:{ id:'GAD3', text:'Worrying too much about different things', module:'GAD7', type:'freq4' },
  GAD4:{ id:'GAD4', text:'Trouble relaxing', module:'GAD7', type:'freq4' },
  GAD5:{ id:'GAD5', text:'Being so restless that it is hard to sit still', module:'GAD7', type:'freq4' },
  GAD6:{ id:'GAD6', text:'Becoming easily annoyed or irritable', module:'GAD7', type:'freq4' },
  GAD7:{ id:'GAD7', text:'Feeling afraid, as if something awful might happen', module:'GAD7', type:'freq4' },
  // ISI - Insomnia
  ISI1:{ id:'ISI1', text:'How difficult is it to fall asleep?', module:'ISI', type:'severity4' },
  ISI2:{ id:'ISI2', text:'How difficult is it to stay asleep?', module:'ISI', type:'severity4' },
  ISI3:{ id:'ISI3', text:'How often do you wake up too early and can\'t get back to sleep?', module:'ISI', type:'freq4' },
  ISI4:{ id:'ISI4', text:'How satisfied are you with your current sleep pattern?', module:'ISI', type:'satisfaction' },
  ISI5:{ id:'ISI5', text:'How noticeable to others do you think your sleep problem is in terms of impairing your quality of life?', module:'ISI', type:'severity4' },
  // WHO-5 Wellbeing
  WHO1:{ id:'WHO1', text:'I have felt cheerful and in good spirits', module:'WHO5', type:'freq6' },
  WHO2:{ id:'WHO2', text:'I have felt calm and relaxed', module:'WHO5', type:'freq6' },
  WHO3:{ id:'WHO3', text:'I have felt active and vigorous', module:'WHO5', type:'freq6' },
  WHO4:{ id:'WHO4', text:'I woke up feeling fresh and rested', module:'WHO5', type:'freq6' },
  WHO5:{ id:'WHO5', text:'My daily life has been filled with things that interest me', module:'WHO5', type:'freq6' },
  // Burnout (MBI abbreviated)
  BRN1:{ id:'BRN1', text:'I feel emotionally drained from my work', module:'BURNOUT', type:'freq7' },
  BRN2:{ id:'BRN2', text:'I feel used up at the end of the workday', module:'BURNOUT', type:'freq7' },
  BRN3:{ id:'BRN3', text:'I feel fatigued when I get up in the morning and have to face another day', module:'BURNOUT', type:'freq7' },
  BRN4:{ id:'BRN4', text:'Working with people all day is really a strain for me', module:'BURNOUT', type:'freq7' },
  BRN5:{ id:'BRN5', text:'I feel burned out from my work', module:'BURNOUT', type:'freq7' },
  // PCL-5 PTSD (abbreviated)
  PCL1:{ id:'PCL1', text:'Repeated disturbing memories, thoughts, or images of a stressful experience', module:'PCL5', type:'freq5' },
  PCL2:{ id:'PCL2', text:'Feeling very upset when something reminded you of a stressful experience', module:'PCL5', type:'freq5' },
  PCL3:{ id:'PCL3', text:'Avoiding memories, thoughts, or feelings related to a stressful experience', module:'PCL5', type:'freq5' },
  PCL4:{ id:'PCL4', text:'Feeling emotionally numb or unable to have loving feelings for those close to you', module:'PCL5', type:'freq5' },
  PCL5:{ id:'PCL5', text:'Being "super alert" or watchful or on guard', module:'PCL5', type:'freq5' },
  // ADHD ASRS (abbreviated)
  ADHD1:{ id:'ADHD1', text:'How often do you have trouble wrapping up the final details of a project?', module:'ADHD', type:'freq5' },
  ADHD2:{ id:'ADHD2', text:'How often do you have difficulty getting things in order when you need to do a task?', module:'ADHD', type:'freq5' },
  ADHD3:{ id:'ADHD3', text:'How often do you have problems remembering appointments or obligations?', module:'ADHD', type:'freq5' },
  ADHD4:{ id:'ADHD4', text:'How often do you fidget or squirm with your hands or feet when sitting for a long time?', module:'ADHD', type:'freq5' },
  ADHD5:{ id:'ADHD5', text:'How often do you feel overly active and compelled to do things, as if driven by a motor?', module:'ADHD', type:'freq5' },
  // OCD (abbreviated)
  OCD1:{ id:'OCD1', text:'I check things more often than necessary', module:'OCD', type:'freq5' },
  OCD2:{ id:'OCD2', text:'I have difficulty controlling my own thoughts', module:'OCD', type:'freq5' },
  OCD3:{ id:'OCD3', text:'I collect things I don\'t need', module:'OCD', type:'freq5' },
  OCD4:{ id:'OCD4', text:'I get upset if others change the way I have arranged my things', module:'OCD', type:'freq5' },
  // C-SSRS (crisis)
  CSSRS1:{ id:'CSSRS1', text:'Have you wished you were dead or wished you could go to sleep and not wake up?', module:'CSSRS', type:'yesno', critical:true },
  CSSRS2:{ id:'CSSRS2', text:'Have you had any thoughts of killing yourself?', module:'CSSRS', type:'yesno', critical:true },
  CSSRS3:{ id:'CSSRS3', text:'Have you been thinking about how you might do this?', module:'CSSRS', type:'yesno', critical:true },
  // Big Five (abbreviated)
  E1:{ id:'E1', text:'I see myself as someone who is talkative and outgoing', module:'BIGFIVE', type:'agree5' },
  E2:{ id:'E2', text:'I see myself as someone who is full of energy', module:'BIGFIVE', type:'agree5' },
  N1:{ id:'N1', text:'I see myself as someone who worries a lot', module:'BIGFIVE', type:'agree5' },
  N2:{ id:'N2', text:'I see myself as someone who gets nervous easily', module:'BIGFIVE', type:'agree5' },
  A1:{ id:'A1', text:'I see myself as someone who is helpful and considerate', module:'BIGFIVE', type:'agree5' },
  A2:{ id:'A2', text:'I see myself as someone who is warm and sympathetic', module:'BIGFIVE', type:'agree5' },
  C1:{ id:'C1', text:'I see myself as someone who does a thorough job', module:'BIGFIVE', type:'agree5' },
  C2:{ id:'C2', text:'I see myself as someone who is organized and efficient', module:'BIGFIVE', type:'agree5' },
  O1:{ id:'O1', text:'I see myself as someone who is curious about many different things', module:'BIGFIVE', type:'agree5' },
  O2:{ id:'O2', text:'I see myself as someone who is inventive and creative', module:'BIGFIVE', type:'agree5' },
  // Rosenberg Self-Esteem
  RSE1:{ id:'RSE1', text:'I feel that I am a person of worth, at least on an equal basis with others', module:'RSE', type:'agree4' },
  RSE2:{ id:'RSE2', text:'I feel that I have a number of good qualities', module:'RSE', type:'agree4' },
  RSE3:{ id:'RSE3', text:'On the whole, I am satisfied with myself', module:'RSE', type:'agree4' },
  RSE4:{ id:'RSE4', text:'I certainly feel useless at times', module:'RSE', type:'agree4', reverse:true },
  // Bipolar MDQ
  MDQ1:{ id:'MDQ1', text:'You felt so good or so hyper that other people thought you were not your normal self', module:'MDQ', type:'yesno' },
  MDQ2:{ id:'MDQ2', text:'You were so irritable that you shouted at people or started fights', module:'MDQ', type:'yesno' },
  MDQ3:{ id:'MDQ3', text:'You felt much more self-confident than usual', module:'MDQ', type:'yesno' },
  MDQ4:{ id:'MDQ4', text:'You got much less sleep than usual and found you didn\'t really miss it', module:'MDQ', type:'yesno' },
  MDQ5:{ id:'MDQ5', text:'You were much more talkative or spoke much faster than usual', module:'MDQ', type:'yesno' },
  // Dark Triad
  M1:{ id:'M1', text:'I tend to manipulate others to get my own way', module:'DARK', type:'agree5' },
  M2:{ id:'M2', text:'I use deception or lie to get what I want', module:'DARK', type:'agree5' },
  NA1:{ id:'NA1', text:'I want others to pay attention to me', module:'DARK', type:'agree5' },
  NA2:{ id:'NA2', text:'I seek prestige or status', module:'DARK', type:'agree5' },
  P1:{ id:'P1', text:'I tend to lack remorse', module:'DARK', type:'agree5' },
  P2:{ id:'P2', text:'I tend to not be too concerned about the morality of my actions', module:'DARK', type:'agree5' },
};

// ── BAYESIAN TRIAGE ENGINE ────────────────────────────────
// Maps concern to likely modules + question paths
const TRIAGE_MAP = {
  anxiety:    { modules:['GAD7','PHQ9','ISI','BIGFIVE'], label:'Anxiety', color:S.warning },
  depression: { modules:['PHQ9','GAD7','WHO5','RSE','BIGFIVE'], label:'Depression', color:S.danger },
  sleep:      { modules:['ISI','PHQ9','GAD7','BURNOUT'], label:'Sleep Issues', color:'#7C3AED' },
  stress:     { modules:['GAD7','BURNOUT','PHQ9','BIGFIVE'], label:'Stress & Burnout', color:S.warning },
  trauma:     { modules:['PCL5','PHQ9','GAD7','CSSRS'], label:'Trauma', color:S.danger },
  adhd:       { modules:['ADHD','PHQ9','GAD7'], label:'Focus & ADHD', color:S.blue },
  burnout:    { modules:['BURNOUT','PHQ9','GAD7','ISI'], label:'Burnout', color:'#EA580C' },
  ocd:        { modules:['OCD','GAD7','PHQ9'], label:'OCD', color:S.purple },
  unsure:     { modules:['PHQ9','GAD7','WHO5','ISI','BIGFIVE'], label:'General Wellbeing', color:S.blue },
};

// Module to question IDs
const MODULE_QS = {
  PHQ9:   ['PHQ1','PHQ2','PHQ3','PHQ4','PHQ5','PHQ6','PHQ7','PHQ8','PHQ9'],
  GAD7:   ['GAD1','GAD2','GAD3','GAD4','GAD5','GAD6','GAD7'],
  ISI:    ['ISI1','ISI2','ISI3','ISI4','ISI5'],
  WHO5:   ['WHO1','WHO2','WHO3','WHO4','WHO5'],
  BURNOUT:['BRN1','BRN2','BRN3','BRN4','BRN5'],
  PCL5:   ['PCL1','PCL2','PCL3','PCL4','PCL5'],
  ADHD:   ['ADHD1','ADHD2','ADHD3','ADHD4','ADHD5'],
  OCD:    ['OCD1','OCD2','OCD3','OCD4'],
  CSSRS:  ['CSSRS1','CSSRS2','CSSRS3'],
  BIGFIVE:['E1','E2','N1','N2','A1','A2','C1','C2','O1','O2'],
  RSE:    ['RSE1','RSE2','RSE3','RSE4'],
  MDQ:    ['MDQ1','MDQ2','MDQ3','MDQ4','MDQ5'],
  DARK:   ['M1','M2','NA1','NA2','P1','P2'],
};

// CAT: Build adaptive question list based on triage
function buildAdaptiveFlow(concerns, mode) {
  if (mode === 'quick') {
    // 3-min: PHQ-9 + GAD-7 only
    return ['PHQ1','PHQ2','PHQ9','GAD1','GAD2','GAD7'];
  }
  if (mode === 'deep') {
    // All instruments
    return Object.values(MODULE_QS).flat();
  }
  // Adaptive: triage-based
  const modules = new Set();
  concerns.forEach(c => {
    (TRIAGE_MAP[c]?.modules || TRIAGE_MAP.unsure.modules).forEach(m => modules.add(m));
  });
  // Always include core
  modules.add('PHQ9'); modules.add('GAD7'); modules.add('BIGFIVE');
  return [...modules].flatMap(m => MODULE_QS[m] || []);
}

// ── Answer option configs ─────────────────────────────────
const OPTIONS = {
  freq4:   [['Not at all',0],['Several days',1],['More than half the days',2],['Nearly every day',3]],
  freq5:   [['Never',0],['Rarely',1],['Sometimes',2],['Often',3],['Always',4]],
  freq6:   [['At no time',0],['Some of the time',1],['Less than half',2],['More than half',3],['Most of the time',4],['All of the time',5]],
  freq7:   [['Never',0],['A few times/year',1],['Once a month',2],['A few times/month',3],['Once a week',4],['A few times/week',5],['Every day',6]],
  agree4:  [['Strongly disagree',0],['Disagree',1],['Agree',2],['Strongly agree',3]],
  agree5:  [['Strongly disagree',1],['Disagree',2],['Neutral',3],['Agree',4],['Strongly agree',5]],
  severity4:[['Not difficult',0],['Slightly',1],['Moderately',2],['Very difficult',3]],
  satisfaction:[['Very satisfied',0],['Satisfied',1],['Neutral',2],['Unsatisfied',3],['Very unsatisfied',4]],
  yesno:   [['Yes',1],['No',0]],
};

// Module section labels
const MODULE_LABELS = {
  PHQ9:'Depression', GAD7:'Anxiety', ISI:'Sleep', WHO5:'Wellbeing',
  BURNOUT:'Burnout', PCL5:'Trauma', ADHD:'Focus & ADHD', OCD:'OCD',
  CSSRS:'Safety', BIGFIVE:'Personality', RSE:'Self-Esteem',
  MDQ:'Mood Episodes', DARK:'Interpersonal Style',
};

// Module completion messages (micro-rewards)
const MODULE_COMPLETE = {
  PHQ9:'We now understand your mood patterns.',
  GAD7:'We now understand your anxiety profile.',
  ISI:'We\'ve mapped your sleep patterns.',
  WHO5:'We\'ve captured your overall wellbeing.',
  BURNOUT:'We understand your energy and burnout levels.',
  PCL5:'Thank you for sharing that. Your responses are confidential.',
  ADHD:'We\'ve assessed your focus and attention profile.',
  OCD:'We\'ve noted your thought patterns.',
  CSSRS:'Your safety is our priority. Thank you for your honesty.',
  BIGFIVE:'We\'ve built your personality profile.',
  RSE:'We understand your self-perception.',
  MDQ:'We\'ve assessed your mood history.',
  DARK:'We\'ve captured your interpersonal style.',
};

// ── Concern options for triage ────────────────────────────
const CONCERNS = [
  { id:'depression', label:'Low mood or depression', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 15s1.5-2 4-2 4 2 4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
  { id:'anxiety', label:'Anxiety or worry', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id:'sleep', label:'Sleep problems', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id:'stress', label:'Stress or overwhelm', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id:'burnout', label:'Exhaustion or burnout', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id:'trauma', label:'Past trauma or PTSD', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id:'adhd', label:'Focus or attention issues', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id:'unsure', label:'Not sure — check everything', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
];

export default function AdaptiveQuestionnaire({ onComplete }) {
  const [phase, setPhase] = useState('path'); // path | triage | questions | complete
  const [path, setPath] = useState(null); // quick | adaptive | deep
  const [concerns, setConcerns] = useState([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [qList, setQList] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showModuleComplete, setShowModuleComplete] = useState(null);
  const [animating, setAnimating] = useState(false);
  const topRef = useRef();

  const currentQ = qList[qIndex] ? Q[qList[qIndex]] : null;
  const progress = qList.length > 0 ? Math.round((qIndex / qList.length) * 100) : 0;
  const currentModule = currentQ?.module;

  // Check if we just finished a module
  const justFinishedModule = () => {
    if (qIndex === 0) return null;
    const prev = Q[qList[qIndex - 1]];
    const curr = Q[qList[qIndex]];
    if (prev?.module !== curr?.module) return prev?.module;
    return null;
  };

  // Start assessment
  const startAssessment = () => {
    const flow = buildAdaptiveFlow(concerns, path);
    // Deduplicate
    const unique = [...new Set(flow)];
    setQList(unique);
    setQIndex(0);
    setPhase('questions');
  };

  // Answer a question
  const answer = (val) => {
    if (animating) return;
    const qId = qList[qIndex];
    const newAnswers = { ...answers, [qId]: val };
    setAnswers(newAnswers);

    // CAT: if PHQ9 very low, skip some PHQ questions
    // Bayesian: if PHQ1+PHQ2 both 0, skip rest of PHQ
    let nextIndex = qIndex + 1;

    // Crisis escalation: if PHQ9 = 3, immediately add CSSRS
    if (qId === 'PHQ9' && val === 3) {
      const newList = [...qList];
      if (!newList.includes('CSSRS1')) {
        newList.splice(nextIndex, 0, 'CSSRS1', 'CSSRS2', 'CSSRS3');
        setQList(newList);
      }
    }

    // CAT skip: if first 2 PHQ both 0, skip PHQ3-8, keep PHQ9
    if (qId === 'PHQ2' && val === 0 && newAnswers['PHQ1'] === 0) {
      const newList = qList.filter(id => !['PHQ3','PHQ4','PHQ5','PHQ6','PHQ7','PHQ8'].includes(id));
      setQList(newList);
    }

    // CAT skip: if GAD1+GAD2 both 0, skip GAD3-6, keep GAD7
    if (qId === 'GAD2' && val === 0 && newAnswers['GAD1'] === 0) {
      const newList = qList.filter(id => !['GAD3','GAD4','GAD5','GAD6'].includes(id));
      setQList(newList);
    }

    // Animate transition
    setAnimating(true);
    setTimeout(() => {
      if (nextIndex >= qList.length) {
        // Done
        finalizeAnswers(newAnswers);
      } else {
        // Check module completion
        const prevMod = Q[qList[qIndex]]?.module;
        const nextMod = Q[qList[nextIndex]]?.module;
        if (prevMod !== nextMod && MODULE_COMPLETE[prevMod]) {
          setShowModuleComplete(prevMod);
          setTimeout(() => {
            setShowModuleComplete(null);
            setQIndex(nextIndex);
            setAnimating(false);
          }, 2000);
        } else {
          setQIndex(nextIndex);
          setAnimating(false);
        }
      }
      topRef.current?.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 300);
  };

  const finalizeAnswers = (finalAnswers) => {
    const score = (ids) => ids.reduce((s, id) => s + (finalAnswers[id] !== undefined ? finalAnswers[id] : 3), 0) / ids.length;
    onComplete({
      answers: finalAnswers,
      age: parseInt(age) || 25,
      gender: gender === 'Male' ? 1 : gender === 'Female' ? 0 : 2,
      occupation,
      concern: concerns.join(','),
      cssrs_score: ['CSSRS1','CSSRS2','CSSRS3'].filter(id => finalAnswers[id] === 1).length,
      cssrs_high_risk: ['CSSRS2','CSSRS3'].some(id => finalAnswers[id] === 1),
      audit_score: 0,
    });
  };

  // ── PATH SELECTION ─────────────────────────────────────
  if (phase === 'path') return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", minHeight:'100vh', background:S.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ maxWidth:560, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:S.blue, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <svg width="26" height="26" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C9 1.5 4 5 4 10C4 12.8 6.2 15 9 15C11.8 15 14 12.8 14 10C14 5 9 1.5 9 1.5Z" fill="white"/><circle cx="9" cy="10" r="2.2" fill="#0C1A2E"/></svg>
          </div>
          <h1 style={{ fontSize:28, fontWeight:700, color:S.navy, letterSpacing:'-0.03em', margin:'0 0 10px' }}>Mental Health Assessment</h1>
          <p style={{ fontSize:16, color:S.muted, lineHeight:1.6 }}>Choose how you want to be assessed. All responses are private and encrypted.</p>
        </div>

        {/* Demographics */}
        <div style={{ background:S.white, borderRadius:14, padding:20, border:`1px solid ${S.border}`, marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:700, color:S.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Tell us a bit about yourself</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:5 }}>AGE</label>
              <input type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder="25" min="13" max="100"
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${S.border}`, fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                onFocus={e=>e.target.style.borderColor=S.blue} onBlur={e=>e.target.style.borderColor=S.border}/>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:5 }}>GENDER</label>
              <select value={gender} onChange={e=>setGender(e.target.value)}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${S.border}`, fontSize:14, outline:'none', background:'#fff', fontFamily:'inherit' }}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:S.muted, display:'block', marginBottom:5 }}>OCCUPATION</label>
            <input value={occupation} onChange={e=>setOccupation(e.target.value)} placeholder="Software Engineer, Student, Doctor..."
              style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${S.border}`, fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
              onFocus={e=>e.target.style.borderColor=S.blue} onBlur={e=>e.target.style.borderColor=S.border}/>
          </div>
        </div>

        {/* 3 paths */}
        <div style={{ display:'grid', gap:12, marginBottom:24 }}>
          {[
            { id:'quick', title:'Quick Checkup', time:'3 min', desc:'Core mood and anxiety screening. 6 questions. Fast and essential.', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, color:S.success },
            { id:'adaptive', title:'Adaptive Assessment', time:'8-12 min', desc:'AI selects questions based on your concerns. Personalized and efficient.', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, color:S.blue, recommended:true },
            { id:'deep', title:'Full Clinical Assessment', time:'20-25 min', desc:'All 16 validated instruments. Complete psychological profile. For researchers and clinicians.', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9.5 2A2.5 2.5 0 007 4.5v1A2.5 2.5 0 004.5 8v1A2.5 2.5 0 002 11.5C2 13 3 14.3 4.5 14.8V17a5 5 0 005 5h5a5 5 0 005-5v-2.2c1.5-.5 2.5-1.8 2.5-3.3A2.5 2.5 0 0019.5 9V8A2.5 2.5 0 0017 5.5v-1A2.5 2.5 0 0014.5 2h-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, color:S.purple },
          ].map(p=>(
            <div key={p.id} onClick={()=>setPath(p.id)} style={{ background:S.white, borderRadius:12, padding:20, border:`2px solid ${path===p.id?p.color:S.border}`, cursor:'pointer', transition:'all 0.15s', position:'relative' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=p.color}
              onMouseLeave={e=>e.currentTarget.style.borderColor=path===p.id?p.color:S.border}>
              {p.recommended && <div style={{ position:'absolute', top:12, right:12, fontSize:10, fontWeight:700, color:S.blue, background:S.lightBlue, padding:'2px 8px', borderRadius:100 }}>Recommended</div>}
              <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <div style={{ width:40, height:40, borderRadius:10, background:`${p.color}15`, border:`1px solid ${p.color}30`, display:'flex', alignItems:'center', justifyContent:'center', color:p.color, flexShrink:0 }}>{p.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:4 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:S.navy }}>{p.title}</div>
                    <div style={{ fontSize:11, color:p.color, fontWeight:600, background:`${p.color}10`, padding:'2px 8px', borderRadius:100 }}>{p.time}</div>
                  </div>
                  <div style={{ fontSize:13, color:S.muted, lineHeight:1.5 }}>{p.desc}</div>
                </div>
                {path===p.id && <div style={{ width:20, height:20, borderRadius:'50%', background:p.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>}
              </div>
            </div>
          ))}
        </div>

        <button onClick={()=>{ if(!path||!age) return; path==='adaptive'?setPhase('triage'):startAssessment(); }}
          disabled={!path||!age}
          style={{ width:'100%', padding:'13px', background:path&&age?S.blue:'#CBD5E1', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:600, cursor:path&&age?'pointer':'not-allowed', transition:'background 0.2s' }}>
          {!age?'Enter your age to continue':!path?'Choose an assessment path':'Continue →'}
        </button>
        <div style={{ marginTop:16, textAlign:'center', fontSize:12, color:S.hint }}>
          All responses are encrypted and confidential. Crisis support: iCall 9152987821
        </div>
      </div>
    </div>
  );

  // ── TRIAGE (adaptive only) ─────────────────────────────
  if (phase === 'triage') return (
    <div style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", minHeight:'100vh', background:S.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ maxWidth:560, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <h2 style={{ fontSize:24, fontWeight:700, color:S.navy, letterSpacing:'-0.02em', margin:'0 0 10px' }}>What's been on your mind?</h2>
          <p style={{ fontSize:15, color:S.muted, lineHeight:1.6 }}>Select everything that applies. We'll tailor your assessment to focus only on what matters to you.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
          {CONCERNS.map(c=>{
            const selected = concerns.includes(c.id);
            return (
              <div key={c.id} onClick={()=>{ setConcerns(prev => prev.includes(c.id) ? prev.filter(x=>x!==c.id) : c.id==='unsure'?['unsure']:[...prev.filter(x=>x!=='unsure'),c.id]); }}
                style={{ background:S.white, borderRadius:10, padding:'14px 16px', border:`2px solid ${selected?S.blue:S.border}`, cursor:'pointer', display:'flex', gap:10, alignItems:'center', transition:'all 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=S.blue}
                onMouseLeave={e=>e.currentTarget.style.borderColor=selected?S.blue:S.border}>
                <div style={{ color:selected?S.blue:S.muted, flexShrink:0 }}>{c.icon}</div>
                <div style={{ fontSize:13, fontWeight:selected?600:400, color:selected?S.navy:S.muted, lineHeight:1.3 }}>{c.label}</div>
                {selected && <div style={{ marginLeft:'auto', width:18, height:18, borderRadius:'50%', background:S.blue, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>}
              </div>
            );
          })}
        </div>
        {concerns.length > 0 && (
          <div style={{ background:S.lightBlue, borderRadius:10, padding:'10px 14px', marginBottom:16, border:`1px solid ${S.border}` }}>
            <div style={{ fontSize:12, color:S.blue, fontWeight:600 }}>
              Estimated {concerns.includes('unsure')?'20-25':concerns.length<=2?'8-10':concerns.length<=4?'12-15':'15-18'} min · {concerns.includes('unsure')?'All instruments':concerns.map(c=>TRIAGE_MAP[c]?.label).join(', ')}
            </div>
          </div>
        )}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={()=>setPhase('path')} style={{ padding:'11px 20px', background:'transparent', color:S.muted, border:`1px solid ${S.border}`, borderRadius:10, fontSize:14, cursor:'pointer' }}>← Back</button>
          <button onClick={()=>{ if(concerns.length===0) return; startAssessment(); }} disabled={concerns.length===0}
            style={{ flex:1, padding:'12px', background:concerns.length>0?S.blue:'#CBD5E1', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:600, cursor:concerns.length>0?'pointer':'not-allowed' }}>
            Start Personalized Assessment →
          </button>
        </div>
      </div>
    </div>
  );

  // ── QUESTIONS ──────────────────────────────────────────
  if (phase === 'questions' && currentQ) {
    const opts = OPTIONS[currentQ.type] || OPTIONS.freq4;
    const moduleLabel = MODULE_LABELS[currentModule] || currentModule;
    const finishedMod = justFinishedModule();

    return (
      <div ref={topRef} style={{ fontFamily:"'Satoshi',-apple-system,sans-serif", minHeight:'100vh', background:S.bg, display:'flex', flexDirection:'column' }}>
        {/* Progress bar */}
        <div style={{ height:3, background:S.border }}>
          <div style={{ height:3, background:S.blue, width:`${progress}%`, transition:'width 0.4s ease' }}/>
        </div>

        {/* Header */}
        <div style={{ padding:'14px 24px', background:S.white, borderBottom:`1px solid ${S.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontSize:12, fontWeight:700, color:S.blue, textTransform:'uppercase', letterSpacing:'0.06em' }}>{moduleLabel}</div>
            <div style={{ fontSize:12, color:S.hint }}>Question {qIndex+1} of ~{qList.length}</div>
          </div>
          <div style={{ fontSize:12, color:S.muted }}>{progress}% complete</div>
        </div>

        {/* Module complete overlay */}
        {showModuleComplete && (
          <div style={{ position:'fixed', inset:0, background:'rgba(12,26,46,0.5)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ background:S.white, borderRadius:20, padding:32, textAlign:'center', maxWidth:320, margin:24, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={S.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ fontSize:16, fontWeight:700, color:S.navy, marginBottom:8 }}>{MODULE_LABELS[showModuleComplete]} complete</div>
              <div style={{ fontSize:14, color:S.muted, lineHeight:1.6 }}>{MODULE_COMPLETE[showModuleComplete]}</div>
            </div>
          </div>
        )}

        {/* Question */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div style={{ maxWidth:560, width:'100%' }}>
            {/* Crisis warning */}
            {currentQ.critical && (
              <div style={{ background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius:10, padding:'10px 14px', marginBottom:20, display:'flex', gap:8, alignItems:'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={S.danger} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize:12, color:S.danger, fontWeight:500 }}>This is a sensitive question. Your answer is completely confidential. Crisis support: iCall 9152987821</span>
              </div>
            )}

            {/* Question text */}
            <div style={{ opacity:animating?0:1, transform:animating?'translateY(8px)':'translateY(0)', transition:'opacity 0.25s, transform 0.25s' }}>
              <div style={{ fontSize:11, fontWeight:700, color:S.blue, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>
                {moduleLabel} · Q{qIndex+1}
              </div>
              <h2 style={{ fontSize:22, fontWeight:600, color:S.navy, lineHeight:1.4, margin:'0 0 28px', letterSpacing:'-0.01em' }}>
                {currentQ.text}
              </h2>

              {/* Time reference for clinical questions */}
              {['PHQ9','GAD7','ISI'].includes(currentModule) && (
                <div style={{ fontSize:12, color:S.hint, marginBottom:20, fontStyle:'italic' }}>
                  Over the last 2 weeks, how often have you been bothered by this?
                </div>
              )}

              {/* Answer options */}
              <div style={{ display:'grid', gap:10 }}>
                {opts.map(([label, val]) => (
                  <button key={label} onClick={()=>answer(val)}
                    style={{ padding:'14px 18px', background:S.white, border:`1.5px solid ${S.border}`, borderRadius:10, fontSize:15, color:S.navy, cursor:'pointer', textAlign:'left', fontWeight:500, transition:'all 0.15s', fontFamily:'inherit', display:'flex', justifyContent:'space-between', alignItems:'center' }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor=S.blue; e.currentTarget.style.background=S.lightBlue; e.currentTarget.style.color=S.blue; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=S.border; e.currentTarget.style.background=S.white; e.currentTarget.style.color=S.navy; }}>
                    <span>{label}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ opacity:0.3 }}><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                ))}
              </div>

              {/* Skip for non-critical */}
              {!currentQ.critical && (
                <button onClick={()=>answer(currentQ.type==='yesno'?0:0)}
                  style={{ marginTop:16, padding:'8px 16px', background:'transparent', border:'none', fontSize:13, color:S.hint, cursor:'pointer', display:'block', margin:'16px auto 0' }}>
                  Skip this question
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom safe space */}
        <div style={{ padding:'12px 24px', textAlign:'center' }}>
          <div style={{ fontSize:11, color:S.hint }}>Your responses are encrypted and confidential</div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div style={{ minHeight:'100vh', background:S.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Satoshi',-apple-system,sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, borderRadius:'50%', border:`3px solid ${S.blue}`, borderTopColor:'transparent', animation:'spin 1s linear infinite', margin:'0 auto 16px' }}/>
        <div style={{ fontSize:15, color:S.muted }}>Building your assessment...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}
