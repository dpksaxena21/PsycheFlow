import React, { useState } from 'react';

const QUESTIONS = {
  // ── DEMOGRAPHICS ──────────────────────────────────────────
  AGE:    { id:'AGE',    text:'How old are you?',    type:'number', section:'About You' },
  GENDER: { id:'GENDER', text:'What is your gender?', type:'choice', options:['Male','Female','Non-binary','Prefer not to say'], section:'About You' },
  OCC:    { id:'OCC',    text:'What is your occupation?', type:'choice', options:['Student','Employed','Self-employed','Unemployed','Retired','Other'], section:'About You' },

  // ── PHQ-9 ─────────────────────────────────────────────────
  PHQ1: { id:'PHQ1', text:'Little interest or pleasure in doing things', type:'frequency4', section:'Depression (PHQ-9)' },
  PHQ2: { id:'PHQ2', text:'Feeling down, depressed, or hopeless', type:'frequency4', section:'Depression (PHQ-9)' },
  PHQ3: { id:'PHQ3', text:'Trouble falling or staying asleep, or sleeping too much', type:'frequency4', section:'Depression (PHQ-9)' },
  PHQ4: { id:'PHQ4', text:'Feeling tired or having little energy', type:'frequency4', section:'Depression (PHQ-9)' },
  PHQ5: { id:'PHQ5', text:'Poor appetite or overeating', type:'frequency4', section:'Depression (PHQ-9)' },
  PHQ6: { id:'PHQ6', text:'Feeling bad about yourself — or that you are a failure', type:'frequency4', section:'Depression (PHQ-9)' },
  PHQ7: { id:'PHQ7', text:'Trouble concentrating on things', type:'frequency4', section:'Depression (PHQ-9)' },
  PHQ8: { id:'PHQ8', text:'Moving or speaking so slowly that others noticed, or being fidgety', type:'frequency4', section:'Depression (PHQ-9)' },
  PHQ9: { id:'PHQ9', text:'Thoughts that you would be better off dead or of hurting yourself', type:'frequency4', section:'Depression (PHQ-9)' },

  // ── GAD-7 ─────────────────────────────────────────────────
  GAD1: { id:'GAD1', text:'Feeling nervous, anxious, or on edge', type:'frequency4', section:'Anxiety (GAD-7)' },
  GAD2: { id:'GAD2', text:'Not being able to stop or control worrying', type:'frequency4', section:'Anxiety (GAD-7)' },
  GAD3: { id:'GAD3', text:'Worrying too much about different things', type:'frequency4', section:'Anxiety (GAD-7)' },
  GAD4: { id:'GAD4', text:'Trouble relaxing', type:'frequency4', section:'Anxiety (GAD-7)' },
  GAD5: { id:'GAD5', text:'Being so restless that it is hard to sit still', type:'frequency4', section:'Anxiety (GAD-7)' },
  GAD6: { id:'GAD6', text:'Becoming easily annoyed or irritable', type:'frequency4', section:'Anxiety (GAD-7)' },
  GAD7: { id:'GAD7', text:'Feeling afraid as if something awful might happen', type:'frequency4', section:'Anxiety (GAD-7)' },

  // ── WHO-5 WELLBEING ───────────────────────────────────────
  WHO1: { id:'WHO1', text:'I have felt cheerful and in good spirits', type:'frequency6', section:'Wellbeing (WHO-5)' },
  WHO2: { id:'WHO2', text:'I have felt calm and relaxed', type:'frequency6', section:'Wellbeing (WHO-5)' },
  WHO3: { id:'WHO3', text:'I have felt active and vigorous', type:'frequency6', section:'Wellbeing (WHO-5)' },
  WHO4: { id:'WHO4', text:'I woke up feeling fresh and rested', type:'frequency6', section:'Wellbeing (WHO-5)' },
  WHO5: { id:'WHO5', text:'My daily life has been filled with things that interest me', type:'frequency6', section:'Wellbeing (WHO-5)' },

  // ── ISI INSOMNIA ──────────────────────────────────────────
  ISI1: { id:'ISI1', text:'Difficulty falling asleep', type:'severity5', section:'Sleep (ISI)' },
  ISI2: { id:'ISI2', text:'Difficulty staying asleep through the night', type:'severity5', section:'Sleep (ISI)' },
  ISI3: { id:'ISI3', text:'Problems waking up too early', type:'severity5', section:'Sleep (ISI)' },
  ISI4: { id:'ISI4', text:'How satisfied are you with your current sleep pattern?', type:'satisfaction5', section:'Sleep (ISI)' },
  ISI5: { id:'ISI5', text:'How noticeable to others is your sleep problem?', type:'severity5', section:'Sleep (ISI)' },
  ISI6: { id:'ISI6', text:'How worried are you about your current sleep problem?', type:'severity5', section:'Sleep (ISI)' },
  ISI7: { id:'ISI7', text:'How much does your sleep problem interfere with daily functioning?', type:'severity5', section:'Sleep (ISI)' },

  // ── BIG FIVE ──────────────────────────────────────────────
  E1: { id:'E1', text:'I see myself as someone who is talkative', type:'agree5', section:'Personality (Big Five)' },
  E2: { id:'E2', text:'I see myself as outgoing and sociable', type:'agree5', section:'Personality (Big Five)' },
  N1: { id:'N1', text:'I see myself as someone who worries a lot', type:'agree5', section:'Personality (Big Five)' },
  N2: { id:'N2', text:'I see myself as someone who gets nervous easily', type:'agree5', section:'Personality (Big Five)' },
  A1: { id:'A1', text:'I see myself as someone who is helpful and unselfish', type:'agree5', section:'Personality (Big Five)' },
  A2: { id:'A2', text:'I see myself as someone who has a forgiving nature', type:'agree5', section:'Personality (Big Five)' },
  C1: { id:'C1', text:'I see myself as someone who does a thorough job', type:'agree5', section:'Personality (Big Five)' },
  C2: { id:'C2', text:'I see myself as someone who tends to be organized', type:'agree5', section:'Personality (Big Five)' },
  O1: { id:'O1', text:'I see myself as someone who is curious about many different things', type:'agree5', section:'Personality (Big Five)' },
  O2: { id:'O2', text:'I see myself as someone who has an active imagination', type:'agree5', section:'Personality (Big Five)' },

  // ── DARK TRIAD ────────────────────────────────────────────
  M1:  { id:'M1',  text:'I tend to manipulate others to get my way', type:'agree5', section:'Personality (Advanced)' },
  M2:  { id:'M2',  text:'I have used deceit or lied to get my way', type:'agree5', section:'Personality (Advanced)' },
  NA1: { id:'NA1', text:'I tend to want others to admire me', type:'agree5', section:'Personality (Advanced)' },
  NA2: { id:'NA2', text:'I tend to want others to pay attention to me', type:'agree5', section:'Personality (Advanced)' },
  P1:  { id:'P1',  text:'I tend to lack remorse', type:'agree5', section:'Personality (Advanced)' },
  P2:  { id:'P2',  text:'I tend to not worry about the morality of my actions', type:'agree5', section:'Personality (Advanced)' },

  // ── OCD ───────────────────────────────────────────────────
  OCD1: { id:'OCD1', text:'I have saved so many things that they get in the way', type:'severity5', section:'OCD Screening' },
  OCD2: { id:'OCD2', text:'I check things more often than necessary', type:'severity5', section:'OCD Screening' },
  OCD3: { id:'OCD3', text:'I get upset if objects are not arranged properly', type:'severity5', section:'OCD Screening' },
  OCD4: { id:'OCD4', text:'I feel compelled to count while I am doing things', type:'severity5', section:'OCD Screening' },
  OCD5: { id:'OCD5', text:'I wash my hands more than necessary', type:'severity5', section:'OCD Screening' },

  // ── PTSD ──────────────────────────────────────────────────
  PCL1: { id:'PCL1', text:'Repeated, disturbing memories or dreams of a stressful experience', type:'frequency5', section:'PTSD Screening' },
  PCL2: { id:'PCL2', text:'Feeling very upset when reminded of a stressful experience', type:'frequency5', section:'PTSD Screening' },
  PCL3: { id:'PCL3', text:'Avoiding memories, thoughts, or feelings related to the experience', type:'frequency5', section:'PTSD Screening' },
  PCL4: { id:'PCL4', text:'Feeling distant or cut off from other people', type:'frequency5', section:'PTSD Screening' },
  PCL5: { id:'PCL5', text:'Feeling jumpy or easily startled', type:'frequency5', section:'PTSD Screening' },

  // ── ADHD ──────────────────────────────────────────────────
  ADHD1: { id:'ADHD1', text:'How often do you have trouble wrapping up the final details of a project?', type:'frequency5', section:'ADHD Screening' },
  ADHD2: { id:'ADHD2', text:'How often do you have difficulty getting things in order?', type:'frequency5', section:'ADHD Screening' },
  ADHD3: { id:'ADHD3', text:'How often do you have problems remembering appointments?', type:'frequency5', section:'ADHD Screening' },
  ADHD4: { id:'ADHD4', text:'How often do you avoid tasks that require a lot of thought?', type:'frequency5', section:'ADHD Screening' },
  ADHD5: { id:'ADHD5', text:'How often do you fidget or squirm when you have to sit for a long time?', type:'frequency5', section:'ADHD Screening' },

  // ── BURNOUT ───────────────────────────────────────────────
  BRN1: { id:'BRN1', text:'I feel emotionally drained from my work', type:'frequency7', section:'Burnout Screening' },
  BRN2: { id:'BRN2', text:'I feel used up at the end of the workday', type:'frequency7', section:'Burnout Screening' },
  BRN3: { id:'BRN3', text:'I feel fatigued when I get up in the morning and have to face another day', type:'frequency7', section:'Burnout Screening' },
  BRN4: { id:'BRN4', text:'Working with people all day is really a strain for me', type:'frequency7', section:'Burnout Screening' },
  BRN5: { id:'BRN5', text:'I feel burned out from my work', type:'frequency7', section:'Burnout Screening' },

  // ── BIPOLAR (MDQ) ─────────────────────────────────────────
  MDQ1: { id:'MDQ1', text:'I felt so good or hyper that others thought I was not my normal self', type:'yesno', section:'Bipolar Screening' },
  MDQ2: { id:'MDQ2', text:'I was so irritable that I shouted at people or started fights', type:'yesno', section:'Bipolar Screening' },
  MDQ3: { id:'MDQ3', text:'I felt much more self-confident than usual', type:'yesno', section:'Bipolar Screening' },
  MDQ4: { id:'MDQ4', text:'I got much less sleep than usual and found I did not really miss it', type:'yesno', section:'Bipolar Screening' },
  MDQ5: { id:'MDQ5', text:'I was much more talkative or spoke faster than usual', type:'yesno', section:'Bipolar Screening' },

  // ── SELF ESTEEM (RSE) ────────────────────────────────────
  RSE1: { id:'RSE1', text:'On the whole, I am satisfied with myself', type:'agree4', section:'Self-Esteem (RSE)' },
  RSE2: { id:'RSE2', text:'I feel that I have a number of good qualities', type:'agree4', section:'Self-Esteem (RSE)' },
  RSE3: { id:'RSE3', text:'I am able to do things as well as most other people', type:'agree4', section:'Self-Esteem (RSE)' },
  RSE4: { id:'RSE4', text:'I feel that I am a person of worth', type:'agree4', section:'Self-Esteem (RSE)' },

  // ── DASS-21 ───────────────────────────────────────────────
  DASS1: { id:'DASS1', text:'I found it hard to wind down', type:'dass4', section:'Stress & Mood (DASS-21)' },
  DASS2: { id:'DASS2', text:'I felt that I had nothing to look forward to', type:'dass4', section:'Stress & Mood (DASS-21)' },
  DASS3: { id:'DASS3', text:'I felt down-hearted and blue', type:'dass4', section:'Stress & Mood (DASS-21)' },
  DASS4: { id:'DASS4', text:'I was unable to become enthusiastic about anything', type:'dass4', section:'Stress & Mood (DASS-21)' },
  DASS5: { id:'DASS5', text:'I felt I was close to panic', type:'dass4', section:'Stress & Mood (DASS-21)' },
  DASS6: { id:'DASS6', text:'I experienced trembling (e.g. in the hands)', type:'dass4', section:'Stress & Mood (DASS-21)' },
  DASS7: { id:'DASS7', text:'I tended to over-react to situations', type:'dass4', section:'Stress & Mood (DASS-21)' },
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

  const handleNext = () => {
    if (sectionIdx < totalSections - 1) setSectionIdx(s => s + 1);
    else {
      onComplete({
        answers, age: parseInt(age) || 25,
        gender: gender === 'Male' ? 1 : gender === 'Female' ? 0 : 2,
        occupation, concern: ''
      });
    }
  };

  const renderQuestion = (q) => {
    if (q.id === 'AGE') return (
      <input key={q.id} type="number" value={age} onChange={e => setAge(e.target.value)}
        placeholder="Your age" min="10" max="100"
        style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:'1.5px solid #E5E7EB', fontSize:16, boxSizing:'border-box', outline:'none' }}
        onFocus={e=>e.target.style.borderColor='#4F46E5'} onBlur={e=>e.target.style.borderColor='#E5E7EB'}
      />
    );
    if (q.id === 'GENDER') return (
      <div key={q.id} style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {['Male','Female','Non-binary','Prefer not to say'].map(opt => (
          <button key={opt} onClick={() => setGender(opt)}
            style={{ padding:'10px 16px', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:500, background: gender===opt ? '#4F46E5' : '#F3F4F6', color: gender===opt ? '#fff' : '#374151', transition:'all 0.15s' }}>
            {opt}
          </button>
        ))}
      </div>
    );
    if (q.id === 'OCC') return (
      <div key={q.id} style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {['Student','Employed','Self-employed','Unemployed','Retired','Other'].map(opt => (
          <button key={opt} onClick={() => setOccupation(opt)}
            style={{ padding:'10px 16px', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:500, background: occupation===opt ? '#4F46E5' : '#F3F4F6', color: occupation===opt ? '#fff' : '#374151', transition:'all 0.15s' }}>
            {opt}
          </button>
        ))}
      </div>
    );

    const scale = SCALE[q.type] || SCALE.frequency4;
    return (
      <div key={q.id} style={{ marginBottom:24 }}>
        <p style={{ fontSize:15, color:'#111827', margin:'0 0 12px', fontWeight:500, lineHeight:1.5 }}>{q.text}</p>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {scale.map((label, i) => (
            <button key={i} onClick={() => handleAnswer(q.id, i)}
              style={{
                padding:'11px 16px', borderRadius:10, border:'none', cursor:'pointer',
                textAlign:'left', fontSize:13, fontWeight: answers[q.id]===i ? 600 : 400,
                transition:'all 0.15s',
                background: answers[q.id]===i ? '#4F46E5' : '#F9FAFB',
                color: answers[q.id]===i ? '#fff' : '#374151',
                outline: answers[q.id]===i ? 'none' : '1px solid #F3F4F6'
              }}>
              <span style={{ marginRight:8, opacity:0.6 }}>{i}</span> {label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily:"-apple-system,'DM Sans',sans-serif" }}>
      {/* Progress */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#9CA3AF', marginBottom:6 }}>
          <span>{section}</span>
          <span>{progress}% complete</span>
        </div>
        <div style={{ background:'#E5E7EB', borderRadius:6, height:4 }}>
          <div style={{ width:`${progress}%`, background:'#4F46E5', height:4, borderRadius:6, transition:'width 0.4s ease' }} />
        </div>
        <div style={{ fontSize:11, color:'#9CA3AF', marginTop:4 }}>
          Section {sectionIdx+1} of {totalSections}
        </div>
      </div>

      {/* Questions */}
      <div style={{ background:'#fff', borderRadius:16, padding:28, border:'1px solid #F3F4F6', marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin:'0 0 20px', color:'#4F46E5', fontSize:14, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>{section}</h3>
        {currentQs.map(q => renderQuestion(q))}
      </div>

      {/* Navigation */}
      <div style={{ display:'flex', gap:12 }}>
        {sectionIdx > 0 && (
          <button onClick={() => setSectionIdx(s => s-1)}
            style={{ flex:1, padding:'13px', background:'#fff', color:'#6B7280', border:'1.5px solid #E5E7EB', borderRadius:12, fontSize:15, cursor:'pointer', fontWeight:500 }}>
            ← Back
          </button>
        )}
        <button onClick={handleNext} disabled={!allAnswered}
          style={{ flex:2, padding:'13px', background: allAnswered ? '#4F46E5' : '#E5E7EB', color: allAnswered ? '#fff' : '#9CA3AF', border:'none', borderRadius:12, fontSize:15, cursor: allAnswered ? 'pointer' : 'not-allowed', fontWeight:600, transition:'all 0.15s' }}>
          {sectionIdx === totalSections-1 ? 'Complete Assessment →' : 'Next Section →'}
        </button>
      </div>
    </div>
  );
}
