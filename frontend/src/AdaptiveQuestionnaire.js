import React, { useState } from 'react';

const QUESTIONS = {
  // ── DEMOGRAPHICS ──────────────────────────────────────────
  AGE:    { id:'AGE',    text:'How old are you?',    type:'number', section:'About You' },
  GENDER: { id:'GENDER', text:'What is your gender?', type:'choice', options:['Male','Female','Non-binary','Prefer not to say'], section:'About You' },
  OCC:    { id:'OCC',    text:'What is your occupation?', type:'choice', options:['Student','Employed','Self-employed','Unemployed','Retired','Other'], section:'About You' },

  // ── PHQ-9 ─────────────────────────────────────────────────
  PHQ1: { id:'PHQ1', hint:"Loss of interest is one of the two core symptoms of depression. It's different from just being bored.", text:'Little interest or pleasure in doing things', type:'frequency4', section:'Depression (PHQ-9)' },
  PHQ2: { id:'PHQ2', hint:"Persistent low mood — not just a bad day — is a clinical marker psychologists look for.", text:'Feeling down, depressed, or hopeless', type:'frequency4', section:'Depression (PHQ-9)' },
  PHQ3: { id:'PHQ3', hint:"Sleep and mood are deeply connected. Poor sleep can both cause and worsen depression.", text:'Trouble falling or staying asleep, or sleeping too much', type:'frequency4', section:'Depression (PHQ-9)' },
  PHQ4: { id:'PHQ4', hint:"Physical fatigue without a medical reason is often a sign of emotional exhaustion.", text:'Feeling tired or having little energy', type:'frequency4', section:'Depression (PHQ-9)' },
  PHQ5: { id:'PHQ5', hint:"Appetite changes — eating too much or too little — are common physical responses to emotional stress.", text:'Poor appetite or overeating', type:'frequency4', section:'Depression (PHQ-9)' },
  PHQ6: { id:'PHQ6', hint:"Excessive guilt or self-blame, especially when it feels out of proportion, is a key depression indicator.", text:'Feeling bad about yourself — or that you are a failure', type:'frequency4', section:'Depression (PHQ-9)' },
  PHQ7: { id:'PHQ7', hint:"When your mind is overwhelmed, focusing on simple tasks becomes genuinely difficult.", text:'Trouble concentrating on things', type:'frequency4', section:'Depression (PHQ-9)' },
  PHQ8: { id:'PHQ8', hint:"Psychomotor changes — moving or thinking slower — can be visible to others before you notice them yourself.", text:'Moving or speaking so slowly that others noticed, or being fidgety', type:'frequency4', section:'Depression (PHQ-9)' },
  PHQ9: { id:'PHQ9', hint:"This is the most important question in the PHQ-9. Your answer is completely confidential.", text:'Thoughts that you would be better off dead or of hurting yourself', type:'frequency4', section:'Depression (PHQ-9)' },

  // ── GAD-7 ─────────────────────────────────────────────────
  GAD1: { id:'GAD1', hint:"General anxiety often shows up as a constant low-level nervousness, even without a specific reason.", text:'Feeling nervous, anxious, or on edge', type:'frequency4', section:'Anxiety (GAD-7)' },
  GAD2: { id:'GAD2', hint:"Uncontrollable worry is what separates clinical anxiety from everyday stress.", text:'Not being able to stop or control worrying', type:'frequency4', section:'Anxiety (GAD-7)' },
  GAD3: { id:'GAD3', hint:"Worrying about multiple unrelated things simultaneously is a hallmark of generalized anxiety.", text:'Worrying too much about different things', type:'frequency4', section:'Anxiety (GAD-7)' },
  GAD4: { id:'GAD4', hint:"Difficulty relaxing — even when you want to — suggests your nervous system may be overstimulated.", text:'Trouble relaxing', type:'frequency4', section:'Anxiety (GAD-7)' },
  GAD5: { id:'GAD5', hint:"Physical restlessness is anxiety expressing itself through your body.", text:'Being so restless that it is hard to sit still', type:'frequency4', section:'Anxiety (GAD-7)' },
  GAD6: { id:'GAD6', hint:"Irritability is often a mask for underlying anxiety. Many people don't connect the two.", text:'Becoming easily annoyed or irritable', type:'frequency4', section:'Anxiety (GAD-7)' },
  GAD7: { id:'GAD7', hint:"A sense of impending doom or dread, even without specific cause, is a classic anxiety symptom.", text:'Feeling afraid as if something awful might happen', type:'frequency4', section:'Anxiety (GAD-7)' },

  // ── WHO-5 WELLBEING ───────────────────────────────────────
  WHO1: { id:'WHO1', hint:"Positive affect — actually feeling good — is as important to wellbeing as the absence of problems.", text:'I have felt cheerful and in good spirits', type:'frequency6', section:'Wellbeing (WHO-5)' },
  WHO2: { id:'WHO2', hint:"Calm and relaxation are active states of wellbeing, not just the absence of stress.", text:'I have felt calm and relaxed', type:'frequency6', section:'Wellbeing (WHO-5)' },
  WHO3: { id:'WHO3', hint:"Energy levels reflect both your physical and mental health status.", text:'I have felt active and vigorous', type:'frequency6', section:'Wellbeing (WHO-5)' },
  WHO4: { id:'WHO4', hint:"Restorative sleep is a foundation of mental health. Waking up exhausted is worth paying attention to.", text:'I woke up feeling fresh and rested', type:'frequency6', section:'Wellbeing (WHO-5)' },
  WHO5: { id:'WHO5', hint:"Engagement with life — finding things interesting — is a strong predictor of psychological wellbeing.", text:'My daily life has been filled with things that interest me', type:'frequency6', section:'Wellbeing (WHO-5)' },

  // ── ISI INSOMNIA ──────────────────────────────────────────
  ISI1: { id:'ISI1', hint:"Trouble falling asleep (sleep onset insomnia) is the most common sleep complaint.", text:'Difficulty falling asleep', type:'severity5', section:'Sleep (ISI)' },
  ISI2: { id:'ISI2', hint:"Waking up in the middle of the night and struggling to return to sleep is called sleep maintenance insomnia.", text:'Difficulty staying asleep through the night', type:'severity5', section:'Sleep (ISI)' },
  ISI3: { id:'ISI3', hint:"Early morning awakening (before you want to wake) is particularly associated with depression.", text:'Problems waking up too early', type:'severity5', section:'Sleep (ISI)' },
  ISI4: { id:'ISI4', hint:"Your subjective satisfaction with sleep matters as much as the hours you actually get.", text:'How satisfied are you with your current sleep pattern?', type:'satisfaction5', section:'Sleep (ISI)' },
  ISI5: { id:'ISI5', hint:"When others notice your sleep issues, it suggests the impact is significant enough to affect your behavior.", text:'How noticeable to others is your sleep problem?', type:'severity5', section:'Sleep (ISI)' },
  ISI6: { id:'ISI6', hint:"Anxiety about sleep can create a cycle that makes the sleep problem worse.", text:'How worried are you about your current sleep problem?', type:'severity5', section:'Sleep (ISI)' },
  ISI7: { id:'ISI7', hint:"Sleep problems that affect daily functioning — concentration, mood, performance — are clinically significant.", text:'How much does your sleep problem interfere with daily functioning?', type:'severity5', section:'Sleep (ISI)' },

  // ── BIG FIVE ──────────────────────────────────────────────
  E1: { id:'E1', hint:"Extraversion measures how energized you feel around others vs. alone. Neither is better.", text:'I see myself as someone who is talkative', type:'agree5', section:'Personality (Big Five)' },
  E2: { id:'E2', hint:"Sociability is one dimension of extraversion. Introverts can be warm and friendly, just differently wired.", text:'I see myself as outgoing and sociable', type:'agree5', section:'Personality (Big Five)' },
  N1: { id:'N1', hint:"Neuroticism measures emotional reactivity. High scorers feel emotions more intensely — both positive and negative.", text:'I see myself as someone who worries a lot', type:'agree5', section:'Personality (Big Five)' },
  N2: { id:'N2', hint:"Nervous system sensitivity is partly genetic. This question helps assess your baseline emotional reactivity.", text:'I see myself as someone who gets nervous easily', type:'agree5', section:'Personality (Big Five)' },
  A1: { id:'A1', hint:"Agreeableness reflects how much you prioritize others' needs. Both high and low scores have strengths.", text:'I see myself as someone who is helpful and unselfish', type:'agree5', section:'Personality (Big Five)' },
  A2: { id:'A2', hint:"Forgiveness capacity is a strong predictor of relationship satisfaction and mental health.", text:'I see myself as someone who has a forgiving nature', type:'agree5', section:'Personality (Big Five)' },
  C1: { id:'C1', hint:"Conscientiousness is the strongest personality predictor of life outcomes — career, health, relationships.", text:'I see myself as someone who does a thorough job', type:'agree5', section:'Personality (Big Five)' },
  C2: { id:'C2', hint:"Organization reflects how well you manage your environment and commitments.", text:'I see myself as someone who tends to be organized', type:'agree5', section:'Personality (Big Five)' },
  O1: { id:'O1', hint:"Openness to experience is linked to creativity, curiosity, and adaptability.", text:'I see myself as someone who is curious about many different things', type:'agree5', section:'Personality (Big Five)' },
  O2: { id:'O2', hint:"An active imagination is associated with creative thinking and divergent problem solving.", text:'I see myself as someone who has an active imagination', type:'agree5', section:'Personality (Big Five)' },

  // ── DARK TRIAD ────────────────────────────────────────────
  M1:  { id:'M1', hint:"Machiavellianism measures strategic manipulation. Most people score somewhere in the middle.",  text:'I tend to manipulate others to get my way', type:'agree5', section:'Personality (Advanced)' },
  M2:  { id:'M2', hint:"This question is about self-awareness, not judgment. Honesty here gives you more accurate results.",  text:'I have used deceit or lied to get my way', type:'agree5', section:'Personality (Advanced)' },
  NA1: { id:'NA1', hint:"Wanting admiration is normal. This scale measures the degree to which it drives your behavior.", text:'I tend to want others to admire me', type:'agree5', section:'Personality (Advanced)' },
  NA2: { id:'NA2', hint:"Attention-seeking exists on a spectrum. This helps calibrate where your tendencies fall.", text:'I tend to want others to pay attention to me', type:'agree5', section:'Personality (Advanced)' },
  P1:  { id:'P1', hint:"Remorse is a core component of empathy. This is a self-awareness question, not a moral judgment.",  text:'I tend to lack remorse', type:'agree5', section:'Personality (Advanced)' },
  P2:  { id:'P2', hint:"Moral reasoning varies widely. Your honest answer produces the most accurate personality profile.",  text:'I tend to not worry about the morality of my actions', type:'agree5', section:'Personality (Advanced)' },

  // ── OCD ───────────────────────────────────────────────────
  OCD1: { id:'OCD1', hint:"Hoarding behavior is one of the OCD spectrum presentations — difficulty letting go of objects.", text:'I have saved so many things that they get in the way', type:'severity5', section:'OCD Screening' },
  OCD2: { id:'OCD2', hint:"Checking compulsions — stove, locks, switches — are among the most common OCD behaviors.", text:'I check things more often than necessary', type:'severity5', section:'OCD Screening' },
  OCD3: { id:'OCD3', hint:"Need for symmetry or exactness is a classic OCD presentation that many people don't recognize as such.", text:'I get upset if objects are not arranged properly', type:'severity5', section:'OCD Screening' },
  OCD4: { id:'OCD4', hint:"Counting compulsions often happen automatically. Many people don't realize it's a pattern.", text:'I feel compelled to count while I am doing things', type:'severity5', section:'OCD Screening' },
  OCD5: { id:'OCD5', hint:"Contamination fears leading to excessive washing are among the most recognized OCD symptoms.", text:'I wash my hands more than necessary', type:'severity5', section:'OCD Screening' },

  // ── PTSD ──────────────────────────────────────────────────
  PCL1: { id:'PCL1', hint:"Intrusive memories of distressing events are a hallmark of trauma responses.", text:'Repeated, disturbing memories or dreams of a stressful experience', type:'frequency5', section:'PTSD Screening' },
  PCL2: { id:'PCL2', hint:"Trauma can cause ongoing distress even when thinking about the event, not just during it.", text:'Feeling very upset when reminded of a stressful experience', type:'frequency5', section:'PTSD Screening' },
  PCL3: { id:'PCL3', hint:"Physical reactions to reminders — heart racing, sweating — show trauma stored in the body, not just the mind.", text:'Avoiding memories, thoughts, or feelings related to the experience', type:'frequency5', section:'PTSD Screening' },
  PCL4: { id:'PCL4', hint:"Emotional numbing is a protective mechanism, but it can affect all emotions, not just painful ones.", text:'Feeling distant or cut off from other people', type:'frequency5', section:'PTSD Screening' },
  PCL5: { id:'PCL5', hint:"Hypervigilance — always being on alert — is exhausting and is a common trauma response.", text:'Feeling jumpy or easily startled', type:'frequency5', section:'PTSD Screening' },

  // ── ADHD ──────────────────────────────────────────────────
  ADHD1: { id:'ADHD1', hint:"Inattention to details is one of the two core ADHD dimensions. It's different from not caring.", text:'How often do you have trouble wrapping up the final details of a project?', type:'frequency5', section:'ADHD Screening' },
  ADHD2: { id:'ADHD2', hint:"Sustaining focus on tasks that aren't immediately rewarding is a core ADHD challenge.", text:'How often do you have difficulty getting things in order?', type:'frequency5', section:'ADHD Screening' },
  ADHD3: { id:'ADHD3', hint:"Difficulty listening is often about working memory, not disrespect or disinterest.", text:'How often do you have problems remembering appointments?', type:'frequency5', section:'ADHD Screening' },
  ADHD4: { id:'ADHD4', hint:"Starting tasks but not finishing them is a classic pattern of ADHD inattentive type.", text:'How often do you avoid tasks that require a lot of thought?', type:'frequency5', section:'ADHD Screening' },
  ADHD5: { id:'ADHD5', hint:"Losing things frequently reflects working memory and organizational challenges common in ADHD.", text:'How often do you fidget or squirm when you have to sit for a long time?', type:'frequency5', section:'ADHD Screening' },

  // ── BURNOUT ───────────────────────────────────────────────
  BRN1: { id:'BRN1', hint:"Emotional exhaustion is the core burnout symptom — feeling drained even after rest.", text:'I feel emotionally drained from my work', type:'frequency7', section:'Burnout Screening' },
  BRN2: { id:'BRN2', hint:"End-of-day depletion that doesn't recover with sleep is a warning sign of progressive burnout.", text:'I feel used up at the end of the workday', type:'frequency7', section:'Burnout Screening' },
  BRN3: { id:'BRN3', hint:"Depersonalization — treating people like objects — is the second dimension of burnout.", text:'I feel fatigued when I get up in the morning and have to face another day', type:'frequency7', section:'Burnout Screening' },
  BRN4: { id:'BRN4', hint:"When work feels meaningless despite being the same work you used to care about, that's burnout.", text:'Working with people all day is really a strain for me', type:'frequency7', section:'Burnout Screening' },
  BRN5: { id:'BRN5', hint:"Reduced sense of accomplishment is the third burnout dimension — feeling ineffective.", text:'I feel burned out from my work', type:'frequency7', section:'Burnout Screening' },

  // ── BIPOLAR (MDQ) ─────────────────────────────────────────
  MDQ1: { id:'MDQ1', hint:"Elevated mood periods — feeling unusually high or energized — are the core bipolar indicator.", text:'I felt so good or hyper that others thought I was not my normal self', type:'yesno', section:'Bipolar Screening' },
  MDQ2: { id:'MDQ2', hint:"Decreased need for sleep (not just insomnia, but not feeling tired) is a key bipolar symptom.", text:'I was so irritable that I shouted at people or started fights', type:'yesno', section:'Bipolar Screening' },
  MDQ3: { id:'MDQ3', hint:"Racing thoughts are a common experience during elevated mood states.", text:'I felt much more self-confident than usual', type:'yesno', section:'Bipolar Screening' },
  MDQ4: { id:'MDQ4', hint:"Increased goal-directed activity or impulsive behavior during high periods is diagnostically significant.", text:'I got much less sleep than usual and found I did not really miss it', type:'yesno', section:'Bipolar Screening' },
  MDQ5: { id:'MDQ5', hint:"Functional impairment — when mood changes affected your work or relationships — is what separates clinical from normal.", text:'I was much more talkative or spoke faster than usual', type:'yesno', section:'Bipolar Screening' },

  // ── SELF ESTEEM (RSE) ────────────────────────────────────
  RSE1: { id:'RSE1', hint:"Global self-worth — your overall sense of value as a person — is the foundation of self-esteem.", text:'On the whole, I am satisfied with myself', type:'agree4', section:'Self-Esteem (RSE)' },
  RSE2: { id:'RSE2', hint:"Recognizing your own qualities is part of healthy self-concept, distinct from arrogance.", text:'I feel that I have a number of good qualities', type:'agree4', section:'Self-Esteem (RSE)' },
  RSE3: { id:'RSE3', hint:"Self-acceptance — liking yourself overall — is different from thinking you're perfect.", text:'I am able to do things as well as most other people', type:'agree4', section:'Self-Esteem (RSE)' },
  RSE4: { id:'RSE4', hint:"How you compare yourself to others affects your self-esteem more than your actual abilities.", text:'I feel that I am a person of worth', type:'agree4', section:'Self-Esteem (RSE)' },

  // ── DASS-21 ───────────────────────────────────────────────
  DASS1: { id:'DASS1', hint:"DASS measures depression, anxiety, and stress as three distinct but related dimensions.", text:'I found it hard to wind down', type:'dass4', section:'Stress & Mood (DASS-21)' },
  DASS2: { id:'DASS2', hint:"Positive affect — enthusiasm and optimism — is specifically what depression diminishes.", text:'I felt that I had nothing to look forward to', type:'dass4', section:'Stress & Mood (DASS-21)' },
  DASS3: { id:'DASS3', hint:"Situational anxiety — in specific contexts — differs from generalized anxiety.", text:'I felt down-hearted and blue', type:'dass4', section:'Stress & Mood (DASS-21)' },
  DASS4: { id:'DASS4', hint:"Stress in the DASS sense is about chronic tension and agitation, not just being busy.", text:'I was unable to become enthusiastic about anything', type:'dass4', section:'Stress & Mood (DASS-21)' },
  DASS5: { id:'DASS5', hint:"Overreaction to minor setbacks is a stress indicator, distinct from depression or anxiety.", text:'I felt I was close to panic', type:'dass4', section:'Stress & Mood (DASS-21)' },
  DASS6: { id:'DASS6', hint:"Physical tension — tight muscles, restlessness — is how stress manifests in the body.", text:'I experienced trembling (e.g. in the hands)', type:'dass4', section:'Stress & Mood (DASS-21)' },
  DASS7: { id:'DASS7', hint:"Intolerance of interruptions reflects depleted coping resources.", text:'I tended to over-react to situations', type:'dass4', section:'Stress & Mood (DASS-21)' },
};

const SCALE = {
  frequency4:   ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
  frequency5:   ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely'],
  frequency6:   ['At no time', 'Some of the time', 'Less than half the time', 'More than half', 'Most of the time', 'All of the time'],
  frequency7:   ['Never', 'A few times a year', 'Monthly', 'A few times/month', 'Weekly', 'A few times/week', 'Daily'],
  agree5:       ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  agree4:       ['Strongly Disagree', 'Disagree', 'Agree', 'Strongly Agree'],
  severity5:    ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
  satisfaction5:['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
  dass4:        ['Did not apply to me', 'Applied to me some', 'Applied to me considerably', 'Applied to me very much'],
  yesno:        ['No', 'Yes'],
};

const FLOW = [
  ['AGE','GENDER','OCC'],
  ['PHQ1','PHQ2','PHQ3','PHQ4','PHQ5','PHQ6','PHQ7','PHQ8','PHQ9'],
  ['GAD1','GAD2','GAD3','GAD4','GAD5','GAD6','GAD7'],
  ['WHO1','WHO2','WHO3','WHO4','WHO5'],
  ['ISI1','ISI2','ISI3','ISI4','ISI5','ISI6','ISI7'],
  ['E1','E2','N1','N2','A1','A2','C1','C2','O1','O2'],
  ['M1','M2','NA1','NA2','P1','P2'],
  ['OCD1','OCD2','OCD3','OCD4','OCD5'],
  ['PCL1','PCL2','PCL3','PCL4','PCL5'],
  ['ADHD1','ADHD2','ADHD3','ADHD4','ADHD5'],
  ['BRN1','BRN2','BRN3','BRN4','BRN5'],
  ['MDQ1','MDQ2','MDQ3','MDQ4','MDQ5'],
  ['RSE1','RSE2','RSE3','RSE4'],
  ['DASS1','DASS2','DASS3','DASS4','DASS5','DASS6','DASS7'],
];

export default function AdaptiveQuestionnaire({ onComplete }) {
  const [sectionIdx, setSectionIdx] = useState(0);
  const [answers, setAnswers]       = useState({});
  const [age, setAge]               = useState('');
  const [gender, setGender]         = useState('');
  const [occupation, setOccupation] = useState('');

  const totalSections = FLOW.length;
  const progress      = Math.round(((sectionIdx) / totalSections) * 100);
  const currentIds    = FLOW[sectionIdx];
  const currentQs     = currentIds.map(id => QUESTIONS[id]).filter(Boolean);
  const section       = currentQs[0]?.section || '';

  const allAnswered = currentIds.every(id => {
    if (id === 'AGE')    return age.trim() !== '';
    if (id === 'GENDER') return gender !== '';
    if (id === 'OCC')    return occupation !== '';
    return answers[id] !== undefined;
  });

  const handleAnswer = (id, val) => setAnswers(prev => ({ ...prev, [id]: val }));



  const topRef = React.useRef(null);

  const handleNext = () => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (sectionIdx < totalSections - 1) setSectionIdx(s => s + 1);
    else {
      onComplete({
        answers, age: parseInt(age) || 25,
        gender: gender === 'Male' ? 1 : gender === 'Female' ? 0 : 2,
        occupation, concern: ''
      });
    }
  };

  const S = { blue:'#1D4ED8', navy:'#0C1A2E', bg:'#F8FAFF', card:'#FFFFFF', border:'#E2EBF6', muted:'#3B5998', hint:'#94a3b8', lightBlue:'#EFF6FF' };

  const renderQuestion = (q) => {
    if (q.id === 'AGE') return (
      <div key={q.id} style={{ marginBottom:24 }}>
        <p style={{ fontSize:15, color:S.navy, margin:'0 0 10px', fontWeight:500, lineHeight:1.5 }}>How old are you?</p>
        <input type="number" value={age} onChange={e => setAge(e.target.value)}
          placeholder="Enter your age" min="10" max="100"
          style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:'0.5px solid '+S.border, fontSize:16, boxSizing:'border-box', outline:'none', fontFamily:"'Satoshi',-apple-system,sans-serif", color:S.navy, background:S.bg }}
          onFocus={e=>e.target.style.borderColor=S.blue} onBlur={e=>e.target.style.borderColor=S.border}
        />
      </div>
    );
    if (q.id === 'GENDER') return (
      <div key={q.id} style={{ marginBottom:24 }}>
        <p style={{ fontSize:15, color:S.navy, margin:'0 0 10px', fontWeight:500 }}>What is your gender?</p>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {['Male','Female','Non-binary','Prefer not to say'].map(opt => (
            <button key={opt} onClick={() => setGender(opt)}
              style={{ padding:'10px 18px', borderRadius:10, border:'0.5px solid '+(gender===opt ? S.blue : S.border), cursor:'pointer', fontSize:13, fontWeight:600, background: gender===opt ? S.blue : S.card, color: gender===opt ? '#fff' : S.navy, transition:'all 0.2s' }}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
    if (q.id === 'OCC') return (
      <div key={q.id} style={{ marginBottom:24 }}>
        <p style={{ fontSize:15, color:S.navy, margin:'0 0 10px', fontWeight:500 }}>What is your occupation?</p>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {['Student','Employed','Self-employed','Unemployed','Retired','Other'].map(opt => (
            <button key={opt} onClick={() => setOccupation(opt)}
              style={{ padding:'10px 18px', borderRadius:10, border:'0.5px solid '+(occupation===opt ? S.blue : S.border), cursor:'pointer', fontSize:13, fontWeight:600, background: occupation===opt ? S.blue : S.card, color: occupation===opt ? '#fff' : S.navy, transition:'all 0.2s' }}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );

    const scale = SCALE[q.type] || SCALE.frequency4;
    return (
      <div key={q.id} style={{ marginBottom:20, animation:'fadeIn 0.3s ease' }}>
        <p style={{ fontSize:15, color:S.navy, margin:'0 0 6px', fontWeight:500, lineHeight:1.6 }}>{q.text}</p>
        {q.hint && (
          <div style={{ fontSize:12, color:S.muted, lineHeight:1.6, marginBottom:12, paddingLeft:2, animation:'fadeIn 0.4s ease', opacity:0.85 }}>
            {q.hint}
          </div>
        )}
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {scale.map((label, i) => (
            <button key={i} onClick={() => handleAnswer(q.id, i)}
              style={{
                padding:'11px 16px', borderRadius:10, cursor:'pointer',
                textAlign:'left', fontSize:13, fontWeight: answers[q.id]===i ? 600 : 400,
                transition:'all 0.2s',
                background: answers[q.id]===i ? S.blue : S.lightBlue,
                color: answers[q.id]===i ? '#fff' : S.navy,
                border: answers[q.id]===i ? 'none' : '0.5px solid '+S.border,
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div ref={topRef} style={{ fontFamily:"'Satoshi',-apple-system,sans-serif" }}>
      {/* Progress */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:S.muted, marginBottom:8, fontWeight:500 }}>
          <span style={{ color:S.blue, fontWeight:600 }}>{section}</span>
          <span>{sectionIdx+1} of {totalSections}</span>
        </div>
        <div style={{ background:S.border, borderRadius:6, height:3 }}>
          <div style={{ width:`${progress}%`, background:S.blue, height:3, borderRadius:6, transition:'width 0.5s ease' }} />
        </div>
        <div style={{ fontSize:11, color:S.hint, marginTop:6 }}>
          {progress}% complete
        </div>
      </div>

      {/* Questions */}
      <div style={{ background:S.card, borderRadius:12, padding:28, border:'0.5px solid '+S.border, marginBottom:16, boxShadow:'0 1px 4px rgba(29,78,216,0.06)', animation:'slideIn 0.3s ease' }}>
        <div style={{ fontSize:11, fontWeight:600, color:S.muted, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:20, paddingBottom:12, borderBottom:'0.5px solid '+S.border }}>{section}</div>
        {currentQs.map(q => renderQuestion(q))}
      </div>

      {/* Navigation */}
      <div style={{ display:'flex', gap:10 }}>
        {sectionIdx > 0 && (
          <button onClick={() => { setSectionIdx(s => s-1); if(topRef.current) topRef.current.scrollIntoView({behavior:'smooth'}); }}
            style={{ flex:1, padding:'13px', background:S.card, color:S.navy, border:'0.5px solid '+S.border, borderRadius:10, fontSize:14, cursor:'pointer', fontWeight:600 }}>
            Back
          </button>
        )}
        <button onClick={handleNext} disabled={!allAnswered}
          style={{ flex:2, padding:'13px', background: allAnswered ? S.blue : S.border, color: allAnswered ? '#fff' : S.hint, border:'none', borderRadius:10, fontSize:14, cursor: allAnswered ? 'pointer' : 'not-allowed', fontWeight:600, transition:'all 0.2s' }}>
          {sectionIdx === totalSections-1 ? 'Complete Assessment' : 'Next'}
        </button>
      </div>
    </div>
  );
}
